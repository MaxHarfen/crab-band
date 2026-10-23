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
test('reads no chat text: only working, the model label and where to draw, even mid-reply', () => {
  const s = readPage(newDoc({ stop: true, steps: ['Run a 20-second demo computation loop'] }))
  assert.deepEqual(Object.keys(s).sort(), ['footerRow', 'modelButton', 'modelLabel', 'working'])
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
