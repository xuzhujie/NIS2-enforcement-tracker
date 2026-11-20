import { ArrowUpRight, ExternalLink, History as HistoryIcon } from 'lucide-react'
import { formatDate, text, type HistoryChange, type HistoryData, type Language } from '../data/nis2'

interface HistoryPanelProps {
  history: HistoryData | null
  language: Language
}

function changeClass(change: HistoryChange): string {
  if (change.kind === 'cjeu_referral') return 'history-dot history-dot-red'
  if (change.kind === 'reasoned_opinion') return 'history-dot history-dot-amber'
  if (change.kind === 'data_refresh') return 'history-dot history-dot-blue'
  return 'history-dot history-dot-green'
}

export default function HistoryPanel({ history, language }: HistoryPanelProps) {
  const copy = language === 'zh'
    ? { title: '历史快照与变更日志', subtitle: '记录公开决定链条和数据登记簿变化；历史批次覆盖不等于当前合规结论。', changes: '公开变更', snapshots: '登记簿快照', source: '官方原文', empty: '历史文件暂不可用。' }
    : { title: 'History snapshots & change log', subtitle: 'Public decision milestones and registry changes; historical batch coverage is not a current compliance conclusion.', changes: 'Public changes', snapshots: 'Registry snapshots', source: 'Official source', empty: 'The history file is not available yet.' }

  if (!history) {
    return <section className="history-panel surface-panel"><div className="panel-heading"><div><h2>{copy.title}</h2><p>{copy.subtitle}</p></div><HistoryIcon size={19} /></div><p className="empty-copy">{copy.empty}</p></section>
  }

  return <section className="history-panel surface-panel" aria-labelledby="history-title">
    <div className="section-heading history-heading">
      <div>
        <div className="section-kicker"><HistoryIcon size={13} /> {language === 'zh' ? '源数据记录' : 'Source data record'}</div>
        <h2 id="history-title">{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </div>
      <span className="history-updated">{language === 'zh' ? '文件更新' : 'File updated'} · {formatDate(history.updated_at.slice(0, 10), language)}</span>
    </div>
    <div className="history-layout">
      <div className="history-changes">
        <h3>{copy.changes}</h3>
        <div className="history-change-list">
          {history.changes.map((change) => <article className="history-change" key={`${change.date}-${change.kind}`}>
            <span className={changeClass(change)} aria-hidden="true" />
            <div className="history-change-body"><div className="history-change-meta"><time>{formatDate(change.date, language)}</time><span>{change.kind.replace('_', ' ')}</span></div><h4>{text(change.title, language)}</h4><p>{text(change.summary, language)}</p><a href={change.source_url} target="_blank" rel="noreferrer">{copy.source} <ArrowUpRight size={12} /></a></div>
          </article>)}
        </div>
      </div>
      <div className="history-snapshots">
        <h3>{copy.snapshots}</h3>
        <div className="snapshot-list">
          {[...history.snapshots].reverse().map((snapshot) => <article className="snapshot-card" key={snapshot.date}>
            <div className="snapshot-head"><div><time>{formatDate(snapshot.date, language)}</time><strong>{text(snapshot.label, language)}</strong></div><a href={snapshot.source_url} target="_blank" rel="noreferrer" aria-label={`${copy.source}: ${text(snapshot.label, language)}`}><ExternalLink size={14} /></a></div>
            <div className="snapshot-metrics">{snapshot.member_state_count !== undefined && <span><b>{snapshot.member_state_count}</b> {language === 'zh' ? '国' : 'states'}</span>}{snapshot.current_notified_count !== undefined && <span><b>{snapshot.current_notified_count}</b> {language === 'zh' ? '已通知' : 'notified'}</span>}{snapshot.current_referred_count !== undefined && <span><b>{snapshot.current_referred_count}</b> {language === 'zh' ? '转交' : 'referred'}</span>}{snapshot.decision_round_count !== undefined && <span><b>{snapshot.decision_round_count}</b> {language === 'zh' ? '批次' : 'rounds'}</span>}{snapshot.decision_scope_count !== undefined && <span><b>{snapshot.decision_scope_count}</b> {language === 'zh' ? '覆盖国' : 'states in batch'}</span>}</div>
            <p>{text(snapshot.note, language)}</p>
          </article>)}
        </div>
      </div>
    </div>
  </section>
}
