import type { PlanItem, PlanStatus } from '../types'

// The main session's task list, replayed from the calls the model makes to keep it: the desktop
// app's update_plan (a whole list, or advance / done / start), its wrap_up (ticks everything off),
// and the terminal's TodoWrite (a whole list). Read only: the calls go on unchanged.
export const PLAN_TOOL = 'mcp__ccd_turn__update_plan'
export const WRAP_TOOL = 'mcp__ccd_turn__wrap_up'
export const TODO_TOOL = 'TodoWrite'

const MAX_ITEMS = 50
const STATUSES: readonly PlanStatus[] = ['pending', 'in_progress', 'completed']
const statusOf = (value: unknown): PlanStatus =>
  STATUSES.includes(value as PlanStatus) ? (value as PlanStatus) : 'pending'

type PlanCall = { items?: unknown; advance?: unknown; done?: unknown; start?: unknown }

export const applyPlanCall = (plan: readonly PlanItem[], call: PlanCall): PlanItem[] => {
  if (Array.isArray(call.items)) {
    return call.items
      .flatMap((raw): PlanItem[] => {
        const item = raw as { content?: unknown; status?: unknown }
        return typeof item?.content === 'string' ? [{ title: item.content, status: statusOf(item.status) }] : []
      })
      .slice(0, MAX_ITEMS)
  }
  const next = plan.map(item => ({ ...item }))
  if (call.advance === true) {
    const current = next.findIndex(item => item.status === 'in_progress')
    const finished = next[current]
    if (finished) finished.status = 'completed'
    const following = next.find((item, k) => k > current && item.status === 'pending')
    if (following) following.status = 'in_progress'
  }
  if (Array.isArray(call.done)) {
    for (const n of call.done) {
      const item = next[Number(n) - 1]
      if (item) item.status = 'completed'
    }
  }
  if (typeof call.start === 'number') {
    const item = next[call.start - 1]
    if (item) item.status = 'in_progress'
  }
  return next
}

export const applyTodos = (todos: unknown): PlanItem[] =>
  Array.isArray(todos)
    ? todos
        .flatMap((raw): PlanItem[] => {
          const todo = raw as { content?: unknown; status?: unknown; activeForm?: unknown }
          if (typeof todo?.content !== 'string') return []
          const status = statusOf(todo.status)
          const title = status === 'in_progress' && typeof todo.activeForm === 'string' ? todo.activeForm : todo.content
          return [{ title, status }]
        })
        .slice(0, MAX_ITEMS)
    : []

export const finishAll = (plan: readonly PlanItem[]): PlanItem[] =>
  plan.map(item => ({ ...item, status: 'completed' }))

export const isFinished = (plan: readonly PlanItem[]): boolean =>
  plan.length > 0 && plan.every(item => item.status === 'completed')

// What the row says: the step in progress (or the next one), and how many are done.
export const planSummary = (plan: readonly PlanItem[]): { current?: string; done: number; total: number } => {
  const done = plan.filter(item => item.status === 'completed').length
  const current =
    plan.find(item => item.status === 'in_progress')?.title ?? plan.find(item => item.status === 'pending')?.title
  return { current, done, total: plan.length }
}
