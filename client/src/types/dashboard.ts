/**
 * Shared dashboard types for revenue & reporting components.
 * Centralizes record interfaces to avoid duplication and naming drift.
 */
export interface DailyRevenueRecord {
  /** Period label (e.g., 'Mon', 'Jan', '2025-01-01'). */
  period: string;
  /** Numeric revenue or value for the period. */
  value: number;
}

export interface MonthlyComparisonRecord {
  /** Period label (e.g., 'Jan', '2025-01'). */
  period: string;
  /** Previous period value. */
  previous: number;
  /** Current period value. */
  current: number;
}

export interface CancellationRecord {
  /** Category / route / entity name. */
  name: string;
  /** Numerator count (e.g., cancelled tickets). */
  count: number;
  /** Denominator total (e.g., total tickets). */
  total: number;
}

export interface RevenueStatsSummary {
  /** Aggregated total revenue (all time or scoped). */
  totalRevenue: number;
  /** Average ticket price in the chosen scope. */
  avgTicketPrice: number;
  /** Total tickets sold. */
  ticketsSold: number;
  /** Total cancelled tickets. */
  cancelledTickets: number;
}
