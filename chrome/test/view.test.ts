import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ART } from '../../crab-band/hooks/crab.ts'
import { routineOf } from '../../crab-band/hooks/moves.ts'
import { crabSvg } from '../src/crab-svg.ts'
import { createCrabView, createLimitsView } from '../src/view.ts'
import { newDoc } from './fixtures.ts'

test('the svg dances only while working, in its outfit, in its own box', () => {
  const s = crabSvg('medium', true, 0)
  assert.match(s, /class="c-medium run"/)
  assert.match(s, new RegExp(`viewBox="${routineOf('medium').box.join(' ')}"`))
  assert.doesNotMatch(crabSvg('medium', false, 0), / run"/)
  assert.match(crabSvg('nope', true, 0), /class="c-other run"/)
})
test('keeps the same svg while costume and working are unchanged', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'medium', working: true, phase: 0 })
  const first = v.host.shadowRoot!.querySelector('svg')
  v.render({ costume: 'medium', working: true, phase: 3 })
  assert.equal(v.host.shadowRoot!.querySelector('svg'), first)
  v.render({ costume: 'sonnet', working: true, phase: 3 })
  assert.notEqual(v.host.shadowRoot!.querySelector('svg'), first)
})
test('the crab walks the row only while working, with no text beside it', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const crab = () => v.host.shadowRoot!.querySelector('.crab')!
  v.render({ costume: 'other', working: true, phase: 0 })
  assert.equal(crab().classList.contains('walk'), true)
  v.render({ costume: 'other', working: false, phase: 0 })
  assert.equal(crab().classList.contains('walk'), false)
  assert.equal(v.host.shadowRoot!.querySelector('.step'), null)
})
test('reduced motion stops the walk as well as the dance', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const css = [...v.host.shadowRoot!.querySelectorAll('style')].map(s => s.textContent).join('\n')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\{[^}]*\.walk\{animation:none/)
})
test('limits: text and title, hidden when null', () => {
  const doc = newDoc({}); const v = createLimitsView(doc); doc.body.append(v.host)
  v.render('5h 6% · 7d 91%', '5h ↺3h10m · 7d ↺1d12h')
  assert.equal(v.host.shadowRoot!.textContent!.trim(), '5h 6% · 7d 91%')
  assert.equal(v.host.title, '5h ↺3h10m · 7d ↺1d12h')
  v.render(null, '')
  assert.equal(v.host.hidden, true)
})
test('the drawn crab has its outfit, its groups and its dance in the shadow root', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'medium', working: true, phase: 0 })
  const root = v.host.shadowRoot!
  assert.ok(root.querySelector('svg g.c-medium.run g.dn g.bd rect'), 'the crab is drawn')
  assert.match([...root.querySelectorAll('style')].map(s => s.textContent).join('\n'), /@keyframes mv-medium-/)
})
test('the walk is slow: 30 s there and back (Max, live check)', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const css = [...v.host.shadowRoot!.querySelectorAll('style')].map(s => s.textContent).join('\n')
  assert.match(css, /animation:crab-walk 30s /)
})

// A crab caught mid-walk, with animate() recorded instead of run.
const midWalk = (at: string) => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'medium', working: true, phase: 0 })
  const crab = v.host.shadowRoot!.querySelector('.crab') as HTMLElement
  crab.style.transform = at
  const calls: unknown[] = []
  ;(crab as any).animate = (keyframes: unknown, options: unknown) => { calls.push([keyframes, options]); return { cancel() {} } }
  return { v, crab, calls }
}
test('done mid-walk: the crab stops dancing and runs back to the start in 2 s', () => {
  const { v, crab, calls } = midWalk('translateX(300px)')
  v.render({ costume: 'medium', working: false, phase: 0 })
  assert.equal(crab.classList.contains('walk'), false)
  assert.doesNotMatch(crab.innerHTML, / run"/)
  assert.deepEqual(calls, [[[{ transform: 'translateX(300px)' }, { transform: 'none' }], { duration: 2000, easing: 'ease-in-out' }]])
})
test('done at the start: nothing to run back', () => {
  const { v, calls } = midWalk('none')
  v.render({ costume: 'medium', working: false, phase: 0 })
  assert.deepEqual(calls, [])
})
test('a new reply during the run back cancels it and walks again', () => {
  const { v, crab } = midWalk('translateX(300px)')
  let cancelled = false
  ;(crab as any).animate = () => ({ cancel() { cancelled = true } })
  v.render({ costume: 'medium', working: false, phase: 0 })
  v.render({ costume: 'medium', working: true, phase: 0 })
  assert.equal(cancelled, true)
  assert.equal(crab.classList.contains('walk'), true)
})

const cssOf = (v: { host: HTMLElement }): string =>
  [...v.host.shadowRoot!.querySelectorAll('style')].map(s => s.textContent).join('\n')

test('two footprints on each side of the crab, kept across redraws so they stay in step with the walk', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'medium', working: true, phase: 0 })
  const root = v.host.shadowRoot!
  const trails = [...root.querySelectorAll('.crab .trail')]
  assert.deepEqual(trails.map(t => [t.className, t.querySelectorAll('i').length]), [['trail l', 2], ['trail r', 2]])
  v.render({ costume: 'sonnet', working: true, phase: 3 })
  assert.equal(root.querySelector('.crab .trail'), trails[0])
})
test('the footprints follow the walk: behind the crab both ways, only while walking, never with reduced motion', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const css = cssOf(v)
  assert.match(css, /\.walk \.trail\.l\{animation:crab-trail-l 30s step-end infinite\}/)
  assert.match(css, /\.walk \.trail\.r\{animation:crab-trail-r 30s step-end infinite\}/)
  assert.match(css, /(^|\n)\.trail\{[^}]*display:none/)
  assert.match(css, /prefers-reduced-motion[^@]*\.trail\{display:none/)
})
test('the footprints sit where each outfit\'s feet stand', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const crab = v.host.shadowRoot!.querySelector('.crab') as HTMLElement
  v.render({ costume: 'medium', working: true, phase: 0 })
  assert.equal(crab.style.getPropertyValue('--feet'), '1.5px')
  v.render({ costume: 'fable', working: true, phase: 0 })
  assert.equal(crab.style.getPropertyValue('--feet'), '6px')
})
test('the footprints are the crab\'s own orange and blink like Claude\'s working dot (Max, live check)', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const css = cssOf(v)
  assert.equal(ART.base.legend.c[0], '#D97757')
  assert.match(css, new RegExp(`\\.trail i\\{[^}]*background:${ART.base.legend.c[0]}`))
  assert.match(css, /\.trail i\{[^}]*animation:crab-print /)
})
