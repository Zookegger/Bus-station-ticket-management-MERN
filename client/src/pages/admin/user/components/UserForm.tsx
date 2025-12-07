import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Grid,
	Typography,
	Divider,
	IconButton,
	InputAdornment,
	CircularProgress,
	Alert,
} from "@mui/material";
import {
	Close as CloseIcon,
	Visibility,
	VisibilityOff,
	Person as PersonIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	Home as HomeIcon,
	Password as PasswordIcon,
	AccountCircle,
	Edit as EditIcon,
	AdminPanelSettings,
	Wc,
	Save as SaveIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { User } from "@my-types/user";
import { Gender, Role } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserForm as UserFormType } from "@schemas/userSchema";

interface Props {
	open: boolean;
	onClose: () => void;
	onSaved: (user: User, message?: string) => void;
	initialData?: User | null;
}

const UserForm: React.FC<Props> = ({ open, onClose, onSaved, initialData }) => {
	const isEditMode = !!initialData;
	const [showPassword, setShowPassword] = useState(false);
	const [formError, setFormError] = useState<
		Record<string, string> | string | null
	>();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<UserFormType>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			userName: "",
			phoneNumber: "",
			role: Role.USER,
			password: "",
			address: "",
			gender: Gender.OTHER,
			dateOfBirth: null,
		},
	});

	useEffect(() => {
		if (open) {
			if (isEditMode && initialData) {
				reset({
					email: initialData.email,
					firstName: initialData.firstName || "",
					lastName: initialData.lastName || "",
					userName: initialData.userName,
					phoneNumber: initialData.phoneNumber || "",
					role: initialData.role,
					password: "",
					address: initialData.address || "",
					gender: initialData.gender || Gender.OTHER,
					dateOfBirth: initialData.dateOfBirth
						? new Date(initialData.dateOfBirth)
						: null,
				});
			} else {
				reset({
					email: "",
					firstName: "",
					lastName: "",
					userName: "",
					phoneNumber: "",
					role: Role.USER,
					password: "",
					address: "",
					gender: Gender.OTHER,
					dateOfBirth: null,
				});
			}
			setFormError(null);
		}
	}, [open, isEditMode, initialData, reset]);

	const onSubmit = async (data: UserFormType) => {
		try {
			const url = isEditMode
				? API_ENDPOINTS.ADMIN.UPDATE(String(initialData!.id))
				: API_ENDPOINTS.ADMIN.ADD;
			const method = isEditMode ? "PUT" : "POST";

			const payload = {
				...data,
				dateOfBirth: data.dateOfBirth
					? data.dateOfBirth.toISOString()
					: undefined,
				password: data.password || undefined, // Only send if provided (for edit)
			};

			const res = await callApi<User>({
				method,
				url,
				data: payload,
			});

			const savedUser = (res as any).data ?? res;
			onSaved(savedUser as User, isEditMode ? "User updated successfully" : "User created successfully");
			onClose();
		} catch (err: any) {
			console.error(
				`Failed to ${isEditMode ? "update" : "create"} user`,
				err
			);
			setFormError(err?.response?.data ?? err?.message ?? err);
		}
	};

	const handleTogglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason !== "backdropClick") onClose();
			}}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{isEditMode ? <EditIcon /> : <PersonIcon />}
				<Typography variant="h6">
					{isEditMode ? "Edit User" : "Add New User"}
				</Typography>
				<IconButton
					onClick={onClose}
					sx={{ marginLeft: "auto" }}
					size="small"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
					{formError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{typeof formError === "string"
								? formError
								: JSON.stringify(formError)}
						</Alert>
					)}

					<Grid container spacing={2}>
						{/* Personal Information Section */}
						<Grid size={{ xs: 12 }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ mb: 1 }}
							>
								Personal Information
							</Typography>
							<Divider sx={{ mb: 2 }} />
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="firstName"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="First Name"
										fullWidth
										error={!!errors.firstName}
										helperText={errors.firstName?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon color="action" />
												</InputAdornment>
											),
										}}
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
										label="Last Name"
										fullWidth
										error={!!errors.lastName}
										helperText={errors.lastName?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon color="action" />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="gender"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Gender"
										fullWidth
										error={!!errors.gender}
										helperText={errors.gender?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Wc color="action" />
												</InputAdornment>
											),
										}}
									>
										{Object.values(Gender).map((g) => (
											<MenuItem key={g} value={g}>
												{g.charAt(0).toUpperCase() +
													g.slice(1).toLowerCase()}
											</MenuItem>
										))}
									</TextField>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<Controller
									name="dateOfBirth"
									control={control}
									render={({ field }) => (
										<DatePicker
											label="Date of Birth"
											value={field.value}
											onChange={field.onChange}
											slotProps={{
												textField: {
													fullWidth: true,
													error: !!errors.dateOfBirth,
													helperText:
														errors.dateOfBirth
															?.message,
												},
											}}
										/>
									)}
								/>
							</LocalizationProvider>
						</Grid>

						{/* Account Information Section */}
						<Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ mb: 1 }}
							>
								Account Information
							</Typography>
							<Divider sx={{ mb: 2 }} />
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="userName"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Username"
										fullWidth
										error={!!errors.userName}
										helperText={errors.userName?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AccountCircle color="action" />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Email"
										fullWidth
										error={!!errors.email}
										helperText={errors.email?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<EmailIcon color="action" />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label={
											isEditMode
												? "New Password (Optional)"
												: "Password"
										}
										type={
											showPassword ? "text" : "password"
										}
										fullWidth
										error={!!errors.password}
										helperText={errors.password?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PasswordIcon color="action" />
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														onClick={
															handleTogglePasswordVisibility
														}
														edge="end"
													>
														{showPassword ? (
															<VisibilityOff />
														) : (
															<Visibility />
														)}
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="role"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Role"
										fullWidth
										error={!!errors.role}
										helperText={errors.role?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AdminPanelSettings color="action" />
												</InputAdornment>
											),
										}}
									>
										{Object.values(Role).map((r) => (
											<MenuItem key={r} value={r}>
												{r}
											</MenuItem>
										))}
									</TextField>
								)}
							/>
						</Grid>

						{/* Contact Information Section */}
						<Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ mb: 1 }}
							>
								Contact Information
							</Typography>
							<Divider sx={{ mb: 2 }} />
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="phoneNumber"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Phone Number"
										fullWidth
										error={!!errors.phoneNumber}
										helperText={errors.phoneNumber?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PhoneIcon color="action" />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<Controller
								name="address"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Address"
										fullWidth
										multiline
										rows={2}
										error={!!errors.address}
										helperText={errors.address?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<HomeIcon
														color="action"
														sx={{ mt: 1 }}
													/>
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						startIcon={
							isSubmitting ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<SaveIcon />
							)
						}
						disabled={isSubmitting}
					>
						{isSubmitting
							? "Saving..."
							: isEditMode
							? "Update User"
							: "Create User"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UserForm;
