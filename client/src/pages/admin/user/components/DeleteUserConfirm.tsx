import { useCallback, useMemo } from "react";
import type { FC } from "react";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import type { User } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";

interface Props {
	open: boolean;
	user: User | null;
	onClose: () => void;
	onDeleted: (id: string, message?: string) => void;
}

const DeleteUserConfirm: FC<Props> = ({ open, user, onClose, onDeleted }) => {
	const blockingError = useMemo(
		() => (open && !user ? "No user selected for deletion." : null),
		[open, user]
	);

	const dialogDescription = useMemo(
		() =>
			user
				? `Are you sure you want to permanently delete user "${user.fullName}"?`
				: "Select a user before attempting to delete.",
		[user]
	);

	const deleteUser = useCallback(async () => {
		if (!user) {
			throw new Error("Cannot delete without a selected user.");
		}

		// Remove the user account from the backend.
		await callApi({
			method: "DELETE",
			url: API_ENDPOINTS.ADMIN.DELETE(String(user.id)),
		});
	}, [user]);

	const handleSuccess = useCallback(() => {
		if (user) {
			onDeleted(user.id, "User deleted successfully");
		}
	}, [onDeleted, user]);

	return (
		<ConfirmDeleteDialog
			open={open}
			title="Delete User"
			description={dialogDescription}
			onClose={onClose}
			deleteAction={deleteUser}
			onSuccess={handleSuccess}
			blockingError={blockingError}
			confirmLabel="Delete"
		/>
	);
};

export default DeleteUserConfirm;
