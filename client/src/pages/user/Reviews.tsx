import React, { useEffect, useState } from "react";
import {
	Container,
	Typography,
	Box,
	Paper,
	Rating,
	Stack,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Alert,
	Snackbar,
	Grid,
	Card,
	CardContent,
	CardActions,
	Chip,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	DirectionsBus,
	AccessTime,
} from "@mui/icons-material";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { format } from "date-fns";
import { formatCurrency } from "@utils/formatting";
import { ConfirmDeleteDialog } from "@components/common";

const UserReviews: React.FC = () => {
	const [reviews, setReviews] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedReview, setSelectedReview] = useState<any>(null);

	// Edit form state
	const [editRating, setEditRating] = useState<number | null>(0);
	const [editComment, setEditComment] = useState("");
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const fetchReviews = async () => {
		setLoading(true);
		try {
			const res = await callApi({
				method: "GET",
				url: API_ENDPOINTS.REVIEWS.BY_USER,
			});
			if (res && (res as any).data) {
				setReviews((res as any).data);
			}
		} catch (error) {
			console.error("Failed to fetch reviews", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
	}, []);

	const handleEditClick = (review: any) => {
		setSelectedReview(review);
		setEditRating(review.rating);
		setEditComment(review.comment || "");
		setEditModalOpen(true);
	};

	const handleDeleteClick = (review: any) => {
		setSelectedReview(review);
		setDeleteDialogOpen(true);
	};

	const handleUpdateReview = async () => {
		if (!selectedReview || !editRating) return;

		try {
			await callApi({
				method: "PUT",
				url: API_ENDPOINTS.REVIEWS.UPDATE(selectedReview.id),
				data: {
					rating: editRating,
					comment: editComment,
				},
			});
			setSnackbar({
				open: true,
				message: "Review updated successfully",
				severity: "success",
			});
			setEditModalOpen(false);
			fetchReviews();
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to update review",
				severity: "error",
			});
		}
	};

	const handleDeleteAction = async () => {
		if (!selectedReview) return;
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.REVIEWS.DELETE(selectedReview.id),
		});
	};

	const handleDeleteSuccess = () => {
		setSnackbar({
			open: true,
			message: "Review deleted successfully",
			severity: "success",
		});
		fetchReviews();
	};

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom fontWeight="bold">
				My Reviews
			</Typography>

			{reviews.length === 0 && !loading ? (
				<Alert severity="info">
					You haven't written any reviews yet.
				</Alert>
			) : (
				<Grid container spacing={3}>
					{reviews.map((review) => (
						<Grid size={{ xs: 12, md: 6 }} key={review.id}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<CardContent sx={{ flexGrow: 1 }}>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="flex-start"
										mb={2}
									>
										<Box>
											<Typography
												variant="h6"
												gutterBottom
											>
												{review.trip?.route?.name}
											</Typography>
											<Stack
												direction="row"
												spacing={1}
												alignItems="center"
												color="text.secondary"
												mb={1}
											>
												<AccessTime fontSize="small" />
												<Typography variant="body2">
													{review.trip?.startTime &&
														format(
															new Date(
																review.trip.startTime
															),
															"PPpp"
														)}
												</Typography>
											</Stack>
											<Stack
												direction="row"
												spacing={1}
												alignItems="center"
												color="text.secondary"
											>
												<DirectionsBus fontSize="small" />
												<Typography variant="body2">
													{
														review.trip?.vehicle
															?.vehicleType?.name
													}
												</Typography>
											</Stack>
										</Box>
										<Chip
											label={formatCurrency(
												review.trip?.price || 0,
												"VND",
												"vi-vn"
											)}
											color="primary"
											variant="outlined"
											size="small"
										/>
									</Stack>

									<Box
										sx={{
											my: 2,
											p: 2,
											bgcolor: "grey.50",
											borderRadius: 1,
										}}
									>
										<Rating
											value={review.rating}
											readOnly
											size="small"
											sx={{ mb: 1 }}
										/>
										<Typography variant="body1">
											{review.comment ||
												"No comment provided."}
										</Typography>
									</Box>

									<Typography
										variant="caption"
										color="text.secondary"
									>
										Reviewed on{" "}
										{format(
											new Date(review.createdAt),
											"PP"
										)}
									</Typography>
								</CardContent>
								<CardActions
									sx={{ justifyContent: "flex-end", p: 2 }}
								>
									<Button
										startIcon={<EditIcon />}
										size="small"
										onClick={() => handleEditClick(review)}
									>
										Edit
									</Button>
									<Button
										startIcon={<DeleteIcon />}
										size="small"
										color="error"
										onClick={() =>
											handleDeleteClick(review)
										}
									>
										Delete
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Edit Dialog */}
			<Dialog
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Edit Review</DialogTitle>
				<DialogContent>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
							pt: 1,
						}}
					>
						<Box>
							<Typography component="legend">Rating</Typography>
							<Rating
								value={editRating}
								onChange={(_, newValue) =>
									setEditRating(newValue)
								}
							/>
						</Box>
						<TextField
							label="Comment"
							multiline
							rows={4}
							value={editComment}
							onChange={(e) => setEditComment(e.target.value)}
							fullWidth
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditModalOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleUpdateReview} variant="contained">
						Update
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation */}
			<ConfirmDeleteDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				deleteAction={handleDeleteAction}
				onSuccess={handleDeleteSuccess}
				title="Delete Review"
				description="Are you sure you want to delete this review? This action cannot be undone."
			/>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default UserReviews;
