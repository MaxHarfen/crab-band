import { test } from 'node:test'
import assert from 'node:assert/strict'
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
test('the walk is slow: 16 s there and back (Max, live check)', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  const css = [...v.host.shadowRoot!.querySelectorAll('style')].map(s => s.textContent).join('\n')
  assert.match(css, /animation:crab-walk 16s /)
})
