import React, { useState } from "react";
import { FilterAlt as FilterIcon } from "@mui/icons-material";
import {
	TextField,
	Button,
	Stack,
	Menu,
	Typography,
	Divider,
} from "@mui/material";

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
	apply_label = "Apply",
	clear_label = "Clear",
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleApply = () => {
		on_apply(from_date, to_date);
		handleClose();
	};

	const handleClear = () => {
		on_clear();
		handleClose();
	};

	return (
		<>
			<Button
				onClick={handleClick}
				color="primary"
				variant="outlined"
				sx={{
					height: "100%",
					minWidth: "60px",
				}}
			>
				<FilterIcon />
			</Button>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				slotProps={{
					paper: {
						sx: { mt: 1.5, width: 320, p: 2 },
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<Typography variant="subtitle2" fontWeight={600} mb={2}>
					Filter by Date Range
				</Typography>

				<Stack spacing={2}>
					<TextField
						label="From Date"
						type="date"
						size="small"
						fullWidth
						slotProps={{ inputLabel: { shrink: true } }}
						value={from_date}
						onChange={(e) => on_change("from", e.target.value)}
					/>
					<TextField
						label="To Date"
						type="date"
						size="small"
						fullWidth
						slotProps={{ inputLabel: { shrink: true } }}
						value={to_date}
						onChange={(e) => on_change("to", e.target.value)}
					/>

					<Divider sx={{ my: 1 }} />

					<Stack
						direction="row"
						spacing={1}
						justifyContent="flex-end"
					>
						<Button
							variant="outlined"
							color="inherit"
							size="small"
							onClick={handleClear}
						>
							{clear_label}
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={handleApply}
						>
							{apply_label}
						</Button>
					</Stack>
				</Stack>
			</Menu>
		</>
	);
};

export default DateRangeFilter;
