import React, { useState } from "react";
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
	Box,
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
	Badge,
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
import { userSchema, type UserForm } from "@schemas/userSchema";

interface Props {
	open: boolean;
	onClose: () => void;
	onSaved: (created: User) => void;
}

const AddUserForm: React.FC<Props> = ({ open, onClose, onSaved }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [formError, setFormError] = useState<Record<string,string> | string | null>();

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<UserForm>({
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

	const onSubmit = async (data: UserForm) => {
		try {
			const res = await callApi<User>({
				method: "POST",
				url: API_ENDPOINTS.ADMIN.ADD,
				data: {
					...data,
					dateOfBirth: data.dateOfBirth
						? data.dateOfBirth.toISOString()
						: undefined,
				},
			});

			const created = (res as any).user ?? (res as any).data ?? res;
			onSaved(created as User);
			reset();
			onClose();
		} catch (err: any) {
			console.error("Failed to create user", err);
			setFormError(err.message);
		}
	};

	const handleTogglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pb: 1,
					}}
				>
					<Typography variant="h6" fontWeight={"bold"}>Add New User</Typography>
					<IconButton
						aria-label="close"
						onClick={onClose}
						size="small"
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<Divider />

				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent sx={{ pt: 3 }}>
						{(formError && typeof formError === "string")  && 
							<Alert color="error">{formError}</Alert>
						}
						<Grid container spacing={3}>
							{/* Account Information Section */}
							<Grid size={{ xs: 12 }}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mb: 1,
									}}
								>
									<AdminPanelSettings color="primary" />
									<Typography variant="h6" color="primary">
										Account Information
									</Typography>
								</Box>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<Controller
									name="userName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Username"
											placeholder="Enter username (e.g. jdoe)"
											fullWidth
											error={
												!!errors.userName ||
												(!!formError && typeof formError === "object" && !!formError.userName)
											}
											helperText={
												errors.userName?.message ||
												(formError && typeof formError === "object" ? formError.userName : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<AccountCircle color="action" />
														</InputAdornment>
													),
												},
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
											placeholder="Select role"
											fullWidth
											error={
												!!errors.role ||
												(!!formError && typeof formError === "object" && !!formError.role)
											}
											helperText={
												errors.role?.message ||
												(formError && typeof formError === "object" ? formError.role : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<AdminPanelSettings color="action" />
														</InputAdornment>
													),
												},
											}}
										>
											{Object.values(Role).map((v, k) => {
												return (
													<MenuItem key={k} value={v}>
														{v}
													</MenuItem>
												);
											})}
										</TextField>
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
											placeholder="Enter email (e.g. user@example.com)"
											type="email"
											fullWidth
											error={
												!!errors.email ||
												(!!formError && typeof formError === "object" && !!formError.email)
											}
											helperText={
												errors.email?.message ||
												(formError && typeof formError === "object" ? formError.email : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<EmailIcon color="action" />
														</InputAdornment>
													),
												},
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
											label="Password"
											placeholder="Enter password (min 8 characters)"
											type={
												showPassword
													? "text"
													: "password"
											}
											fullWidth
											error={
												!!errors.password ||
												(!!formError && typeof formError === "object" && !!formError.password)
											}
											helperText={
												errors.password?.message ||
												(formError && typeof formError === "object" ? formError.password : undefined) ||
												"Required for new users"
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<PasswordIcon />
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
												},
											}}
										/>
									)}
								/>
							</Grid>

							{/* Personal Details Section */}
							<Grid size={{ xs: 12 }}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mt: 2,
										mb: 1,
									}}
								>
									<PersonIcon color="primary" />
									<Typography variant="h6" color="primary">
										Personal Details
									</Typography>
								</Box>
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
											placeholder="Given name"
											fullWidth
											error={
												!!errors.firstName ||
												(!!formError && typeof formError === "object" && !!formError.firstName)
											}
											helperText={
												errors.firstName?.message ||
												(formError && typeof formError === "object" ? formError.firstName : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<Badge color="action" />
														</InputAdornment>
													),
												},
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
											placeholder="Family name"
											fullWidth
											error={
												!!errors.lastName ||
												(!!formError && typeof formError === "object" && !!formError.lastName)
											}
											helperText={
												errors.lastName?.message ||
												(formError && typeof formError === "object" ? formError.lastName : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<Badge color="action" />
														</InputAdornment>
													),
												},
											}}
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
											label="Phone Number"
											placeholder="Enter phone number (e.g. 0123456)"
											fullWidth
											error={
												!!errors.phoneNumber ||
												(!!formError && typeof formError === "object" && !!formError.phoneNumber)
											}
											helperText={
												errors.phoneNumber?.message ||
												(formError && typeof formError === "object" ? formError.phoneNumber : undefined)
											}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<PhoneIcon color="action" />
														</InputAdornment>
													),
												},
											}}
										/>
									)}
								/>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<Controller
									name="dateOfBirth"
									control={control}
									render={({ field }) => (
										<DatePicker
											label="Date of Birth"
											value={
												field.value
													? new Date(field.value)
													: null
											}
											onChange={(newValue) =>
												field.onChange(newValue)
											}
											slotProps={{
												textField: {
													fullWidth: true,
													error: !!errors.dateOfBirth,
													helperText: errors
														.dateOfBirth
														?.message as string,
												},
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
											value={field.value || ""}
											placeholder="Pick a gender"
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<Wc color="action" />
														</InputAdornment>
													),
												},
											}}
										>
											{Object.values(Gender).map(
												(v, k) => {
													return (
														<MenuItem
															key={k}
															value={v}
														>
															{v
																.charAt(0)
																.toUpperCase() +
																v
																	.slice(1)
																	.toLowerCase()}
														</MenuItem>
													);
												}
											)}
										</TextField>
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
											placeholder="Enter home address"
											error={
												!!errors.address ||
												(!!formError && typeof formError === "object" && !!formError.address)
											}
											helperText={
												errors.address?.message ||
												(formError && typeof formError === "object" ? formError.address : undefined)
											}
											value={field.value || ""}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment
															position="start"
															sx={{
																mt: 1.5,
																alignSelf:
																	"flex-start",
															}}
														>
															<HomeIcon color="action" />
														</InputAdornment>
													),
												},
											}}
										/>
									)}
								/>
							</Grid>
						</Grid>
					</DialogContent>
					<Divider />
					<DialogActions sx={{ p: 2, gap: 1 }}>
						<Button
							onClick={onClose}
							color="inherit"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
							className="hvr-icon-grow"
							startIcon={
								isSubmitting ? (
									<CircularProgress
										size={20}
										color="inherit"
									/>
								) : (
									<SaveIcon className="hvr-icon"/>
								)
							}
							sx={{ px: 4 }}
						>
							{isSubmitting ? "Creating..." : "Create User"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</LocalizationProvider>
	);
};

export default AddUserForm;
