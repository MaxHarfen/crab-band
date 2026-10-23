import { CRAB_ORANGE, crabSvg, feetFromBottom } from './crab-svg.ts'

// The two things the extension draws, each in a host of its own with a shadow root, so claude.ai's
// styles and the crab's never touch. A render writes only what changed: the page's MutationObserver
// sees every write, and the dance would restart if the SVG were redrawn.

export type CrabState = { costume: string; working: boolean; phase: number }
export type CrabView = { host: HTMLElement; render(s: CrabState): void }
export type LimitsView = { host: HTMLElement; render(text: string | null, title: string): void }

// The host fills the rest of the footer row, and the crab walks it sideways, there and back, slowly
// enough not to pull the eye, while Claude works (dancing as it goes), with two orange footprints
// blinking behind it on the side it came from, like Claude's own working dot. Done, it stops dancing
// and runs back to the start, beside claude.ai's spark, in RETURN_MS. Nothing moves while Claude is
// idle. claude.ai keeps the footer row `invisible` while its spark is hidden; the crab shows regardless.
const WALK_SECONDS = 30
const RETURN_MS = 2000
const CRAB_STYLE = [
  ':host{display:block;flex:1 1 auto;min-width:0;container-type:inline-size;visibility:visible;line-height:0}',
  '.crab{display:inline-block;position:relative;line-height:0}',
  `.crab.walk{animation:crab-walk ${WALK_SECONDS}s ease-in-out infinite}`,
  '@keyframes crab-walk{0%,100%{transform:translateX(0)}50%{transform:translateX(calc(100cqw - 100%))}}',
  '.art,.crab svg{display:block;image-rendering:pixelated}',
  // The footprints: near one first, on the left on the way out and on the right on the way back,
  // switching sides at the turn, in step with the walk (both start when the walk does).
  '.trail{position:absolute;bottom:var(--feet,0px);display:none;gap:3px}',
  '.walk .trail{display:flex}',
  '.trail.l{right:100%;margin-right:2px;flex-direction:row-reverse}',
  '.trail.r{left:100%;margin-left:2px}',
  `.trail i{display:block;width:3px;height:3px;background:${CRAB_ORANGE};animation:crab-print 1s ease-in-out infinite}`,
  '.trail i+i{animation-delay:-.5s}',
  '@keyframes crab-print{0%,100%{opacity:.25}50%{opacity:1}}',
  `.walk .trail.l{animation:crab-trail-l ${WALK_SECONDS}s step-end infinite}`,
  `.walk .trail.r{animation:crab-trail-r ${WALK_SECONDS}s step-end infinite}`,
  '@keyframes crab-trail-l{0%{visibility:visible}50%{visibility:hidden}}',
  '@keyframes crab-trail-r{0%{visibility:hidden}50%{visibility:visible}}',
  '@media (prefers-reduced-motion: reduce){.walk{animation:none!important}.trail{display:none!important}}',
].join('\n')

const LIMITS_STYLE = 'font:11px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:inherit;opacity:.7;white-space:nowrap'

const hostOf = (doc: Document, kind: string): HTMLElement => {
  const host = doc.createElement('span')
  host.setAttribute('data-crab-band', kind)
  return host
}

export const createCrabView = (doc: Document): CrabView => {
  const host = hostOf(doc, 'crab')
  const root = host.attachShadow({ mode: 'open' })
  const style = doc.createElement('style')
  style.textContent = CRAB_STYLE
  const crab = doc.createElement('span')
  crab.className = 'crab'
  const art = doc.createElement('span')
  art.className = 'art'
  const trail = (side: string) => {
    const t = doc.createElement('span')
    t.className = `trail ${side}`
    t.append(doc.createElement('i'), doc.createElement('i'))
    return t
  }
  crab.append(art, trail('l'), trail('r'))
  root.append(style, crab)

  let drawn: { costume: string; working: boolean } | null = null
  let back: { cancel(): void } | null = null
  return {
    host,
    render(s) {
      if (drawn === null || drawn.costume !== s.costume || drawn.working !== s.working) {
        // Where the walk had got to, read before the walk stops (the Web Animation adds no attribute,
        // so the page's MutationObserver does not see the run back).
        const stopping = drawn !== null && drawn.working && !s.working
        const from = stopping ? doc.defaultView?.getComputedStyle(crab).transform : undefined
        art.innerHTML = crabSvg(s.costume, s.working, s.phase)
        if (drawn === null || drawn.costume !== s.costume) crab.style.setProperty('--feet', `${feetFromBottom(s.costume)}px`)
        if (drawn === null || drawn.working !== s.working) {
          if (s.working) {
            back?.cancel()
            back = null
          }
          crab.classList.toggle('walk', s.working)
        }
        if (from && from !== 'none' && typeof crab.animate === 'function') {
          back = crab.animate([{ transform: from }, { transform: 'none' }], { duration: RETURN_MS, easing: 'ease-in-out' })
        }
        drawn = { costume: s.costume, working: s.working }
      }
    },
  }
}

export const createLimitsView = (doc: Document): LimitsView => {
  const host = hostOf(doc, 'limits')
  host.hidden = true
  const root = host.attachShadow({ mode: 'open' })
  const line = doc.createElement('span')
  line.setAttribute('style', LIMITS_STYLE)
  root.append(line)

  return {
    host,
    render(text, title) {
      if (text === null) {
        if (!host.hidden) host.hidden = true
        return
      }
      if (line.textContent !== text) line.textContent = text
      if (host.title !== title) host.title = title
      if (host.hidden) host.hidden = false
    },
  }
}
