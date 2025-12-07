import React, { useEffect, useState } from "react";
import {
	Container,
	Box,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Grid,
	Stack,
} from "@mui/material";
import cover from "@assets/background.jpg";
import { type Coupon, CouponType } from "@my-types";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { LocalOffer } from "@mui/icons-material";
import TripSearch from "@components/common/TripSearch";
import buildImgUrl from "@utils/imageHelper";

/**
 * Home landing component containing the primary hero and search form.
 * Provides Autocomplete fields for departure and destination while preserving
 * prior layout and styling. Background hero uses pseudo-element overlays.
 */
const Home: React.FC = () => {
	// Coupons carousel state
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

	// Fetch active coupons for carousel
	useEffect(() => {
		const fetchCoupons = async () => {
			setIsLoadingCoupons(true);
			try {
				const response = await callApi({
					method: "GET",
					url: API_ENDPOINTS.COUPON.SEARCH,
					params: { isActive: true, limit: 10 }, // Fetch active coupons, limit to 10
				});

				const data = response as any;
				if (Array.isArray(data)) {
					setCoupons(data);
				} else if (data?.rows && Array.isArray(data.rows)) {
					setCoupons(data.rows);
				} else if (data?.data && Array.isArray(data.data)) {
					setCoupons(data.data);
				} else {
					setCoupons([]);
				}
			} catch (err) {
				console.error("Failed to fetch coupons:", err);
				setCoupons([]);
			} finally {
				setIsLoadingCoupons(false);
			}
		};
		fetchCoupons();
	}, []);

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
							fontWeight="bold"
							sx={{ mb: 2, color: "#e0e0e0" }}
						>
							Book Your Bus Ticket Online
						</Typography>
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ mb: 3, color: "#e0e0e0" }}
						>
							Fast, easy, and secure travel reservations
						</Typography>

						<TripSearch
							slotProps={{
								box: {
									sx: { mb: 3 },
								},
								paper: {
									elevation: 0,
									sx: { background: "unset" },
								},
								submitButton: {
									sx: {
										borderRadius: 6,
									},
								},
								swapButton: {
									className: "hvr-icon-spin",
								},
							}}
						/>
					</Box>
				</Container>
			</Box>

			{/* Coupons Carousel Section */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
						Special Offers & Coupons
					</Typography>
					{isLoadingCoupons ? (
						<Typography>Loading offers...</Typography>
					) : coupons.length > 0 ? (
						<Box sx={{ overflowX: "auto", pb: 2 }}>
							<Grid
								container
								spacing={2}
								sx={{ minWidth: "max-content" }}
							>
								{coupons.map((coupon) => (
									<Grid
										key={coupon.id}
										size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
									>
										{coupon.imgUrl ? (
											<Card sx={{ maxWidth: 345 }}>
												<CardMedia
													component="img"
													height="140"
													image={buildImgUrl(
														coupon.imgUrl,
														"coupons"
													)}
													alt={
														coupon.title ||
														coupon.code
													}
												/>
												<CardContent>
													<Typography
														gutterBottom
														variant="h6"
														component="div"
													>
														{coupon.title ||
															coupon.code}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mb: 1 }}
													>
														{coupon.description}
													</Typography>
													<Stack
														direction="row"
														spacing={1}
													>
														<Chip
															label={`${
																coupon.type.toUpperCase() ===
																CouponType.PERCENTAGE
																	? `${coupon.value}%`
																	: `$${coupon.value}`
															}`}
															color="primary"
															size="small"
														/>
														<Chip
															label={`Code: ${coupon.code}`}
															variant="outlined"
															size="small"
														/>
													</Stack>
												</CardContent>
											</Card>
										) : (
											<Card sx={{ maxWidth: 345 }}>
												<CardContent
													sx={{ textAlign: "center" }}
												>
													<LocalOffer
														sx={{
															fontSize: 48,
															color: "primary.main",
															mb: 2,
														}}
													/>
													<Typography
														gutterBottom
														variant="h6"
														component="div"
													>
														{coupon.title ||
															coupon.code}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mb: 1 }}
													>
														{coupon.description}
													</Typography>
													<Stack
														direction="row"
														spacing={1}
														sx={{
															justifyContent:
																"center",
														}}
													>
														<Chip
															label={`${
																coupon.type.toUpperCase() ===
																CouponType.PERCENTAGE
																	? `${Math.floor(
																			coupon.value
																	  )}%`
																	: `$${coupon.value}`
															} Off`}
															color="primary"
															size="small"
														/>
														<Chip
															label={`Code: ${coupon.code}`}
															variant="outlined"
															size="small"
														/>
													</Stack>
												</CardContent>
											</Card>
										)}
									</Grid>
								))}
							</Grid>
						</Box>
					) : (
						<Typography variant="body2" color="text.secondary">
							No special offers available at the moment.
						</Typography>
					)}
				</Container>
			</Box>
		</Box>
	);
};

export default Home;
