#!/usr/bin/env python3
"""Refresh the small, source-first official-updates feed used by the dashboard.

The monitor deliberately stores discovery signals only. It never mutates the curated
Member State registry; a human review is still required before a country record changes.
"""

from __future__ import annotations

import argparse
import email.utils
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable, Iterable
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


DEFAULT_FEEDS = (
    "https://ec.europa.eu/commission/presscorner/api/rss?language=en",
    "https://digital-strategy.ec.europa.eu/en/news/rss.xml",
)
KEYWORDS = (
    "nis2",
    "nis 2",
    "transposition",
    "infringement",
    "reasoned opinion",
    "court of justice",
    "cjeu",
    "directive (eu) 2022/2555",
)


def _local_name(value: str) -> str:
    return value.rsplit("}", 1)[-1].lower()


def _clean_text(value: str | None) -> str:
    return " ".join((value or "").split())


def _element_text(element: ET.Element | None) -> str:
    if element is None:
        return ""
    return _clean_text(" ".join(element.itertext()))


def _first_child_text(item: ET.Element, names: Iterable[str]) -> str:
    wanted = set(names)
    for child in item.iter():
        if child is not item and _local_name(child.tag) in wanted:
            text = _element_text(child)
            if text:
                return text
    return ""


def _first_link(item: ET.Element) -> str:
    for child in item.iter():
        if child is item or _local_name(child.tag) != "link":
            continue
        href = _clean_text(child.attrib.get("href"))
        if href:
            return href
        text = _element_text(child)
        if text:
            return text
    return ""


def normalize_date(value: str) -> str:
    """Return an ISO calendar date for the common RSS/Atom date forms."""

    value = _clean_text(value)
    if not value:
        return ""
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return value

    candidates = (value.replace("Z", "+00:00"), value)
    for candidate in candidates:
        try:
            parsed = datetime.fromisoformat(candidate)
            if parsed.tzinfo is not None:
                parsed = parsed.astimezone(timezone.utc)
            return parsed.date().isoformat()
        except ValueError:
            pass

    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(timezone.utc)
        return parsed.date().isoformat()
    except (TypeError, ValueError, OverflowError):
        return value[:10]


def _is_relevant(title: str, summary: str) -> bool:
    haystack = f"{title} {summary}".lower()
    return any(keyword in haystack for keyword in KEYWORDS)


def _normalize_candidate(title: str, link: str, date: str, summary: str) -> dict[str, str] | None:
    title = _clean_text(title)
    link = _clean_text(link)
    summary = _clean_text(summary)
    if not title or not link or not _is_relevant(title, summary):
        return None
    return {
        "title": title,
        "link": link,
        "date": normalize_date(date),
        "summary": summary,
    }


def _parse_xml(text: str) -> list[dict[str, str]]:
    root = ET.fromstring(text)
    entries = [element for element in root.iter() if _local_name(element.tag) in {"item", "entry"}]
    parsed: list[dict[str, str]] = []
    for entry in entries:
        candidate = _normalize_candidate(
            _first_child_text(entry, {"title"}),
            _first_link(entry),
            _first_child_text(entry, {"pubdate", "published", "updated", "date"}),
            _first_child_text(entry, {"description", "summary", "content"}),
        )
        if candidate:
            parsed.append(candidate)
    return parsed


