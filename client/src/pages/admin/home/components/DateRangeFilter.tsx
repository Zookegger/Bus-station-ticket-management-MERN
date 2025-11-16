import { TextField, Button, Stack } from "@mui/material";

/**
 * Controlled date range filter component.
 * Delegates state management to parent / hook for better reuse & side-effects.
 */
interface DateRangeFilterProps {
	from_date: string;
	to_date: string;
	on_change: (key: "from" | "to", value: string) => void;
	on_apply: (from: string, to: string) => void;
	on_clear: () => void;
	apply_label?: string;
	clear_label?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	from_date,
	to_date,
	on_change,
	on_apply,
	on_clear,
	apply_label = "Apply Filter",
	clear_label = "Clear Filter",
}) => {
	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<TextField
				label="From Date"
				type="date"
				size="small"
				slotProps={{ inputLabel: { shrink: true } }}
				value={from_date}
				onChange={(e) => on_change("from", e.target.value)}
			/>
			<TextField
				label="To Date"
				type="date"
				size="small"
				slotProps={{ inputLabel: { shrink: true } }}
				value={to_date}
				onChange={(e) => on_change("to", e.target.value)}
			/>
			<Button variant="contained" onClick={() => on_apply(from_date, to_date)}>
				{apply_label}
			</Button>
			<Button variant="outlined" color="error" onClick={on_clear}>
				{clear_label}
			</Button>
		</Stack>
	);
};

export default DateRangeFilter;