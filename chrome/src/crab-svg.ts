import { COSTUME_ACCENT, COSTUME_NAME, crabCss, crabMarkup } from '../../crab-band/hooks/crab.ts'
import { routineOf } from '../../crab-band/hooks/moves.ts'

// Pixels per grid unit. The crab's art is a 30 x 28 grid; its dance needs a little more room.
export const CRAB_UNIT = 1.5

// One crab as its own SVG, in its outfit's own dance box (one crab, so no shared width as in the
// band). It dances while `isWalking`; `phase` is how long it has danced, so a redraw picks up there.
// The outfit's stylesheet comes first, beside the SVG rather than inside it: the crab lives in a
// shadow root of its own, where the sheet reaches it either way, and an HTML <style> parses the same
// everywhere (happy-dom, the test DOM, drops whatever follows a <style> inside an inline <svg>).
export const crabSvg = (costume: string, isWalking: boolean, phase: number, unit = CRAB_UNIT): string => {
  const [x, y, w, h] = routineOf(costume).box
  const name = COSTUME_NAME[costume] ?? COSTUME_NAME.other
  return (
    crabCss(costume) +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * unit)}" height="${Math.round(h * unit)}" ` +
    `viewBox="${x} ${y} ${w} ${h}" shape-rendering="crispEdges" role="img" aria-label="${name} crab">` +
    `${crabMarkup(costume, COSTUME_ACCENT[costume] ?? '#888780', isWalking, phase)}</svg>`
  )
}
