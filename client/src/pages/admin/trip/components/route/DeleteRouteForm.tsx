import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";

interface DeleteRouteFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: (message?: string) => void;
}

const DeleteRouteForm: FC<DeleteRouteFormProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const validationError = useMemo(() => {
		if (!open) {
			return null;
		}

		return typeof id === "number" && Number.isInteger(id)
			? null
			: "Invalid route identifier.";
	}, [id, open]);

	const handleDelete = useCallback(async () => {
		if (typeof id !== "number" || !Number.isInteger(id)) {
			throw new Error("No route id provided.");
		}

		// Invoke API to remove the selected route before triggering any refresh callbacks.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.ROUTE.DELETE(id),
		});
	}, [id]);

	const handleSuccess = useCallback(() => {
		// Allow parent components to refresh their data after a successful deletion.
		onConfirm("Route deleted successfully");
	}, [onConfirm]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete Route"
			description="Are you sure you want to delete this route?"
			onClose={onClose}
			deleteAction={handleDelete}
			onSuccess={handleSuccess}
			blockingError={validationError}
		/>
	);
};

export default DeleteRouteForm;