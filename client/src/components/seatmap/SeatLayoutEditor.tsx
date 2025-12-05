import {
	Box,
	Chip,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useEffect, useState, type FC, type JSX } from "react";
import {
	EventSeat as EventSeatIcon ,
	Accessible as AccessibleIcon,
	NotInterested as NotInterestedIcon,
} from "@mui/icons-material";
import type { SeatLayout, SeatLayoutEditorProps, SeatType } from "./types";

const seatTypes: {
	type: SeatType;
	label: string;
	icon: JSX.Element;
	color: "primary" | "default" | "warning" | "error";
}[] = [
	{
		type: "available",
		label: "Available",
		icon: <EventSeatIcon  />,
		color: "primary",
	},
	{
		type: "aisle",
		label: "Aisle",
		icon: <NotInterestedIcon />,
		color: "default",
	},
	{
		type: "disabled",
		label: "Disabled",
		icon: <AccessibleIcon />,
		color: "warning",
	},
];

const SeatLayoutEditor: FC<SeatLayoutEditorProps> = ({
	onLayoutChange,
	initialLayout,
	totalFloors,
}) => {
	const [floors, setFloors] = useState(totalFloors || 1);
	const [rows, setRows] = useState(5);
	const [columns, setColumns] = useState(5);
	const [activeTab, setActiveTab] = useState(0);
	const [selectedSeatType, setSelectedSeatType] =
		useState<SeatType>("available");
	const [layout, setLayout] = useState<SeatLayout>(() => {
		if (initialLayout) {
			try {
				const parsedLayout = JSON.parse(initialLayout);
				if (
					Array.isArray(parsedLayout) &&
					parsedLayout.length > 0 &&
					Array.isArray(parsedLayout[0]) &&
					parsedLayout[0].length > 0 &&
					Array.isArray(parsedLayout[0][0])
				) {
					setFloors(parsedLayout.length);
					setRows(parsedLayout[0].length);
					setColumns(parsedLayout[0][0].length);
					return parsedLayout;
				}
			} catch (error) {
				console.error("Failed to parse initial layout:", error);
			}
		}
		return Array(floors)
			.fill(null)
			.map(() =>
				Array(rows)
					.fill(null)
					.map(() => Array(columns).fill("available"))
			);
	});

	useEffect(() => {
		if (initialLayout) {
			try {
				const parsedLayout = JSON.parse(initialLayout);
				setLayout(parsedLayout);
				setFloors(parsedLayout.length);
				if (parsedLayout.length > 0) {
					setRows(parsedLayout[0].length);
					if (parsedLayout[0].length > 0) {
						setColumns(parsedLayout[0][0].length);
					}
				}
			} catch (e) {
				console.error("Invalid initial layout format");
			}
		}
	}, [initialLayout]);

	useEffect(() => {
		const totalSeats = layout
			.flat(2)
			.filter(
				(seat) => seat === "available" || seat === "disabled"
			).length;
		onLayoutChange(layout, totalSeats);
	}, [layout, onLayoutChange]);

	const handleSeatClick = (floor: number, row: number, col: number) => {
		const newLayout = [...layout];
		newLayout[floor][row][col] = selectedSeatType;
		setLayout(newLayout);
	};

	const handleDimensionChange = (
		dim: "floors" | "rows" | "columns",
		value: number
	) => {
		const newFloors = dim === "floors" ? value : floors;
		const newRows = dim === "rows" ? value : rows;
		const newColumns = dim === "columns" ? value : columns;

		if (dim === "floors") setFloors(value);
		if (dim === "rows") setRows(value);
		if (dim === "columns") setColumns(value);

		const newLayout = Array(newFloors)
			.fill(null)
			.map((_, f_idx) =>
				Array(newRows)
					.fill(null)
					.map((_, r_idx) =>
						Array(newColumns)
							.fill(null)
							.map((_, c_idx) => {
								return (
									layout[f_idx]?.[r_idx]?.[c_idx] ||
									"available"
								);
							})
					)
			);

		setLayout(newLayout);
		if (activeTab >= value) {
			setActiveTab(value - 1);
		}
	};

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12, md: 4 }}>
				<Paper elevation={2} sx={{ p: 2 }}>
					<Typography
						variant="subtitle1"
						fontWeight={"bold"}
						marginBottom={2}
					>
						Controls
					</Typography>
					<Stack spacing={2}>
						<FormControl fullWidth>
							<InputLabel>Floors</InputLabel>
							<Select
								value={floors}
								label="Floors"
								onChange={(e) =>
									handleDimensionChange(
										"floors",
										e.target.value as number
									)
								}
							>
								<MenuItem value={1}>1</MenuItem>
								<MenuItem value={2}>2</MenuItem>
							</Select>
						</FormControl>
						<TextField
							label="Rows"
							type="number"
							value={rows}
							onChange={(e) =>
								handleDimensionChange(
									"rows",
									parseInt(e.target.value, 10)
								)
							}
							slotProps={{ htmlInput: { min: 1, max: 20 } }}
						/>
						<TextField
							label="Columns"
							type="number"
							value={columns}
							onChange={(e) =>
								handleDimensionChange(
									"columns",
									parseInt(e.target.value, 10)
								)
							}
							slotProps={{ htmlInput: { min: 1, max: 10 } }}
						/>
					</Stack>
				</Paper>
				<Paper elevation={2} sx={{ p: 2, mt: 2 }}>
					<Typography
						variant="subtitle1"
						fontWeight={"bold"}
						gutterBottom
					>
						Seat Types
					</Typography>
					<Stack
						direction="row"
						gap={1}
						flexWrap="wrap"
						justifyContent={{ md: "space-around" }}
					>
						{seatTypes.map(({ type, label, icon, color }) => (
							<Chip
								key={type}
								icon={icon}
								label={label}
								color={color}
								onClick={() => setSelectedSeatType(type)}
								variant={
									selectedSeatType === type
										? "filled"
										: "outlined"
								}
								sx={{ px: 1 }}
							/>
						))}
					</Stack>
				</Paper>
			</Grid>
			<Grid
				size={{ xs: 12, md: 8 }}
				display={"flex"}
				flexDirection={"column"}
			>
				{/* Floor layout switcher */}
				<Tabs
					value={activeTab}
					onChange={(_, newValue) => setActiveTab(newValue)}
					aria-label="Floor tabs"
				>
					{Array(floors)
						.fill(0)
						.map((_, i) => (
							<Tab label={`Floor ${i + 1}`} key={i} />
						))}
				</Tabs>

				{/* Seat map */}
				<Box
					sx={{
						mt: 2,
						border: "1px solid #ccc",
						borderRadius: 1,
						overflowX: "auto",
					}}
					flexGrow={1}
					display={"flex"}
					flexDirection={"column"}
					alignItems="center"
					justifyContent="center"
					overflow={"auto"}
				>
					{layout[activeTab] &&
						layout[activeTab].map((row, r_idx) => (
							<Stack
								direction="row"
								key={r_idx}
								justifyContent="center"
							>
								{row.map((seat, c_idx) => {
									const seatType = seatTypes.find(
										(s) => s.type === seat
									);
									return (
										<Tooltip
											disableInteractive
											arrow
											placement="top"
											title={seatType?.label || "Empty"}
											key={c_idx}
											slotProps={{
												popper: {
													modifiers: [
														{
															name: "offset",
															options: {
																offset: [
																	0, -12,
																],
															},
														},
													],
												},
											}}
										>
											<IconButton
												onClick={() =>
													handleSeatClick(
														activeTab,
														r_idx,
														c_idx
													)
												}
												color={
													seatType?.color || "default"
												}
												sx={{
													m: 0.5,
													border: "1px solid #eee",
												}}
											>
												{seatType?.icon || (
													<EventSeatIcon  />
												)}
											</IconButton>
										</Tooltip>
									);
								})}
							</Stack>
						))}
				</Box>
			</Grid>
		</Grid>
	);
};

export default SeatLayoutEditor;
