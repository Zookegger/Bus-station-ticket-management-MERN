import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import type { DeleteCouponFormProps } from "./types/Props";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { API_ENDPOINTS } from "@constants/index";;
import { Warning } from "@mui/icons-material";

const DeleteCouponForm: React.FC<DeleteCouponFormProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const [errors, setErrors] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	useEffect(() => {
		if (!(typeof id === "number" && Number.isInteger(id))) {
			setErrors("Invalid ID");
		} else {
			setErrors(null);
		}
	}, [id]);
	
	const handleSubmit = async () => {
		if (errors) return;

		setIsDeleting(true);
		setErrors(null);

		if (!id) throw new Error("No ID provided");

		try {
			const response = await axios.delete(
				API_ENDPOINTS.COUPON.DELETE(id)
			);
			if (!response || response.status !== 200) {
				throw new Error("No response from server");
			}
			await onConfirm();
			onClose();
		} catch (err: unknown) {
			const message = handleAxiosError(err);
			setErrors(message.message);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				<Warning color="error" />
				{errors && <Alert>{errors.toString()}</Alert>}
			</DialogTitle>

			<DialogContent>
				<DialogContentText>
					Are you sure you want to delete this coupon?
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 2 }}>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button
					type="button"
					variant="contained"
					color="error"
					disabled={isDeleting || errors != null}
					onClick={handleSubmit}
				>
					{isDeleting ? "Delete..." : "Confirm Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteCouponForm;
