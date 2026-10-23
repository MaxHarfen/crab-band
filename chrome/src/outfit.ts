import { costumeFor } from '../../crab-band/hooks/costume.ts'

// The model picker's effort labels, as claude.ai writes them in English, and the effort crab-band
// knows them by. Longest label first, so "Extra high" is not read as "High".
export const EFFORTS: ReadonlyArray<readonly [string, string]> = [
  ['extra high', 'xhigh'],
  ['max', 'max'],
  ['high', 'high'],
  ['medium', 'medium'],
  ['low', 'low'],
]

// "Model: Opus 5.5 Medium" → { model: 'Opus 5.5', effort: 'medium' }. A label with no effort at its
// end (Haiku, or a model the picker shows without one) has no effort.
export const parseModelLabel = (label: string): { model: string; effort?: string } => {
  const text = label.replace(/^\s*model:/i, '').trim()
  const lower = text.toLowerCase()
  for (const [words, effort] of EFFORTS) {
    if (lower.endsWith(` ${words}`)) return { model: text.slice(0, -words.length - 1).trim(), effort }
  }
  return { model: text }
}

// The outfit for what the model picker says, by crab-band's own table; no label is the plain crab.
export const outfitFromLabel = (label: string | null): string => {
  if (label === null) return 'other'
  const { model, effort } = parseModelLabel(label)
  return costumeFor('other', 'main', model, effort)
}
