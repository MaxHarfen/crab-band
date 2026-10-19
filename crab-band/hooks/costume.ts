// Which outfit an agent wears, by its model and effort, so the crabs tell apart what each agent
// costs. A savvy-flow worker (savvy-careful, ...) wears its tier's outfit; Explore is the explorer.
//
//   Fable                      fable (wizard)
//   Opus, effort xhigh / max   heavy (scientist)
//   Opus, effort high          careful (painter)
//   Opus, effort medium        medium (cowboy)
//   Opus, effort low           light (ninja)
//   Haiku                      haiku (gardener)
//   Sonnet                     sonnet (musician)
//
// An Opus agent whose effort is not known yet (no model request seen) stays a plain crab
// until its first request reports it.
export const costumeFor = (tier: string, type: string, model: string, effort?: string): string => {
  if (tier !== 'other') return tier
  if (type === 'Explore') return 'explore'

  const m = model.toLowerCase()
  if (/fable|mythos/.test(m)) return 'fable'
  if (/opus/.test(m)) {
    if (effort === 'xhigh' || effort === 'max') return 'heavy'
    if (effort === 'high') return 'careful'
    if (effort === 'medium') return 'medium'
    if (effort === 'low') return 'light'
    return 'other'
  }
  if (/sonnet/.test(m)) return 'sonnet'
  if (/haiku/.test(m)) return 'haiku'
  return 'other'
}

const SAVVY_TIERS = ['fable', 'heavy', 'careful', 'medium', 'light']

// The savvy tier a subagent type names (`savvy-careful`, or `savvy-flow:savvy-careful` from the plugin),
// else 'other': the first argument costumeFor takes.
export const savvyTier = (type: string): string => {
  const bare = type.replace(/^[^:]*:/, '')
  const tier = bare.replace(/^savvy-/, '').toLowerCase()
  return bare.startsWith('savvy-') && SAVVY_TIERS.includes(tier) ? tier : 'other'
}
