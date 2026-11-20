import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DATA_AS_OF,
  memberStates,
  publicDecisions,
  type MemberStateRecord,
} from '../src/data/nis2'
import { countryProfiles } from '../src/data/countryProfiles'
import {
  filterMemberStates,
  filterPublicDecisions,
  getDashboardMetrics,
} from '../src/data/dashboardMetrics'

test('seed data covers all 27 EU Member States and three public decisions', () => {
  assert.equal(memberStates.length, 27)
  assert.equal(publicDecisions.length, 3)
})

test('country matrix has a source-backed profile for every Member State', () => {
  assert.equal(Object.keys(countryProfiles).length, 27)
  assert.equal(memberStates.filter((item) => item.transposition_state === 'transposed').length, 7)
  assert.equal(memberStates.filter((item) => item.transposition_state === 'reasoned_opinion').length, 19)
  assert.equal(memberStates.filter((item) => item.transposition_state === 'not_yet_transposed').length, 1)

  for (const item of memberStates) {
    assert.ok(countryProfiles[item.code])
    assert.ok(item.competent_authority)
    assert.ok(item.csirt)
    assert.ok(item.spoc)
    assert.equal(item.last_verified_at, DATA_AS_OF)
    assert.ok(item.sources.some((source) => source.url === item.source_url || source.url.includes(`nis2-directive-${item.code.toLowerCase()}`)))
  }
})

test('current status counts separate notified states from CJEU referrals', () => {
  const metrics = getDashboardMetrics(memberStates, publicDecisions)

  assert.equal(metrics.currentStatus.notified, 23)
  assert.equal(metrics.currentStatus.referred_to_cjeu, 4)
})

test('decision-stage filters use historical country membership', () => {
  assert.equal(filterPublicDecisions(publicDecisions, { decisionType: 'reasoned_opinion' }).length, 1)
  assert.equal(filterMemberStates(memberStates, publicDecisions, { decisionType: 'reasoned_opinion' }).length, 19)
  assert.equal(filterMemberStates(memberStates, publicDecisions, { currentStatus: 'referred_to_cjeu' }).length, 4)
})

test('transposition filters use country-page state independently from procedure status', () => {
  assert.equal(filterMemberStates(memberStates, publicDecisions, { transpositionState: 'transposed' }).length, 7)
  assert.equal(filterMemberStates(memberStates, publicDecisions, { transpositionState: 'not_yet_transposed' }).map((item) => item.code).join(','), 'MT')
  assert.equal(filterPublicDecisions(publicDecisions, { transpositionState: 'transposed' }, memberStates).length, 1)
})

test('current status filters narrow decisions to linked countries when records are supplied', () => {
  assert.equal(filterPublicDecisions(publicDecisions, { currentStatus: 'referred_to_cjeu' }, memberStates).length, 3)
  assert.equal(filterPublicDecisions(publicDecisions, { currentStatus: 'notified' }, memberStates).length, 2)
})

test('country filter keeps one record even when a country appears in multiple decisions', () => {
  const filtered = filterMemberStates(memberStates, publicDecisions, { decisionType: 'formal_notice' })
  const codes = filtered.map((item) => item.code)

  assert.equal(filtered.length, new Set(codes).size)
  assert.equal(filtered.length, 23)
})

test('missing authority metadata remains undefined for explicit UI fallback', () => {
  const incomplete: MemberStateRecord = {
    id: 'test-xx',
    code: 'XX',
    name: { zh: '测试国', en: 'Testland' },
    current_status: 'unknown',
    status_label: { zh: '未提供', en: 'Not provided' },
    transposition_state: 'unknown',
    transposition_label: { zh: '未提供', en: 'Not provided' },
    first_date: '2024-10-17',
    latest_date: '2024-10-17',
    latest_stage: { zh: '未提供', en: 'Not provided' },
    commission_case_ids: [],
    source_url: 'https://example.com/testland',
    source_type: ['fixture'],
    evidence_snapshot: { zh: '测试夹具', en: 'Test fixture' },
    last_verified_at: '2026-11-20',
    events: [],
  }

  const result = filterMemberStates([incomplete], [], {})[0]

  assert.equal(result?.competent_authority, undefined)
  assert.equal(result?.csirt, undefined)
  assert.equal(result?.spoc, undefined)
})
