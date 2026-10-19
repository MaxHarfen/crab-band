import { describe, expect, mock, test } from 'claude-code/testing'

import { eta, formatLimits } from '../hooks/limits-format'

const NOW = Date.parse('2026-10-18T10:00:00Z')
const CONTEXT = { window: 1_000_000 }
const LIMITS = [
  { kind: 'five_hour', percentUsed: 31.4, resetsAt: '2026-10-18T12:14:00Z' },
  { kind: 'seven_day', percentUsed: 52, resetsAt: '2026-10-22T10:00:00Z' },
]

describe('formatLimits', () => {
  test('draws each window with a gauge, percent and reset countdown', () => {
    expect(formatLimits(LIMITS, NOW)).toBe('5h ▓▓▓░░░░░░░ 31% ↺2h14m   7d ▓▓▓▓▓░░░░░ 52% ↺4d')
  })

  test('clears the line when there is no reading', () => {
    expect(formatLimits([], NOW)).toBe(undefined)
  })

  test('countdowns read compactly', () => {
    expect(eta(0)).toBe('now')
    expect(eta(30_000)).toBe('<1m')
    expect(eta(47 * 60_000)).toBe('47m')
    expect(eta(3 * 3_600_000)).toBe('3h')
    expect(eta((4 * 24 + 3) * 3_600_000)).toBe('4d3h')
  })
})

test('pins the limits on session start, on measure, and ticks the countdown', async ($, on) => {
  const clock = mock.clock(on, { now: NOW })
  const lines: (string | undefined)[] = []

  on('ui.status', (_$, e) => {
    lines.push(e.text)
    return { value: undefined }
  })
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: CONTEXT, rateLimits: [] } }))
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('session.end', () => ({ sessionId: 'test' }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(lines.at(-1)).toBe(undefined)

  await $.session.measure({ context: CONTEXT, rateLimits: LIMITS, changed: ['rateLimits'] })
  expect(lines.at(-1)).toBe('5h ▓▓▓░░░░░░░ 31% ↺2h14m   7d ▓▓▓▓▓░░░░░ 52% ↺4d')

  await clock.advance(60_000)
  expect(lines.at(-1)).toBe('5h ▓▓▓░░░░░░░ 31% ↺2h13m   7d ▓▓▓▓▓░░░░░ 52% ↺3d23h')
})
