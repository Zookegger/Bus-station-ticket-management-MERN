import React from "react";
import {
	Box,
	Chip,
	Divider,
	IconButton,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	Chair as ChairIcon,
	Accessible as AccessibleIcon,
	NotInterested as NotInterestedIcon,
} from "@mui/icons-material";
import type { JSX } from "react";
import { Grid } from "@mui/system";

type SeatType = "available" | "aisle" | "disabled" | "occupied";

const seatTypeDetails: {
	type: SeatType;
	label: string;
	icon: JSX.Element;
	color: "primary" | "default" | "warning" | "error" ;
}[] = [
	{
		type: "available",
		label: "Available",
		icon: <ChairIcon />,
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
	{
		type: "occupied",
		label: "Occupied",
		icon: <ChairIcon />,
		color: "error",
	},
];

interface SeatLayoutPreviewProps {
	seatLayout: string | null | undefined;
}

const SeatLayoutPreview: React.FC<SeatLayoutPreviewProps> = ({
	seatLayout,
}) => {
	if (!seatLayout) {
		return <Typography>No seat layout defined.</Typography>;
	}

	let layout: SeatType[][][] = [];
	try {
		layout = JSON.parse(seatLayout);
	} catch (error) {
		return (
			<Typography color="error">Invalid seat layout format.</Typography>
		);
	}

	return (
		<Box>
			{layout.map((floor, floorIndex) => (
				<Paper
					key={floorIndex}
					elevation={0}
					sx={{ p: 2, mb: 2, overflowX: "auto" }}
				>
					<Typography variant="h6" fontSize={18} fontWeight={"bold"}  gutterBottom>
						Floor {floorIndex + 1}
					</Typography>
					<Box>
						{floor.map((row, rowIndex) => (
							<Stack
								direction="row"
								key={rowIndex}
								justifyContent="center"
							>
								{row.map((seat, colIndex) => {
									const seatDetails = seatTypeDetails.find(
										(s) => s.type === seat
									);
									return (
										<Tooltip
											title={
												seatDetails?.label || "Empty"
											}
											key={colIndex}
										>
											<IconButton
												color={
													seatDetails?.color ||
													"default"
												}
												sx={{ m: 0.2 }}
												size="small"
											>
												{seatDetails?.icon || (
													<ChairIcon />
												)}
											</IconButton>
										</Tooltip>
									);
								})}
							</Stack>
						))}
					</Box>
				</Paper>
			))}
			<Box display={"flex"} flexDirection={"column"}>
				<Divider>
					<Typography
						variant="caption"
						sx={{ mr: 1 }}
						textAlign={"center"}
					>
						Legend
					</Typography>
				</Divider>

				<Stack
					direction="row"
					spacing={1}
					mt={2}
					justifyContent="center"
					flexWrap="wrap"
				>
					<Grid container gap={1} px={2}>
						{seatTypeDetails.map(({ label, icon, color }) => (
							<Grid size={{ xs: 4 }} flexGrow={1}>
								<Chip
									key={label}
									icon={icon}
									label={label}
									color={color}
									size="medium"
									variant="outlined"
									sx={{ width: "100%" }}
								/>
							</Grid>
						))}
					</Grid>
				</Stack>
			</Box>
		</Box>
	);
};

export default SeatLayoutPreview;
