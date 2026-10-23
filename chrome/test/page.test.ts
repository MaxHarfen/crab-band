import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orgIdFromCookie, readPage } from '../src/page.ts'
import { newDoc } from './fixtures.ts'

test('the Stop button means working, even before streaming starts', () => {
  assert.equal(readPage(newDoc({ stop: true })).working, true)
})
test('streaming alone also means working', () => {
  assert.equal(readPage(newDoc({ streaming: true })).working, true)
})
test('neither means done', () => {
  assert.equal(readPage(newDoc({})).working, false)
})
test('the step is the last TurnStatus of the last reply, only while working', () => {
  const steps = ['Finding a way to simulate working', 'Run a 20-second demo computation loop']
  assert.equal(readPage(newDoc({ stop: true, steps })).step, 'Run a 20-second demo computation loop')
  assert.equal(readPage(newDoc({ stop: false, steps })).step, null)
  assert.equal(readPage(newDoc({ stop: true })).step, null)
})
test('the model label loses its "Model:" prefix; no picker is null', () => {
  assert.equal(readPage(newDoc({ model: 'Sonnet 5.5' })).modelLabel, 'Sonnet 5.5')
  assert.equal(readPage(newDoc({ model: null })).modelLabel, null)
})
test('no footer row is null, not an error', () => {
  assert.equal(readPage(newDoc({ footer: false })).footerRow, null)
})
test('the org id comes from lastActiveOrg and must be a UUID', () => {
  const id = '0b7e9c2a-1111-4222-8333-444455556666'
  assert.equal(orgIdFromCookie(`a=1; lastActiveOrg=${id}; b=2`), id)
  assert.equal(orgIdFromCookie('lastActiveOrg=not-a-uuid'), null)
  assert.equal(orgIdFromCookie(''), null)
})
