import { describe, expect, test } from 'claude-code/testing'

import { ART, COSTUME_ACCENT, COSTUME_NAME, CRAB_CSS, DANCE_SECONDS, crabMarkup } from './crab'

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

  test('the stylesheet holds the routine for the body and each limb', () => {
    expect(CRAB_CSS).toContain('@keyframes bb{0.000%{transform:translate(-1px,0)}')
    expect(CRAB_CSS).toContain(`.c-sonnet.run .dn{transform-origin:50% 57.143%;animation:bb ${DANCE_SECONDS}s steps(1,end) infinite var(--d,0s)}`)
    for (const limb of ['la', 'lb', 'cl', 'cr']) expect(CRAB_CSS).toContain(`@keyframes bb-${limb}{`)
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

  test('the outfits match the names and accents', () => {
    expect(Object.keys(ART.outfits).sort()).toEqual(Object.keys(COSTUME_NAME).sort())
    expect(Object.keys(ART.outfits).sort()).toEqual(Object.keys(COSTUME_ACCENT).sort())
  })
})

describe('outfit motion', () => {
  test('the explorer glances left and right with its own eyes group', () => {
    expect(crabMarkup('explore', '#888780', true)).toContain('<g class="eye">')
    expect(CRAB_CSS).toContain('.c-explore.run .eye{animation:look 2s')
  })

  test("the scientist's blast is hidden until the flask blows", () => {
    expect(crabMarkup('heavy', '#D85A30', false)).toContain('<g class="boom">')
    expect(CRAB_CSS).toContain('.c-heavy .pop,.c-heavy .boom,.c-heavy .smoke{opacity:0}')
  })

  test('the musician spins one turn, not two', () => {
    expect(CRAB_CSS).toContain('rotate(495deg)')
    expect(CRAB_CSS).not.toContain('rotate(540deg)')
  })
})
