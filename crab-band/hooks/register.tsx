import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit, Timer } from 'claude-code'

import type { Main, Run, RunStatus } from '../types'
import { costumeFor, savvyTier } from './costume'
import { COSTUME_ACCENT, COSTUME_NAME, CRAB_CSS, crabMarkup } from './crab'
import { isVisible, mainMeta, mainRowText, mainTitle, rowText, runMeta, runTitle } from './format'
import { formatLimits } from './limits-format'
import { PLAN_TOOL, TODO_TOOL, WRAP_TOOL, applyPlanCall, applyTodos, finishAll, isFinished } from './plan'

const IDLE: Main = { model: '', isWorking: false, turnStartedAt: 0, contextTokens: 0, plan: [] }

const runs = atom({ plugin: 'crab-band', key: 'runs' } as const, [])
const now = atom({ plugin: 'crab-band', key: 'now' } as const, 0)
const main = atom({ plugin: 'crab-band', key: 'main' } as const, IDLE)

const MAX_ROWS = 5
const MAX_KEPT = 50
// One px per cell of the crab's 30-cell grid (two device pixels on a Retina screen), so its edges stay even.
const CRAB_W = 30
// The agents pane: the same crabs, about twice the size, on a plain background.
const PANE = 'crab-agents'
const PANE_TITLE = 'Agents'
const BIG_W = 63
const MAX_FINISHED = 20

const MARK: Record<RunStatus, string> = { running: '●', done: '✓', failed: '✗' }
const COLOR: Record<RunStatus, string> = { running: '#8f8cf4', done: '#5fbf8f', failed: '#e5484d' }

const costumeOf = (run: Run): string => costumeFor(savvyTier(run.type ?? ''), run.type ?? '', run.model, run.effort)
const mainCostume = (m: Main): string => costumeFor('other', 'main', m.model, m.effort)

// One crab as its own SVG, `width` px wide, the costume's prop moving while the agent runs. The
// view leaves room above the crab for the musician's rising notes, and below it for his headspin
// and freeze, which reach about 5 units under a standing crab; `phase` (seconds the agent has
// run) keeps his dance going across the once-a-second redraw.
const crabTall = (costume: string): number => (costume === 'sonnet' ? 37 : 32)
const crabHeight = (costume: string, width = CRAB_W): number => Math.round((width * crabTall(costume)) / 30)
const crabSvg = (costume: string, isWalking: boolean, phase: number, width = CRAB_W): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${crabHeight(costume, width)}" viewBox="0 -4 30 ${crabTall(costume)}" shape-rendering="crispEdges">${CRAB_CSS}${crabMarkup(costume, COSTUME_ACCENT[costume] ?? '#888780', isWalking, phase)}</svg>`

// The status line: the 5-hour and weekly limits with their reset countdowns, redrawn once a
// minute so the countdowns keep moving while idle.
const LIMITS_TICK_MS = 60_000

async function drawLimits($: EngineInterface, limits: readonly SessionRateLimit[]) {
  $.ui.status(formatLimits(limits, await $.clock.now()))
}

// Moves the band's clock once a second while something on it moves: the main session at work,
// a running subagent, or a finished one still lingering (and once more as it leaves).
async function tick($: EngineInterface) {
  const at = await $.clock.now()
  const list = await read($, runs)
  const shown = await read($, now)
  const m = await read($, main)
  if (m.isWorking || list.some(r => isVisible(r, at) || isVisible(r, shown))) {
    await update($, now, () => at)
  }
}

