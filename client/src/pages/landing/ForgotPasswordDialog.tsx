import { API_ENDPOINTS, APP_CONFIG } from "@constants/index";
import { Email } from "@mui/icons-material";
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios, { isAxiosError } from "axios";
import { useState } from "react";

interface ForgotPasswordDialogProps {
	open: boolean;
	onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
	open,
	onClose,
}) => {
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!email) newErrors.login = "Email is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		if (!validateForm()) {
            setIsLoading(false);
			return;
		}

		try {
            await axios.post(
				APP_CONFIG.apiBaseUrl + API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
				{
					email
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

            setMessage("Password reset link sent to your email.");
            setEmail("");
            setTimeout(() => onClose(), 2000); // Close after success

		} catch (err: unknown) {
			// Fixed: Use 'unknown' instead of specific type or 'any'
			// Narrow the type safely
			let errorMessage = "Forgot password failed. Please try again.";

			if (isAxiosError(err) && err.response?.data?.message) {
				errorMessage = err.response.data.message; // Now TypeScript knows it's a string
			} else if (err instanceof Error) {
				errorMessage = err.message; // Fallback for other Errors
			} // Else: Use the default message for non-Error throws (e.g., strings)

			setErrors({ general: errorMessage }); // Or merge: setErrors((prev) => ({ ...prev, general: errorMessage }));
			console.error("Forgot password error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} maxWidth={"sm"} fullWidth>
			<DialogTitle>Forgot Password</DialogTitle>
			<DialogContent>
				<Typography variant="body2" mb={2}>
					Enter your email to receive a reset link.
				</Typography>
				{Object.keys(errors).length > 0 && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{Object.values(errors).map((errMsg, index) => (
							<Typography key={index}>{errMsg}</Typography>
						))}
					</Alert>
				)}

                {message && (
                    <Alert severity="success">{message}</Alert>
                )}

				<Box component={"form"} id="forgot-password-form" onSubmit={handleSubmit}>
					<TextField
						type="email"
						size="small"
						placeholder="placeholder@example.com"
						fullWidth
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						slotProps={{
							input: {
								startAdornment: (
									<Email
										fontSize="small"
										sx={{ marginRight: 1 }}
									/>
								),
							},
						}}
					></TextField>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button type="submit" variant="contained" disabled={isLoading} form="forgot-password-form">
					{isLoading ? "Sending..." : "Send Reset Link"}
				</Button>
				<Button onClick={onClose}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ForgotPasswordDialog;
