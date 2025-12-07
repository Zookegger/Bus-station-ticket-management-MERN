import {
	Box,
	Grid,
	IconButton,
	Paper,
	Snackbar,
	Stack,
	Tab,
	Tabs,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { useState, useMemo, type FC } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
	EventSeat as EventSeatIcon,
	CheckCircle as SelectedIcon,
	Cancel as BookedIcon,
} from "@mui/icons-material";
import type { SeatLayout, SeatType } from "./types";
import { SeatStatus } from "@my-types/seat";

// --- Types ---

const Size = {
	large: 85,
	medium: 65,
	small: 50,
} as const;

type Size = (typeof Size)[keyof typeof Size];
type SizeName = keyof typeof Size;

export interface SeatBookingSelectorProps {
	initialLayout: string | SeatLayout; // JSON string or object
	bookedSeats?: { floor: number; row: number; col: number }[]; // Coordinates of sold tickets
	selectedSeats?: { floor: number; row: number; col: number }[]; // Externally controlled selection
	/**
	 * Optional map of seat status keyed by "{floor}_{row}_{col}" (0-based)
	 * e.g. { '0_0_1': { id: 123, status: 'reserved', number: '1' } }
	 */
	seatStatusMap?: Record<
		string,
		{ id: number; status: string; number?: string }
	>;
	/**
	 * Optional detailed occupied seats list (0-based coords)
	 */
	occupiedSeatsDetailed?: {
		id: number;
		floor: number;
		row: number;
		col: number;
		status: string;
		number?: string;
	}[];
	onSelectionChange?: (
		seats: { floor: number; row: number; col: number; label: string }[]
	) => void;
	maxSelectable?: number;

