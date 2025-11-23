import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Snackbar,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import axios from "axios";
import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "@constants/index";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import type { Gender, User } from "@my-types/user";
import { useEffect, useState } from "react";
import type { AuthUser } from "@my-types/auth";
import { Check, GppBad, VerifiedUser } from "@mui/icons-material";
import { handleAxiosError } from "@utils/handleError";
import buildAvatarUrl from "@utils/avatarImageHelper";

interface ChangePasswordDialogProps {
	dialogOpen: boolean;
	onClose: () => void;
	/** Setter from parent to report validation/errors back to Profile */
	setFormErrors: (errors: Record<string, string>) => void;
	/** Current form errors (displayed by the dialog) */
	formErrors?: Record<string, string>;
	/** Current authenticated user from parent (used for API call) */
	user?: AuthUser | User | null;
	/** Called when password change succeeds; parent can show snackbar */
	onSuccess?: (message: string) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
	dialogOpen,
	onClose,
	setFormErrors,
	formErrors,
	user,
	onSuccess,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [changePasswordDTO, setChangePasswordDTO] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handlePasswordChangeInput = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setChangePasswordDTO((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmitChangePassword = async () => {
		try {
			setIsLoading(true);
			setFormErrors({});
			if (
				!changePasswordDTO.currentPassword ||
				!changePasswordDTO.newPassword
			) {
				setFormErrors({
					change_password: "Please fill all password fields.",
				});
				return;
			}
			if (
				changePasswordDTO.newPassword !==
				changePasswordDTO.confirmPassword
			) {
				setFormErrors({
					change_password:
						"New password and confirm password do not match.",
				});
				return;
			}
			if (!user) {
				setFormErrors({ change_password: "No user available." });
				return;
			}
			await axios.post(
				`${
					APP_CONFIG.apiBaseUrl
				}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD_WITH_ID.replace(
					":id",
					user.id
				)}`,
				{
					currentPassword: changePasswordDTO.currentPassword,
					newPassword: changePasswordDTO.newPassword,
				}
			);
			onClose();
			if (onSuccess) onSuccess("Password changed successfully");
		} catch (err) {
			setFormErrors({ change_password: "Password change failed" });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={dialogOpen} onClose={onClose}>
			<DialogTitle>Change Password</DialogTitle>
			<DialogContent>
				<TextField
					label="Current password"
					name="currentPassword"
					type="password"
					value={changePasswordDTO.currentPassword}
					onChange={handlePasswordChangeInput}
					fullWidth
					margin="dense"
				/>
				<TextField
					label="New password"
					name="newPassword"
					type="password"
					value={changePasswordDTO.newPassword}
					onChange={handlePasswordChangeInput}
					fullWidth
					margin="dense"
				/>
				<TextField
					label="Confirm new password"
					name="confirmPassword"
					type="password"
					value={changePasswordDTO.confirmPassword}
					onChange={handlePasswordChangeInput}
					fullWidth
					margin="dense"
				/>
				{formErrors?.change_password && (
					<Alert severity="error" sx={{ mt: 1 }}>
						{formErrors.change_password}
					</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					disabled={isLoading}
					onClick={handleSubmitChangePassword}
				>
					{isLoading ? (
						<CircularProgress size={20} />
					) : (
						"Change password"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

interface ChangeEmailDialogProps {
	dialogOpen: boolean;
	onClose: () => void;
	/** Setter from parent to report validation/errors back to Profile */
	setFormErrors: (errors: Record<string, string>) => void;
	/** Current form errors (displayed by the dialog) */
	formErrors?: Record<string, string>;
	/** Current authenticated user from parent (used for API call) */
	user?: AuthUser | User | null;
	/** Called when password change succeeds; parent can show snackbar */
	onSuccess?: (message: string) => void;
}

const ChangeEmailDialog: React.FC<ChangeEmailDialogProps> = ({
	dialogOpen,
	formErrors,
	user,
	onClose,
	setFormErrors,
	onSuccess,
}) => {
	const [new_email, setNewEmail] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSubmitChangeEmail = async () => {
		if (user === null || typeof user === "undefined") {
			throw new Error("You're not allowed to make changes");
		}

		let success = false;
		try {
			setIsLoading(true);
			setFormErrors({});

			if (new_email && new_email !== user.email) {
				const response = await axios.post(
					API_ENDPOINTS.USERS.CHANGE_EMAIL(user.id),
					{ current_email: user.email, new_email: new_email }
				);
				if (response.status === 200) {
					success = true;
					if (onSuccess) {
						onSuccess(
							"Email changed successfully, Now check your email to verify your new email"
						);
					}
				}
			}
		} catch (err) {
			const error = handleAxiosError(err);
			setFormErrors({
				change_email: `Email change failed: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
			if (success) onClose();
		}
	};

	const handleVerifyEmail = async () => {
		if (user === null || typeof user === "undefined") {
			throw new Error("You're not allowed to make changes");
		}

		let success = false;
		try {
			setIsLoading(true);
			setFormErrors({});

			const response = await axios.post(
				API_ENDPOINTS.USERS.VERIFY_EMAIL(user.id),
				{ email: user.email }
			);

			if (response.status === 200) {
				success = true;
				if (onSuccess) {
					onSuccess(
						"Email changed successfully, Now check your email to verify your new email"
					);
				}
			}
		} catch (err: any) {
			const error = handleAxiosError(err);
			setFormErrors({
				verify_email: `Email verification failed: ${error.message}`,
			});
		} finally {
			setIsLoading(false);
			if (success) onClose();
		}
	};

	return (
		<Dialog open={dialogOpen} fullWidth>
			<DialogTitle>Change Email</DialogTitle>
			<DialogContent>
				{formErrors?.change_email && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{formErrors.change_email}
					</Alert>
				)}
				{formErrors?.verify_email && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{formErrors.verify_email}
					</Alert>
				)}
				<TextField
					fullWidth
					label="Current Email"
					value={user?.email}
					slotProps={{
						input: {
							readOnly: true,
							endAdornment: user?.emailConfirmed ? (
								<Check color="success" />
							) : (
								<Button onClick={handleVerifyEmail}>
									Verify
								</Button>
							),
						},
						inputLabel: {
							shrink: true,
						},
					}}
					sx={{
						mt: 1,
						mb: 2,
					}}
				/>
				<FormControl fullWidth>
					<TextField
						fullWidth
						variant="filled"
						label="New Email"
						value={new_email}
						onChange={(e) => setNewEmail(e.target.value)}
					></TextField>
				</FormControl>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				{isLoading ? (
					<Button variant="contained" disabled>
						Saving...
					</Button>
				) : (
					<Button
						variant="contained"
						onClick={handleSubmitChangeEmail}
					>
						Save changes
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

interface DeleteAccountDialogProps {
	dialogOpen: boolean;
	onClose: () => void;
	setError: (error: string | null) => void;
	error: string | null;
	user?: AuthUser | User;
	onSuccess?: (message: string) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
	dialogOpen,
	user,
	error,
	onClose,
	onSuccess,
	setError,
}) => {
	const navigate = useNavigate();
	const { deleteAccount } = useAuth();
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

	const handleDeleteAccount = async () => {
		try {
			setDeleteLoading(true);
			if (!user) {
				setError(
					"Unable to determine user identifier. Please re-authenticate."
				);
				onClose();
				return;
			}

			const isDeletionSuccess = await deleteAccount();
			if (isDeletionSuccess) {
				navigate(ROUTES.HOME);
				if (onSuccess) {
					onSuccess("Account deletion success");
				}
			}
		} catch (err) {
			setError("Failed to delete account.");
			console.error(err);
			onClose();
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<Dialog open={dialogOpen} onClose={onClose}>
			<DialogTitle>Confirm Account Deletion</DialogTitle>
			<DialogContent sx={{ paddingBottom: 0 }}>
				<DialogContentText gutterBottom>
					Are you sure you want to delete your account? This action
					cannot be undone. All your data will be permanently deleted.
				</DialogContentText>
				<TextField
					label="Type DELETE to confirm"
					value={deleteConfirmInput}
					onChange={(e) => setDeleteConfirmInput(e.target.value)}
					variant="filled"
					fullWidth
					autoFocus
					error={!!error}
					helperText={error}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (deleteConfirmInput !== "DELETE") {
							setError("Please type DELETE to confirm deletion.");
							return;
						}
						handleDeleteAccount();
					}}
					color="error"
					disabled={deleteLoading}
				>
					{deleteLoading ? (
						<CircularProgress size={24} />
					) : (
						"Delete Account"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const Profile: React.FC = () => {
	const { user, isAuthenticated } = useAuth();

	const [profile, setProfile] = useState<any | null>(null);
	const [editedProfile, setEditedProfile] = useState<any>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);

	const [isEditMode, setIsEditMode] = useState(false);

	const handleChangePasswordClose = () => {
		setPasswordDialogOpen(false);
	};
	const handleChangeEmailClose = () => {
		setEmailDialogOpen(false);
	};
	const handleDeleteAccountClose = () => {
		setDeleteDialogOpen(false);
	};

	const fetchProfile = async () => {
		try {
			if (user === null) throw new Error("No user found");
			if (!isAuthenticated) throw new Error("You're not logged in");

			console.log(user.id);
			setIsLoading(true);
			const response = await axios.get(
				API_ENDPOINTS.USERS.PROFILE(user.id)
			);
			const data = response.data;
			setProfile(data);
			setEditedProfile({
				firstName: data.firstName ?? "",
				lastName: data.lastName ?? "",
				gender: data.gender ?? "other",
				phoneNumber: data.phoneNumber ?? "",
				address: data.address ?? "",
				dateOfBirth: data.dateOfBirth
					? new Date(data.dateOfBirth).toISOString().split("T")[0]
					: "",
				avatar: data.avatar ?? "",
			});
		} catch (err) {
			setError("Failed to fetch profile data.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		fetchProfile();
	}, []);

	useEffect(() => {
		return () => {
			if (avatarPreview) URL.revokeObjectURL(avatarPreview);
		};
	}, [avatarPreview]);

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};
		if (
			!editedProfile.firstName ||
			editedProfile.firstName.trim().length < 2
		) {
			errors.firstName = "First name is required (min 2 characters).";
		}
		if (
			!editedProfile.lastName ||
			editedProfile.lastName.trim().length < 2
		) {
			errors.lastName = "Last name is required (min 2 characters).";
		}
		if (
			editedProfile.phoneNumber &&
			!/^\+?[0-9]{6,15}$/.test(editedProfile.phoneNumber)
		) {
			errors.phoneNumber = "Please enter a valid phone number.";
		}
		if (editedProfile.dateOfBirth) {
			const dob = new Date(editedProfile.dateOfBirth);
			if (dob > new Date()) {
				errors.dateOfBirth = "Date of birth cannot be in the future.";
			}
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSaveClick = async () => {
		try {
			setIsLoading(true);
			setError(null);
			setSuccessMessage(null);

			if (!user) {
				setError(
					"Unable to determine user identifier. Please re-authenticate."
				);
				setIsLoading(false);
				return;
			}

			if (!validateForm()) {
				setIsLoading(false);
				return;
			}

			const formData = new FormData();
			Object.keys(editedProfile).forEach((key) => {
				if (key === "dateOfBirth" && !editedProfile[key]) {
					return;
				}
				if (key === "address" && !editedProfile[key]) {
					return;
				}
				if (
					editedProfile[key] !== null &&
					editedProfile[key] !== undefined
				) {
					formData.append(key, editedProfile[key]);
				}
			});

			if (avatarFile) {
				formData.append("avatar", avatarFile);
			}

			const response = await axios.put(
				`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.USERS.UPDATE_PROFILE(
					user.id
				)}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			setSuccessMessage(response.data.message);
			setSnackbarOpen(true);
			fetchProfile();
			setIsEditMode(false);
		} catch (err) {
			setError("Failed to update profile.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelClick = () => {
		setEditedProfile({
			firstName: profile.firstName ?? "",
			lastName: profile.lastName ?? "",
			gender: profile.gender ?? "other",
			phoneNumber: profile.phoneNumber ?? "",
			address: profile.address ?? "",
			dateOfBirth: profile.dateOfBirth
				? new Date(profile.dateOfBirth).toISOString().split("T")[0]
				: "",
			avatar: profile.avatar ?? "",
		});
		setFormErrors({});
		setIsEditMode(false);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setEditedProfile((prev: any) => ({
			...prev,
			[e.target.name]: e.target.value || null,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		setAvatarFile(file);
		if (file) setAvatarPreview(URL.createObjectURL(file));
	};

	const handleSnackbarClose = () => setSnackbarOpen(false);

	const handleErrorClose = (
		_event: Event | React.SyntheticEvent<any, Event>,
		reason: string
	) => {
		if (reason === "clickaway") {
			return;
		}
		setError(null);
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" minHeight="80vh">
				<CircularProgress />
			</Box>
		);
	}

	if (!profile) {
		return (
			<Box
				p={3}
				display="flex"
				justifyContent="center"
				flexDirection={"column"}
				alignItems={"center"}
			>
				<Snackbar
					open={Boolean(error)}
					onClose={handleErrorClose}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
					autoHideDuration={5000}
				>
					<Alert sx={{ p: 3 }} severity="error">
						{error}
					</Alert>
				</Snackbar>
				<Alert severity="info">No profile data available.</Alert>
			</Box>
		);
	}

	const fullName = `${editedProfile.firstName || ""} ${
		editedProfile.lastName || ""
	}`.trim();

	return (
		<>
			<Snackbar
				open={Boolean(error)}
				onClose={handleErrorClose}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				autoHideDuration={5000}
			>
				<Alert sx={{ p: 3 }} severity="error">
					{error}
				</Alert>
			</Snackbar>

			<Box p={3} display="flex" justifyContent="center">
				<Card sx={{ width: { xs: "100%", md: "900px" }, boxShadow: 3 }}>
					<Grid container>
						{/* Left column: Avatar & actions */}
						<Grid size={{ xs: 12, md: 4 }}>
							<Box
								sx={{
									p: 3,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<Box sx={{ position: "relative" }}>
									<Avatar
										src={
											avatarPreview ||
											buildAvatarUrl(editedProfile.avatar)||
											""
										}
										sx={{ width: 120, height: 120 }}
									>
										{fullName?.charAt(0).toUpperCase() ||
											"N"}
									</Avatar>
									<label
										htmlFor="avatar-upload"
										style={{
											position: "absolute",
											right: -10,
											bottom: -10,
										}}
									>
										<input
											id="avatar-upload"
											type="file"
											accept="image/*"
											style={{ display: "none" }}
											onChange={handleFileChange}
											disabled={!isEditMode}
										/>
										<IconButton
											color="primary"
											size="small"
											aria-label="upload avatar"
											component="span"
											disabled={!isEditMode}
										>
											<PhotoCamera />
										</IconButton>
									</label>
								</Box>
								<Typography variant="h6" sx={{ mt: 1 }}>
									{fullName || "No name"}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									gutterBottom
								>
									{(profile as any)?.email ?? ""}
								</Typography>
								<Chip
									icon={
										user?.emailConfirmed ? (
											<VerifiedUser />
										) : (
											<GppBad />
										)
									}
									label={
										user?.emailConfirmed
											? "Verified"
											: "Not verified"
									}
									color={
										user?.emailConfirmed
											? "success"
											: "warning"
									}
									variant="outlined"
								/>

								<Stack
									spacing={1}
									sx={{ mt: 3, width: "100%" }}
								>
									<Button
										variant="outlined"
										onClick={() =>
											setPasswordDialogOpen(true)
										}
									>
										Change password
									</Button>
									<Button
										variant="outlined"
										color="warning"
										onClick={() => setEmailDialogOpen(true)}
									>
										Change Email
									</Button>
									<Button
										variant="outlined"
										color="error"
										onClick={() =>
											setDeleteDialogOpen(true)
										}
									>
										Delete account
									</Button>
								</Stack>
							</Box>
						</Grid>

						{/* Right column: form */}
						<Grid size={{ xs: 12, md: 8 }}>
							<Box sx={{ p: 3 }}>
								<Typography
									variant="h6"
									fontWeight={"bold"}
									gutterBottom
									marginBottom={2}
								>
									Personal Information
								</Typography>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="First name"
											name="firstName"
											value={
												editedProfile.firstName ?? ""
											}
											onChange={handleChange}
											fullWidth
											error={!!formErrors.firstName}
											helperText={formErrors.firstName}
											disabled={!isEditMode}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Last name"
											name="lastName"
											value={editedProfile.lastName ?? ""}
											onChange={handleChange}
											fullWidth
											error={!!formErrors.lastName}
											helperText={formErrors.lastName}
											disabled={!isEditMode}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Phone number"
											name="phoneNumber"
											value={
												editedProfile.phoneNumber ?? ""
											}
											onChange={handleChange}
											fullWidth
											error={!!formErrors.phoneNumber}
											helperText={formErrors.phoneNumber}
											disabled={!isEditMode}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Birth"
											name="dateOfBirth"
											type="date"
											value={
												editedProfile.dateOfBirth ?? ""
											}
											onChange={handleChange}
											fullWidth
											slotProps={{
												inputLabel: { shrink: true },
											}}
											error={!!formErrors.dateOfBirth}
											helperText={formErrors.dateOfBirth}
											disabled={!isEditMode}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<FormControl
											fullWidth
											disabled={!isEditMode}
										>
											<InputLabel>Gender</InputLabel>
											<Select
												name="gender"
												value={
													editedProfile.gender ??
													"other"
												}
												onChange={(e) =>
													setEditedProfile(
														(prev: any) => ({
															...prev,
															gender: e.target
																.value as Gender,
														})
													)
												}
												label="Gender"
											>
												<MenuItem value={"male"}>
													Male
												</MenuItem>
												<MenuItem value={"female"}>
													Female
												</MenuItem>
												<MenuItem value={"other"}>
													Other
												</MenuItem>
											</Select>
										</FormControl>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<TextField
											label="Address"
											name="address"
											value={editedProfile.address ?? ""}
											onChange={handleChange}
											fullWidth
											disabled={!isEditMode}
										/>
									</Grid>
								</Grid>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-end",
										mt: 3,
									}}
								>
									{isEditMode ? (
										<>
											<Button
												variant="contained"
												color="primary"
												onClick={handleSaveClick}
												disabled={isLoading}
												sx={{ mr: 2 }}
											>
												{isLoading ? (
													<CircularProgress
														size={20}
													/>
												) : (
													"Save changes"
												)}
											</Button>
											<Button
												variant="outlined"
												onClick={handleCancelClick}
											>
												Cancel
											</Button>
										</>
									) : (
										<Button
											variant="contained"
											onClick={() => setIsEditMode(true)}
										>
											Edit Profile
										</Button>
									)}
								</Box>
							</Box>
						</Grid>
					</Grid>
				</Card>

				<DeleteAccountDialog
					dialogOpen={deleteDialogOpen}
					onClose={handleDeleteAccountClose}
					setError={setError}
					error={error}
					user={user ?? undefined}
					onSuccess={(msg: string) => {
						setSuccessMessage(msg);
						setSnackbarOpen(true);
					}}
				/>

				<ChangeEmailDialog
					dialogOpen={emailDialogOpen}
					onClose={handleChangeEmailClose}
					setFormErrors={setFormErrors}
					formErrors={formErrors}
					user={user ?? undefined}
					onSuccess={(msg: string) => {
						setSuccessMessage(msg);
						setSnackbarOpen(true);
					}}
				/>

				<ChangePasswordDialog
					dialogOpen={passwordDialogOpen}
					onClose={handleChangePasswordClose}
					setFormErrors={setFormErrors}
					formErrors={formErrors}
					user={user}
					onSuccess={(msg: string) => {
						setSuccessMessage(msg);
						setSnackbarOpen(true);
					}}
				/>

				{/* Snackbar */}
				<Snackbar
					open={snackbarOpen}
					onClose={handleSnackbarClose}
					autoHideDuration={6000}
				>
					<Alert
						severity={successMessage ? "success" : "info"}
						onClose={handleSnackbarClose}
					>
						{successMessage ?? "Action completed"}
					</Alert>
				</Snackbar>
			</Box>
		</>
	);
};

export default Profile;
