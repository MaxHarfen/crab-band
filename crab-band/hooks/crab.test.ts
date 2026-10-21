import { describe, expect, test } from 'claude-code/testing'

import { ART, COSTUME_ACCENT, COSTUME_NAME, crabCss, crabMarkup } from './crab'
import { routineCss } from './moves'

const OUTFITS = Object.keys(COSTUME_NAME)

describe('crabMarkup', () => {
  test('a running musician picks up its dance at the phase it is given', () => {
    const m = crabMarkup('sonnet', '#C2569B', true, 5.5)
    expect(m.startsWith('<g class="c-sonnet run" style="--d:-1.50s"><g class="dn">')).toBe(true)
  })

  test("the musician's notes sit outside the dancing group, and both claws swing on their own", () => {
    const m = crabMarkup('sonnet', '#C2569B', true)
    expect(m).toContain('</g></g><g class="nt">')
    expect(m).toContain('<g class="cl">')
    expect(m).toContain('<g class="cr">')
  })

  test('a crab that is not running carries no phase and no run class', () => {
    expect(crabMarkup('sonnet', '#C2569B', false, 5.5)).not.toContain('--d')
    expect(crabMarkup('light', '#1D9E75', false).startsWith('<g class="c-light"><g class="dn">')).toBe(true)
  })

  test('a running crab carries its phase, so the once-a-second redraw never restarts its dance', () => {
    expect(crabMarkup('other', '#888780', true, 5.3)).toContain('--d:-1.30s')
    expect(crabMarkup('other', '#888780', false)).not.toContain(' run')
    expect(routineCss('other')).toContain('var(--d,0s)')
  })

  test("an outfit nobody drew is the plain crab, class and all, so the plain crab's dance reaches it", () => {
    expect(crabMarkup('nope', '#888780', true).startsWith('<g class="c-other run"><g class="dn">')).toBe(true)
  })

  test('the claws are drawn over the outfit, as in the samples: the doll holds them in front of her hair', () => {
    const m = crabMarkup('doll', COSTUME_ACCENT.doll ?? '', false)
    expect(m.indexOf('<g class="cl">')).toBeGreaterThan(m.indexOf('<g class="skirt">'))
    expect(m.indexOf('<g class="cr">')).toBeGreaterThan(m.indexOf('<g class="hair">'))
    expect(m).toContain('<g class="cr">')
  })
})

