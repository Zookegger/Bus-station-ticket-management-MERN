import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";

interface RemoveVehicleFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: (message?: string) => void;
}

const RemoveVehicleForm: FC<RemoveVehicleFormProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const validationError = useMemo(
		() =>
			open && (typeof id !== "number" || !Number.isInteger(id))
				? "Invalid vehicle identifier."
				: null,
		[open, id]
	);

	const deleteVehicle = useCallback(async () => {
		if (typeof id !== "number" || !Number.isInteger(id)) {
			throw new Error("No vehicle id provided.");
		}

		// Request backend deletion prior to invoking parent callbacks.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.VEHICLE.DELETE(id),
		});
	}, [id]);

	const handleSuccess = useCallback(() => {
		// Propagate success so list views can refresh their data.
		onConfirm("Vehicle deleted successfully");
	}, [onConfirm]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete Vehicle"
			description="Are you sure you want to delete this vehicle?"
			onClose={onClose}
			deleteAction={deleteVehicle}
			onSuccess={handleSuccess}
			blockingError={validationError}
			confirmLabel="Confirm"
		/>
	);
};

export default RemoveVehicleForm;
