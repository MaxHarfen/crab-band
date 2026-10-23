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
  v.render({ costume: 'medium', working: true, step: 'a', phase: 0 })
  const first = v.host.shadowRoot!.querySelector('svg')
  v.render({ costume: 'medium', working: true, step: 'b', phase: 3 })
  assert.equal(v.host.shadowRoot!.querySelector('svg'), first)
  v.render({ costume: 'sonnet', working: true, step: 'b', phase: 3 })
  assert.notEqual(v.host.shadowRoot!.querySelector('svg'), first)
})
test('step text is text, not markup', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'other', working: true, step: '<img src=x onerror=alert(1)>', phase: 0 })
  assert.equal(v.host.shadowRoot!.querySelector('img'), null)
  assert.equal(v.host.shadowRoot!.querySelector('.step')!.textContent, '<img src=x onerror=alert(1)>')
})
test('no step hides the step line', () => {
  const doc = newDoc({}); const v = createCrabView(doc); doc.body.append(v.host)
  v.render({ costume: 'other', working: false, step: null, phase: 0 })
  assert.equal((v.host.shadowRoot!.querySelector('.step') as HTMLElement).hidden, true)
})
test('limits: text and title, hidden when null', () => {
  const doc = newDoc({}); const v = createLimitsView(doc); doc.body.append(v.host)
  v.render('5h 6% · 7d 91%', '5h ↺3h10m · 7d ↺1d12h')
  assert.equal(v.host.shadowRoot!.textContent!.trim(), '5h 6% · 7d 91%')
  assert.equal(v.host.title, '5h ↺3h10m · 7d ↺1d12h')
  v.render(null, '')
  assert.equal(v.host.hidden, true)
})
