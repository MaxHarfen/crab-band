import type { SessionRateLimit } from 'claude-code'

// One gauge per window, then the countdown to its reset:
//   5h ▓▓▓░░░░░░░ 31% ↺2h14m   7d ▓▓▓▓▓░░░░░ 52% ↺4d
const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: 'spend' }
const MINUTE = 60_000

const gauge = (percent: number): string => {
  const filled = Math.min(10, Math.max(0, Math.round(percent / 10)))
  return '▓'.repeat(filled) + '░'.repeat(10 - filled)
}

// Compact countdown: 4d3h / 2h14m / 47m / <1m / now
export const eta = (ms: number): string => {
  if (ms <= 0) return 'now'
  const minutes = Math.floor(ms / MINUTE)
  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60
  if (d > 0) return h > 0 ? `${d}d${h}h` : `${d}d`
  if (h > 0) return m > 0 ? `${h}h${m}m` : `${h}h`
  return m > 0 ? `${m}m` : '<1m'
}

// One segment per window; undefined (clears the line) when there is no reading,
// as off a subscription or before the session's first API response.
export const formatLimits = (
  limits: readonly SessionRateLimit[],
  now: number,
): string | undefined => {
  if (limits.length === 0) return undefined

  return limits
    .map(limit => {
      const label = LABELS[limit.kind] ?? limit.kind
      const percent = Math.round(limit.percentUsed)
      const resetsAt = limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt)
      const reset = Number.isNaN(resetsAt) ? '' : ` ↺${eta(resetsAt - now)}`
      return `${label} ${gauge(percent)} ${percent}%${reset}`
    })
    .join('   ')
}
