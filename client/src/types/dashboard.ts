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

export interface PeriodComparisonRecord {
  period: string; // "Today", "This Month", "2025"
  previous: number; // Revenue from previous period
  current: number; // Revenue from current period
}

// Alias for backward compatibility
export type MonthlyComparisonRecord = PeriodComparisonRecord;

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
  /** Total users. */
  totalUsers: number;
  /** Total trips. */
  totalTrips: number;
}

export interface DashboardStats extends RevenueStatsSummary {
  dailyRevenue: Array<DailyRevenueRecord>;
  // Comparison Data
  dailyComparison: PeriodComparisonRecord[];
  monthlyComparison: PeriodComparisonRecord[];
  yearlyComparison: PeriodComparisonRecord[];
  cancellationRate: Array<CancellationRecord>;
}

/**
 * API Response type for dashboard stats
 */
export interface DashboardStatsResponse {
  data?: DashboardStats;
  [key: string]: any; // For flexible response handling
}
