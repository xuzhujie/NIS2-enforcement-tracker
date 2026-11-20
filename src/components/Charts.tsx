import { BarChart3, CheckCircle2, Layers3, Scale } from 'lucide-react'
import { type CurrentStatus, type DecisionType, type Language } from '../data/nis2'
import type { DashboardMetrics } from '../data/dashboardMetrics'

interface ChartsProps {
  metrics: DashboardMetrics
  language: Language
}

function BarList({ values, language }: { values: Array<{ label: string; value: number; meta?: string }>; language: Language }) {
  const max = Math.max(...values.map((item) => item.value), 1)
  return <div className="bar-list">{values.map((item) => <div className="bar-row" key={item.label}><div className="bar-row-head"><span>{item.label}</span><strong>{item.value}<small>{item.meta ?? (language === 'zh' ? '项' : 'items')}</small></strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(item.value === 0 ? 0 : 8, (item.value / max) * 100)}%` }} /></div></div>)}</div>
}

const stageLabels: Record<DecisionType, { zh: string; en: string }> = {
  formal_notice: { zh: '正式通知', en: 'Formal notice' },
  reasoned_opinion: { zh: '理由意见', en: 'Reasoned opinion' },
  cjeu_referral: { zh: 'CJEU 转交', en: 'CJEU referral' },
}

const statusLabels: Record<CurrentStatus, { zh: string; en: string }> = {
  notified: { zh: '已通知 / 状态页', en: 'Notified / state-of-play' },
  referred_to_cjeu: { zh: 'CJEU 转交', en: 'CJEU referral' },
  unknown: { zh: '未提供', en: 'Not provided' },
}

export default function Charts({ metrics, language }: ChartsProps) {
  const statusValues = (Object.keys(metrics.currentStatus) as CurrentStatus[]).map((key) => ({ label: statusLabels[key][language], value: metrics.currentStatus[key] }))
  const stageValues = metrics.decisionStageCounts.map((item) => ({ label: stageLabels[item.decisionType][language], value: item.countries, meta: language === 'zh' ? '国覆盖' : 'countries' }))
  return <section className="charts-grid" aria-label={language === 'zh' ? '统计图表' : 'Charts'}>
    <div className="chart-card surface-panel"><div className="section-heading"><div><h3>{language === 'zh' ? '当前状态分布' : 'Current status mix'}</h3><p>{language === 'zh' ? '矩阵按当前状态计数。' : 'Current-state count used by the matrix.'}</p></div><CheckCircle2 size={17} /></div><BarList values={statusValues} language={language} /></div>
    <div className="chart-card surface-panel"><div className="section-heading"><div><h3>{language === 'zh' ? '公开决定覆盖' : 'Public decision coverage'}</h3><p>{language === 'zh' ? '同一国家可出现在多个历史批次。' : 'A country can appear in more than one historical batch.'}</p></div><Layers3 size={17} /></div><BarList values={stageValues} language={language} /></div>
    <div className="chart-card surface-panel"><div className="section-heading"><div><h3>{language === 'zh' ? '程序轮次' : 'Decision rounds'}</h3><p>{language === 'zh' ? '按官方公开批次而非国家数量计数。' : 'Counted by official batch, not by country.'}</p></div><Scale size={17} /></div><BarList values={[{ label: language === 'zh' ? '公开决定批次' : 'Public decision batches', value: metrics.decisionRoundCount }, { label: language === 'zh' ? 'CJEU 转交国家' : 'Countries referred to CJEU', value: metrics.referredCount }]} language={language} /></div>
    <div className="chart-card surface-panel"><div className="section-heading"><div><h3>{language === 'zh' ? '多轮程序国家' : 'Countries with multiple rounds'}</h3><p>{language === 'zh' ? '用于识别需要沿历史链复核的国家。' : 'Countries needing historical-chain review.'}</p></div><BarChart3 size={17} /></div><BarList values={metrics.countryDecisionCounts.slice(0, 6).map((item) => ({ label: item.code, value: item.count, meta: language === 'zh' ? '批次' : 'rounds' }))} language={language} /></div>
  </section>
}
