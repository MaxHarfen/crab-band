import type { Main, Run } from '../types'
import { planSummary } from './plan'

// How long a finished agent's row stays in the band before it leaves.
export const LINGER_MS = 30_000

const MAX_TITLE = 48

// The context window by model: 200K for Haiku 4 and older models, 1M otherwise.
export const windowOf = (model: string): number => (/haiku-4|claude-3/i.test(model) ? 200_000 : 1_000_000)

// claude-haiku-5-5 -> Haiku 5.5; anything else keeps its own name.
export const modelName = (id: string): string => {
  const [, family = '', major = '', minor] = /(fable|mythos|opus|sonnet|haiku)-(\d+)(?:-(\d{1,2})(?!\d))?/i.exec(id) ?? []
  if (!family) {
    const bare = id.replace(/^claude-/, '').replace(/\[.*\]$/, '')
    return bare ? bare.charAt(0).toUpperCase() + bare.slice(1) : '—'
  }
  const name = family.charAt(0).toUpperCase() + family.slice(1).toLowerCase()
  return minor ? `${name} ${major}.${minor}` : `${name} ${major}`
}

const pad = (n: number): string => String(n).padStart(2, '0')

// 0:15 / 12:04 / 1:02:05
export const elapsed = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}

export const isVisible = (run: Run, at: number): boolean =>
  run.status === 'running' || (run.endedAt !== undefined && at - run.endedAt < LINGER_MS)

const clip = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

// A subagent's details: Haiku 5.5 · ctx 6% · 0:15
export const runMeta = (run: Run, at: number): string => {
  const parts = [modelName(run.model)]
  if (run.contextTokens > 0) {
    parts.push(`ctx ${Math.round((run.contextTokens / windowOf(run.model)) * 100)}%`)
  }
  parts.push(elapsed((run.endedAt ?? at) - run.startedAt))
  return parts.join(' · ')
}

export const runTitle = (run: Run): string => clip(run.description, MAX_TITLE)

// Count hooks · Haiku 5.5 · ctx 6% · 0:15
export const rowText = (run: Run, at: number): string => `${runTitle(run)} · ${runMeta(run, at)}`

// A 6-cell gauge of steps done: ▓▓▓░░░
export const stepBar = (done: number, total: number): string => {
  const filled = total > 0 ? Math.round((done / total) * 6) : 0
  return '▓'.repeat(filled) + '░'.repeat(6 - filled)
}

// What the main session is on: Write the parser · 2/5 ▓▓░░░░ (or Working / Waiting for you / Ready)
export const mainTitle = (main: Main): string => {
  const { current, done, total } = planSummary(main.plan)
  if (total === 0) return main.isWorking ? 'Working' : main.turnStartedAt > 0 ? 'Waiting for you' : 'Ready'
  return `${clip(done === total ? 'All steps done' : (current ?? 'Next step'), MAX_TITLE)} · ${done}/${total} ${stepBar(done, total)}`
}

// Its details: Opus 5.5 · ctx 24% · 2:13 (the time only while it works)
export const mainMeta = (main: Main, at: number): string => {
  const parts: string[] = []
  if (main.model) parts.push(modelName(main.model))
  const percent =
    main.contextPercent ?? (main.contextTokens > 0 && main.model ? (main.contextTokens / windowOf(main.model)) * 100 : undefined)
  if (percent !== undefined) parts.push(`ctx ${Math.round(percent)}%`)
  if (main.isWorking && main.turnStartedAt > 0) parts.push(elapsed(at - main.turnStartedAt))
  return parts.join(' · ')
}

// The main session's band row: Write the parser · 2/5 ▓▓░░░░ · Opus 5.5 · ctx 24% · 2:13
export const mainRowText = (main: Main, at: number): string => [mainTitle(main), mainMeta(main, at)].filter(Boolean).join(' · ')
