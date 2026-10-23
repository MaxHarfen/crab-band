import { ART, COSTUME_ACCENT, COSTUME_NAME, crabCss, crabMarkup } from '../../crab-band/hooks/crab.ts'
import { routineOf } from '../../crab-band/hooks/moves.ts'

// Pixels per grid unit. The crab's art is a 30 x 28 grid; its dance needs a little more room.
export const CRAB_UNIT = 1.5

// The crab's own orange (its body, Claude's colour), for the footprints it leaves.
export const CRAB_ORANGE = ART.base.legend.c[0]

// The legs end at row 26 of the grid: how far above the bottom of an outfit's dance box its feet
// stand, in px, so footprints land on the ground whatever the outfit.
const FEET_ROW = 26
export const feetFromBottom = (costume: string, unit = CRAB_UNIT): number => {
  const [, y, , h] = routineOf(costume).box
  return (y + h - FEET_ROW) * unit
}

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
