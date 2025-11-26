import {
	Box,
	Grid,
	IconButton,
	Paper,
	Stack,
	Tab,
	Tabs,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { useState, useMemo, type FC } from "react";
import {
	Chair as ChairIcon,
	CheckCircle as SelectedIcon,
	Cancel as BookedIcon,
} from "@mui/icons-material";
import type {
	SeatLayout,
	SeatType,
} from "./types";

// --- Types ---

export interface SeatBookingSelectorProps {
	initialLayout: string | SeatLayout; // JSON string or object
	bookedSeats?: { floor: number; row: number; col: number }[]; // Coordinates of sold tickets
	selectedSeats?: { floor: number; row: number; col: number }[]; // Externally controlled selection
	onSelectionChange?: (
		seats: { floor: number; row: number; col: number; label: string }[]
	) => void;
	maxSelectable?: number;
}

// --- Helper to parse layout consistently ---
const parseLayout = (layoutInput: string | SeatLayout): SeatLayout => {
	if (typeof layoutInput === "string") {
		try {
			const parsed = JSON.parse(layoutInput);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	return layoutInput;
};

// --- Legend Definition ---
const LEGEND_ITEMS = [
	{
		label: "Available",
		icon: <ChairIcon />,
		color: "primary.main",
		variant: "outlined",
	},
	{
		label: "Selected",
		icon: <SelectedIcon />,
		color: "primary.main",
		variant: "filled",
	},
	{
		label: "Booked",
		icon: <BookedIcon />,
		color: "text.disabled",
		variant: "filled",
	},
];

const SeatBookingSelector: FC<SeatBookingSelectorProps> = ({
	initialLayout,
	bookedSeats = [],
	selectedSeats: externalSelectedSeats,
	onSelectionChange,
	maxSelectable = 5,
}) => {
	const theme = useTheme();
	const [activeTab, setActiveTab] = useState(0);
	const [internalSelected, setInternalSelected] = useState<
		{ floor: number; row: number; col: number; label: string }[]
	>([]);

	// Use external state if provided, otherwise local
	const selected = useMemo(() => {
		// If external props are passed, we map them to include labels if possible,
		// strictly speaking we mostly rely on the internal handle for the label logic below
		return externalSelectedSeats || internalSelected;
	}, [externalSelectedSeats, internalSelected]);

	// Parse layout once
	const layout = useMemo(() => parseLayout(initialLayout), [initialLayout]);
	const floors = layout.length;

	// --- Generate Seat Labels (1, 2, 3...) based on layout structure ---
	// This allows us to give a human-readable name to every seat coordinate
	const seatLabels = useMemo(() => {
		const labels: Record<string, string> = {};
		let counter = 1;

		layout.forEach((floor, fIdx) => {
			floor.forEach((row, rIdx) => {
				row.forEach((type, cIdx) => {
					const key = `${fIdx}-${rIdx}-${cIdx}`;
					if (type === "available") {
						labels[key] = `${counter++}`; // Simple numeric increment
					}
				});
			});
		});
		return labels;
	}, [layout]);

	// --- Helpers ---

	const isBooked = (f: number, r: number, c: number) => {
		return bookedSeats.some(
			(s) => s.floor === f && s.row === r && s.col === c
		);
	};

	const isSelected = (f: number, r: number, c: number) => {
		// Handle both prop-structure (maybe just coords) and internal structure (with label)
		return selected.some(
			(s) => s.floor === f && s.row === r && s.col === c
		);
	};

	const handleSeatClick = (
		floor: number,
		row: number,
		col: number,
		type: SeatType
	) => {
		if (type !== "available") return;
		if (isBooked(floor, row, col)) return;

		const alreadySelected = isSelected(floor, row, col);
		let newSelection = [...(internalSelected || [])];

		if (alreadySelected) {
			newSelection = newSelection.filter(
				(s) => !(s.floor === floor && s.row === row && s.col === col)
			);
		} else {
			if (maxSelectable && newSelection.length >= maxSelectable) {
				// Optional: Trigger a toast warning here
				return;
			}
			const key = `${floor}-${row}-${col}`;
			newSelection.push({
				floor,
				row,
				col,
				label: seatLabels[key] || "?",
			});
		}

		if (!externalSelectedSeats) {
			setInternalSelected(newSelection);
		}

		if (onSelectionChange) {
			onSelectionChange(newSelection);
		}
	};

	return (
		<Grid container spacing={2} justifyContent="center">
			{/* --- Legend / Info Section --- */}
			<Grid size={{ xs: 12 }}>
				<Stack
					direction="row"
					spacing={3}
					justifyContent="center"
					flexWrap="wrap"
					sx={{
						mb: 2,
						p: 1,
						backgroundColor: "background.paper",
						borderRadius: 1,
					}}
				>
					{LEGEND_ITEMS.map((item) => (
						<Stack
							key={item.label}
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<Box
								sx={{
									display: "flex",
									color: item.color,
									opacity: item.label === "Booked" ? 0.5 : 1,
								}}
							>
								{item.icon}
							</Box>
							<Typography variant="body2">
								{item.label}
							</Typography>
						</Stack>
					))}
				</Stack>
			</Grid>

			{/* --- Floor Tabs (if multi-decker) --- */}
			{floors > 1 && (
				<Grid size={{ xs: 12 }}>
					<Tabs
						value={activeTab}
						onChange={(_, v) => setActiveTab(v)}
						centered
						indicatorColor="primary"
						textColor="primary"
					>
						{layout.map((_, i) => (
							<Tab key={i} label={`Floor ${i + 1}`} />
						))}
					</Tabs>
				</Grid>
			)}

			{/* --- Seat Map Grid --- */}
			<Grid size={{ xs: 12, lg: 8 }}>
				<Paper
					elevation={3}
					sx={{
						p: 3,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						minHeight: 300,
						backgroundColor: "#f8f9fa",
					}}
				>
					{/* Front of Bus Indicator */}
					<Box
						sx={{
							width: "80%",
							height: 8,
							borderRadius: 4,
							bgcolor: "grey.300",
							mb: 4,
							position: "relative",
						}}
					>
						<Typography
							variant="caption"
							sx={{
								position: "absolute",
								top: -20,
								left: "50%",
								transform: "translateX(-50%)",
								color: "text.secondary",
								textTransform: "uppercase",
								fontSize: "0.7rem",
							}}
						>
							Front
						</Typography>
					</Box>

					{/* The Grid */}
					<Stack spacing={1}>
						{layout[activeTab]?.map((rowArr, rIdx) => (
							<Stack
								key={rIdx}
								direction="row"
								spacing={1}
								justifyContent="center"
							>
								{rowArr.map((type, cIdx) => {
									const seatKey = `${activeTab}-${rIdx}-${cIdx}`;
									const label = seatLabels[seatKey];

									// Status Checks
									const booked = isBooked(
										activeTab,
										rIdx,
										cIdx
									);
									const selected = isSelected(
										activeTab,
										rIdx,
										cIdx
									);

									// Aisle / Hidden
									if (type === "aisle" || !type) {
										return (
											<Box
												key={cIdx}
												sx={{ width: 60, height: 60 }}
											/>
										);
									}

									return (
										<Tooltip
											key={cIdx}
											title={
												booked
													? "Booked"
													: `Seat ${label}`
											}
											arrow
										>
											<Box sx={{ position: "relative" }}>
												<IconButton
													onClick={() =>
														handleSeatClick(
															activeTab,
															rIdx,
															cIdx,
															type
														)
													}
													disabled={booked}
													color={
														selected
															? "primary"
															: "default"
													}
													sx={{
														width: 50,
														height: 50,
														border: selected
															? `2px solid ${theme.palette.primary.main}`
															: "1px solid #e0e0e0",
														bgcolor: selected
															? "primary.light"
															: booked
															? "action.disabledBackground"
															: "background.paper",
														color: selected
															? "primary.contrastText"
															: booked
															? "action.disabled"
															: "text.primary",
														transition: "all 0.2s",
														"&:hover": {
															bgcolor:
																!booked &&
																!selected
																	? "action.hover"
																	: undefined,
															transform: !booked
																? "scale(1.1)"
																: undefined,
														},
													}}
												>
													{selected ? (
														<SelectedIcon />
													) : (
														<ChairIcon />
													)}
												</IconButton>

												{/* Seat Number Label (Small overlay) */}
												{!booked &&
													!selected &&
													label && (
														<Typography
															variant="caption"
															sx={{
																position:
																	"absolute",
																bottom: -8,
																left: "50%",
																transform:
																	"translateX(-50%)",
																fontSize:
																	"0.65rem",
																fontWeight:
																	"bold",
																color: "text.secondary",
															}}
														>
															{label}
														</Typography>
													)}
											</Box>
										</Tooltip>
									);
								})}
							</Stack>
						))}
					</Stack>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default SeatBookingSelector;
