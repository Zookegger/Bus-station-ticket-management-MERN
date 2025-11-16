import React, { useMemo, useState, useEffect } from "react";
import {
	Box,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	TextField,
	InputAdornment,
	CircularProgress,
} from "@mui/material";
import {
	Add as AddIcon,
	MoreVert as MoreIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import { DataGrid as Grid } from "@mui/x-data-grid"; // Alias DataGrid as Grid per v7 guideline
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import type { TripItemDTO, ApiTripDTO } from "@my-types/TripDTOs";
import axios from "axios";
import { DataGridPageLayout } from "@components/admin";


interface TripListProps {
	onOpenDetails: (trip: TripItemDTO) => void;
}

/**
 * Admin Trip List page component.
 * Fetches trips, applies client-side search filtering, and renders them inside a shared DataGrid layout.
 */
const TripList: React.FC<TripListProps> = ({ onOpenDetails }) => {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [menuTrip, setMenuTrip] = useState<TripItemDTO | null>(null);
	const [search, setSearch] = useState("");
	const [trips, setTrips] = useState<TripItemDTO[]>([]);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTrips = async () => {
			try {
				// Replace with your auth token retrieval (e.g., from context)
				const response = await axios.get("/api/trips");
				if (response.status === 200) {
					const data = response.data;
					// Assuming API returns { trips: [...] } or direct array
					const tripsData = data.trips || data;
					setTrips(
						tripsData.map((t: ApiTripDTO) => ({
							id: t.id,
							route:
								t.origin && t.destination
									? `${t.origin} - ${t.destination}`
									: "Unknown Route",
							departure: t.departureTime,
							arrival: t.arrivalTime,
							price: `$${t.price}`,
							status:
								(t.status as TripItemDTO["status"]) ||
								"Standby",
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
		return trips.filter((d) => d.route.toLowerCase().includes(query)); // Filter trips based on search input
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

	// Define DataGrid columns
	const columns: GridColDef[] = [
		{
			field: "route",
			headerName: "Route",
			flex: 2,
			minWidth: 200,
		},
		{
			field: "departure",
			headerName: "Departure Time",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "arrival",
			headerName: "Arrival Time",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "price",
			headerName: "Total Price",
			width: 120,
		},
		{
			field: "status",
			headerName: "Status",
			width: 120,
		},
		{
			field: "actions",
			headerName: "Actions",
			width: 80,
			sortable: false,
			renderCell: (params) => (
				<IconButton
					onClick={(e) => {
						e.stopPropagation();
						handleOpenMenu(e, params.row as TripItemDTO);
					}}
				>
					<MoreIcon />
				</IconButton>
			),
		},
	];

	// Action bar providing search + create button
	const actionBar = (
		<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
			<TextField
				size="small"
				placeholder="Search by route"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				sx={{ width: 300 }}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					},
				}}
			/>
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
	);

	if (isLoading) {
		return (
			<DataGridPageLayout title="Trips" actionBar={actionBar}>
				<Box display="flex" justifyContent="center" py={8}>
					<CircularProgress />
				</Box>
			</DataGridPageLayout>
		);
	}

	return (
		<DataGridPageLayout title="Trips" actionBar={actionBar}>
			<Paper elevation={3} sx={{ width: "100%" }}>
				<Grid
					rows={filtered}
					columns={columns}
					pagination
					rowHeight={35}
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10, page: 0 },
						},
					}}
					pageSizeOptions={[5, 10, 20, 50]}
					sx={{ border: "none" }}
					onRowClick={(params) =>
						onOpenDetails(params.row as TripItemDTO)
					}
					loading={isLoading}
				/>
			</Paper>
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
		</DataGridPageLayout>
	);
};

export default TripList;