describe('crabCss', () => {
  test("each crab carries its own outfit's rules and no other's", () => {
    const css = crabCss('other')
    for (const other of ['c-heavy', 'c-sonnet', 'mv-careful']) expect(css).not.toContain(other)
    expect(css).toContain(routineCss('other'))
    expect(crabCss('careful')).toContain(routineCss('careful'))
    expect(crabCss('careful')).not.toContain('mv-other')
  })

  test('every crab freezes for reduced motion, and none walks any more', () => {
    for (const outfit of OUTFITS) {
      const css = crabCss(outfit)
      const ok =
        css.startsWith('<style>') &&
        css.endsWith('</style>') &&
        css.includes('@media (prefers-reduced-motion: reduce){.run,.run g{animation:none!important}}') &&
        !/@keyframes (st|bob|float)\{|(^|\n|\})\.run \.(la|lb|bd|cl|cr)\{/.test(css)
      expect(`${outfit} ${ok}`).toBe(`${outfit} true`)
    }
  })

  test("an outfit nobody drew gets the plain crab's stylesheet", () => {
    expect(crabCss('nope')).toBe(crabCss('other'))
  })

  test('a keyframe name two outfits both define means the same thing in both', () => {
    const body = new Map<string, string>()
    for (const outfit of OUTFITS) {
      for (const m of crabCss(outfit).matchAll(/@keyframes ([\w-]+)(\{(?:[^{}]|\{[^{}]*\})*\})/g)) {
        const [, name = '', rules = ''] = m
        expect(`${outfit} ${name} ${body.get(name) ?? rules}`).toBe(`${outfit} ${name} ${rules}`)
        body.set(name, rules)
      }
    }
  })
})

describe('the ART block', () => {
  test('every picture fits the 30 x 28 grid and every pixel has a colour', () => {
    expect(ART.base.rows.length).toBe(28)
    expect(ART.base.rows.every(row => row.length === 30)).toBe(true)
    for (const [name, outfit] of Object.entries(ART.outfits)) {
      for (const part of outfit.parts) {
        const width = part.rows[0]?.length ?? 0
        const fits = part.x >= 0 && part.y >= 0 && part.x + width <= 30 && part.rows.every(row => row.length === width)
        const coloured = part.rows.join('').replace(/\./g, '').split('').every(ch => ch in part.legend)
        expect(`${name} ${fits && coloured}`).toBe(`${name} true`)
      }
    }
  })

  test("the doll wears her hair, a skirt, a sparkle and a heart, each a group of its own", () => {
    const m = crabMarkup('doll', COSTUME_ACCENT.doll ?? '', true)
    for (const cls of ['hair', 'skirt', 'sp', 'ht']) expect(m).toContain(`<g class="${cls}">`)
  })

  test('the outfits match the names and accents', () => {
    expect(Object.keys(ART.outfits).sort()).toEqual(Object.keys(COSTUME_NAME).sort())
    expect(Object.keys(ART.outfits).sort()).toEqual(Object.keys(COSTUME_ACCENT).sort())
  })
})

describe('outfit motion', () => {
  test('the explorer glances left and right with its own eyes group', () => {
    expect(crabMarkup('explore', '#888780', true)).toContain('<g class="eye">')
    expect(crabCss('explore')).toContain('.c-explore.run .eye{animation:look 2s')
  })

  test("the scientist's blast is hidden until the flask blows", () => {
    expect(crabMarkup('heavy', '#D85A30', false)).toContain('<g class="boom">')
    expect(crabCss('heavy')).toContain('.c-heavy .pop,.c-heavy .boom,.c-heavy .smoke{opacity:0}')
  })

  test("the wizard's star blinks twice as fast while he rises, on the dance's own loop", () => {
    const css = crabCss('fable')
    expect(css).toContain('.c-fable.run .star{animation:star 4s steps(1,end) infinite var(--d,0s)}')
    expect(css).toContain('@keyframes star{0.000%{opacity:.2}3.125%{opacity:1}9.375%{opacity:.2}')
    expect(css).toContain('28.125%{opacity:1}31.250%{opacity:.2}34.375%{opacity:1}')
  })

  test('the doll flips her hair, flares her skirt, twinkles and sends up a heart', () => {
    const css = crabCss('doll')
    expect(css).toContain('.c-doll.run .hair{transform-origin:50% 18.75%;animation:hair 4s steps(1,end) infinite var(--d,0s)}')
    expect(css).toContain('@keyframes hair{0.000%{transform:rotate(0deg)}50.000%{transform:rotate(10deg)}53.750%{transform:rotate(-12deg)}57.500%{transform:rotate(0deg)}}')
    expect(css).toContain('.c-doll.run .skirt{transform-origin:50% 0;animation:flare 4s steps(1,end) infinite var(--d,0s)}')
    expect(css).toContain('@keyframes flare{0.000%{transform:scaleX(1)}62.500%{transform:scaleX(1.2)}71.875%{transform:scaleX(1)}}')
    expect(css).toContain('.c-doll.run .sp{animation:twinkle 4s steps(1,end) infinite var(--d,0s)}')
    expect(css).toContain('@keyframes twinkle{0.000%{opacity:.15}2.500%{opacity:1}8.750%{opacity:.15}15.000%{opacity:1}')
    expect(css).toContain('71.250%{opacity:.15}77.500%{opacity:1}80.625%{opacity:.15}83.750%{opacity:1}')
    expect(css).toContain('.c-doll.run .ht{animation:heart 1s ease-out infinite var(--d,0s)}')
    expect(css).toContain('@keyframes heart{0%{transform:translateY(2px);opacity:0}25%{opacity:1}100%{transform:translateY(-5px);opacity:0}}')
  })
})
