import { describe, expect, test } from 'claude-code/testing'

import { costumeFor, savvyTier } from './costume'

describe('costumeFor', () => {
  test('savvy workers keep their own tier, Explore is the explorer', () => {
    expect(costumeFor('careful', 'savvy-careful', 'claude-haiku-5-5', 'low')).toBe('careful')
    expect(costumeFor('other', 'Explore', 'claude-opus-5-5', 'xhigh')).toBe('explore')
  })

  test('other agents dress by model and effort', () => {
    expect(costumeFor('other', 'general-purpose', 'claude-fable-5-1', 'high')).toBe('fable')
    expect(costumeFor('other', 'general-purpose', 'claude-opus-5-5', 'max')).toBe('heavy')
    expect(costumeFor('other', 'general-purpose', 'claude-opus-5-5[1m]', 'xhigh')).toBe('heavy')
    expect(costumeFor('other', 'Plan', 'claude-opus-5-5', 'high')).toBe('careful')
    expect(costumeFor('other', 'general-purpose', 'claude-opus-5-5', 'medium')).toBe('medium')
    expect(costumeFor('other', 'general-purpose', 'claude-opus-5-5', 'low')).toBe('light')
    expect(costumeFor('other', 'general-purpose', 'claude-sonnet-5-5', undefined)).toBe('sonnet')
    expect(costumeFor('other', 'claude-code-guide', 'claude-haiku-5-5', undefined)).toBe('haiku')
  })

  test('an Opus agent with no effort reported yet, or an unknown model, stays a plain crab', () => {
    expect(costumeFor('other', 'general-purpose', 'claude-opus-5-5', undefined)).toBe('other')
    expect(costumeFor('other', 'general-purpose', 'some-gateway-model', 'high')).toBe('other')
  })
})

describe('savvyTier', () => {
  test('a savvy worker type names its tier, any other type is other', () => {
    expect(savvyTier('savvy-careful')).toBe('careful')
    expect(savvyTier('savvy-flow:savvy-light')).toBe('light')
    expect(savvyTier('savvy-unknown')).toBe('other')
    expect(savvyTier('general-purpose')).toBe('other')
  })
})
