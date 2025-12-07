import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import { API_ENDPOINTS } from "@constants/index";
import callApi from "@utils/apiCaller";
interface DeleteCouponFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm?: (id: number) => void;
}

const DeleteCouponForm: FC<DeleteCouponFormProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const validationError = useMemo(
		() =>
			open && (typeof id !== "number" || !Number.isInteger(id))
				? "Invalid coupon identifier."
				: null,
		[open, id]
	);

	const deleteCoupon = useCallback(async () => {
		if (typeof id !== "number" || !Number.isInteger(id)) {
			throw new Error("No coupon id provided.");
		}

		// Remove the coupon via API before notifying parent components.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.COUPON.DELETE(id),
		});
	}, [id]);

	const handleSuccess = useCallback(() => {
		if (typeof id === "number" && Number.isInteger(id)) {
			onConfirm?.(id);
		}
	}, [id, onConfirm]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete Coupon"
			description="Are you sure you want to delete this coupon?"
			onClose={onClose}
			deleteAction={deleteCoupon}
			onSuccess={handleSuccess}
			blockingError={validationError}
		/>
	);
};

export default DeleteCouponForm;
