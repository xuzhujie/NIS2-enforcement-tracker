import { ArrowUpRight, CalendarClock, ExternalLink, SearchCheck, ShieldAlert } from 'lucide-react'
import { formatDate, text, type HistoryData, type Language, type MemberStateRecord, type OfficialSource, type PublicDecisionRecord, type UpdatesData } from '../data/nis2'
import type { DashboardMetrics } from '../data/dashboardMetrics'
import MemberStateMatrix from './MemberStateMatrix'
import PublicDecisionCard from './PublicDecisionCard'
import HistoryPanel from './HistoryPanel'

interface DashboardOverviewProps {
  items: MemberStateRecord[]
  decisions: PublicDecisionRecord[]
  metrics: DashboardMetrics
  updates: UpdatesData | null
  history: HistoryData | null
  language: Language
  officialSources: OfficialSource[]
  onOpenTab: (tab: 'states' | 'decisions' | 'timeline' | 'charts') => void
  decisionFilterActive?: boolean
}

export default function DashboardOverview({ items, decisions, metrics, updates, history, language, officialSources, onOpenTab, decisionFilterActive = false }: DashboardOverviewProps) {
  const copy = language === 'zh'
    ? { attention: '待关注国家', attentionSub: '当前仍处于公开正式程序中的国家，按最新公开节点排序。', freshness: '数据新鲜度', freshnessSub: '国家登记簿与官方动态 feed 分开核验。', countryData: '国家登记簿核验截至', updates: '动态文件最后更新', open: '打开登记簿', noAttention: '当前没有符合条件的待关注国家。', recent: '自动监测动态', recentSub: '动态发现不等于成员国状态变更。', rules: 'NIS2 执法规则速览', rulesSub: '页面把转置状态、欧委会正式程序和国家机构字段分开保存。', sources: '官方数据来源' }
    : { attention: 'Countries to review', attentionSub: 'Countries still in a public formal procedure, ordered by latest public milestone.', freshness: 'Data freshness', freshnessSub: 'The country registry and official updates feed are verified separately.', countryData: 'Registry verified through', updates: 'Updates file last changed', open: 'Open registry', noAttention: 'No countries in the current attention queue.', recent: 'Automatic source updates', recentSub: 'Finding an update does not change a Member State record automatically.', rules: 'NIS2 enforcement rules at a glance', rulesSub: 'Transposition state, Commission procedure and national contact fields remain separate objects.', sources: 'Official sources' }

  return <div className="dashboard-overview">
    <div className="dashboard-grid">
      <section className="attention-panel surface-panel"><div className="panel-heading"><div><h2>{copy.attention}</h2><p>{copy.attentionSub}</p></div><ShieldAlert size={19} /></div>{metrics.attention.length === 0 ? <p className="empty-copy">{copy.noAttention}</p> : metrics.attention.map((item) => <button type="button" className="attention-row" key={item.code} onClick={() => onOpenTab('states')}><div className="attention-row-top"><span className="status-badge status-badge-red">{text(item.status_label, language)}</span><span>{formatDate(item.latest_date, language)}</span></div><strong>{item.code} · {text(item.name, language)}</strong><span>{text(item.latest_stage, language)} · {item.commission_case_ids.join(', ') || (language === 'zh' ? '程序编号未公开' : 'Public case number not listed')}</span><ArrowUpRight size={14} /></button>)}<button type="button" className="panel-link" onClick={() => onOpenTab('states')}>{copy.open} <ArrowUpRight size={13} /></button></section>
      <section className="freshness-panel surface-panel"><div className="panel-heading"><div><h2>{copy.freshness}</h2><p>{copy.freshnessSub}</p></div><CalendarClock size={19} /></div><div className="freshness-item"><CalendarClock size={16} /><div><span>{copy.countryData}</span><strong>{formatDate(items[0]?.last_verified_at ?? '2026-11-20', language)}</strong></div></div><div className="freshness-item"><SearchCheck size={16} /><div><span>{copy.updates}</span><strong>{updates?.updated_at ? formatDate(updates.updated_at.slice(0, 10), language) : '—'}</strong></div></div><div className="freshness-note">{language === 'zh' ? '国家记录来自人工核验的官方页面；动态文件只承载发现线索。' : 'Country records are manually verified against official pages; the updates file only carries discovery signals.'}</div></section>
      <section className="recent-panel surface-panel"><div className="panel-heading"><div><h2>{copy.recent}</h2><p>{copy.recentSub}</p></div><SearchCheck size={19} /></div>{updates?.items.slice(0, 3).map((update) => <a className="recent-row" href={update.link} target="_blank" rel="noreferrer" key={update.link}><span>{update.date}</span><strong>{language === 'zh' ? update.title_zh ?? update.title : update.title}</strong><ArrowUpRight size={13} /></a>)}{(!updates || updates.items.length === 0) && <p className="empty-copy">{language === 'zh' ? '暂无新动态，监测任务等待下一次刷新。' : 'No new updates; the monitor is waiting for its next refresh.'}</p>}</section>
    </div>

    <div className="dashboard-main-grid"><MemberStateMatrix items={items} language={language} decisionFilterActive={decisionFilterActive} /><section className="decisions-rail surface-panel"><div className="section-heading"><div><h2>{language === 'zh' ? '公开决定' : 'Public decisions'}</h2><p>{language === 'zh' ? '按批次查看欧委会公开程序。' : 'Commission procedure batches, ordered by date.'}</p></div><button type="button" className="icon-link" onClick={() => onOpenTab('decisions')} aria-label={language === 'zh' ? '查看全部公开决定' : 'Open all decisions'}><ExternalLink size={16} /></button></div>{decisions.map((decision) => <PublicDecisionCard item={decision} language={language} key={decision.id} />)}<button type="button" className="panel-link" onClick={() => onOpenTab('decisions')}>{language === 'zh' ? '打开公开决定登记簿' : 'Open public decision register'} <ArrowUpRight size={13} /></button></section></div>

    <HistoryPanel history={history} language={language} />

    <section className="rules-panel surface-panel"><div className="section-heading"><div><h2>{copy.rules}</h2><p>{copy.rulesSub}</p></div></div><div className="rules-grid"><div><strong>{language === 'zh' ? '转置期限' : 'Transposition deadline'}</strong><span>17 Oct 2024</span><p>{language === 'zh' ? '成员国应将 NIS2 转置为国内法并通知欧委会。' : 'Member States had to transpose NIS2 and notify the Commission.'}</p></div><div><strong>{language === 'zh' ? '程序阶段' : 'Procedure stages'}</strong><span>Formal notice → reasoned opinion → CJEU</span><p>{language === 'zh' ? '历史阶段可重复出现；当前状态单独计算。' : 'Historical stages can repeat; current state is calculated separately.'}</p></div><div><strong>{language === 'zh' ? '国家节点' : 'National nodes'}</strong><span>Authority · CSIRT · SPOC</span><p>{language === 'zh' ? '缺失信息显示为未提供，不用推断补齐。' : 'Missing information is shown as unavailable, never inferred.'}</p></div></div></section>

    <section className="sources-panel"><div className="section-heading"><div><h2>{copy.sources}</h2><p>{language === 'zh' ? '每条状态和决定都可以回到官方原文。' : 'Every status and decision can be traced back to an official source.'}</p></div></div><div className="source-grid">{officialSources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><ExternalLink size={15} /><strong>{text(source.label, language)}</strong><span>{text(source.desc, language)}</span></a>)}</div></section>
  </div>
}
