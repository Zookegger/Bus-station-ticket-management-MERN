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
import { Gender, type User } from "@my-types/user";
import { useEffect, useState } from "react";
import type { AuthUser } from "@my-types/auth";
import { Check, GppBad, VerifiedUser } from "@mui/icons-material";
import { handleAxiosError } from "@utils/handleError";
import buildImgUrl from "@utils/imageHelper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileForm } from "../../schemas/userSchema";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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

	const {
		control,
		handleSubmit,
		reset,
		setError: setFormError,
		formState: { errors, isSubmitting },
	} = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phoneNumber: "",
			address: "",
			gender: Gender.OTHER,
			dateOfBirth: null,
		},
	});

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
			reset({
				firstName: data.firstName ?? "",
				lastName: data.lastName ?? "",
				gender: (data.gender as Gender) ?? Gender.OTHER,
				phoneNumber: data.phoneNumber ?? "",
				address: data.address ?? "",
				dateOfBirth: data.dateOfBirth
					? new Date(data.dateOfBirth)
					: null,
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

	const onSubmit = async (data: ProfileForm) => {
		try {
			setError(null);
			setSuccessMessage(null);

			if (!user) {
				setError(
					"Unable to determine user identifier. Please re-authenticate."
				);
				return;
			}

			const formData = new FormData();
			Object.keys(data).forEach((key) => {
				const value = data[key as keyof ProfileForm];
				if (key === "dateOfBirth" && value) {
					formData.append(key, (value as Date).toISOString().split("T")[0]);
					return;
				}
				if (value !== null && value !== undefined && value !== "") {
					formData.append(key, value as string);
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
		} catch (err: any) {
			const resp = err?.response?.data;
			if (resp && Array.isArray(resp.errors)) {
				resp.errors.forEach((e: any) => {
					if (e && e.type === "field" && e.path) {
						setFormError(e.path as any, {
							type: "server",
							message:
								e.msg || e.message || resp.message || "Invalid value",
						}, { shouldFocus: true });
					}
				});
				return;
			}
			setError("Failed to update profile.");
		}
	};

	const handleCancelClick = () => {
		if (profile) {
			reset({
				firstName: profile.firstName ?? "",
				lastName: profile.lastName ?? "",
				gender: (profile.gender as Gender) ?? Gender.OTHER,
				phoneNumber: profile.phoneNumber ?? "",
				address: profile.address ?? "",
				dateOfBirth: profile.dateOfBirth
					? new Date(profile.dateOfBirth)
					: null,
			});
		}
		setIsEditMode(false);
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

	const fullName = `${profile.firstName || ""} ${
		profile.lastName || ""
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
											buildImgUrl(profile.avatar) ||
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
								<form onSubmit={handleSubmit(onSubmit)}>
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="firstName"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														label="First name"
														fullWidth
														error={
															!!errors.firstName
														}
														helperText={
															errors.firstName
																?.message
														}
														disabled={!isEditMode}
													/>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="lastName"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														label="Last name"
														fullWidth
														error={
															!!errors.lastName
														}
														helperText={
															errors.lastName
																?.message
														}
														disabled={!isEditMode}
													/>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="phoneNumber"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														label="Phone number"
														fullWidth
														error={
															!!errors.phoneNumber
														}
														helperText={
															errors.phoneNumber
																?.message
														}
														disabled={!isEditMode}
													/>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="dateOfBirth"
												control={control}
												render={({ field }) => (
													<LocalizationProvider
														dateAdapter={
															AdapterDateFns
														}
													>
														<DatePicker
															label="Date of Birth"
															value={field.value}
															onChange={(
																newValue
															) =>
																field.onChange(
																	newValue
																)
															}
															disabled={
																!isEditMode
															}
															slotProps={{
																textField: {
																	fullWidth:
																		true,
																	error: !!errors.dateOfBirth,
																	helperText:
																		errors
																			.dateOfBirth
																			?.message,
																},
															}}
														/>
													</LocalizationProvider>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="gender"
												control={control}
												render={({ field }) => (
													<FormControl
														fullWidth
														disabled={!isEditMode}
													>
														<InputLabel>
															Gender
														</InputLabel>
														<Select
															{...field}
															label="Gender"
															value={
																field.value ||
																Gender.OTHER
															}
														>
															<MenuItem
																value={
																	Gender.MALE
																}
															>
																Male
															</MenuItem>
															<MenuItem
																value={
																	Gender.FEMALE
																}
															>
																Female
															</MenuItem>
															<MenuItem
																value={
																	Gender.OTHER
																}
															>
																Other
															</MenuItem>
														</Select>
													</FormControl>
												)}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Controller
												name="address"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														label="Address"
														fullWidth
														disabled={!isEditMode}
														value={
															field.value || ""
														}
													/>
												)}
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
													type="submit"
													variant="contained"
													color="primary"
													disabled={isSubmitting}
													sx={{ mr: 2 }}
												>
													{isSubmitting ? (
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
												type="button"
												variant="contained"
												onClick={(e) => {
													e.preventDefault();
													setIsEditMode(true);
												}}
											>
												Edit Profile
											</Button>
										)}
									</Box>
								</form>
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
						{successMessage ?? "Profile Updated"}
					</Alert>
				</Snackbar>
			</Box>
		</>
	);
};

export default Profile;
