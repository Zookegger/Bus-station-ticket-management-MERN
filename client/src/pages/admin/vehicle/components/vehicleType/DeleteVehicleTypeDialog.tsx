import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { API_ENDPOINTS } from "@constants";
import { Warning } from "@mui/icons-material";

interface DeleteVehicleTypeDialogProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const DeleteVehicleTypeDialog: React.FC<DeleteVehicleTypeDialogProps> = ({
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
				API_ENDPOINTS.VEHICLE_TYPE.DELETE(id)
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
					Are you sure you want to delete this vehicle type?
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
					{isDeleting ? "Deleting..." : "Confirm Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteVehicleTypeDialog;
