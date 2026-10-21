import { describe, expect, test } from 'claude-code/testing'

import { COSTUME_NAME } from './crab'
import { DANCE_SECONDS, MOVES, routineCss, routineOf } from './moves'

describe('MOVES', () => {
  test('every outfit has a routine, and nothing else does', () => {
    expect(Object.keys(MOVES).sort()).toEqual(Object.keys(COSTUME_NAME).sort())
  })

  test('each routine starts at 0, its keys rise within one loop, and its box holds the body', () => {
    for (const [name, routine] of Object.entries(MOVES)) {
      const times = routine.keys.map(([second]) => second)
      const rises =
        times[0] === 0 && times.every((s, i) => i === 0 || s > (times[i - 1] ?? s)) && times.every(s => s < DANCE_SECONDS)
      const [x, y, w, h] = routine.box
      const holds = x <= 3 && y <= 10 && x + w >= 27 && y + h >= 26
      expect(`${name} ${rises} ${holds}`).toBe(`${name} true true`)
    }
  })

  test("an outfit with no routine dances the plain crab's", () => {
    expect(routineOf('nope')).toBe(MOVES.other)
  })
})

describe('routineCss', () => {
  test('the plain crab moves as a whole about its pivot, on the 4 s loop, from the phase it is given', () => {
    const css = routineCss('other')
    expect(css).toContain('@keyframes mv-other-dn{0.000%{transform:translate(-2px,0px) rotate(-10deg) scale(1,1)}')
    expect(css).toContain(
      '.c-other.run .dn{transform-origin:50% 60.714%;animation:mv-other-dn 4s steps(1,end) infinite var(--d,0s)}',
    )
  })

  test('the body squats, the claws move on top of it and the legs lift, each on its own', () => {
    const css = routineCss('other')
    expect(css).toContain('@keyframes mv-other-bd{0.000%{transform:translate(0,0px)}6.250%{transform:translate(0,1px)}')
    expect(css).toContain('@keyframes mv-other-cl{0.000%{transform:translate(0px,-3px)}')
    expect(css).toContain('@keyframes mv-other-la{0.000%{transform:translateY(-1px)}')
    for (const group of ['bd', 'cl', 'cr', 'la', 'lb'])
      expect(css).toContain(`.c-other.run .${group}{animation:mv-other-${group} 4s steps(1,end) infinite var(--d,0s)}`)
  })

  test('the painter sways from the feet, and the cowboy turns round', () => {
    expect(routineCss('careful')).toContain('transform-origin:50% 92.857%')
    expect(routineCss('medium')).toContain('scale(-1,1)')
  })

  test('the musician spins one turn, not two', () => {
    expect(routineCss('sonnet')).toContain('rotate(495deg)')
    expect(routineCss('sonnet')).not.toContain('rotate(540deg)')
    expect(routineCss('sonnet')).toContain('transform-origin:50% 57.143%')
  })

  test("each outfit's keyframes carry its own name, so crabs on one page never share one", () => {
    const owner = new Map<string, string>()
    for (const outfit of Object.keys(MOVES)) {
      const names = [...routineCss(outfit).matchAll(/@keyframes ([\w-]+)\{/g)].map(m => m[1] ?? '')
      expect(`${outfit} ${names.length > 0}`).toBe(`${outfit} true`)
      for (const name of names) {
        expect(`${outfit} ${name.startsWith(`mv-${outfit}-`)} ${owner.get(name) ?? 'new'}`).toBe(`${outfit} true new`)
        owner.set(name, outfit)
      }
    }
  })

  test("an outfit with no routine gets the plain crab's rules, never rules of its own", () => {
    expect(routineCss('nope')).toBe(routineCss('other'))
  })
})
