import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import type { HistoryData } from '../src/data/nis2'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const history = JSON.parse(readFileSync(join(projectRoot, 'public/data/history.json'), 'utf-8')) as HistoryData

test('history file contains source-backed snapshots and changes', () => {
  assert.equal(history.snapshots.length, 5)
  assert.equal(history.changes.length, 5)
  assert.equal(history.snapshots.at(-1)?.member_state_count, 27)
  assert.equal(history.snapshots.at(-1)?.current_referred_count, 4)
  assert.ok(history.snapshots.every((snapshot) => snapshot.source_url.startsWith('https://')))
  assert.ok(history.changes.every((change) => change.title.zh && change.summary.en && change.source_url.startsWith('https://')))
})
