import { ExternalLink, FileText, Scale } from 'lucide-react'
import { formatDate, text, type DecisionType, type Language, type PublicDecisionRecord } from '../data/nis2'

interface PublicDecisionCardProps {
  item: PublicDecisionRecord
  language: Language
}

const meta: Record<DecisionType, { className: string; label: { zh: string; en: string } }> = {
  formal_notice: { className: 'decision-purple', label: { zh: '正式通知', en: 'Formal notice' } },
  reasoned_opinion: { className: 'decision-amber', label: { zh: '理由意见', en: 'Reasoned opinion' } },
  cjeu_referral: { className: 'decision-red', label: { zh: 'CJEU 转交', en: 'CJEU referral' } },
}

export default function PublicDecisionCard({ item, language }: PublicDecisionCardProps) {
  const itemMeta = meta[item.decision_type]
  return <article className={`decision-card ${itemMeta.className}`}>
    <div className="decision-card-top"><span className="decision-icon"><FileText size={16} /></span><span className="decision-stage-label">{itemMeta.label[language]}</span><span className="decision-date">{formatDate(item.date, language)}</span></div>
    <h3>{text(item.title, language)}</h3>
    <p>{text(item.summary, language)}</p>
    <div className="decision-meta"><span><Scale size={13} /> {item.countries.length} {language === 'zh' ? '国' : item.countries.length === 1 ? 'country' : 'countries'}</span>{item.infr_refs && <span>{item.infr_refs.length} INFR</span>}</div>
    <div className="decision-card-evidence"><strong>{language === 'zh' ? '证据快照' : 'Evidence snapshot'}</strong><span>{text(item.evidence_snapshot, language)}</span></div>
    <a className="decision-source-link" href={item.source_url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> {language === 'zh' ? '打开官方决定' : 'Open official decision'}</a>
  </article>
}
