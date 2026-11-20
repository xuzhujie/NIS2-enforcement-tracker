import {
  text,
  type Bilingual,
  type Language,
  type MemberStateRecord,
  type PublicDecisionRecord,
} from '../data/nis2'

export interface ExportFilters {
  currentStatus?: string
  transpositionState?: string
  decisionType?: string
  countryCode?: string
}

function display(value: Bilingual | undefined, language: Language): string {
  return value ? text(value, language) : ''
}

function csvCell(value: string | number | null | undefined): string {
  const textValue = value == null ? '' : String(value)
  return `"${textValue.replaceAll('"', '""')}"`
}

function decisionStagesForCountry(country: MemberStateRecord, decisions: PublicDecisionRecord[]): string {
  return decisions
    .filter((decision) => decision.countries.includes(country.code))
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((decision) => decision.decision_type)
    .join(' | ')
}

function decisionIdsForCountry(country: MemberStateRecord, decisions: PublicDecisionRecord[]): string {
  const ids = new Set(country.commission_case_ids)
  decisions.forEach((decision) => {
    if (decision.countries.includes(country.code)) ids.add(decision.id)
  })
  return [...ids].join(' | ')
}

function filterLines(filters: ExportFilters): string {
  return Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n') || '- none'
}

export function buildExportMarkdown(
  countries: MemberStateRecord[],
  decisions: PublicDecisionRecord[],
  language: Language,
  filters: ExportFilters,
  exportedAt = new Date().toISOString(),
): string {
  const isChinese = language === 'zh'
  const title = isChinese ? '# NIS2 执法追踪器导出' : '# NIS2 Enforcement Tracker export'
  const filtersTitle = isChinese ? '## 当前筛选' : '## Active filters'
  const countriesTitle = isChinese ? '## 成员国' : '## Member States'
  const decisionsTitle = isChinese ? '## 公开决定' : '## Public decisions'
  const countryLines = countries.map((country) => {
    const decisionStages = decisionStagesForCountry(country, decisions)
    const fields = isChinese
      ? [
          `- 国家：${display(country.name, language)} (${country.code})`,
          `- 当前状态：${display(country.status_label, language)}`,
          `- 转置状态：${display(country.transposition_label, language)}`,
          `- 最新阶段：${display(country.latest_stage, language)}`,
          `- 最新日期：${country.latest_date}`,
          `- 决定阶段：${decisionStages || '—'}`,
          `- 官方来源：${country.source_url}`,
          `- 证据摘要：${display(country.evidence_snapshot, language)}`,
        ]
      : [
          `- Country: ${display(country.name, language)} (${country.code})`,
          `- Current status: ${display(country.status_label, language)}`,
          `- Transposition status: ${display(country.transposition_label, language)}`,
          `- Latest stage: ${display(country.latest_stage, language)}`,
          `- Latest date: ${country.latest_date}`,
          `- Decision stages: ${decisionStages || '—'}`,
          `- Official source: ${country.source_url}`,
          `- Evidence: ${display(country.evidence_snapshot, language)}`,
        ]
    return `### ${display(country.name, language)}\n${fields.join('\n')}`
  })
  const decisionLines = decisions.map((decision) => {
    const countriesText = decision.countries.join(', ')
    const refs = decision.infr_refs?.map((ref) => `${ref.country}: ${ref.value}`).join(' | ') ?? '—'
    const fields = isChinese
      ? [`- 日期：${decision.date}`, `- 阶段：${decision.decision_type}`, `- 覆盖国家：${countriesText}`, `- INFR：${refs}`, `- 摘要：${display(decision.summary, language)}`, `- 官方来源：${decision.source_url}`]
      : [`- Date: ${decision.date}`, `- Stage: ${decision.decision_type}`, `- Countries: ${countriesText}`, `- INFR: ${refs}`, `- Summary: ${display(decision.summary, language)}`, `- Official source: ${decision.source_url}`]
    return `### ${display(decision.title, language)}\n${fields.join('\n')}`
  })

  return [
    title,
    isChinese ? `\n导出时间：${exportedAt}` : `\nExported at: ${exportedAt}`,
    filtersTitle,
    filterLines(filters),
    countriesTitle,
    countryLines.join('\n\n') || (isChinese ? '暂无成员国记录。' : 'No Member State records.'),
    decisionsTitle,
    decisionLines.join('\n\n') || (isChinese ? '暂无公开决定记录。' : 'No public decision records.'),
  ].join('\n\n') + '\n'
}

export function buildExportJson(
  countries: MemberStateRecord[],
  decisions: PublicDecisionRecord[],
  language: Language,
  filters: ExportFilters,
  exportedAt = new Date().toISOString(),
): string {
  return JSON.stringify({ exported_at: exportedAt, language, filters, member_states: countries, public_decisions: decisions }, null, 2)
}

export function buildExportCsv(countries: MemberStateRecord[], decisions: PublicDecisionRecord[], language: Language): string {
  const columns = [
    'country_code',
    'country_name',
    'current_status',
    'status_label',
    'transposition_state',
    'transposition_label',
    'latest_stage',
    'first_date',
    'latest_date',
    'national_measure',
    'competent_authority',
    'csirt',
    'spoc',
    'decision_ids',
    'decision_stages',
    'source_url',
    'source_type',
    'evidence_snapshot',
    'last_verified_at',
  ]
  const rows = countries.map((country) => [
    country.code,
    display(country.name, language),
    country.current_status,
    display(country.status_label, language),
    country.transposition_state,
    display(country.transposition_label, language),
    display(country.latest_stage, language),
    country.first_date,
    country.latest_date,
    display(country.national_measure, language),
    display(country.competent_authority, language),
    display(country.csirt, language),
    display(country.spoc, language),
    decisionIdsForCountry(country, decisions),
    decisionStagesForCountry(country, decisions),
    country.source_url,
    country.source_type.join(' | '),
    display(country.evidence_snapshot, language),
    country.last_verified_at,
  ].map(csvCell).join(','))
  return [columns.join(','), ...rows].join('\n') + '\n'
}

export function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
