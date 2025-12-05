import { format } from "date-fns";

/**
 * Currency formatting helper reused across dashboard charts.
 * Ensures consistent locale + style handling.
 */
export const formatCurrency = (
	value: number,
	currency: string = "USD",
	locale: string = "en-US",
	minimumFractionDigits: number = 0
): string => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits,
	}).format(value);
};

/**
 * Percentage formatting helper.
 */
export const formatPercent = (
	value: number,
	fractionDigits: number = 0
): string => {
	return `${value.toFixed(fractionDigits)}%`;
};

// Helper to format date for input type="date" (YYYY-MM-DD)
export const formatDateForInput = (date: string | Date | null | undefined) => {
	if (!date) return "";
	const d = new Date(date);
	return isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd");
};
