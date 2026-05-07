export const CURRENCIES = [
  { code: 'NGN', symbol: '₦',   label: 'NGN – Nigerian Naira' },
  { code: 'USD', symbol: '$',   label: 'USD – US Dollar' },
  { code: 'EUR', symbol: '€',   label: 'EUR – Euro' },
  { code: 'GBP', symbol: '£',   label: 'GBP – British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD – Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  label: 'AUD – Australian Dollar' },
  { code: 'ZAR', symbol: 'R',   label: 'ZAR – South African Rand' },
  { code: 'GHS', symbol: '₵',   label: 'GHS – Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'KES – Kenyan Shilling' },
  { code: 'EGP', symbol: 'E£',  label: 'EGP – Egyptian Pound' },
  { code: 'AED', symbol: 'AED', label: 'AED – UAE Dirham' },
  { code: 'INR', symbol: '₹',   label: 'INR – Indian Rupee' },
  { code: 'JPY', symbol: '¥',   label: 'JPY – Japanese Yen' },
  { code: 'SAR', symbol: 'SAR', label: 'SAR – Saudi Riyal' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency = 'NGN',
): string | null {
  if (!min && !max) return null
  const sym = getCurrencySymbol(currency)
  const prefix = sym.length > 1 ? `${sym} ` : sym
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
    if (n >= 10_000)    return `${prefix}${Math.round(n / 1_000)}k`
    if (n >= 1_000)     return `${prefix}${(n / 1_000).toFixed(1)}k`
    return `${prefix}${n}`
  }
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}
