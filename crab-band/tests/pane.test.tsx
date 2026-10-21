import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

import { routineOf } from '../hooks/moves'

const PLUGIN = 'crab-band'
const PANE = 'crab-agents'
const NOW = Date.parse('2026-10-19T08:00:00Z')
const PANE_PROPS = {
  title: 'Agents',
  isFocused: false,
  bodyColumns: 60,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 30 },
  view: {},
} as never

async function start($: Engine, on: On, panes: { id: string }[], calls: string[]) {
  const clock = mock.clock(on, { now: NOW })
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('session.model', async () => ({ value: 'claude-opus-5-5' }) as never)
  on('command.register', async (_$, e) => ({ value: { command: (e as { name: string }).name } }) as never)
  on('ui.panes', async () => ({ value: panes.map(p => ({ ...p, title: 'Agents', isShown: true, isFocused: false, isPlaced: true })) }) as never)
  on('ui.open', async (_$, e) => {
    calls.push(`open ${(e as { id: string }).id}`)
    return { value: { isPlaced: true } } as never
  })
  on('ui.close', async (_$, e) => {
    calls.push(`close ${(e as { id: string }).id}`)
    return { value: undefined } as never
  })
  on('agent.spawn', async () => ({ model: 'claude-sonnet-5-5', agentId: 'a1' }) as never)
  on('turn.complete', async () => ({ text: '' }) as never)
  await $.session.start({ cwd: '/repo', surface: 'desktop', isInteractive: true })
  return clock
}

const run = ($: Engine, args: string) =>
  $.command.run({ command: 'agents-info', args, origin: { kind: 'composer' }, presentation: {} } as never) as Promise<{ text?: string }>

test('/agents-info opens the pane, closes it when open, and `open` only ever opens', async ($, on) => {
  const panes: { id: string }[] = []
  const calls: string[] = []
  await start($, on, panes, calls)

  expect((await run($, '')).text).toBe('Agents pane opened.')
  panes.push({ id: PANE })
  expect((await run($, '')).text).toBe('Agents pane closed.')
  expect((await run($, 'open')).text).toBe('Agents pane opened.')
  expect(calls).toEqual([`open ${PANE}`, `close ${PANE}`, `open ${PANE}`])
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: the pane lists the main session, running and finished agents, with big crabs on desktop`, async ($, on) => {
    const clock = await start($, on, [], [])
    await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Review the spec', subagentType: 'general-purpose', parentModel: 'claude-opus-5-5' } as never)
    await clock.advance(12_000)

    const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'Pane', requestId: PANE, props: PANE_PROPS })
    const texts = (await ui.findAll({ type: 'Text' })).map(el => String(el.text ?? ''))
    const crabs = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.alt ?? ''))
    await ui.unmount()

    expect(texts).toContain('○ Ready')
    expect(texts).toContain('Main session · Opus 5.5')
    expect(texts).toContain('Running · 1')
    expect(texts).toContain('● Review the spec')
    expect(texts).toContain('general-purpose · Sonnet 5.5 · 0:12')
    expect(crabs).toEqual(surface === 'desktop' ? ['crab crab', 'musician crab'] : [])

    await $.turn.complete({ agentId: 'a1', reason: 'answer', answer: '', durationMs: 12_000, isAborted: false, turnId: 'x' } as never)
    await clock.advance(60_000)
    const later = await $.ui.mount({ plugin: PLUGIN, surface, component: 'Pane', requestId: PANE, props: PANE_PROPS })
    const after = (await later.findAll({ type: 'Text' })).map(el => String(el.text ?? ''))
    await later.unmount()
    // Unlike the band, the pane keeps a finished agent for the whole session.
    expect(after).toContain('Finished · 1')
    expect(after).toContain('✓ Review the spec')
  })
}

test("desktop: the pane's crabs are the band's views drawn 2.1 times as large", async ($, on) => {
  await start($, on, [], [])
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Review the spec', subagentType: 'general-purpose', parentModel: 'claude-opus-5-5' } as never)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: PANE, props: PANE_PROPS })
  const crabs = (await ui.findAll({ type: 'Svg' })).map(el => el.props as { alt?: string; width?: number; height?: number; source?: string })
  await ui.unmount()
  for (const [alt, costume] of [['crab crab', 'other'], ['musician crab', 'sonnet']] as const) {
    const [x, y, w, h] = routineOf(costume).box
    const crab = crabs.find(c => c.alt === alt)
    expect([alt, crab?.width, crab?.height]).toEqual([alt, Math.round(w * 2.1), Math.round(h * 2.1)])
    expect(crab?.source).toContain(`viewBox="${x} ${y} ${w} ${h}"`)
  }
})
