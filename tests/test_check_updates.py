import json
import tempfile
import unittest
from pathlib import Path

from scripts.check_updates import parse_feed, update_file


RSS_FIXTURE = '''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Commission refers four Member States to the Court over NIS2 transposition</title>
      <link>https://example.test/nis2-referral</link>
      <pubDate>Wed, 08 Jul 2026 00:00:00 GMT</pubDate>
      <description>The Commission takes the next infringement step under the NIS2 Directive.</description>
    </item>
    <item>
      <title>Duplicate NIS2 referral item</title>
      <link>https://example.test/nis2-referral</link>
      <pubDate>2026-07-09</pubDate>
      <description>Same official link, different feed copy.</description>
    </item>
    <item>
      <title>Cybersecurity threat landscape report</title>
      <link>https://example.test/general-cybersecurity</link>
      <pubDate>Tue, 07 Jul 2026 00:00:00 GMT</pubDate>
      <description>General threat intelligence report with no related policy terms.</description>
    </item>
  </channel>
</rss>'''


ATOM_FIXTURE = '''<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Member States and NIS2 transposition update</title>
    <link href="https://example.test/transposition" />
    <updated>2025-05-07T12:00:00Z</updated>
    <summary>Reasoned opinions and the transposition deadline.</summary>
  </entry>
</feed>'''


HTML_FIXTURE = '''
<main>
  <article>
    <h2>Transposition progress under the NIS2 Directive</h2>
    <a href="https://example.test/html-transposition">Read item</a>
    <time datetime="2024-11-28T08:00:00Z">28 November 2024</time>
    <p>Official transposition and infringement update.</p>
  </article>
</main>'''


class CheckUpdatesTests(unittest.TestCase):
    def test_relevant_items_are_normalized_and_duplicate_links_removed(self):
        items = parse_feed(RSS_FIXTURE)

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["link"], "https://example.test/nis2-referral")
        self.assertEqual(items[0]["date"], "2026-07-08")
        self.assertIn("NIS2", items[0]["title"])

    def test_atom_entries_are_supported(self):
        items = parse_feed(ATOM_FIXTURE)

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["date"], "2025-05-07")
        self.assertEqual(items[0]["link"], "https://example.test/transposition")

    def test_article_cards_are_supported_as_html_fallback(self):
        items = parse_feed(HTML_FIXTURE)

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["date"], "2024-11-28")
        self.assertEqual(items[0]["link"], "https://example.test/html-transposition")

    def test_no_change_does_not_rewrite_existing_json(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = Path(temp_dir) / "updates.json"

            first_write = update_file(
                output_path,
                ["https://example.test/feed"],
                lambda _url: RSS_FIXTURE,
                updated_at="2026-11-20T09:00:00Z",
            )
            first_content = output_path.read_text(encoding="utf-8")
            first_payload = json.loads(first_content)

            second_write = update_file(
                output_path,
                ["https://example.test/feed"],
                lambda _url: RSS_FIXTURE,
                updated_at="2026-11-20T10:00:00Z",
            )

            self.assertTrue(first_write)
            self.assertFalse(second_write)
            self.assertEqual(output_path.read_text(encoding="utf-8"), first_content)
            self.assertEqual(first_payload["updated_at"], "2026-11-20T09:00:00Z")

    def test_all_fetch_failures_do_not_create_or_empty_feed(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = Path(temp_dir) / "updates.json"

            changed = update_file(
                output_path,
                ["https://example.test/unavailable"],
                lambda _url: (_ for _ in ()).throw(RuntimeError("offline")),
            )

            self.assertFalse(changed)
            self.assertFalse(output_path.exists())

    def test_partial_failure_keeps_last_good_items(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = Path(temp_dir) / "updates.json"
            update_file(output_path, ["https://example.test/seed"], lambda _url: RSS_FIXTURE, updated_at="2026-11-20T09:00:00Z")

            def fetch(url):
                if url.endswith("broken"):
                    raise RuntimeError("offline")
                return ATOM_FIXTURE

            changed = update_file(output_path, ["https://example.test/new", "https://example.test/broken"], fetch, updated_at="2026-11-20T10:00:00Z")
            payload = json.loads(output_path.read_text(encoding="utf-8"))

            self.assertTrue(changed)
            self.assertEqual({item["link"] for item in payload["items"]}, {"https://example.test/nis2-referral", "https://example.test/transposition"})


if __name__ == "__main__":
    unittest.main()
