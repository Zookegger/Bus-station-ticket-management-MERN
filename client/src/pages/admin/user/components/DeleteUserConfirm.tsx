import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from "@mui/material";
import type { User } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";

interface Props {
	open: boolean;
	user: User | null;
	onClose: () => void;
	onDeleted: (id: string) => void;
}

const DeleteUserConfirm: React.FC<Props> = ({
	open,
	user,
	onClose,
	onDeleted,
}) => {
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!user) return;
		setDeleting(true);
		try {
			await callApi({
				method: "DELETE",
				url: API_ENDPOINTS.ADMIN.DELETE(String(user.id)),
			});
			onDeleted(user.id);
			onClose();
		} catch (err) {
			console.error("Delete failed", err);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Delete user</DialogTitle>
			<DialogContent>
				<Typography>
					Are you sure you want to permanently delete user "
					{user?.fullName}"?
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={deleting}>
					Cancel
				</Button>
				<Button
					color="error"
					variant="contained"
					onClick={handleDelete}
					disabled={deleting}
				>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteUserConfirm;
