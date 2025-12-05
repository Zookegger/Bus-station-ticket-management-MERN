import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";

interface DeleteVehicleTypeDialogProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const DeleteVehicleTypeDialog: FC<DeleteVehicleTypeDialogProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const validationError = useMemo(
		() =>
			open && (typeof id !== "number" || !Number.isInteger(id))
				? "Invalid vehicle type identifier."
				: null,
		[open, id]
	);

	const deleteVehicleType = useCallback(async () => {
		if (typeof id !== "number" || !Number.isInteger(id)) {
			throw new Error("No vehicle type id provided.");
		}

		// Request the backend to remove the vehicle type before continuing.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.VEHICLE_TYPE.DELETE(id),
		});
	}, [id]);

	const handleSuccess = useCallback(() => {
		// Let parent elements refresh any cached vehicle type listings.
		onConfirm();
	}, [onConfirm]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete Vehicle Type"
			description="Are you sure you want to delete this vehicle type?"
			onClose={onClose}
			deleteAction={deleteVehicleType}
			onSuccess={handleSuccess}
			blockingError={validationError}
		/>
	);
};

export default DeleteVehicleTypeDialog;