export const register: Register = on => {
  let ticker: Timer | undefined
  let limitsTicker: Timer | undefined
  let limits: readonly SessionRateLimit[] = []

  on('session.start', async ($, e, next) => {
    const started = await next(e)

    // A reload or a resume starts with the limits the engine already has, rather than a blank
    // line until the next turn ends.
    try {
      limits = (await $.session.usage()).rateLimits
    } catch {
      limits = []
    }
    await drawLimits($, limits)
    limitsTicker?.cancel()
    limitsTicker = $.clock.every(LIMITS_TICK_MS, () => void drawLimits($, limits))
    let model = ''
    try {
      model = await $.session.model()
    } catch {
      model = ''
    }
    await update($, main, () => ({ ...IDLE, model }))
    ticker?.cancel()
    ticker = $.clock.every(1000, () => void tick($))
    // Last, and on its own: a host that refuses the command still gets the status line and the band.
    // `immediate`: typed while a turn is in flight, it opens the pane at once instead of waiting.
    try {
      await $.command.register({
        name: 'agents-info',
        description: 'Show or hide the agents pane: the main session and every subagent of this session, with big crabs',
        argumentHint: '[open]',
        immediate: true,
      })
    } catch {
      // the pane stays unreachable; everything else works
    }
    return started
  })

  on('session.end', async ($, e, next) => {
    ticker?.cancel()
    ticker = undefined
    limitsTicker?.cancel()
    limitsTicker = undefined
    return next(e)
  })

  // A prompt starts the main session's turn. A finished task list is cleared, so a new
  // request does not show the last one's "All steps done"; an unfinished one stays.
  on('prompt.submit', async ($, e, next) => {
    const submitted = await next(e)
    if (submitted.drop !== undefined || e.isMeta) return submitted
    const at = await $.clock.now()
    await update($, main, m => ({
      ...m,
      isWorking: true,
      turnStartedAt: m.isWorking ? m.turnStartedAt : at,
      plan: isFinished(m.plan) ? [] : m.plan,
    }))
    await update($, now, () => at)
    return submitted
  }).catch(($, e, next) => next(e))

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (started.deny !== undefined) return started

    const at = await $.clock.now()
    const run: Run = {
      id: started.agentId ?? e.tool_use_id,
      agentId: started.agentId,
      description: e.description || e.subagentType,
      type: e.subagentType,
      model: started.model,
      status: 'running',
      startedAt: at,
      contextTokens: 0,
    }
    await update($, runs, list => [...list.filter(r => r.id !== run.id), run].slice(-MAX_KEPT))
    await update($, now, () => at)
    return started
  }).catch(($, e, next) => next(e)) // bookkeeping only: a failure here never blocks a spawn

  // The task list: read from the calls that keep it, after they went through. Never changes them.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    const name = String(e.tool)
    if (e.agentId || result.deny !== undefined || result.isError) return result
    if (name !== PLAN_TOOL && name !== WRAP_TOOL && name !== TODO_TOOL) return result
    const call = e as unknown as Record<string, unknown>
    await update($, main, m => ({
      ...m,
      plan: name === WRAP_TOOL ? finishAll(m.plan) : name === TODO_TOOL ? applyTodos(call.todos) : applyPlanCall(m.plan, call),
    }))
    return result
  }).catch(($, e, next) => next(e))

  // Each model request. The model and effort are known before it is sent, so the crab is dressed
  // at once (the first answer can stream for a while, task list and all); how full the window is
  // comes with the reply.
  on('turn.step', async function* ($, e, next) {
    const effort = typeof e.effort === 'string' ? e.effort : undefined
    if (!e.agentId) {
      await update($, main, m => ({ ...m, model: e.model || m.model, effort: effort ?? m.effort, isWorking: true }))
    } else {
      await update($, runs, list =>
        list.map((r): Run => (r.agentId === e.agentId ? { ...r, model: e.model || r.model, effort: effort ?? r.effort } : r)),
      )
    }

    const result = yield* next(e)
    const usage = result.usage
    if (!usage) return result
    const tokens =
      (usage.input_tokens || 0) +
      (usage.cache_read_input_tokens || 0) +
      (usage.cache_creation_input_tokens || 0) +
      (usage.output_tokens || 0)
    if (!e.agentId) {
      await update($, main, m => ({ ...m, model: usage.model || m.model, contextTokens: tokens }))
      return result
    }
    await update($, runs, list =>
      list.map((r): Run =>
        r.agentId === e.agentId
          ? { ...r, model: usage.model || r.model, contextTokens: tokens, status: 'running', endedAt: undefined }
          : r,
      ),
    )
    return result
  })

  // The engine's own measurements, after each turn and whenever a limit moves a point: the main
  // window's fill for the band, the limits for the status line.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      limits = e.rateLimits
      await drawLimits($, limits)
    }
    if (e.context.percent !== undefined) {
      const percent = e.context.percent
      await update($, main, m => ({ ...m, contextPercent: percent }))
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const at = await $.clock.now()
    if (e.agentId) {
      const status: RunStatus = e.reason === 'answer' ? 'done' : 'failed'
      await update($, runs, list => list.map((r): Run => (r.agentId === e.agentId ? { ...r, status, endedAt: at } : r)))
    } else {
      await update($, main, m => ({ ...m, isWorking: false }))
    }
    await update($, now, () => at)
    return next(e)
  })

  // `/agents-info` toggles the pane; `/agents-info open` opens it (or brings it forward) without toggling.
  on('command.run', { command: 'agents-info' }, async ($, e) => {
    const isOpen = (await $.ui.panes()).some(pane => pane.id === PANE)
    if (isOpen && e.args.trim() !== 'open') {
      await $.ui.close({ id: PANE })
      return { text: 'Agents pane closed.' }
    }
    await $.ui.open({ id: PANE, title: PANE_TITLE })
    return { text: 'Agents pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : undefined
    const at = await read($, now)
    const m = await read($, main)
    const list = await read($, runs)
    const running = list.filter(r => r.status === 'running').reverse()
    const finished = list.filter(r => r.status !== 'running').reverse().slice(0, MAX_FINISHED)

    const big = (costume: string, isWalking: boolean, phase: number, key: string) =>
      Svg && (
        <Svg
          key={key}
          source={crabSvg(costume, isWalking, phase, BIG_W)}
          alt={`${COSTUME_NAME[costume] ?? 'crab'} crab`}
          width={BIG_W}
          height={crabHeight(costume, BIG_W)}
        />
      )
    const agent = (r: Run) => (
      <Box key={`crabs-pane-${r.id}`} flexDirection="row" alignItems="center" gap={2}>
        {big(costumeOf(r), r.status === 'running', ((r.endedAt ?? at) - r.startedAt) / 1000, `crabs-pane-crab-${r.id}`)}
        <Box flexDirection="column">
          <Text bold wrap="truncate-end">
            {MARK[r.status]} {runTitle(r)}
          </Text>
          <Text dimColor wrap="truncate-end">
            {r.type ? `${r.type} · ` : ''}
            {runMeta(r, at)}
          </Text>
        </Box>
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1}>
        <Box key="crabs-pane-main" flexDirection="row" alignItems="center" gap={2}>
          {big(mainCostume(m), m.isWorking, m.turnStartedAt > 0 ? (at - m.turnStartedAt) / 1000 : 0, 'crabs-pane-main-crab')}
          <Box flexDirection="column">
            <Text bold wrap="truncate-end">
              {m.isWorking ? '●' : isFinished(m.plan) ? '✓' : '○'} {mainTitle(m)}
            </Text>
            <Text dimColor wrap="truncate-end">
              Main session{mainMeta(m, at) ? ` · ${mainMeta(m, at)}` : ''}
            </Text>
          </Box>
        </Box>
        <Text dimColor>Running · {running.length}</Text>
        {running.map(agent)}
        {finished.length > 0 && <Text dimColor>Finished · {finished.length}</Text>}
        {finished.map(agent)}
        {list.length === 0 && <Text dimColor>No subagents in this session yet.</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const at = await read($, now)
    const m = await read($, main)
    const visible = (await read($, runs)).filter(r => isVisible(r, at))
    // VS Code pins a "From the crab-band plugin" mark on the band and paints it over the slash-command
    // menu, so there the band shows only while the session or a subagent is at work.
    if (e.surface === 'vscode' && !m.isWorking && visible.length === 0) return next(e)

    // Other mods' bands draw beneath these rows. The engine's
    // own placeholder ({ type: 'engine' }) is never nested: the desktop drops a band that nests it.
    const drawn = await Promise.resolve(next(e)).catch(() => null)
    const below = drawn && typeof drawn === 'object' && (drawn as { type?: string }).type !== 'engine' ? drawn : null

    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    // The desktop draws an SVG; the terminal's table has an Svg that draws nothing, so test the surface too.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : undefined
    const ordered = [...visible.filter(r => r.status === 'running'), ...visible.filter(r => r.status !== 'running')]
    // The main row always shows; subagents share what is left of the room.
    const room = Math.max(0, Math.min(MAX_ROWS, (e.props.maxRows || MAX_ROWS) - 1) - 1)
    const rows = ordered.slice(0, room)
    const hidden = ordered.length - rows.length
    const crab = (costume: string, isWalking: boolean, phase: number, key: string) =>
      Svg && (
        <Svg
          key={key}
          source={crabSvg(costume, isWalking, phase)}
          alt={`${COSTUME_NAME[costume] ?? 'crab'} crab`}
          width={CRAB_W}
          height={crabHeight(costume)}
        />
      )
    const mainMark = m.isWorking ? '●' : isFinished(m.plan) ? '✓' : '○'
    const mainColor = m.isWorking ? COLOR.running : isFinished(m.plan) ? COLOR.done : '#9a9a96'

    return (
      <Box flexDirection="column">
        <Box key="crabs-main" flexDirection="row" alignItems="center" gap={1}>
          {crab(mainCostume(m), m.isWorking, m.turnStartedAt > 0 ? (at - m.turnStartedAt) / 1000 : 0, 'crabs-main-crab')}
          <Text color={mainColor}>{mainMark} </Text>
          <Text wrap="truncate-end" dimColor={!m.isWorking}>
            {mainRowText(m, at)}
          </Text>
        </Box>
        {rows.map(r => (
          <Box key={`crabs-${r.id}`} flexDirection="row" alignItems="center" gap={1}>
            {crab(costumeOf(r), r.status === 'running', ((r.endedAt ?? at) - r.startedAt) / 1000, `crabs-crab-${r.id}`)}
            <Text color={COLOR[r.status]}>{MARK[r.status]} </Text>
            <Text wrap="truncate-end">{rowText(r, at)}</Text>
          </Box>
        ))}
        {hidden > 0 && <Text dimColor>+{hidden} more · /agents-info</Text>}
        {below}
      </Box>
    )
  })
}
