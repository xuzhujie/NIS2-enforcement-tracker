import { countryProfiles } from './countryProfiles'

export type Language = 'zh' | 'en'
export type Bilingual = { zh: string; en: string }

export type CurrentStatus = 'notified' | 'referred_to_cjeu' | 'unknown'
export type TranspositionState = 'transposed' | 'reasoned_opinion' | 'not_yet_transposed' | 'unknown'
export type DecisionType = 'formal_notice' | 'reasoned_opinion' | 'cjeu_referral'
export type EventKind = 'deadline' | DecisionType | 'status_update'
export type HistoryChangeKind = 'deadline' | DecisionType | 'data_refresh'

export interface SourceRef {
  label: Bilingual
  url: string
  source_type?: string
  evidence_snapshot?: Bilingual
  last_verified_at?: string
}

export interface EventItem {
  date: string
  label: Bilingual
  description: Bilingual
  kind: EventKind
}

export interface MemberStateRecord {
  id: string
  code: string
  name: Bilingual
  current_status: CurrentStatus
  status_label: Bilingual
  transposition_state: TranspositionState
  transposition_label: Bilingual
  national_measure?: Bilingual
  national_measure_url?: string
  national_strategy_note?: Bilingual
  competent_authority?: Bilingual
  csirt?: Bilingual
  spoc?: Bilingual
  national_strategy_url?: string
  first_date: string
  latest_date: string
  latest_stage: Bilingual
  commission_case_ids: string[]
  source_url: string
  source_type: string[]
  evidence_snapshot: Bilingual
  last_verified_at: string
  notes?: Bilingual
  events: EventItem[]
  sources: SourceRef[]
}

export interface PublicDecisionRecord {
  id: string
  decision_type: DecisionType
  date: string
  title: Bilingual
  countries: string[]
  infr_refs?: Array<{ country: string; value: string }>
  authority: Bilingual
  summary: Bilingual
  legal_basis: string[]
  source_url: string
  source_type: string[]
  evidence_snapshot: Bilingual
  last_verified_at: string
}

export interface OfficialSource {
  label: Bilingual
  url: string
  desc: Bilingual
}

export interface UpdateItem {
  title: string
  title_zh?: string
  link: string
  date: string
  summary: string
  summary_zh?: string
}

export interface UpdatesData {
  updated_at: string
  items: UpdateItem[]
}

export interface HistorySnapshot {
  date: string
  label: Bilingual
  member_state_count?: number
  current_notified_count?: number
  current_referred_count?: number
  decision_round_count?: number
  decision_scope_count?: number
  note: Bilingual
  source_url: string
}

export interface HistoryChange {
  date: string
  kind: HistoryChangeKind
  title: Bilingual
  summary: Bilingual
  source_url: string
}

export interface HistoryData {
  updated_at: string
  snapshots: HistorySnapshot[]
  changes: HistoryChange[]
}

export const DATA_AS_OF = '2026-11-20'
export const ALL_FILTER = '__all__'

const SOURCE_DIRECTIVE = 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj'
const SOURCE_POLICY = 'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive'
const SOURCE_TRANSPOSITION = 'https://digital-strategy.ec.europa.eu/en/policies/nis-transposition'
const SOURCE_FORMAL_NOTICE = 'https://digital-strategy.ec.europa.eu/en/news/commission-calls-23-member-states-fully-transpose-nis2-directive'
const SOURCE_REASONED_OPINION = 'https://digital-strategy.ec.europa.eu/en/news/commission-calls-19-member-states-fully-transpose-nis2-directive'
const SOURCE_REFERRAL = 'https://digital-strategy.ec.europa.eu/en/news/commission-refers-ireland-spain-france-and-netherlands-court-justice-failing-transpose-rules'
const SOURCE_ENISA = 'https://www.enisa.europa.eu/topics/nis2-directive'

