import { ExternalLink } from 'lucide-react'
import { formatDate, text, type Language, type MemberStateRecord } from '../data/nis2'

interface TimelineProps {
  items: MemberStateRecord[]
  language: Language
}

export default function Timeline({ items, language }: TimelineProps) {
  const events = items.flatMap((item) => item.events.map((event) => ({ ...event, country: item }))).sort((left, right) => right.date.localeCompare(left.date))
  const copy = language === 'zh' ? { title: '统一时间线', subtitle: '把转置期限、正式通知、理由意见和 CJEU 转交放在同一条可核验事件流中。', source: '国家来源' } : { title: 'Unified timeline', subtitle: 'Deadlines, formal notices, reasoned opinions and CJEU referrals in one verifiable event stream.', source: 'Country source' }
  return <section className="timeline-panel surface-panel" aria-labelledby="timeline-title"><div className="section-heading"><div><h2 id="timeline-title">{copy.title}</h2><p>{copy.subtitle}</p></div></div>{events.length === 0 ? <div className="empty-state">{language === 'zh' ? '没有符合条件的时间线事件。' : 'No timeline events match the filters.'}</div> : <div className="timeline-list">{events.map((event, index) => <div className={`timeline-event timeline-${event.kind}`} key={`${event.country.code}-${event.date}-${event.kind}-${index}`}><div className="timeline-marker" /><div className="timeline-content"><div className="timeline-event-top"><span>{formatDate(event.date, language)}</span><span>{event.country.code} · {text(event.country.name, language)}</span></div><strong>{text(event.label, language)}</strong><p>{text(event.description, language)}</p><a href={event.country.source_url} target="_blank" rel="noreferrer"><ExternalLink size={12} />{copy.source}</a></div></div>)}</div>}</section>
}
