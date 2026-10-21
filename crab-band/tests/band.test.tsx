import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { elapsed, modelName } from '../hooks/format'

const PLUGIN = 'crab-band'
type Surface = 'terminal' | 'desktop' | 'vscode'
const NOW = Date.parse('2026-10-18T08:00:00Z')
const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} } as never,
} as const

describe('format', () => {
  test('model ids read as their names', () => {
    expect(modelName('claude-haiku-5-5')).toBe('Haiku 5.5')
    expect(modelName('claude-opus-5-5[1m]')).toBe('Opus 5.5')
    expect(modelName('haiku')).toBe('Haiku')
  })

  test('elapsed time reads as m:ss or h:mm:ss', () => {
    expect(elapsed(15_000)).toBe('0:15')
    expect(elapsed(725_000)).toBe('12:05')
    expect(elapsed(3_725_000)).toBe('1:02:05')
  })
})

async function start($: Engine, on: On, surface: Surface) {
  const clock = mock.clock(on, { now: NOW })
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('agent.spawn', async () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }) as never)
  on('turn.complete', async () => ({ text: '' }) as never)
  on('session.model', async () => ({ value: 'claude-opus-5-5' }) as never)
  on('prompt.submit', async (_$, e) => ({ text: e.text }) as never)
  on('tool.call', async () => ({ result: 'ok' }) as never)
  on('session.measure', async (_$, e) => ({ changed: e.changed }) as never)
  // Stands in for the engine's own band: what the plugin passes on when it has no rows.
  on('ui.render', async () => ({ type: 'engine', ref: 1 }) as never)
  await $.session.start({ cwd: '/repo', surface, isInteractive: true })
  return clock
}

async function rowsOn($: Engine, surface: Surface) {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...BAND })
  const texts = (await ui.findAll({ type: 'Text' })).map(el => String(el.text ?? ''))
  await ui.unmount()
  return texts
}

async function crabsOn($: Engine, surface: Surface) {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...BAND })
  const crabs = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.alt ?? ''))
  await ui.unmount()
  return crabs
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: a running agent gets a row, lingers once done, then leaves`, async ($, on) => {
    const clock = await start($, on, surface)

    expect(await rowsOn($, surface)).not.toContain('● ')

    await $.agent.spawn({
      tool_use_id: 't1',
      prompt: 'count the hooks',
      description: 'Count the hooks',
      subagentType: 'Explore',
      parentModel: 'claude-opus-5-5',
    } as never)
    await clock.advance(15_000)
    const running = await rowsOn($, surface)
    expect(running).toContain('● ')
    expect(running).toContain('Count the hooks · Haiku 5.5 · 0:15')
    // An Explore agent is the explorer; the terminal draws no crab.
    expect(await crabsOn($, surface)).toEqual(surface === 'desktop' ? ['crab crab', 'explorer crab'] : [])

    await $.turn.complete({ agentId: 'a1', reason: 'answer', answer: '', durationMs: 15_000, isAborted: false, turnId: 'x' } as never)
    await clock.advance(10_000)
    const done = await rowsOn($, surface)
    expect(done).toContain('✓ ')
    expect(done).toContain('Count the hooks · Haiku 5.5 · 0:15')

    await clock.advance(30_000)
    expect((await rowsOn($, surface)).some(t => t.includes('Count the hooks'))).toBe(false)
  })
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: the main session leads the band with its task list`, async ($, on) => {
    const clock = await start($, on, surface)
    expect(await rowsOn($, surface)).toContain('Ready · Opus 5.5')

    await $.prompt.submit({ text: 'fix the bug' } as never)
    await clock.advance(5_000)
    expect(await rowsOn($, surface)).toContain('Working · Opus 5.5 · 0:05')

    await $.tool.call({
      tool: 'mcp__ccd_turn__update_plan',
      items: [
        { content: 'Write the parser', status: 'in_progress' },
        { content: 'Wire the CLI', status: 'pending' },
      ],
    } as never)
    expect(await rowsOn($, surface)).toContain('Write the parser · 0/2 ░░░░░░ · Opus 5.5 · 0:05')

    await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', advance: true } as never)
    await $.session.measure({ context: { window: 1_000_000, tokens: 240_000, percent: 24 }, rateLimits: [], changed: ['context'] } as never)
    await clock.advance(3_000)
    expect(await rowsOn($, surface)).toContain('Wire the CLI · 1/2 ▓▓▓░░░ · Opus 5.5 · ctx 24% · 0:08')

    await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'done' } as never)
    await $.turn.complete({ reason: 'answer', answer: '', durationMs: 8_000, isAborted: false, turnId: 'm' } as never)
    const idle = await rowsOn($, surface)
    expect(idle).toContain('✓ ')
    expect(idle).toContain('All steps done · 2/2 ▓▓▓▓▓▓ · Opus 5.5 · ctx 24%')

    // The next request starts clean: a finished list does not carry over.
    await $.prompt.submit({ text: 'and another thing' } as never)
    expect(await rowsOn($, surface)).toContain('Working · Opus 5.5 · ctx 24% · 0:00')
  })
}

for (const surface of ['desktop'] as const) {
  test(`${surface}: the main crab wears its costume while the first model request is still streaming`, async ($, on) => {
    let during: string[] = []
    let watching = false
    // The bottom of turn.step stands for the request in flight: the band is drawn before it ends.
    on('turn.step', async function* () {
      if (watching) during = await crabsOn($, surface)
      return { turnId: 't', index: 0, answer: '', toolUses: [], stopReason: 'end_turn', usage: null } as never
    })
    await start($, on, surface)
    await $.prompt.submit({ text: 'hello' } as never)
    watching = true
    const step = $.turn.step({ turnId: 't', index: 0, model: 'claude-opus-5-5', effort: 'xhigh', messageCount: 1 } as never) as unknown
    if (step && typeof (step as AsyncIterable<unknown>)[Symbol.asyncIterator] === 'function') {
      for await (const _ of step as AsyncIterable<unknown>) {
        // drain the stream
      }
    } else {
      await step
    }
    expect(during).toEqual(['painter crab'])
  })
}

// VS Code pins a "From the <plugin> plugin" mark on a mod's band and paints it over the slash-command
// menu, so there the band shows only while something is at work.
test('vscode: the band shows only while the session or a subagent is at work', async ($, on) => {
  const clock = await start($, on, 'vscode')
  expect(await rowsOn($, 'vscode')).toEqual([])

  await $.prompt.submit({ text: 'fix the bug' } as never)
  await clock.advance(5_000)
  expect(await rowsOn($, 'vscode')).toContain('Working · Opus 5.5 · 0:05')

  await $.turn.complete({ reason: 'answer', answer: '', durationMs: 5_000, isAborted: false, turnId: 'm' } as never)
  expect(await rowsOn($, 'vscode')).toEqual([])
})
