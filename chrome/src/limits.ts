import { eta } from '../../crab-band/hooks/limits-format.ts'

// The 5-hour and 7-day limits, from the usage endpoint claude.ai's own Settings page reads.
export type LimitWindow = { percent: number; resetsAt: string | null }
export type Limits = { fiveHour: LimitWindow; sevenDay: LimitWindow }

const windowOf = (raw: unknown): LimitWindow | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const { utilization, resets_at } = raw as { utilization?: unknown; resets_at?: unknown }
  if (typeof utilization !== 'number' || !Number.isFinite(utilization)) return null
  if (resets_at !== undefined && resets_at !== null && typeof resets_at !== 'string') return null
  return { percent: utilization, resetsAt: resets_at ?? null }
}

// Both windows or nothing: a reply in any other shape hides the limits.
export const parseUsage = (json: unknown): Limits | null => {
  if (typeof json !== 'object' || json === null) return null
  const { five_hour, seven_day } = json as { five_hour?: unknown; seven_day?: unknown }
  const fiveHour = windowOf(five_hour)
  const sevenDay = windowOf(seven_day)
  return fiveHour && sevenDay ? { fiveHour, sevenDay } : null
}

const WINDOWS: Array<[string, keyof Limits]> = [['5h', 'fiveHour'], ['7d', 'sevenDay']]

// The line next to the model picker: 5h 6% · 7d 91%
export const limitsText = (l: Limits): string =>
  WINDOWS.map(([label, key]) => `${label} ${Math.round(l[key].percent)}%`).join(' · ')

// Its tooltip, in crab-band's countdown format: 5h ↺3h10m · 7d ↺1d12h
export const limitsTitle = (l: Limits, now: number): string =>
  WINDOWS.flatMap(([label, key]) => {
    const at = l[key].resetsAt === null ? NaN : Date.parse(l[key].resetsAt as string)
    return Number.isNaN(at) ? [] : [`${label} ↺${eta(at - now)}`]
  }).join(' · ')

// One same-origin request, with the user's own claude.ai session. Any failure is null.
export const fetchLimits = async (orgId: string, fetchFn: typeof fetch): Promise<Limits | null> => {
  try {
    const res = await fetchFn(`/api/organizations/${encodeURIComponent(orgId)}/usage`, { credentials: 'same-origin' })
    if (!res.ok) return null
    return parseUsage(await res.json())
  } catch {
    return null
  }
}