class _HtmlFeedParser(HTMLParser):
    """Small fallback for feeds rendered as article cards on official pages."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.items: list[dict[str, str]] = []
        self.current: dict[str, str] | None = None
        self.depth = 0
        self.field: str | None = None
        self.buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        if tag == "article" and self.current is None:
            self.current = {"title": "", "link": "", "date": "", "summary": ""}
            self.depth = 1
            return
        if self.current is None:
            return
        if tag == "article":
            self.depth += 1
        if tag == "a" and not self.current["link"] and attrs_map.get("href"):
            self.current["link"] = attrs_map["href"] or ""
        if tag == "time":
            self.current["date"] = attrs_map.get("datetime", "") or ""
            self.field = "date"
            self.buffer = []
        elif tag in {"h1", "h2", "h3", "h4"}:
            self.field = "title"
            self.buffer = []
        elif tag == "p":
            self.field = "summary"
            self.buffer = []

    def handle_data(self, data: str) -> None:
        if self.current is not None and self.field is not None:
            self.buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self.current is None:
            return
        if self.field and tag in {"time", "h1", "h2", "h3", "h4", "p"}:
            value = _clean_text(" ".join(self.buffer))
            if value and self.field != "date":
                self.current[self.field] = value
            elif value and not self.current["date"]:
                self.current["date"] = value
            self.field = None
            self.buffer = []
        if tag == "article":
            self.depth -= 1
            if self.depth == 0:
                candidate = _normalize_candidate(**self.current)
                if candidate:
                    self.items.append(candidate)
                self.current = None


def _parse_html(text: str) -> list[dict[str, str]]:
    parser = _HtmlFeedParser()
    parser.feed(text)
    parser.close()
    return parser.items


def _dedupe_and_sort(items: Iterable[dict[str, str]]) -> list[dict[str, str]]:
    by_link: dict[str, dict[str, str]] = {}
    for item in items:
        link = item.get("link", "")
        if link and link not in by_link:
            by_link[link] = item
    return sorted(by_link.values(), key=lambda item: (item.get("date", ""), item.get("link", "")), reverse=True)


def parse_feed(text: str) -> list[dict[str, str]]:
    """Parse RSS/Atom, with an article-card HTML fallback, into stable items."""

    try:
        parsed_xml = _parse_xml(text)
        return _dedupe_and_sort(parsed_xml) if parsed_xml else _dedupe_and_sort(_parse_html(text))
    except ET.ParseError:
        return _dedupe_and_sort(_parse_html(text))


def fetch_url(url: str, timeout: int = 30) -> str:
    request = Request(url, headers={"User-Agent": "NIS2-enforcement-tracker/0.1"})
    with urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def update_file(
    output_path: Path,
    feed_urls: Iterable[str],
    fetcher: Callable[[str], str] = fetch_url,
    updated_at: str | None = None,
) -> bool:
    """Write only when the normalized item set changes; return whether it changed."""

    existing_payload: dict[str, object] = {}
    existing_items: list[dict[str, str]] = []
    if output_path.exists():
        try:
            existing_payload = json.loads(output_path.read_text(encoding="utf-8"))
            raw_items = existing_payload.get("items", [])
            if isinstance(raw_items, list):
                existing_items = [item for item in raw_items if isinstance(item, dict)]
        except (OSError, json.JSONDecodeError):
            existing_payload = {}

    items: list[dict[str, str]] = []
    failures: list[str] = []
    for url in feed_urls:
        try:
            items.extend(parse_feed(fetcher(url)))
        except Exception as error:  # network failures should not erase the last good feed
            failures.append(f"{url}: {error}")

    normalized_items = _dedupe_and_sort(items)
    if failures and not normalized_items:
        if failures:
            print("No relevant items fetched; keeping the existing feed and avoiding an empty overwrite.", file=sys.stderr)
        return False
    if not normalized_items and existing_items:
        print("No relevant items found; keeping the existing feed.", file=sys.stderr)
        return False

    if failures:
        normalized_items = _dedupe_and_sort([*existing_items, *normalized_items])

    if existing_payload.get("items") == normalized_items:
        return False

    payload = {
        "updated_at": updated_at or datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "items": normalized_items,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("public/data/updates.json"))
    parser.add_argument("--feed", action="append", dest="feeds", help="Official RSS or article feed URL; repeatable")
    args = parser.parse_args()
    changed = update_file(args.output, args.feeds or DEFAULT_FEEDS)
    print(f"{args.output}: {'updated' if changed else 'unchanged'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
