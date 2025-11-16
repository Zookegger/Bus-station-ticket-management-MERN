/**
 * Currency formatting helper reused across dashboard charts.
 * Ensures consistent locale + style handling.
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US",
  minimumFractionDigits: number = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
  }).format(value);
}

/**
 * Percentage formatting helper.
 */
export function formatPercent(value: number, fractionDigits: number = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}
