import { useCallback, useState } from "react";

/**
 * Hook encapsulating date range filter state & handlers for dashboard.
 * Provides controlled values & safe apply/clear logic.
 */
export function useDateRangeFilter() {
  const [from_date, set_from_date] = useState<string>("");
  const [to_date, set_to_date] = useState<string>("");

  /** Update a date field by key. */
  const update_date = useCallback((key: "from" | "to", value: string) => {
    if (key === "from") set_from_date(value);
    else set_to_date(value);
  }, []);

  /** Clear both date fields. */
  const clear_dates = useCallback(() => {
    set_from_date("");
    set_to_date("");
  }, []);

  return {
    from_date,
    to_date,
    set_from_date,
    set_to_date,
    update_date,
    clear_dates,
  };
}
