import { useCallback, useEffect, useMemo, useState } from "react";
import type { FC, ReactNode } from "react";
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

/** Default message used when an error cannot be derived from the thrown value. */
const DEFAULT_ERROR_MESSAGE = "Failed to delete item. Please try again.";

/**
 * Extracts a user-friendly message from an unknown error value.
 * @param {unknown} error - Any thrown error payload.
 * @returns {string} A message safe to display in the UI.
 */
const formatUnknownError = (error: unknown): string => {
	if (typeof error === "string" && error.trim().length > 0) {
		return error;
	}

	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	) {
		return String((error as { message: string }).message).trim() || DEFAULT_ERROR_MESSAGE;
	}

	return DEFAULT_ERROR_MESSAGE;
};

export interface ConfirmDeleteDialogProps {
	open: boolean;
	title: string;
	description: ReactNode;
	onClose: () => void;
	deleteAction: () => Promise<void>;
	onSuccess?: () => Promise<void> | void;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmDisabled?: boolean;
	blockingError?: string | null;
	icon?: ReactNode;
	autoCloseOnSuccess?: boolean;
	formatError?: (error: unknown) => string;
}

/**
 * Consistent confirmation dialog that centralises delete flow state (loading, errors, closing).
 * Designed to replace ad-hoc delete dialogs across admin pages.
 */
const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({
	open,
	title,
	description,
	onClose,
	deleteAction,
	onSuccess,
	confirmLabel = "Confirm Delete",
	cancelLabel = "Cancel",
	confirmDisabled = false,
	blockingError = null,
	icon,
	autoCloseOnSuccess = true,
	formatError,
}) => {
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Reset local state whenever the dialog is (re)opened so each confirmation starts fresh.
	useEffect(() => {
		if (open) {
			setIsProcessing(false);
			setErrorMessage(null);
		}
	}, [open]);

	const isConfirmButtonDisabled = useMemo(
		() => Boolean(blockingError) || confirmDisabled || isProcessing,
		[blockingError, confirmDisabled, isProcessing]
	);

	const dialogIcon = useMemo(() => icon ?? <Warning color="error" />, [icon]);

	const composedAlertMessage = useMemo(
		() => blockingError ?? errorMessage,
		[blockingError, errorMessage]
	);

	const deriveErrorMessage = useCallback(
		(error: unknown) => (formatError ? formatError(error) : formatUnknownError(error)),
		[formatError]
	);

	const handleConfirm = useCallback(async () => {
		// Prevent duplicate submissions or submissions blocked by validation issues.
		if (isConfirmButtonDisabled) {
			return;
		}

		setIsProcessing(true);
		setErrorMessage(null);

		try {
			// Execute the provided delete action and wait for completion to ensure sequential flow.
			await deleteAction();

			if (onSuccess) {
				await onSuccess();
			}

			if (autoCloseOnSuccess) {
				onClose();
			}
		} catch (error) {
			setErrorMessage(deriveErrorMessage(error));
		} finally {
			setIsProcessing(false);
		}
	}, [
		autoCloseOnSuccess,
		deleteAction,
		deriveErrorMessage,
		isConfirmButtonDisabled,
		onClose,
		onSuccess,
	]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{dialogIcon}
				{title}
			</DialogTitle>
			<DialogContent dividers>
				{composedAlertMessage && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{composedAlertMessage}
					</Alert>
				)}
				<DialogContentText>{description}</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, py: 2 }}>
				<Button onClick={onClose} color="inherit" disabled={isProcessing}>
					{cancelLabel}
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color="error"
					disabled={isConfirmButtonDisabled}
				>
					{isProcessing ? "Deleting..." : confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDeleteDialog;
