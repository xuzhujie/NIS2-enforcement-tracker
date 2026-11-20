import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink, Scale } from 'lucide-react'
import { formatDate, text, type Language, type MemberStateRecord } from '../data/nis2'

interface MemberStateMatrixProps {
  items: MemberStateRecord[]
  language: Language
  decisionFilterActive?: boolean
}

const statusMeta = {
  notified: { className: 'status-notified', label: { zh: '已通知', en: 'Notified' } },
  referred_to_cjeu: { className: 'status-referral', label: { zh: 'CJEU 转交', en: 'CJEU referral' } },
  unknown: { className: 'status-unknown', label: { zh: '未提供', en: 'Not provided' } },
} as const

function fallback(value: string | undefined, language: Language): string {
  return value || (language === 'zh' ? '未在官方页面提供' : 'Not provided on the official page')
}

function bilingualFallback(value: MemberStateRecord['competent_authority'], language: Language): string {
  return value ? text(value, language) : fallback(undefined, language)
}

export default function MemberStateMatrix({ items, language, decisionFilterActive = false }: MemberStateMatrixProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const copy = language === 'zh'
    ? { title: '成员国矩阵', subtitle: '按当前公开程序状态查看 27 国；选择公开决定阶段时，矩阵改为显示历史覆盖国家。', evidence: '证据摘要', transposition: '转置状态', nationalMeasure: '国家措施', strategy: '国家战略', authority: '主管机关', csirt: '国家 CSIRT', spoc: 'SPOC', events: '程序历史', sources: '官方来源', open: '查看国家详情', close: '收起国家详情', decisionFilter: '当前按历史公开决定阶段筛选', strategyLink: '打开战略入口' }
    : { title: 'Member State matrix', subtitle: 'Compare all 27 countries by current public procedure; decision-stage filters show historical coverage.', evidence: 'Evidence snapshot', transposition: 'Transposition status', nationalMeasure: 'National measure', strategy: 'National strategy', authority: 'Competent authority', csirt: 'National CSIRT', spoc: 'SPOC', events: 'Procedure history', sources: 'Official sources', open: 'Open country details', close: 'Hide country details', decisionFilter: 'Viewing historical decision-stage coverage', strategyLink: 'Open strategy entry' }

  return <section className="matrix-panel surface-panel" aria-labelledby="matrix-title">
    <div className="section-heading matrix-heading">
      <div>
        <div className="section-kicker">{decisionFilterActive && <span className="filter-context"><Scale size={13} /> {copy.decisionFilter}</span>}</div>
        <h2 id="matrix-title">{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>
      <div className="matrix-legend" aria-label={language === 'zh' ? '状态图例' : 'Status legend'}>
        <span><i className="legend-dot legend-green" />{statusMeta.notified.label[language]}</span>
        <span><i className="legend-dot legend-red" />{statusMeta.referred_to_cjeu.label[language]}</span>
        {decisionFilterActive && <span><i className="legend-dot legend-amber" />{language === 'zh' ? '历史阶段' : 'Historical stage'}</span>}
      </div>
    </div>

    {items.length === 0 ? <div className="empty-state">{language === 'zh' ? '没有符合筛选条件的成员国。' : 'No Member States match these filters.'}</div> : <div className="matrix-grid">
      {items.map((item) => {
        const meta = statusMeta[item.current_status]
        const isOpen = expanded === item.code
        const isAttention = item.current_status !== 'notified'
        return <div className={`matrix-cell-wrap ${isOpen ? 'matrix-cell-open' : ''}`} key={item.code}>
          <button
            type="button"
            className={`matrix-cell ${meta.className}`}
            aria-expanded={isOpen}
            aria-controls={`country-detail-${item.code}`}
            onClick={() => setExpanded((current) => current === item.code ? null : item.code)}
          >
            <span className="matrix-code">{item.code}</span>
            <span className="matrix-name">{text(item.name, language)}</span>
            <span className="matrix-status">{isAttention ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />} {text(meta.label, language)}</span>
            <span className="matrix-stage">{text(item.latest_stage, language)}</span>
          </button>
          {isOpen && <div className="country-detail" id={`country-detail-${item.code}`}>
            <div className="country-detail-head"><div><strong>{text(item.name, language)}</strong><span>{item.code} · {formatDate(item.latest_date, language)}</span></div><button type="button" className="detail-close" onClick={() => setExpanded(null)}>{copy.close}</button></div>
            <dl className="country-facts">
              <div><dt>{copy.transposition}</dt><dd>{text(item.transposition_label, language)}</dd></div>
              <div><dt>{copy.nationalMeasure}</dt><dd>{bilingualFallback(item.national_measure, language)}</dd></div>
              <div><dt>{copy.strategy}</dt><dd>{item.national_strategy_url ? <a href={item.national_strategy_url} target="_blank" rel="noreferrer" className="detail-inline-link">{copy.strategyLink} <ExternalLink size={12} /></a> : item.national_strategy_note ? text(item.national_strategy_note, language) : bilingualFallback(undefined, language)}</dd></div>
              <div><dt>{copy.authority}</dt><dd>{bilingualFallback(item.competent_authority, language)}</dd></div>
              <div><dt>{copy.csirt}</dt><dd>{bilingualFallback(item.csirt, language)}</dd></div>
              <div><dt>{copy.spoc}</dt><dd>{bilingualFallback(item.spoc, language)}</dd></div>
            </dl>
            <div className="country-evidence"><strong>{copy.evidence}</strong><p>{text(item.evidence_snapshot, language)}</p></div>
            <div className="country-events"><strong>{copy.events}</strong>{item.events.map((event) => <div className="mini-event" key={`${event.date}-${event.kind}`}><span>{formatDate(event.date, language)}</span><b>{text(event.label, language)}</b><p>{text(event.description, language)}</p></div>)}</div>
            <div className="country-sources"><strong>{copy.sources}</strong>{item.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><ExternalLink size={13} />{text(source.label, language)}</a>)}</div>
          </div>}
        </div>
      })}
    </div>}
  </section>
}
