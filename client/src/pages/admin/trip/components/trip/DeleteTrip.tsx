import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import type { Trip } from "@my-types/trip";

interface DeleteTripProps {
	open: boolean;
	onClose: () => void;
	onDeleted: () => void;
	trip: Trip | null;
}

const DeleteTrip: FC<DeleteTripProps> = ({ open, onClose, onDeleted, trip }) => {
	const blockingError = useMemo(
		() => (open && !trip ? "No trip selected for deletion." : null),
		[open, trip]
	);

	const dialogDescription = useMemo(
		() =>
			trip
				? `Are you sure you want to delete Trip #${trip.id}? This action cannot be undone.`
				: "Select a trip before attempting to delete.",
		[trip]
	);

	const deleteTrip = useCallback(async () => {
		if (!trip) {
			throw new Error("Cannot delete without a selected trip.");
		}

		// Ensure the server removes the trip before any UI updates execute.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.TRIP.DELETE(trip.id),
		});
	}, [trip]);

	const handleSuccess = useCallback(() => {
		// Refresh parent state to reflect the deleted trip.
		onDeleted();
		onClose();
	}, [onDeleted]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete Trip"
			description={dialogDescription}
			onClose={onClose}
			deleteAction={deleteTrip}
			onSuccess={handleSuccess}
			blockingError={blockingError}
		/>
	);
};

export default DeleteTrip;
