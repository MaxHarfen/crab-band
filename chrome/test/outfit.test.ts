import { test } from 'node:test'
import assert from 'node:assert/strict'
import { outfitFromLabel, parseModelLabel } from '../src/outfit.ts'

test('every row of the spec table', () => {
  const cases: Array<[string | null, string]> = [
    ['Model: Fable 5.1', 'fable'],
    ['Model: Opus 5.5 Max', 'heavy'],
    ['Model: Opus 5.5 Extra high', 'careful'],
    ['Model: Opus 5.5 High', 'doll'],
    ['Model: Opus 5.5 Medium', 'medium'],
    ['Model: Opus 5.5 Low', 'light'],
    ['Model: Sonnet 5.5', 'sonnet'],
    ['Model: Sonnet 5.5 Medium', 'sonnet'],
    ['Model: Haiku 5.5', 'haiku'],
    ['Model: Opus 5.5', 'other'],
    ['Model: Something new', 'other'],
    [null, 'other'],
  ]
  for (const [label, outfit] of cases) assert.equal(outfitFromLabel(label), outfit, String(label))
})

test('the effort is the trailing label, longest first, without the "Model:" prefix', () => {
  assert.deepEqual(parseModelLabel('Model: Opus 5.5 Extra high'), { model: 'Opus 5.5', effort: 'xhigh' })
  assert.deepEqual(parseModelLabel('Opus 5.5 High'), { model: 'Opus 5.5', effort: 'high' })
  assert.deepEqual(parseModelLabel('Haiku 5.5'), { model: 'Haiku 5.5' })
})
