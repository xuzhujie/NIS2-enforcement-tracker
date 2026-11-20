import { useState } from 'react'
import { ChevronDown, ExternalLink, MapPin } from 'lucide-react'
import { formatDate, text, type Language, type MemberStateRecord } from '../data/nis2'

interface MemberStateRowProps {
  item: MemberStateRecord
  language: Language
  decisionStages: string
}

export default function MemberStateRow({ item, language, decisionStages }: MemberStateRowProps) {
  const [expanded, setExpanded] = useState(false)
  const unavailable = language === 'zh' ? '未提供' : 'Not provided'
  const statusClass = item.current_status === 'referred_to_cjeu' ? 'status-badge-red' : item.current_status === 'notified' ? 'status-badge-green' : 'status-badge-slate'
  return <div className={`registry-row-wrap ${expanded ? 'registry-row-open' : ''}`}>
    <div className="registry-row">
      <div className="country-cell"><span className="country-code-small">{item.code}</span><strong>{text(item.name, language)}</strong></div>
      <span className={`status-badge ${statusClass}`}>{text(item.status_label, language)}</span>
      <span>{text(item.transposition_label, language)}</span>
      <span>{formatDate(item.latest_date, language)}</span>
      <span>{decisionStages || unavailable}</span>
      <a href={item.source_url} target="_blank" rel="noreferrer" className="source-inline"><ExternalLink size={13} />{language === 'zh' ? '官方来源' : 'Official source'}</a>
      <button type="button" className="row-view-button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? (language === 'zh' ? '收起' : 'Hide') : (language === 'zh' ? '查看' : 'View')} <ChevronDown size={14} className={expanded ? 'rotated' : ''} /></button>
    </div>
    {expanded && <div className="registry-detail">
      <div className="registry-detail-summary"><MapPin size={15} /><span>{text(item.evidence_snapshot, language)}</span></div>
      <div className="registry-detail-grid"><div><b>{language === 'zh' ? '转置状态' : 'Transposition'}</b><span>{text(item.transposition_label, language)}</span></div><div><b>{language === 'zh' ? '国家措施' : 'National measure'}</b><span>{item.national_measure ? text(item.national_measure, language) : unavailable}</span></div><div><b>{language === 'zh' ? '主管机关' : 'Authority'}</b><span>{item.competent_authority ? text(item.competent_authority, language) : unavailable}</span></div><div><b>CSIRT</b><span>{item.csirt ? text(item.csirt, language) : unavailable}</span></div><div><b>SPOC</b><span>{item.spoc ? text(item.spoc, language) : unavailable}</span></div><div><b>{language === 'zh' ? '核验日期' : 'Verified'}</b><span>{formatDate(item.last_verified_at, language)}</span></div></div>
      <div className="registry-detail-links">{item.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><ExternalLink size={13} />{text(source.label, language)}</a>)}</div>
    </div>}
  </div>
}
