import { useState, useEffect } from 'react'

export interface GeoPrice {
  currency: string
  symbol: string
  starter: string
  growth: string
  country: string
  countryCode: string
}

const PRICING_MAP: Record<string, GeoPrice> = {
  NG: { currency: 'NGN', symbol: '₦', starter: '25,000', growth: '75,000', country: 'Nigeria', countryCode: 'NG' },
  KE: { currency: 'KES', symbol: 'KSh', starter: '3,500', growth: '10,000', country: 'Kenya', countryCode: 'KE' },
  ZA: { currency: 'ZAR', symbol: 'R', starter: '500', growth: '1,500', country: 'South Africa', countryCode: 'ZA' },
  GH: { currency: 'GHS', symbol: 'GH₵', starter: '350', growth: '1,000', country: 'Ghana', countryCode: 'GH' },
  EG: { currency: 'EGP', symbol: 'E£', starter: '1,500', growth: '4,500', country: 'Egypt', countryCode: 'EG' },
  TZ: { currency: 'TZS', symbol: 'TSh', starter: '65,000', growth: '195,000', country: 'Tanzania', countryCode: 'TZ' },
  RW: { currency: 'RWF', symbol: 'RF', starter: '35,000', growth: '105,000', country: 'Rwanda', countryCode: 'RW' },
  GB: { currency: 'GBP', symbol: '£', starter: '25', growth: '75', country: 'United Kingdom', countryCode: 'GB' },
  US: { currency: 'USD', symbol: '$', starter: '29', growth: '89', country: 'United States', countryCode: 'US' },
  CA: { currency: 'CAD', symbol: 'CA$', starter: '39', growth: '119', country: 'Canada', countryCode: 'CA' },
  DE: { currency: 'EUR', symbol: '€', starter: '25', growth: '79', country: 'Germany', countryCode: 'DE' },
  FR: { currency: 'EUR', symbol: '€', starter: '25', growth: '79', country: 'France', countryCode: 'FR' },
  ES: { currency: 'EUR', symbol: '€', starter: '25', growth: '79', country: 'Spain', countryCode: 'ES' },
  IT: { currency: 'EUR', symbol: '€', starter: '25', growth: '79', country: 'Italy', countryCode: 'IT' },
  NL: { currency: 'EUR', symbol: '€', starter: '25', growth: '79', country: 'Netherlands', countryCode: 'NL' },
  IN: { currency: 'INR', symbol: '₹', starter: '2,500', growth: '7,500', country: 'India', countryCode: 'IN' },
  AE: { currency: 'AED', symbol: 'د.إ', starter: '109', growth: '329', country: 'UAE', countryCode: 'AE' },
  SA: { currency: 'SAR', symbol: 'ر.س', starter: '109', growth: '329', country: 'Saudi Arabia', countryCode: 'SA' },
  AU: { currency: 'AUD', symbol: 'A$', starter: '45', growth: '135', country: 'Australia', countryCode: 'AU' },
  BR: { currency: 'BRL', symbol: 'R$', starter: '149', growth: '449', country: 'Brazil', countryCode: 'BR' },
  JP: { currency: 'JPY', symbol: '¥', starter: '4,500', growth: '13,500', country: 'Japan', countryCode: 'JP' },
  SG: { currency: 'SGD', symbol: 'S$', starter: '39', growth: '119', country: 'Singapore', countryCode: 'SG' },
}

// EUR zone fallback
const EUR_COUNTRIES = ['AT','BE','CY','EE','FI','GR','IE','LV','LT','LU','MT','PT','SK','SI']

const DEFAULT_PRICE: GeoPrice = {
  currency: 'USD', symbol: '$', starter: '29', growth: '89', country: 'International', countryCode: 'US'
}

export function useGeoPrice(): GeoPrice & { loading: boolean } {
  const [price, setPrice] = useState<GeoPrice>(DEFAULT_PRICE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = sessionStorage.getItem('vexis_geo')
    if (cached) {
      setPrice(JSON.parse(cached))
      setLoading(false)
      return
    }

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code: string = data.country_code || 'US'
        let resolved: GeoPrice

        if (PRICING_MAP[code]) {
          resolved = PRICING_MAP[code]
        } else if (EUR_COUNTRIES.includes(code)) {
          resolved = { ...PRICING_MAP['DE'], country: data.country_name || 'Europe', countryCode: code }
        } else {
          resolved = { ...DEFAULT_PRICE, country: data.country_name || 'International', countryCode: code }
        }

        sessionStorage.setItem('vexis_geo', JSON.stringify(resolved))
        setPrice(resolved)
      })
      .catch(() => setPrice(DEFAULT_PRICE))
      .finally(() => setLoading(false))
  }, [])

  return { ...price, loading }
}
