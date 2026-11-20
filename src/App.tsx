import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Gavel,
  Languages,
  Landmark,
  LayoutDashboard,
  ListFilter,
  Scale,
  Table2,
  Timeline as TimelineIcon,
} from 'lucide-react'
import {
  ALL_FILTER,
  DATA_AS_OF,
  formatDate,
  memberStates,
  officialSources,
  publicDecisions,
  type CurrentStatus,
  type DecisionType,
  type HistoryData,
  type Language,
  type TranspositionState,
  type UpdatesData,
} from './data/nis2'
import { filterMemberStates, filterPublicDecisions, getDashboardMetrics, type FilterState } from './data/dashboardMetrics'
import { buildExportCsv, buildExportJson, buildExportMarkdown, triggerDownload } from './lib/export'
import DashboardOverview from './components/DashboardOverview'
import MemberStateRow from './components/MemberStateRow'
import PublicDecisionCard from './components/PublicDecisionCard'
import Timeline from './components/Timeline'
import Charts from './components/Charts'

type TabKey = 'dashboard' | 'states' | 'decisions' | 'timeline' | 'charts'

const UI = {
  zh: {
    brand: 'EU Regulatory Intelligence',
    context: '欧盟委员会 · NIS2 Directive (EU) 2022/2555',
    title: 'NIS2 执法追踪器',
    subtitle: '成员国转置 · 公开决定',
    description: '把 27 国转置状态、欧委会正式程序与国家机构信息放进一条可核验的证据链。',
    directive: 'Directive (EU) 2022/2555 · 转置、侵权程序与 CJEU 转交',
    dataAsOf: '数据核验截至',
    language: '语言',
    filters: '筛选',
    allStatuses: '全部状态',
    allTransposition: '全部转置状态',
    allRounds: '全部公开决定阶段',
    allCountries: '全部成员国',
    reset: '重置',
    dashboard: '驾驶舱',
    states: '成员国登记簿',
    decisions: '公开决定',
    timeline: '时间线',
    charts: '统计图表',
    memberStates: '成员国',
    notified: '已通知',
    referred: 'CJEU 转交',
    rounds: '决定批次',
    open: '打开',
    export: '导出当前视图',
    official: '官方',
    statusNote: '已通知 / 状态页显示，不等于已完成实体合规审查。',
    historyNote: '公开决定阶段筛选匹配历史覆盖国家，当前状态保持独立。',
    transpositionNote: '转置状态来自欧委会国家页；当前公开程序状态保持独立。',
    registerTitle: '成员国登记簿',
    registerSub: '每行一个成员国；国家措施、主管机关和 CSIRT 字段只在官方来源可核验时填入。',
    decisionTitle: '公开决定登记簿',
    decisionSub: '按欧委会公开批次查看正式通知、理由意见和 CJEU 转交。',
    noDecisions: '没有符合筛选条件的公开决定。',
    noStates: '没有符合筛选条件的成员国。',
    country: '成员国',
    status: '当前状态',
    measure: '转置状态',
    updated: '最新更新',
    stages: '历史阶段',
    source: '官方来源',
    action: '操作',
    disclaimer: '本项目是研究和合规运营辅助工具，不构成法律意见；状态和法律结论应以最新官方原文为准。',
    footSource: '来源优先 · 欧委会 · EUR-Lex · ENISA',
  },
  en: {
    brand: 'EU Regulatory Intelligence',
    context: 'European Commission · NIS2 Directive (EU) 2022/2555',
    title: 'NIS2 Enforcement Tracker',
    subtitle: 'Member State transposition · official decisions',
    description: 'A source-first evidence chain for 27 Member States, Commission infringement stages and national contact points.',
    directive: 'Directive (EU) 2022/2555 · transposition, infringement procedure and CJEU referrals',
    dataAsOf: 'Data verified through',
    language: 'Language',
    filters: 'Filters',
    allStatuses: 'All statuses',
    allTransposition: 'All transposition states',
    allRounds: 'All decision stages',
    allCountries: 'All Member States',
    reset: 'Reset',
    dashboard: 'Dashboard',
    states: 'Member State register',
    decisions: 'Public decisions',
    timeline: 'Timeline',
    charts: 'Charts',
    memberStates: 'Member States',
    notified: 'notified',
    referred: 'CJEU referrals',
    rounds: 'decision rounds',
    open: 'Open',
    export: 'Export current view',
    official: 'Official',
    statusNote: 'Notified / state-of-play does not mean a completed substantive compliance assessment.',
    historyNote: 'Decision-stage filters match historical coverage while current status remains separate.',
    transpositionNote: 'Transposition status comes from EC country pages; current public procedure status remains separate.',
    registerTitle: 'Member State register',
    registerSub: 'One row per country; measures, authorities and CSIRTs appear only when supported by official sources.',
    decisionTitle: 'Public decision register',
    decisionSub: 'Commission batches for formal notices, reasoned opinions and CJEU referrals.',
    noDecisions: 'No public decisions match these filters.',
    noStates: 'No Member States match these filters.',
    country: 'Member State',
    status: 'Current status',
    measure: 'Transposition',
    updated: 'Latest update',
    stages: 'Historical stages',
    source: 'Official source',
    action: 'Action',
    disclaimer: 'Research and compliance operations aid only; not legal advice. Verify status and legal conclusions against the latest official text.',
    footSource: 'Source-first · Commission · EUR-Lex · ENISA',
  },
} as const

