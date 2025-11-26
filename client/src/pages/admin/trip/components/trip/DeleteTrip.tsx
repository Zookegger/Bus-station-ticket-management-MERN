import React, { useState, useEffect } from "react";
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";
import { handleAxiosError } from "@utils/handleError";
import type { TripAttributes } from "@my-types/trip";

interface DeleteTripProps {
	open: boolean;
	onClose: () => void;
	onDeleted: () => void;
	trip: TripAttributes | null;
}

const DeleteTrip: React.FC<DeleteTripProps> = ({
	open,
	onClose,
	onDeleted,
	trip,
}) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Reset error state when the dialog opens with a valid trip
		if (open && trip) {
			setError(null);
		}
		// Set an error if the trip is missing when the dialog is open
		if (open && !trip) {
			setError("No trip selected for deletion.");
		}
	}, [trip, open]);

	const handleDelete = async () => {
		if (!trip) {
			setError("Cannot delete: Trip data is missing.");
			return;
		}

		setIsDeleting(true);
		setError(null);

		try {
			await axios.delete(API_ENDPOINTS.TRIP.DELETE(trip.id));
			onDeleted(); // Callback to refresh the list
			onClose(); // Close the dialog on success
		} catch (err: unknown) {
			const axiosError = handleAxiosError(err);
			setError(axiosError.message || "An unknown error occurred.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle sx={{ display: "flex", alignItems: "center" }}>
				<Warning color="error" sx={{ mr: 1 }} />
				Delete Trip
			</DialogTitle>
			<DialogContent>
				{error && <Alert severity="error">{error}</Alert>}
				<DialogContentText sx={{ mt: error ? 2 : 0 }}>
					{`Are you sure you want to delete Trip #${trip?.id}? This action cannot be undone.`}
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button
					onClick={handleDelete}
					variant="contained"
					color="error"
					disabled={isDeleting || !trip}
				>
					{isDeleting ? "Deleting..." : "Confirm Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteTrip;
