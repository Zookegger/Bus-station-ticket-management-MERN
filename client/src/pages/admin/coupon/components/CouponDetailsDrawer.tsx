import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Drawer,
	IconButton,
	Stack,
	Typography,
	Grid,
	CardActions,
	useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { GridCloseIcon } from "@mui/x-data-grid";
import { format } from "date-fns";
import type { CouponDetailsDrawerProps } from "./types/Props";
import { CouponType, type Coupon } from "@my-types";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * Renders a drawer that shows a read-only summary of the selected coupon.
 * @param {CouponDetailsDrawerProps} props - Component props injected from the coupon grid interactions.
 * @returns {JSX.Element} React node containing coupon information.
 */
const CouponDetailsDrawer: React.FC<CouponDetailsDrawerProps> = ({
	open,
	onClose,
	coupon,
	onEdit,
	onDelete,
}) => {
	const theme = useTheme();

	/**
	 * Converts an ISO-8601 string into a friendly date-time label for display.
	 * @param {string} iso_value - Raw ISO string saved on the coupon.
	 * @returns {string} Human readable value for UI rendering.
	 */
	const formatDateTime = (iso_value: string): string => {
		return format(new Date(iso_value), "dd/MM/yyyy - HH:mm:ss");
	};

	/**
	 * Invokes the upstream edit handler with the currently selected coupon.
	 * @returns {void}
	 */
	const handleEditClick = (coupon: Coupon): void => {
		if (!coupon || !onEdit) {
			return;
		}

		onEdit(coupon);
	};

	/**
	 * Invokes the upstream delete handler with the currently selected coupon.
	 * @returns {void}
	 */
	const handleDeleteClick = (id: number): void => {
		if (!id || !onDelete) {
			return;
		}

		onDelete(id);
	};

	const formatted_details = coupon
		? {
				start_period: coupon.startPeriod
					? formatDateTime(coupon.startPeriod.toString())
					: "N/A",
				end_period: coupon.endPeriod
					? formatDateTime(coupon.endPeriod.toString())
					: "N/A",
				created_at: coupon.createdAt
					? formatDateTime(coupon.createdAt.toString())
					: "N/A",
				updated_at: coupon.updatedAt
					? formatDateTime(coupon.updatedAt.toString())
					: "N/A",
				value_label:
					coupon.type === CouponType.PERCENTAGE
						? `${coupon.value}%`
						: coupon.value.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
						  }),
		  }
		: null;

	return (
		<Drawer anchor="right" open={open} onClose={onClose}>
			<Box
				sx={{
					p: 3,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					width: 400,
					maxWidth: "100vw",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Typography
						variant="h5"
						sx={{
							fontWeight: "bold",
							color: "#1976d2",
						}}
					>
						Coupon Details
					</Typography>
					<IconButton onClick={onClose} size="small">
						<GridCloseIcon />
					</IconButton>
				</Box>

				<Box p={0}>
					{coupon && formatted_details ? (
						<Grid container spacing={2}>
							<Grid size={12}>
								<Card>
									<CardHeader
										title={coupon.title ?? coupon.code}
										subheader={
											<Box
												display={"flex"}
												justifyContent={"space-between"}
											>
												<Chip
													color={
														coupon.isActive
															? "success"
															: "default"
													}
													label={
														coupon.isActive
															? "Active"
															: "Inactive"
													}
													size="small"
												/>
												<Typography>
													Last updated{" "}
													{
														formatted_details.updated_at
													}
												</Typography>
											</Box>
										}
									/>
									<CardContent>
										<Stack spacing={2}>
											<Grid container spacing={2}>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Coupon ID
													</Typography>
													<Typography variant="body1">
														{coupon.id}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Code
													</Typography>
													<Typography variant="body1">
														{coupon.code}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Type
													</Typography>
													<Typography variant="body1">
														{coupon.type
															.charAt(0)
															.toUpperCase() +
															coupon.type
																.slice(1)
																.toLowerCase()}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Value
													</Typography>
													<Typography variant="body1">
														{
															formatted_details.value_label
														}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Max Usage
													</Typography>
													<Typography variant="body1">
														{coupon.maxUsage}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Current Usage
													</Typography>
													<Typography variant="body1">
														{
															coupon.currentUsageCount
														}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Valid From
													</Typography>
													<Typography variant="body1">
														{
															formatted_details.start_period
														}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Valid Until
													</Typography>
													<Typography variant="body1">
														{
															formatted_details.end_period
														}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Created At
													</Typography>
													<Typography variant="body1">
														{
															formatted_details.created_at
														}
													</Typography>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Updated At
													</Typography>
													<Typography variant="body1">
														{
															formatted_details.updated_at
														}
													</Typography>
												</Grid>
												<Grid size={12}>
													<Typography
														variant="subtitle2"
														color="text.secondary"
													>
														Description
													</Typography>
													<Typography variant="body1">
														{coupon.description ??
															"No description provided."}
													</Typography>
												</Grid>
												{coupon.imgUrl ? (
													<Grid size={12}>
														<Typography
															variant="subtitle2"
															color="text.secondary"
														>
															Image URL
														</Typography>
														<Typography
															component="a"
															href={coupon.imgUrl}
															target="_blank"
															rel="noreferrer"
															sx={{
																wordBreak:
																	"break-all",
															}}
														>
															{coupon.imgUrl}
														</Typography>
													</Grid>
												) : null}
											</Grid>
										</Stack>
									</CardContent>
									<CardActions sx={{ gap: 1 }}>
										<Button
											variant="contained"
											startIcon={<EditIcon />}
											onClick={() =>
												handleEditClick(coupon)
											}
											sx={{
												bgcolor: "#1976d2",
												flex: 1,
												"&:hover": {
													borderColor: "primary.main",
													bgcolor: "#165799ff",
													boxShadow:
														theme.shadows?.[2] ||
														"none",
												},
											}}
										>
											Edit
										</Button>
										<Button
											variant="contained"
											startIcon={<DeleteIcon />}
											onClick={() =>
												handleDeleteClick(coupon.id)
											}
											sx={{
												bgcolor: "#d32f2f",
												flex: 1,
												"&:hover": {
													borderColor: "primary.main",
													bgcolor: "#811e1eff",
													boxShadow:
														theme.shadows?.[2] ||
														"none",
												},
											}}
										>
											Delete
										</Button>
									</CardActions>
								</Card>
							</Grid>
						</Grid>
					) : (
						<Typography color="text.secondary">
							Select a coupon from the table to view its details.
						</Typography>
					)}
				</Box>
			</Box>
		</Drawer>
	);
};

export default CouponDetailsDrawer;
