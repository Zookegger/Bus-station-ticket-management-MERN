import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Rating,
	TextField,
	Typography,
	Box,
	Snackbar,
	Alert,
} from "@mui/material";
import type { CreateReviewDTO } from "@my-types";
import { callApi } from "@utils/apiCaller";

interface ReviewModalProps {
	open: boolean;
	onClose: () => void;
	tripId: number;
	onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
	open,
	onClose,
	tripId,
	onSuccess,
}) => {
	const [rating, setRating] = useState<number | null>(5);
	const [comment, setComment] = useState("");
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleSubmit = async () => {
		if (!rating) return;

		setLoading(true);
		try {
			const data: CreateReviewDTO = {
				tripId,
				rating,
				comment,
			};
			await callApi({
				method: "POST",
				url: "/reviews",
				data,
			});
			setSnackbar({
				open: true,
				message: "Review submitted successfully",
				severity: "success",
			});
			onSuccess();
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (error: any) {
			setSnackbar({
				open: true,
				message:
					error.response?.data?.message || "Failed to submit review",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle>Rate your trip</DialogTitle>
				<DialogContent>
					<Box display="flex" flexDirection="column" gap={2} py={2}>
						<Box display="flex" alignItems="center" gap={1}>
							<Typography component="legend">Rating:</Typography>
							<Rating
								name="simple-controlled"
								value={rating}
								onChange={(_event, newValue) => {
									setRating(newValue);
								}}
							/>
						</Box>
						<TextField
							label="Comment (Optional)"
							multiline
							rows={4}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							fullWidth
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
						disabled={loading || !rating}
					>
						Submit
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};
