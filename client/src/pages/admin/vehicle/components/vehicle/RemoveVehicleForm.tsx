import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@constants/index";;
import { Error as ErrorIcon, Warning } from "@mui/icons-material";
import callApi from "@utils/apiCaller";

interface RemoveVehicleFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const RemoveVehicleForm: React.FC<RemoveVehicleFormProps> = ({
	id,
	open,
	onClose,
	onConfirm,
}) => {
	const [errors, setErrors] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);

	useEffect(() => {
		if (open === true) {
			setErrors(null);
			setIsDeleting(false);
		}
	}, [open]);

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
			// const response = await axios.delete(
			// 	API_ENDPOINTS.VEHICLE.DELETE(id)
			// );
			const { status, data } = await callApi(
				{
					method: "DELETE",
					url: API_ENDPOINTS.VEHICLE.DELETE(id),
				},
				{ returnFullResponse: true }
			);

			if (status !== 200) {
				throw new Error(data);
			}

			await onConfirm();
			onClose();
		} catch (err: any) {
			setErrors(err.message as string);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{errors && (
					<Alert color="error" icon={<ErrorIcon />}>
						{errors.toString()}
					</Alert>
				)}
			</DialogTitle>

			<DialogContent>
				<DialogContentText
					display={"flex"}
					alignItems={"center"}
					justifyContent={"flex-start"}
				>
					<Warning color="error" sx={{ marginRight: 1 }} />
					Are you sure you want to delete this vehicle?
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
					<Typography
						variant="button"
						fontWeight={isDeleting ? "regular" : "bold"}
					>
						{isDeleting ? "Deleting..." : "Confirm"}
					</Typography>
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RemoveVehicleForm;
