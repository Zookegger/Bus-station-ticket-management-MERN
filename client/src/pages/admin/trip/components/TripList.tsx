import React, { useMemo, useState, useEffect } from "react";
import {
	Box,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { Add as AddIcon, MoreVert as MoreIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { TripItemDTO, ApiTripDTO } from "@my-types/TripDTOs";

interface TripListProps {
	onOpenDetails: (trip: TripItemDTO) => void;
}

const TripList: React.FC<TripListProps> = ({ onOpenDetails }) => {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [menuTrip, setMenuTrip] = useState<TripItemDTO | null>(null);
	const [search, setSearch] = useState("");
	const [trips, setTrips] = useState<TripItemDTO[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTrips = async () => {
			try {
				// Replace with your auth token retrieval (e.g., from context)
				const token = localStorage.getItem("jwt"); // Placeholder
				const response = await fetch("/api/trips", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					// Assuming API returns { trips: [...] } or direct array
					const tripsData = data.trips || data;
					setTrips(
						tripsData.map((t: ApiTripDTO) => ({
							id: t.id,
							route: t.origin && t.destination ? `${t.origin} - ${t.destination}` : 'Unknown Route',
							departure: t.departureTime,
							arrival: t.arrivalTime,
							price: `$${t.price}`,
							status: (t.status as TripItemDTO['status']) || "Standby",
						}))
					);
				} else {
					console.error("Failed to fetch trips");
				}
			} catch (error) {
				console.error("Error fetching trips:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTrips();
	}, []);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return trips;
		return trips.filter((d) => d.route.toLowerCase().includes(query));
	}, [trips, search]);

	const handleOpenMenu = (
		event: React.MouseEvent<HTMLButtonElement>,
		trip: TripItemDTO
	) => {
		setAnchorEl(event.currentTarget);
		setMenuTrip(trip);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
		setMenuTrip(null);
	};

	if (loading) {
		return <Typography>Loading trips...</Typography>;
	}

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography
					variant="h5"
					sx={{ fontWeight: "bold", color: "#2E7D32" }}
				>
					Trips
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => navigate("create")}
					sx={{
						textTransform: "none",
						backgroundColor: "#2E7D32",
						"&:hover": { backgroundColor: "#276a2b" },
					}}
				>
					Add New Trip
				</Button>
			</Box>

			<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
				<TextField
					size="small"
					placeholder="Filter route"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ width: 300 }}
				/>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Route</TableCell>
							<TableCell>Departure Time</TableCell>
							<TableCell>Arrival Time</TableCell>
							<TableCell>Total Price</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filtered.map((row) => (
							<TableRow key={row.id} hover>
								<TableCell>{row.route}</TableCell>
								<TableCell>{row.departure}</TableCell>
								<TableCell>{row.arrival}</TableCell>
								<TableCell>{row.price}</TableCell>
								<TableCell>{row.status}</TableCell>
								<TableCell align="right">
									<IconButton
										onClick={(e) => handleOpenMenu(e, row)}
									>
										<MoreIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleCloseMenu}
			>
				<MenuItem
					onClick={() => {
						if (menuTrip) onOpenDetails(menuTrip);
						handleCloseMenu();
					}}
				>
					View Details
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuTrip) navigate(`edit/${menuTrip.id}`);
						handleCloseMenu();
					}}
				>
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuTrip) navigate(`delete/${menuTrip.id}`);
						handleCloseMenu();
					}}
				>
					Delete
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default TripList;
