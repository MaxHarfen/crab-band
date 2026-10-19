import { describe, expect, test } from 'claude-code/testing'

import { applyPlanCall, applyTodos, finishAll, isFinished, planSummary } from './plan'

const items = [
  { content: 'Read the code', status: 'in_progress' },
  { content: 'Write the fix', status: 'pending' },
  { content: 'Run the tests', status: 'pending' },
]

describe('the task list replay', () => {
  test('a whole list replaces the plan', () => {
    expect(applyPlanCall([], { items })).toEqual([
      { title: 'Read the code', status: 'in_progress' },
      { title: 'Write the fix', status: 'pending' },
      { title: 'Run the tests', status: 'pending' },
    ])
  })

  test('advance completes the step in progress and starts the next pending one', () => {
    const plan = applyPlanCall(applyPlanCall([], { items }), { advance: true })
    expect(plan.map(i => i.status)).toEqual(['completed', 'in_progress', 'pending'])
    expect(planSummary(plan)).toEqual({ current: 'Write the fix', done: 1, total: 3 })
  })

  test('done and start work out of order, numbered from 1', () => {
    const plan = applyPlanCall(applyPlanCall([], { items }), { done: [1, 2], start: 3 })
    expect(plan.map(i => i.status)).toEqual(['completed', 'completed', 'in_progress'])
  })

  test('wrap_up ticks everything off', () => {
    const plan = finishAll(applyPlanCall([], { items }))
    expect(isFinished(plan)).toBe(true)
    expect(planSummary(plan)).toEqual({ current: undefined, done: 3, total: 3 })
  })

  test("the terminal's TodoWrite list reads the active form of the step in progress", () => {
    expect(applyTodos([{ content: 'Fix it', status: 'in_progress', activeForm: 'Fixing it' }])).toEqual([
      { title: 'Fixing it', status: 'in_progress' },
    ])
  })

  test('input outside the shape cannot break the plan', () => {
    expect(applyPlanCall([], { items: [null, 7, { content: 'Ok', status: 'weird' }] })).toEqual([{ title: 'Ok', status: 'pending' }])
    expect(applyTodos('nope')).toEqual([])
  })
})