const countrySlugs: Record<string, string> = {
  AT: 'austria',
  BE: 'belgium',
  BG: 'bulgaria',
  HR: 'croatia',
  CY: 'cyprus',
  CZ: 'czech-republic',
  DK: 'denmark',
  EE: 'estonia',
  FI: 'finland',
  FR: 'france',
  DE: 'germany',
  EL: 'greece',
  HU: 'hungary',
  IE: 'ireland',
  IT: 'italy',
  LV: 'latvia',
  LT: 'lithuania',
  LU: 'luxembourg',
  MT: 'malta',
  NL: 'netherlands',
  PL: 'poland',
  PT: 'portugal',
  RO: 'romania',
  SK: 'slovakia',
  SI: 'slovenia',
  ES: 'spain',
  SE: 'sweden',
}

const countryNames: Array<[string, string, string]> = [
  ['AT', '奥地利', 'Austria'],
  ['BE', '比利时', 'Belgium'],
  ['BG', '保加利亚', 'Bulgaria'],
  ['HR', '克罗地亚', 'Croatia'],
  ['CY', '塞浦路斯', 'Cyprus'],
  ['CZ', '捷克', 'Czechia'],
  ['DK', '丹麦', 'Denmark'],
  ['EE', '爱沙尼亚', 'Estonia'],
  ['FI', '芬兰', 'Finland'],
  ['FR', '法国', 'France'],
  ['DE', '德国', 'Germany'],
  ['EL', '希腊', 'Greece'],
  ['HU', '匈牙利', 'Hungary'],
  ['IE', '爱尔兰', 'Ireland'],
  ['IT', '意大利', 'Italy'],
  ['LV', '拉脱维亚', 'Latvia'],
  ['LT', '立陶宛', 'Lithuania'],
  ['LU', '卢森堡', 'Luxembourg'],
  ['MT', '马耳他', 'Malta'],
  ['NL', '荷兰', 'The Netherlands'],
  ['PL', '波兰', 'Poland'],
  ['PT', '葡萄牙', 'Portugal'],
  ['RO', '罗马尼亚', 'Romania'],
  ['SK', '斯洛伐克', 'Slovakia'],
  ['SI', '斯洛文尼亚', 'Slovenia'],
  ['ES', '西班牙', 'Spain'],
  ['SE', '瑞典', 'Sweden'],
]

