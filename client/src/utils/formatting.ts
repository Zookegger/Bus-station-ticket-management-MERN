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

/**
 * Helper to format date for display (dd/MM/yyyy).
 * Handles YYYY-MM-DD strings directly to avoid timezone shifts.
 */
export const formatDateDisplay = (date: string | Date | null | undefined) => {
	if (!date) return "-";
	if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
		const [y, m, d] = date.split("-");
		return `${d}/${m}/${y}`;
	}
	const d = new Date(date);
	return isNaN(d.getTime()) ? "-" : format(d, "dd/MM/yyyy");
};
