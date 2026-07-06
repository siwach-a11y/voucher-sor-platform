import { describe, expect, it } from 'vitest'
import { isValidUrl, routingQualityLabel } from '@/utils/url'

describe('routingQualityLabel', () => {
  it('classifies routing quality per spec §18', () => {
    expect(routingQualityLabel(1.0)).toBe('DIRECT LISTING')
    expect(routingQualityLabel(0.8)).toBe('PRODUCT SELECTION REQUIRED')
    expect(routingQualityLabel(0.6)).toBe('SEARCH RESULT')
    expect(routingQualityLabel(0.3)).toBe('CATEGORY PAGE')
    expect(routingQualityLabel(0.1)).toBe('HOMEPAGE')
    expect(routingQualityLabel(0)).toBe('HOMEPAGE')
  })
})

describe('isValidUrl', () => {
  it('accepts well-formed http(s) URLs', () => {
    expect(isValidUrl('https://giftflow.market/starbucks/500')).toBe(true)
  })

  it('rejects malformed URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})