function getStoredLanguage(): Language {
  return window.localStorage.getItem('nis2-tracker-language') === 'en' ? 'en' : 'zh'
}

function statusLabel(status: CurrentStatus, language: Language): string {
  if (status === 'referred_to_cjeu') return language === 'zh' ? 'CJEU 转交' : 'CJEU referral'
  if (status === 'unknown') return language === 'zh' ? '未提供' : 'Not provided'
  return language === 'zh' ? '已通知 / 状态页' : 'Notified / state-of-play'
}

function decisionLabel(type: DecisionType, language: Language): string {
  if (type === 'formal_notice') return language === 'zh' ? '正式通知' : 'Formal notice'
  if (type === 'reasoned_opinion') return language === 'zh' ? '理由意见' : 'Reasoned opinion'
  return language === 'zh' ? 'CJEU 转交' : 'CJEU referral'
}

function App() {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage())
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [filters, setFilters] = useState<FilterState>({ currentStatus: ALL_FILTER, transpositionState: ALL_FILTER, decisionType: ALL_FILTER, countryCode: ALL_FILTER })
  const [updates, setUpdates] = useState<UpdatesData | null>(null)
  const [history, setHistory] = useState<HistoryData | null>(null)
  const copy = UI[language]

  useEffect(() => {
    window.localStorage.setItem('nis2-tracker-language', language)
  }, [language])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/updates.json`)
      .then((response) => response.ok ? response.json() as Promise<UpdatesData> : null)
      .then((data) => setUpdates(data))
      .catch(() => setUpdates(null))
    fetch(`${import.meta.env.BASE_URL}data/history.json`)
      .then((response) => response.ok ? response.json() as Promise<HistoryData> : null)
      .then((data) => setHistory(data))
      .catch(() => setHistory(null))
  }, [])

  const filteredMemberStates = useMemo(() => filterMemberStates(memberStates, publicDecisions, filters), [filters])
  const filteredDecisions = useMemo(() => filterPublicDecisions(publicDecisions, filters, memberStates), [filters])
  const metrics = useMemo(() => getDashboardMetrics(filteredMemberStates, filteredDecisions), [filteredMemberStates, filteredDecisions])

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function resetFilters() {
    setFilters({ currentStatus: ALL_FILTER, transpositionState: ALL_FILTER, decisionType: ALL_FILTER, countryCode: ALL_FILTER })
  }

  function exportCurrent(format: 'markdown' | 'json' | 'csv') {
    const stamp = new Date().toISOString().slice(0, 10)
    if (format === 'markdown') triggerDownload(`nis2-view-${stamp}.md`, buildExportMarkdown(filteredMemberStates, filteredDecisions, language, filters), 'text/markdown;charset=utf-8')
    if (format === 'json') triggerDownload(`nis2-view-${stamp}.json`, buildExportJson(filteredMemberStates, filteredDecisions, language, filters), 'application/json;charset=utf-8')
    if (format === 'csv') triggerDownload(`nis2-member-states-${stamp}.csv`, buildExportCsv(filteredMemberStates, filteredDecisions, language), 'text/csv;charset=utf-8')
  }

  const tabs: Array<{ key: TabKey; label: string; icon: typeof LayoutDashboard }> = [
    { key: 'dashboard', label: copy.dashboard, icon: LayoutDashboard },
    { key: 'states', label: copy.states, icon: Table2 },
    { key: 'decisions', label: copy.decisions, icon: Gavel },
    { key: 'timeline', label: copy.timeline, icon: TimelineIcon },
    { key: 'charts', label: copy.charts, icon: BarChart3 },
  ]

  return <div className="app-shell">
    <header className="hero">
      <div className="container">
        <div className="top-nav"><button type="button" className="brand-lockup" onClick={() => setTab('dashboard')}><Landmark size={18} /><span>{copy.brand}</span></button><nav className="top-links" aria-label="Primary"><button type="button" className="top-link active" onClick={() => setTab('dashboard')}>NIS2</button><button type="button" className="top-link" onClick={() => setTab('states')}>{language === 'zh' ? '成员国' : 'Member States'}</button><button type="button" className="top-link" onClick={() => setTab('decisions')}>{language === 'zh' ? '公开决定' : 'Decisions'}</button><button type="button" className="top-link" onClick={() => setTab('charts')}>{language === 'zh' ? '统计' : 'Analytics'}</button><a className="top-link" href={officialSources[0].url} target="_blank" rel="noreferrer">{language === 'zh' ? 'EUR-Lex' : 'EUR-Lex'} <ArrowUpRight size={12} /></a></nav><button type="button" className="language-button" aria-pressed={language === 'en'} onClick={() => setLanguage((current) => current === 'zh' ? 'en' : 'zh')}><Languages size={15} /> {copy.language}: {language === 'zh' ? '中文' : 'EN'}</button></div>
        <div className="hero-main"><div className="hero-copy"><span className="hero-context"><span className="hero-rule" />{copy.context}</span><h1>{copy.title}</h1><p className="hero-subtitle">{copy.subtitle}</p><p className="hero-description">{copy.description}</p><a className="hero-source" href={officialSources[0].url} target="_blank" rel="noreferrer">{copy.directive} <ArrowUpRight size={13} /></a><div className="hero-meta"><CalendarDays size={13} /> {copy.dataAsOf} {formatDate(DATA_AS_OF, language)}</div></div><div className="hero-kpis"><div className="hero-kpi"><span className="kpi-icon"><Landmark size={18} /></span><strong>{memberStates.length}</strong><small>{copy.memberStates}</small></div><div className="hero-kpi"><span className="kpi-icon"><CheckCircle2 size={18} /></span><strong>{metrics.notifiedCount}</strong><small>{copy.notified}</small></div><div className="hero-kpi kpi-alert"><span className="kpi-icon"><Scale size={18} /></span><strong>{metrics.referredCount}</strong><small>{copy.referred}</small></div><div className="hero-kpi"><span className="kpi-icon"><FileText size={18} /></span><strong>{metrics.decisionRoundCount}</strong><small>{copy.rounds}</small></div></div></div>
      </div>
    </header>

    <main className="container page-main">
      <section className="filter-bar surface-panel" aria-label={copy.filters}><div className="filter-title"><Filter size={16} /><strong>{copy.filters}</strong></div><label><span>{copy.status}</span><select value={filters.currentStatus ?? ALL_FILTER} onChange={(event) => setFilter('currentStatus', event.target.value as CurrentStatus | typeof ALL_FILTER)}><option value={ALL_FILTER}>{copy.allStatuses}</option><option value="notified">{statusLabel('notified', language)}</option><option value="referred_to_cjeu">{statusLabel('referred_to_cjeu', language)}</option></select></label><label><span>{language === 'zh' ? '国家转置状态' : 'Transposition state'}</span><select value={filters.transpositionState ?? ALL_FILTER} onChange={(event) => setFilter('transpositionState', event.target.value as TranspositionState | typeof ALL_FILTER)}><option value={ALL_FILTER}>{copy.allTransposition}</option><option value="transposed">{language === 'zh' ? '已转置' : 'Transposed'}</option><option value="reasoned_opinion">{language === 'zh' ? '理由意见' : 'Reasoned opinion'}</option><option value="not_yet_transposed">{language === 'zh' ? '尚未转置' : 'Not yet transposed'}</option></select></label><label><span>{language === 'zh' ? '公开决定阶段' : 'Decision stage'}</span><select value={filters.decisionType ?? ALL_FILTER} onChange={(event) => setFilter('decisionType', event.target.value as DecisionType | typeof ALL_FILTER)}><option value={ALL_FILTER}>{copy.allRounds}</option><option value="formal_notice">{decisionLabel('formal_notice', language)}</option><option value="reasoned_opinion">{decisionLabel('reasoned_opinion', language)}</option><option value="cjeu_referral">{decisionLabel('cjeu_referral', language)}</option></select></label><label><span>{copy.country}</span><select value={filters.countryCode ?? ALL_FILTER} onChange={(event) => setFilter('countryCode', event.target.value)}><option value={ALL_FILTER}>{copy.allCountries}</option>{memberStates.map((item) => <option value={item.code} key={item.code}>{item.code} · {item.name[language]}</option>)}</select></label><button type="button" className="reset-filter" onClick={resetFilters}><ChevronDown size={14} className="reset-icon" />{copy.reset}</button><div className="export-tools"><span><Download size={14} /> {copy.export}</span><button type="button" onClick={() => exportCurrent('markdown')}>MD</button><button type="button" onClick={() => exportCurrent('json')}>JSON</button><button type="button" onClick={() => exportCurrent('csv')}>CSV</button></div></section>
      {(filters.decisionType !== ALL_FILTER || filters.currentStatus !== ALL_FILTER || filters.transpositionState !== ALL_FILTER || filters.countryCode !== ALL_FILTER) && <div className="filter-note"><ListFilter size={14} />{filters.decisionType !== ALL_FILTER ? copy.historyNote : filters.transpositionState !== ALL_FILTER ? copy.transpositionNote : copy.statusNote}</div>}

      <div className="tabs" role="tablist" aria-label={language === 'zh' ? '页面视图' : 'Page views'}>{tabs.map(({ key, label, icon: Icon }) => <button type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)} key={key}><Icon size={15} />{label}</button>)}</div>

      {tab === 'dashboard' && <DashboardOverview items={filteredMemberStates} decisions={filteredDecisions} metrics={metrics} updates={updates} history={history} language={language} officialSources={officialSources} onOpenTab={setTab} decisionFilterActive={filters.decisionType !== ALL_FILTER} />}
      {tab === 'states' && <section className="registry-panel surface-panel"><div className="section-heading"><div><h2>{copy.registerTitle}</h2><p>{copy.registerSub}</p></div><span className="result-count">{filteredMemberStates.length} / {memberStates.length}</span></div>{filteredMemberStates.length === 0 ? <div className="empty-state">{copy.noStates}</div> : <div className="registry-table"><div className="registry-header"><span>{copy.country}</span><span>{copy.status}</span><span>{copy.measure}</span><span>{copy.updated}</span><span>{copy.stages}</span><span>{copy.source}</span><span>{copy.action}</span></div>{filteredMemberStates.map((item) => <MemberStateRow item={item} language={language} decisionStages={filteredDecisions.filter((decision) => decision.countries.includes(item.code)).map((decision) => decisionLabel(decision.decision_type, language)).join(' · ')} key={item.id} />)}</div>}</section>}
      {tab === 'decisions' && <section className="decision-register"><div className="section-heading"><div><h2>{copy.decisionTitle}</h2><p>{copy.decisionSub}</p></div><span className="result-count">{filteredDecisions.length} / {publicDecisions.length}</span></div>{filteredDecisions.length === 0 ? <div className="empty-state surface-panel">{copy.noDecisions}</div> : <div className="decision-register-grid">{filteredDecisions.map((decision) => <PublicDecisionCard item={decision} language={language} key={decision.id} />)}</div>}</section>}
      {tab === 'timeline' && <Timeline items={filteredMemberStates} language={language} />}
      {tab === 'charts' && <Charts metrics={metrics} language={language} />}

      <footer className="footer"><div><strong>{copy.footSource}</strong><span>{copy.disclaimer}</span></div><a href={officialSources[1].url} target="_blank" rel="noreferrer">{copy.official} <ArrowUpRight size={12} /></a></footer>
    </main>
  </div>
}

export default App
