import { TrendChart } from "./index";
import type { DailyRevenueRecord } from "@my-types/dashboard";

/**
 * RevenueChart wrapper for TrendChart maintaining backward compatibility.
 * Prefer using TrendChart directly going forward.
 */
const RevenueChart: React.FC<{
  data: DailyRevenueRecord[];
  currency?: string;
}> = ({ data, currency = "USD" }) => (
  <TrendChart data={data} currency={currency} period_type="daily" />
);

export default RevenueChart;