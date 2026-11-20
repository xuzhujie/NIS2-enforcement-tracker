import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildExportCsv,
  buildExportJson,
  buildExportMarkdown,
  type ExportFilters,
} from '../src/lib/export'
import type { MemberStateRecord, PublicDecisionRecord } from '../src/data/nis2'

const filters: ExportFilters = {
  currentStatus: 'referred_to_cjeu',
  decisionType: 'cjeu_referral',
  countryCode: 'IE',
}

const country: MemberStateRecord = {
  id: 'member-state-ie',
  code: 'IE',
  name: { zh: '爱尔兰', en: 'Ireland' },
  current_status: 'referred_to_cjeu',
  status_label: { zh: '转交 CJEU', en: 'Referred to CJEU' },
  transposition_state: 'reasoned_opinion',
  transposition_label: { zh: '理由意见：未通知完整转置', en: 'Reasoned opinion: full transposition not notified' },
  first_date: '2024-11-28',
  latest_date: '2026-07-08',
  latest_stage: { zh: '转交 CJEU', en: 'CJEU referral' },
  commission_case_ids: ['INFR(2024)0279'],
  source_url: 'https://example.com/country',
  source_type: ['fixture'],
  evidence_snapshot: { zh: '包含“引号”、逗号, 和换行\n第二行', en: 'Contains "quotes", commas, and a line\nbreak' },
  last_verified_at: '2026-11-20',
  events: [],
  sources: [],
}

const decision: PublicDecisionRecord = {
  id: 'decision-referral',
  decision_type: 'cjeu_referral',
  date: '2026-07-08',
  title: { zh: '转交欧盟法院', en: 'CJEU referral' },
  countries: ['IE'],
  infr_refs: [{ country: 'IE', value: 'INFR(2024)0279' }],
  authority: { zh: '欧盟委员会', en: 'European Commission' },
  summary: { zh: '摘要', en: 'Summary' },
  legal_basis: ['TFEU Article 258'],
  source_url: 'https://example.com/decision',
  source_type: ['fixture'],
  evidence_snapshot: { zh: '证据', en: 'Evidence' },
  last_verified_at: '2026-11-20',
}

test('Markdown export includes filters and both source-first record sections', () => {
  const output = buildExportMarkdown([country], [decision], 'zh', filters, '2026-11-20T00:00:00.000Z')

  assert.match(output, /NIS2 执法追踪器导出/)
  assert.match(output, /currentStatus: referred_to_cjeu/)
  assert.match(output, /## 成员国/)
  assert.match(output, /## 公开决定/)
  assert.match(output, /爱尔兰/)
  assert.match(output, /INFR\(2024\)0279/)
})

test('JSON export preserves the filtered envelope and language', () => {
  const output = JSON.parse(buildExportJson([country], [decision], 'en', filters, '2026-11-20T00:00:00.000Z')) as Record<string, unknown>

  assert.equal(output.language, 'en')
  assert.deepEqual(output.filters, filters)
  assert.equal((output.member_states as MemberStateRecord[]).length, 1)
  assert.equal((output.public_decisions as PublicDecisionRecord[]).length, 1)
})

test('CSV export escapes commas, quotes, and line breaks and keeps decision stages', () => {
  const output = buildExportCsv([country], [decision], 'en')

  assert.match(output, /country_code/)
  assert.match(output, /decision_ids/)
  assert.match(output, /decision_stages/)
  assert.match(output, /"Contains ""quotes"", commas, and a line\nbreak"/)
  assert.match(output, /INFR\(2024\)0279/)
  assert.match(output, /CJEU referral/)
})