const formalNoticeCountries = ['BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'CY', 'LV', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
const reasonedOpinionCountries = ['BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'ES', 'FR', 'CY', 'LV', 'LU', 'HU', 'NL', 'AT', 'PL', 'PT', 'SI', 'FI', 'SE']
const referralCountries = ['IE', 'ES', 'FR', 'NL']

const referralRefs: Record<string, string> = {
  IE: 'INFR(2024)0279',
  ES: 'INFR(2024)0270',
  FR: 'INFR(2024)0274',
  NL: 'INFR(2024)0288',
}

function countryPageUrl(code: string): string {
  return `https://digital-strategy.ec.europa.eu/en/policies/nis2-directive-${countrySlugs[code] ?? code.toLowerCase()}`
}

function nameOf(code: string): Bilingual {
  const [, zh, en] = countryNames.find(([countryCode]) => countryCode === code) ?? [code, code, code]
  return { zh, en }
}

function statusFor(code: string): CurrentStatus {
  return referralCountries.includes(code) ? 'referred_to_cjeu' : 'notified'
}

function eventFor(code: string): EventItem[] {
  const name = nameOf(code)
  const events: EventItem[] = []
  if (formalNoticeCountries.includes(code)) {
    events.push({
      date: '2024-11-28',
      label: { zh: '发出正式通知', en: 'Formal notice issued' },
      description: { zh: `欧委会将${name.zh}列入未完整通知 NIS2 转置措施的 23 国批次。`, en: `The Commission included ${name.en} in the 23-country batch for incomplete notification of NIS2 transposition measures.` },
      kind: 'formal_notice',
    })
  } else {
    events.push({
      date: '2024-10-17',
      label: { zh: '转置期限', en: 'Transposition deadline' },
      description: { zh: 'NIS2 成员国转置期限届满；该国未出现在 2024-11-28 正式通知批次中。', en: 'The NIS2 transposition deadline passed; this country was not included in the 28 November 2024 formal-notice batch.' },
      kind: 'deadline',
    })
  }
  if (reasonedOpinionCountries.includes(code)) {
    events.push({
      date: '2025-05-07',
      label: { zh: '发出理由意见', en: 'Reasoned opinion issued' },
      description: { zh: `欧委会将${name.zh}列入未完整通知 NIS2 转置措施的 19 国批次。`, en: `The Commission included ${name.en} in the 19-country batch for incomplete notification of NIS2 transposition measures.` },
      kind: 'reasoned_opinion',
    })
  }
  if (referralCountries.includes(code)) {
    events.push({
      date: '2026-07-08',
      label: { zh: '转交欧盟法院', en: 'Referred to the CJEU' },
      description: { zh: `欧委会决定将${name.zh}转交欧盟法院，涉及 NIS2 转置通知义务。`, en: `The Commission decided to refer ${name.en} to the Court of Justice over the NIS2 transposition notification obligation.` },
      kind: 'cjeu_referral',
    })
  }
  return events.sort((left, right) => left.date.localeCompare(right.date))
}

function buildMemberState(code: string, zh: string, en: string): MemberStateRecord {
  const currentStatus = statusFor(code)
  const referred = currentStatus === 'referred_to_cjeu'
  const pageUrl = countryPageUrl(code)
  const profile = countryProfiles[code]
  const sourceUrl = referred ? SOURCE_REFERRAL : pageUrl
  const statusLabel = referred
    ? { zh: '转交 CJEU', en: 'Referred to CJEU' }
    : { zh: '已通知 / 状态页显示', en: 'Notified / state-of-play' }
  const transpositionState = profile?.transposition_state ?? 'unknown'
  const transpositionLabel = profile?.transposition_label ?? { zh: '未提供', en: 'Not provided' }
  const pageUpdatedAt = profile?.source_page_updated_at ?? DATA_AS_OF
  const evidenceSnapshot = referred
    ? { zh: `欧委会国家页状态为“${transpositionLabel.zh}”（页面最后更新 ${pageUpdatedAt}）；2026-07-08 公告又确认该国尚未通知完整 NIS2 转置措施并已转交 CJEU。`, en: `The EC country page shows “${transpositionLabel.en}” (page last updated ${pageUpdatedAt}); the 8 July 2026 announcement then confirmed that the country had not notified complete NIS2 transposition and referred it to the CJEU.` }
    : { zh: `欧委会国家页状态为“${transpositionLabel.zh}”（页面最后更新 ${pageUpdatedAt}）；这不等于欧委会已完成实体合规审查。`, en: `The EC country page shows “${transpositionLabel.en}” (page last updated ${pageUpdatedAt}); this is not a completed substantive compliance assessment.` }

  return {
    id: `member-state-${code.toLowerCase()}`,
    code,
    name: { zh, en },
    current_status: currentStatus,
    status_label: statusLabel,
    transposition_state: transpositionState,
    transposition_label: transpositionLabel,
    national_strategy_url: profile?.national_strategy_url,
    national_strategy_note: profile?.national_strategy_note,
    competent_authority: profile?.competent_authority,
    csirt: profile?.csirt,
    spoc: profile?.spoc,
    first_date: formalNoticeCountries.includes(code) ? '2024-11-28' : '2024-10-17',
    latest_date: referred ? '2026-07-08' : pageUpdatedAt,
    latest_stage: referred
      ? { zh: '转交 CJEU', en: 'CJEU referral' }
      : transpositionLabel,
    commission_case_ids: referralRefs[code] ? [referralRefs[code]] : [],
    source_url: sourceUrl,
    source_type: referred ? ['EC infringement decision', 'EC country page'] : ['EC transposition country page', 'EC transposition overview'],
    evidence_snapshot: evidenceSnapshot,
    last_verified_at: DATA_AS_OF,
    notes: profile?.national_strategy_note ?? { zh: '国家页信息会逐步更新；未在官方页面单独列出的国家措施标题保持未提供。', en: 'Country pages are updated progressively; a national measure title is left unavailable when the official page does not name one.' },
    events: eventFor(code),
    sources: [
      { label: { zh: '欧委会：国家状态页', en: 'EC: country state-of-play' }, url: pageUrl, source_type: 'European Commission', evidence_snapshot: { zh: `国家页最后更新 ${pageUpdatedAt}。`, en: `Country page last updated ${pageUpdatedAt}.` }, last_verified_at: DATA_AS_OF },
      { label: { zh: '欧委会：NIS2 转置总览', en: 'EC: NIS2 transposition overview' }, url: SOURCE_TRANSPOSITION, source_type: 'European Commission', last_verified_at: DATA_AS_OF },
      ...(profile?.national_strategy_url ? [{ label: { zh: '国家网络与信息系统战略', en: 'National strategy for network and information systems' }, url: profile.national_strategy_url, source_type: 'National official source', last_verified_at: DATA_AS_OF }] : []),
      ...(referred ? [{ label: { zh: '欧委会：CJEU 转交公告', en: 'EC: CJEU referral announcement' }, url: SOURCE_REFERRAL, source_type: 'European Commission', last_verified_at: DATA_AS_OF }] : []),
    ],
  }
}

export const memberStates: MemberStateRecord[] = countryNames.map(([code, zh, en]) => buildMemberState(code, zh, en))

export const publicDecisions: PublicDecisionRecord[] = [
  {
    id: 'ec-nis2-formal-notice-2024-11-28',
    decision_type: 'formal_notice',
    date: '2024-11-28',
    title: { zh: '对 23 个成员国发出正式通知', en: 'Formal notices to 23 Member States' },
    countries: formalNoticeCountries,
    authority: { zh: '欧盟委员会', en: 'European Commission' },
    summary: { zh: '欧委会因 23 个成员国未完整转置或通知 NIS2 指令措施，决定发送正式通知。', en: 'The Commission sent letters of formal notice to 23 Member States for failing to fully transpose or notify measures implementing NIS2.' },
    legal_basis: ['Directive (EU) 2022/2555', 'TFEU Article 258'],
    source_url: SOURCE_FORMAL_NOTICE,
    source_type: ['EC press release', 'EU infringement procedure'],
    evidence_snapshot: { zh: '官方新闻稿列出 23 国名单，并确认成员国原定于 2024-10-17 完成转置。', en: 'The official press release lists the 23 countries and confirms the 17 October 2024 transposition deadline.' },
    last_verified_at: DATA_AS_OF,
  },
  {
    id: 'ec-nis2-reasoned-opinion-2025-05-07',
    decision_type: 'reasoned_opinion',
    date: '2025-05-07',
    title: { zh: '对 19 个成员国发出理由意见', en: 'Reasoned opinions to 19 Member States' },
    countries: reasonedOpinionCountries,
    authority: { zh: '欧盟委员会', en: 'European Commission' },
    summary: { zh: '欧委会在 19 国未完成完整通知后发出理由意见，并给予两个月回应期限。', en: 'The Commission issued reasoned opinions to 19 Member States that had not notified full transposition, giving them two months to respond.' },
    legal_basis: ['Directive (EU) 2022/2555', 'TFEU Article 258'],
    source_url: SOURCE_REASONED_OPINION,
    source_type: ['EC transposition state-of-play', 'EU infringement procedure'],
    evidence_snapshot: { zh: '欧委会转置总览页公开列出 19 国理由意见批次，并提示后续可能转交 CJEU。', en: 'The Commission transposition overview lists the 19-country reasoned-opinion batch and notes that referrals to the CJEU could follow.' },
    last_verified_at: DATA_AS_OF,
  },
  {
    id: 'ec-nis2-cjeu-referral-2026-07-08',
    decision_type: 'cjeu_referral',
    date: '2026-07-08',
    title: { zh: '将爱尔兰、西班牙、法国和荷兰转交 CJEU', en: 'CJEU referrals for Ireland, Spain, France and the Netherlands' },
    countries: referralCountries,
    infr_refs: referralCountries.map((country) => ({ country, value: referralRefs[country] })),
    authority: { zh: '欧盟委员会', en: 'European Commission' },
    summary: { zh: '欧委会因四国未通知完整 NIS2 转置措施，决定转交欧盟法院，并请求处以一次性及每日罚款。', en: 'The Commission referred four Member States for failing to notify complete NIS2 transposition measures and asked the Court to impose lump-sum and daily penalties.' },
    legal_basis: ['Directive (EU) 2022/2555', 'TFEU Article 258'],
    source_url: SOURCE_REFERRAL,
    source_type: ['EC press release', 'CJEU referral', 'EU infringement procedure'],
    evidence_snapshot: { zh: '2026-07-08 欧委会公告确认四国仍未通知完整转置，并披露正式通知、理由意见和转交的时间链。', en: 'The Commission’s 8 July 2026 announcement confirms that the four countries had not notified complete transposition and discloses the formal-notice, reasoned-opinion, and referral sequence.' },
    last_verified_at: DATA_AS_OF,
  },
]

export const officialSources: OfficialSource[] = [
  { label: { zh: 'EUR-Lex：NIS2 指令正文', en: 'EUR-Lex: NIS2 Directive' }, url: SOURCE_DIRECTIVE, desc: { zh: 'Directive (EU) 2022/2555 正式文本与条款。', en: 'Official text and provisions of Directive (EU) 2022/2555.' } },
  { label: { zh: '欧委会：NIS2 政策页', en: 'EC: NIS2 policy page' }, url: SOURCE_POLICY, desc: { zh: '范围、义务、制度背景与后续政策动态。', en: 'Scope, obligations, institutional background and policy updates.' } },
  { label: { zh: '欧委会：成员国转置总览', en: 'EC: Member State transposition' }, url: SOURCE_TRANSPOSITION, desc: { zh: '27 国状态页与转置状态说明。', en: '27 country pages and transposition state-of-play notes.' } },
  { label: { zh: '欧委会：23 国正式通知', en: 'EC: 23-country formal notice' }, url: SOURCE_FORMAL_NOTICE, desc: { zh: '2024-11-28 公开程序批次。', en: 'Public procedure batch dated 28 November 2024.' } },
  { label: { zh: '欧委会：19 国理由意见', en: 'EC: 19-country reasoned opinion' }, url: SOURCE_REASONED_OPINION, desc: { zh: '2025-05-07 公开程序批次。', en: 'Public procedure batch dated 7 May 2025.' } },
  { label: { zh: '欧委会：CJEU 转交', en: 'EC: CJEU referrals' }, url: SOURCE_REFERRAL, desc: { zh: '2026-07-08 四国转交公告与罚款请求。', en: '8 July 2026 referral announcement and penalty request.' } },
  { label: { zh: 'ENISA：NIS2', en: 'ENISA: NIS2' }, url: SOURCE_ENISA, desc: { zh: '欧盟网络安全机构的 NIS2 实施与协作入口。', en: 'ENISA implementation and cooperation resources.' } },
]

export const DATA_OBJECTS = [
  'member_states',
  'public_decisions',
  'case_events',
  'national_contacts',
  'sources',
  'monitor_runs',
  'history_snapshots',
  'change_log',
] as const

export function text(value: Bilingual, language: Language): string {
  return value[language]
}

export function formatDate(value: string, language: Language): string {
  const parsed = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).format(parsed)
}
