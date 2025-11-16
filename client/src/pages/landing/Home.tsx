import React, { useEffect, useState, useRef } from "react";
import {
	Container,
	Box,
	Typography,
	Button,
	TextField,
	FormControl,
	FormHelperText,
	Popover,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { Stack } from "@mui/system";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import cover from "@assets/background.jpg";
import type { Location } from "@my-types";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";
import { LocationOn, Search } from "@mui/icons-material";

/**
 * Landing home page skeleton component.
 *
 * This stripped-down version intentionally removes the previous temporary mock data,
 * search form, and trip listing in order to prepare for a full UI/UX redesign.
 *
 * TODO (Structure): Replace current header Box with a dedicated <Hero /> component
 *                   that supports background image, overlay gradient, and responsive typography.
 * TODO (Accessibility): Ensure color contrast meets WCAG AA; add aria-labels for interactive elements.
 * TODO (Internationalization): Externalize all static strings into i18n resource files.
 * TODO (Search Flow): Introduce a multi-step search widget (origin, destination, date, passengers)
 *                     with progressive disclosure and validation feedback.
 * TODO (Real-time Data): Integrate WebSocket (via existing useWebsocket hook) to receive live
 *                        seat availability + dynamic pricing updates after the search.
 * TODO (Performance): Lazy-load below-the-fold sections (e.g., FeaturedRoutes, Promotions) using React.Suspense.
 * TODO (Design System): Abstract repeated layout primitives into shared components (e.g., Section, FeatureCard).
 * TODO (Animation): Add subtle entrance transitions (Framer Motion) for hero text & CTA buttons.
 * TODO (Metrics): Add analytics event dispatch (search initiated, CTA clicked) via a tracking utility.
 * TODO (SEO): Add meta tags & structured data (JSON-LD) for route discovery; confirm with server-side rendering strategy.
 * TODO (Theming): Support light/dark theme toggle with persisted preference in context/localStorage.
 * TODO (State Management): Evaluate moving transient UI state for search into a dedicated context or Zustand store.
 */

type LocationPopoverProps = {
	anchor: HTMLElement | null;
	target: "departure" | "destination" | null;
	locations: Location[];
	isLoading: boolean;
	onClose: () => void;
	onSelect: (location: Location) => void;
};

const LocationPopover: React.FC<LocationPopoverProps> = ({
	anchor,
	target,
	locations,
	isLoading,
	onClose,
	onSelect,
}) => {
	const open = Boolean(anchor);
	const [anchorWidth, setAnchorWidth] = useState<number>(300);

	useEffect(() => {
		if (!anchor) return;

		const updateWidth = () => {
			const baseWidth = anchor.offsetWidth || 300;
			setAnchorWidth(baseWidth - 32); // Subtract padding (16px * 2)
		};

		// Set initial width
		updateWidth();

		// Update width on resize
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, [anchor]);

	return (
		<Popover
			open={open}
			anchorEl={anchor}
			onClose={onClose}
			disableScrollLock
			// Keep focus on the input that opened the popover; prevents the popover
			// from stealing focus when it mounts.
			disableAutoFocus
			disableEnforceFocus
			closeAfterTransition
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
		>
			<Box
				sx={{
					p: 2,
					width: anchorWidth,
					maxHeight: 400,
					overflow: "auto",
				}}
			>
				<Typography variant="subtitle1" gutterBottom>
					Select {target}
				</Typography>
				<List>
					{isLoading ? (
						<Typography
							variant="body2"
							sx={{ p: 2, textAlign: "center" }}
						>
							Loading locations...
						</Typography>
					) : !Array.isArray(locations) || locations.length === 0 ? (
						<Typography
							variant="body2"
							sx={{ p: 2, textAlign: "center" }}
						>
							No locations available
						</Typography>
					) : (
						locations.map((location) => (
							<ListItem key={location.id} disablePadding>
								<ListItemButton
									onClick={() => onSelect(location)}
								>
									<ListItemText
										primary={location.name}
										secondary={location.address}
									/>
								</ListItemButton>
							</ListItem>
						))
					)}
				</List>
			</Box>
		</Popover>
	);
};

type TripSearchFormState = {
	departure: string;
	destination: string;
	date: Date;
};

type FormErrorState = Partial<
	Record<keyof TripSearchFormState | "general", string>
>;

const Home: React.FC = () => {
	// Flow: Render a minimal hero area and a placeholder for future sections.
	// Future expansion will progressively enhance this shell while keeping initial paint lightweight.
	const [departure, setDeparturePoint] = useState<string>();
	const [destination, setDestinationPoint] = useState<string>();
	// Refs to keep inputs focused while popover is open
	const departureInputRef = useRef<HTMLInputElement | null>(null);
	const destinationInputRef = useRef<HTMLInputElement | null>(null);
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoadingLocations, setIsLoadingLocations] =
		useState<boolean>(false);
	const [date, setDate] = useState<Date>();
	// Form validation errors - setErrors reserved for future validation
	const [errors] = useState<FormErrorState>({});

	useEffect(() => {
		const fetchLocations = async () => {
			setIsLoadingLocations(true);
			try {
				const response = await axios.get(API_ENDPOINTS.LOCATION.SEARCH);
				if (response.status === 200) {
					// Handle different response structures
					const data = response.data;
					if (Array.isArray(data)) {
						setLocations(data);
					} else if (
						data?.locations &&
						Array.isArray(data.locations)
					) {
						setLocations(data.locations);
					} else if (data?.data && Array.isArray(data.data)) {
						setLocations(data.data);
					} else {
						console.warn("Unexpected response structure:", data);
						setLocations([]);
					}
				}
			} catch (error) {
				console.error("Failed to fetch locations:", error);
				setLocations([]);
			} finally {
				setIsLoadingLocations(false);
			}
		};
		fetchLocations();
	}, []);

	const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(
		null
	);
	const [popoverTarget, setPopoverTarget] = useState<
		"departure" | "destination" | null
	>(null);

	const handlePopoverClose = () => {
		setPopoverAnchor(null);
		setPopoverTarget(null);
	};

	// Keep the input focused while the popover is open so it appears active
	useEffect(() => {
		if (!popoverAnchor || !popoverTarget) return;

		const ref =
			popoverTarget === "departure"
				? departureInputRef
				: destinationInputRef;

		// Focus the input after popover opens; we use setTimeout to ensure
		// the popover mounts first so focusing doesn't get stolen by the popover.
		const id = window.setTimeout(() => ref.current?.focus(), 0);
		return () => window.clearTimeout(id);
	}, [popoverAnchor, popoverTarget]);

	const handleLocationSelect = (location: Location) => {
		if (popoverTarget === "departure") {
			setDeparturePoint(location.name);
		} else if (popoverTarget === "destination") {
			setDestinationPoint(location.name);
		}
		handlePopoverClose();
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* HERO SECTION */}
			<Box
				sx={{
					position: "relative",
					overflow: "hidden",
					flex: { xs: "0 0 auto", md: "0 0 50%" },
					display: "flex",
					py: { xs: 4, md: 8 },

					"::before": {
						position: "absolute",
						content: '""',
						inset: 0,
						zIndex: -2,
						backgroundImage: `url(${cover})`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: {
							xs: "center 25%",
							md: "center 90%",
						},
						backgroundSize: "cover",
						filter: "blur(4px)",
						transform: "scale(1.05)",
					},
					"::after": {
						content: '""',
						position: "absolute",
						inset: 0,
						zIndex: -1,
						background:
							"linear-gradient(rgba(90, 90, 90, 0.03), rgba(0, 0, 0, 0.6))",
					},
				}}
			>
				<Container maxWidth="md" sx={{ zIndex: 1 }}>
					<Box textAlign="center" maxWidth={{ lg: 800 }} mx="auto">
						<Typography
							variant="h3"
							fontWeight={"bold"}
							sx={{ mb: 2, color: `#e0e0e0` }}
						>
							Book Your Bus Ticket Online
						</Typography>
						<Typography
							variant="subtitle1"
							fontWeight={"bold"}
							sx={{ mb: 3, color: `#e0e0e0` }}
						>
							Fast, easy, and secure travel reservations
						</Typography>

						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<Box component={"form"} mb={4}>
								<Stack
									direction={{ xs: "column", md: "row" }}
									gap={3}
								>
									<FormControl
										fullWidth
										required
										error={!!errors.departure}
									>
										<TextField
											label="Departure"
											variant="filled"
											placeholder="Select departure location"
											value={departure || ""}
											sx={{
												backgroundColor: "white",
												cursor: "pointer",
												"& .MuiInputBase-input": {
													cursor: "pointer",
												},
											}}
											onClick={(e) => {
												setPopoverAnchor(
													e.currentTarget
												);
												setPopoverTarget("departure");
											}}
											inputRef={departureInputRef}
											slotProps={{
												input: {
													readOnly: true,
													"aria-haspopup": "listbox",
													"aria-expanded": Boolean(
														popoverAnchor &&
															popoverTarget ===
																"departure"
													),
													endAdornment: <LocationOn/>
												},
											}}
										/>
									</FormControl>
									<FormControl
										fullWidth
										required
										error={!!errors.destination}
									>
										<TextField
											label="Destination"
											variant="filled"
											placeholder="Select destination location"
											sx={{
												backgroundColor: "white",
												cursor: "pointer",
												"& .MuiInputBase-input": {
													cursor: "pointer",
												},
											}}
											value={destination || ""}
											onClick={(e) => {
												setPopoverAnchor(
													e.currentTarget
												);
												setPopoverTarget("destination");
											}}
											inputRef={destinationInputRef}
											slotProps={{
												input: {
													readOnly: true,
													"aria-haspopup": "listbox",
													"aria-expanded": Boolean(
														popoverAnchor &&
															popoverTarget ===
																"destination"
													),
													endAdornment: <LocationOn/>
												},
											}}
										/>
									</FormControl>
									<FormControl
										fullWidth
										required
										error={!!errors.date}
									>
										<DateTimePicker
											label="Start period"
											format="dd/MM/yyyy - hh:mm aa"
											value={date}
											disablePast
											sx={{
												backgroundColor: "white",
											}}
											onChange={(value) => {
												if (
													value &&
													value > new Date(Date.now())
												) {
													setDate(
														new Date(
															value.toString()
														)
													);
												}
											}}
											slotProps={{
												textField: {
													variant: "filled",
												},
											}}
										/>

										{errors.date && (
											<FormHelperText>
												{errors.date}
											</FormHelperText>
										)}
									</FormControl>
								</Stack>
							</Box>
						</LocalizationProvider>

						<Button
							variant="contained"
							size="large"
							sx={{
								// TODO: Promote primary CTA styling from shared design system
								px: 4,
							}}
							startIcon={<Search/>}
						>
							Start Your Search
						</Button>
						{/* TODO: Secondary CTA (e.g., View Promotions) below primary button */}
					</Box>
					<LocationPopover
						anchor={popoverAnchor}
						target={popoverTarget}
						locations={locations}
						isLoading={isLoadingLocations}
						onClose={handlePopoverClose}
						onSelect={handleLocationSelect}
					/>
				</Container>
			</Box>

			{/* PLACEHOLDER: Future sections (Featured Routes, Promo Banner, Trust Badges) */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
						{/* TODO: Replace with dynamic component pulling curated routes from API */}
						Coming Soon: Curated Routes & Deals
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 3 }}
					>
						This area will showcase personalized recommendations,
						promotions, and live route insights.
					</Typography>
					{/* TODO: Insert <FeaturedRoutes /> + <LivePricingTicker /> + <PromoCarousel /> components */}
					{/* TODO: Defer loading of heavy imagery using native lazy and intersection observers */}
				</Container>
			</Box>
		</Box>
	);
};

export default Home;
