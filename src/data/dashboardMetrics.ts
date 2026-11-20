import {
  ALL_FILTER,
  type CurrentStatus,
  type DecisionType,
  type EventItem,
  type MemberStateRecord,
  type PublicDecisionRecord,
  type TranspositionState,
} from './nis2'

export interface FilterState {
  currentStatus?: CurrentStatus | typeof ALL_FILTER
  transpositionState?: TranspositionState | typeof ALL_FILTER
  decisionType?: DecisionType | typeof ALL_FILTER
  countryCode?: string | typeof ALL_FILTER
}

export interface DashboardMetrics {
  currentStatus: Record<CurrentStatus, number>
  decisionRoundCount: number
  referredCount: number
  notifiedCount: number
  attention: MemberStateRecord[]
  decisionStageCounts: Array<{ decisionType: DecisionType; countries: number; date: string }>
  countryDecisionCounts: Array<{ code: string; count: number }>
  timelineEvents: Array<EventItem & { countryCode?: string }>
}

export function filterPublicDecisions(items: PublicDecisionRecord[], filters: FilterState, memberStates: MemberStateRecord[] = []): PublicDecisionRecord[] {
  const statusCodes = filters.currentStatus && filters.currentStatus !== ALL_FILTER
    ? new Set(memberStates.filter((item) => item.current_status === filters.currentStatus).map((item) => item.code))
    : null
  const transpositionCodes = filters.transpositionState && filters.transpositionState !== ALL_FILTER
    ? new Set(memberStates.filter((item) => item.transposition_state === filters.transpositionState).map((item) => item.code))
    : null
  return items.filter((item) => {
    const matchesType = !filters.decisionType || filters.decisionType === ALL_FILTER || item.decision_type === filters.decisionType
    const matchesCountry = !filters.countryCode || filters.countryCode === ALL_FILTER || item.countries.includes(filters.countryCode)
    const matchesStatus = !statusCodes || item.countries.some((country) => statusCodes.has(country))
    const matchesTransposition = !transpositionCodes || item.countries.some((country) => transpositionCodes.has(country))
    return matchesType && matchesCountry && matchesStatus && matchesTransposition
  })
}

export function filterMemberStates(items: MemberStateRecord[], decisions: PublicDecisionRecord[], filters: FilterState): MemberStateRecord[] {
  return items.filter((item) => {
    const matchesStatus = !filters.currentStatus || filters.currentStatus === ALL_FILTER || item.current_status === filters.currentStatus
    const matchesTransposition = !filters.transpositionState || filters.transpositionState === ALL_FILTER || item.transposition_state === filters.transpositionState
    const matchesCountry = !filters.countryCode || filters.countryCode === ALL_FILTER || item.code === filters.countryCode
    const matchesDecision = !filters.decisionType || filters.decisionType === ALL_FILTER || decisions.some((decision) => decision.decision_type === filters.decisionType && decision.countries.includes(item.code))
    return matchesStatus && matchesTransposition && matchesCountry && matchesDecision
  })
}

export function getDashboardMetrics(items: MemberStateRecord[], decisions: PublicDecisionRecord[]): DashboardMetrics {
  const currentStatus: Record<CurrentStatus, number> = { notified: 0, referred_to_cjeu: 0, unknown: 0 }
  items.forEach((item) => { currentStatus[item.current_status] += 1 })

  const decisionStageCounts = decisions.map((decision) => ({
    decisionType: decision.decision_type,
    countries: decision.countries.length,
    date: decision.date,
  }))

  const decisionCountByCountry = new Map<string, number>()
  decisions.forEach((decision) => decision.countries.forEach((code) => decisionCountByCountry.set(code, (decisionCountByCountry.get(code) ?? 0) + 1)))

  const timelineEvents = items.flatMap((item) => item.events.map((event) => ({ ...event, countryCode: item.code }))).sort((left, right) => right.date.localeCompare(left.date))
  const attention = items.filter((item) => item.current_status === 'referred_to_cjeu' || item.current_status === 'unknown').sort((left, right) => right.latest_date.localeCompare(left.latest_date))

  return {
    currentStatus,
    decisionRoundCount: decisions.length,
    referredCount: currentStatus.referred_to_cjeu,
    notifiedCount: currentStatus.notified,
    attention,
    decisionStageCounts,
    countryDecisionCounts: [...decisionCountByCountry.entries()].map(([code, count]) => ({ code, count })).sort((left, right) => right.count - left.count || left.code.localeCompare(right.code)),
    timelineEvents,
  }
}
