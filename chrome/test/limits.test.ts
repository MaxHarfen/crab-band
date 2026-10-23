import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchLimits, limitsText, limitsTitle, parseUsage } from '../src/limits.ts'
import { USAGE } from './fixtures.ts'

const NOW = Date.parse('2026-10-22T10:30:00Z')

test('reads the two windows', () => {
  assert.deepEqual(parseUsage(USAGE), {
    fiveHour: { percent: 6, resetsAt: '2026-10-22T13:40:00.788961+00:00' },
    sevenDay: { percent: 91, resetsAt: '2026-10-23T23:00:00.788980+00:00' },
  })
})
test('an unexpected shape is null', () => {
  assert.equal(parseUsage({ five_hour: { utilization: '6' } }), null)
  assert.equal(parseUsage(null), null)
  assert.equal(parseUsage({}), null)
})
test('the short line and its tooltip', () => {
  const l = parseUsage(USAGE)!
  assert.equal(limitsText(l), '5h 6% · 7d 91%')
  assert.equal(limitsTitle(l, NOW), '5h ↺3h10m · 7d ↺1d12h')
})
test('percent is rounded', () => {
  assert.equal(limitsText({ fiveHour: { percent: 6.4, resetsAt: null }, sevenDay: { percent: 90.6, resetsAt: null } }), '5h 6% · 7d 91%')
})
test('asks the same-origin usage URL only', async () => {
  const urls: string[] = []
  const fake = (async (url: string) => { urls.push(url); return new Response(JSON.stringify(USAGE)) }) as typeof fetch
  assert.ok(await fetchLimits('org-1', fake))
  assert.deepEqual(urls, ['/api/organizations/org-1/usage'])
})
test('fetch failure is null', async () => {
  assert.equal(await fetchLimits('org-1', (async () => { throw new Error('offline') }) as typeof fetch), null)
  assert.equal(await fetchLimits('org-1', (async () => new Response('', { status: 401 })) as typeof fetch), null)
})