	// Accept either a preset name ('small'|'medium'|'large') or a numeric pixel value
	size?: SizeName | Size | number;
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
		icon: <EventSeatIcon />,
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
	seatStatusMap,
	occupiedSeatsDetailed,
	size = "medium",
}) => {
	const theme = useTheme();
	const [activeTab, setActiveTab] = useState(0);
	const [internalSelected, setInternalSelected] = useState<
		{ floor: number; row: number; col: number; label: string }[]
	>([]);

	const [warning, setWarning] = useState<string | null>(null);

	// Normalize size prop to numeric pixels so callers can pass either names or numbers
	const sizePx: number =
		typeof size === "string" ? Size[size as SizeName] : (size as number);
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
	const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
	const scale = isMobile ? 0.1 : isTablet ? 0.2 : 0.3;
	const adjustedSizePx = Math.max(28, Math.round(sizePx * scale));

	// Derive spacing and label offsets from the adjusted seat size so everything scales together
	const vSeatGap = Math.max(6, Math.round(adjustedSizePx * 0.35));
	const hSeatGap = Math.max(6, Math.round(adjustedSizePx * 0.25));
	const tooltipOffset = -Math.round(adjustedSizePx * 0.3);
	const labelBottom = Math.round(adjustedSizePx * 0.4) * -1; // negative value for bottom offset
	const labelFontPx = Math.max(10, Math.round(adjustedSizePx * 0.5));

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
					// Layout `type` is part of the vehicle layout (e.g. 'aisle' or seat spec).
					// Treat any non-aisle, truthy entry as a seat for labeling purposes.
					if (type && type !== "aisle") {
						labels[key] = `${counter++}`; // Simple numeric increment
					}
				});
			});
		});
		return labels;
	}, [layout]);

	// --- Helpers ---

	const isBooked = (f: number, r: number, c: number) => {
		// Prefer explicit status map if provided (keys are 0-based)
		const key = `${f}_${r}_${c}`;
		const entry = seatStatusMap && seatStatusMap[key];
		if (entry) {
			return String(entry.status).toUpperCase() !== SeatStatus.AVAILABLE;
		}

		// Fallback to simple bookedSeats list
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
		// Use external selection as the base if provided, otherwise use internal state
		const baseSelection =
			externalSelectedSeats && externalSelectedSeats.length
				? externalSelectedSeats.map((s) => ({
						floor: s.floor,
						row: s.row,
						col: s.col,
						label:
							seatLabels[`${s.floor}-${s.row}-${s.col}`] || "?",
				  }))
				: [...(internalSelected || [])];

		let newSelection = [...baseSelection];

		if (alreadySelected) {
			newSelection = newSelection.filter(
				(s) => !(s.floor === floor && s.row === row && s.col === col)
			);
		} else {
			if (maxSelectable && newSelection.length >= maxSelectable) {
				setWarning(`You can only select up to ${maxSelectable} seats.`);
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
			<Snackbar
				open={warning !== null}
				autoHideDuration={6000}
				message={warning}
				onClose={() => setWarning(null)}
			/>

			{/* --- Legend / Info Section --- */}
			<Grid size={{ xs: 12 }}>
				<Stack
					direction="row"
					justifyContent="center"
					flexWrap="wrap"
					sx={{
						mb: 2,
						p: 1,
						backgroundColor: "background.paper",
						borderRadius: 1,
						gap: 2,
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
			<Grid
				size={{ xs: 12, lg: 8 }}
				sx={{ minWidth: isDesktop ? 550 : undefined }}
			>
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
					<Stack sx={{ gap: `${vSeatGap}px` }}>
						{layout[activeTab]?.map((rowArr, rIdx) => (
							<Stack
								key={rIdx}
								direction="row"
								justifyContent="center"
								sx={{ gap: `${hSeatGap}px` }}
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
												sx={{
													width: sizePx,
													height: sizePx,
												}}
											/>
										);
									}

									return (
										<Tooltip
											disableInteractive
											arrow
											placement="top"
											key={cIdx}
											title={(() => {
												if (booked) {
													// try to show status/number if available
													const key = `${activeTab}_${rIdx}_${cIdx}`;
													const entry =
														(seatStatusMap &&
															seatStatusMap[
																key
															]) ||
														(occupiedSeatsDetailed &&
															occupiedSeatsDetailed.find(
																(s) =>
																	s.floor ===
																		activeTab &&
																	s.row ===
																		rIdx &&
																	s.col ===
																		cIdx
															));
													if (entry) {
														const st = String(
															entry.status
														).toLowerCase();
														const num =
															(entry as any)
																.number ??
															(label || "");
														return `${
															st
																.charAt(0)
																.toUpperCase() +
															st.slice(1)
														}${
															num
																? ` — Seat ${num}`
																: ""
														}`;
													}
													return "Booked";
												}
												return `Seat ${label}`;
											})()}
											slotProps={{
												popper: {
													modifiers: [
														{
															name: "offset",
															options: {
																offset: [
																	0,
																	tooltipOffset,
																],
															},
														},
													],
												},
											}}
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
														width: sizePx,
														height: sizePx,
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
														borderRadius: 4,
													}}
												>
													{selected ? (
														<SelectedIcon
															fontSize={
																isDesktop ||
																isTablet
																	? "large"
																	: "medium"
															}
														/>
													) : booked ? (
														<BookedIcon
															fontSize={
																isDesktop ||
																isTablet
																	? "large"
																	: "medium"
															}
														/>
													) : (
														<EventSeatIcon
															fontSize={
																isDesktop ||
																isTablet
																	? "large"
																	: "medium"
															}
														/>
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
																bottom: `${labelBottom}px`,
																left: "50%",
																transform:
																	"translateX(-50%)",
																fontSize: `${labelFontPx}px`,
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

					{/* Front of Bus Indicator */}
					<Box
						sx={{
							width: "80%",
							height: 8,
							borderRadius: 4,
							bgcolor: "grey.300",
							mt: 4,
							position: "relative",
						}}
					>
						<Typography
							variant="caption"
							sx={{
								position: "absolute",
								bottom: -20,
								left: "50%",
								transform: "translateX(-50%)",
								color: "text.secondary",
								textTransform: "uppercase",
								fontSize: "0.7rem",
							}}
						>
							Back
						</Typography>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default SeatBookingSelector;
