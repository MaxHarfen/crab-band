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

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 100, scroll: { offset: 0, bodyRows: 10 }, view: {} } as never,
} as const

// The engine's record of the open panes, as the mocks below keep it: an open lists the pane (shown and
// placed unless a test says otherwise), a close drops it.
type OpenPane = { id: string; isShown?: boolean; isPlaced?: boolean }

async function start($: Engine, on: On, panes: OpenPane[], calls: string[], { dropOnClose = true } = {}) {
  const clock = mock.clock(on, { now: NOW })
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('session.model', async () => ({ value: 'claude-opus-5-5' }) as never)
  on('command.register', async (_$, e) => ({ value: { command: (e as { name: string }).name } }) as never)
  on('ui.panes', async () => ({ value: panes.map(p => ({ title: 'Agents', isShown: true, isFocused: false, isPlaced: true, ...p })) }) as never)
  on('ui.open', async (_$, e) => {
    const id = (e as { id: string }).id
    calls.push(`open ${id}`)
    if (!panes.some(p => p.id === id)) panes.push({ id })
    return { value: { isPlaced: true } } as never
  })
  on('ui.close', async (_$, e) => {
    const id = (e as { id: string }).id
    calls.push(`close ${id}`)
    const at = panes.findIndex(p => p.id === id)
    if (at >= 0 && dropOnClose) panes.splice(at, 1)
    return { value: undefined } as never
  })
  on('agent.spawn', async () => ({ model: 'claude-sonnet-5-5', agentId: 'a1' }) as never)
  on('turn.complete', async () => ({ text: '' }) as never)
  // Stands in for the engine's own band: what the plugin passes on when it draws nothing.
  on('ui.render', async () => ({ type: 'engine', ref: 1 }) as never)
  await $.session.start({ cwd: '/repo', surface: 'desktop', isInteractive: true })
  return clock
}

async function band($: Engine) {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', ...BAND })
  const texts = (await ui.findAll({ type: 'Text' })).map(el => String(el.text ?? ''))
  await ui.unmount()
  return texts
}

const run = ($: Engine, args: string) =>
  $.command.run({ command: 'agents-info', args, origin: { kind: 'composer' }, presentation: {} } as never) as Promise<{ text?: string }>

test('/agents-info opens the pane, closes it when open, and `open` only ever opens', async ($, on) => {
  const panes: { id: string }[] = []
  const calls: string[] = []
  await start($, on, panes, calls)

  expect((await run($, '')).text).toBe('Agents pane opened.')
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

// While the pane shows the crabs, the band would only show them again.
test('the band steps aside while the pane is on screen, and comes back when /agents-info closes it', async ($, on) => {
  await start($, on, [], [])
  expect(await band($)).toContain('Ready · Opus 5.5')

  await run($, '')
  expect(await band($)).toEqual([])

  await run($, '')
  expect(await band($)).toContain('Ready · Opus 5.5')
})

// The kit cannot raise the person's close mark (its `ui` noun has no close, and a test's hooks may not
// call $), so this closes through the command, with the record still listing the pane as shown: the
// band comes back from the `ui.close` hook alone, the one every close passes through, the person's too.
test('every close of the pane brings the band back at once, without waiting for the tick', async ($, on) => {
  const panes: OpenPane[] = []
  await start($, on, panes, [], { dropOnClose: false })
  await run($, 'open')
  expect(await band($)).toEqual([])

  await run($, '')
  expect(panes).toEqual([{ id: PANE }])
  expect(await band($)).toContain('Ready · Opus 5.5')
})

test('the band shows while the pane is behind another tab or not placed, and steps aside once it is in view', async ($, on) => {
  const panes: OpenPane[] = []
  const clock = await start($, on, panes, [])
  await run($, 'open')
  expect(await band($)).toEqual([])

  panes.splice(0, panes.length, { id: PANE, isShown: false })
  await clock.advance(1000)
  expect(await band($)).toContain('Ready · Opus 5.5')

  panes.splice(0, panes.length, { id: PANE, isPlaced: false, isShown: false })
  await clock.advance(1000)
  expect(await band($)).toContain('Ready · Opus 5.5')

  panes.splice(0, panes.length, { id: PANE })
  await clock.advance(1000)
  expect(await band($)).toEqual([])
})

test('a reload with the pane still up starts with the band aside', async ($, on) => {
  await start($, on, [{ id: PANE }], [])
  expect(await band($)).toEqual([])
})
