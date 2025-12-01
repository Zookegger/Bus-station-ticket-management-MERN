import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
	Close as CloseIcon,
	Visibility,
	VisibilityOff,
	Person as PersonIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	Home as HomeIcon,
	AccountCircle,
	Badge,
	AdminPanelSettings,
	Wc,
	Save as SaveIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Gender, type User } from "@my-types/user";
import { Role } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@schemas/userSchema";
import type { UserForm } from "@schemas/userSchema";
import { VehicleStatus } from "@my-types";

interface Props {
	open: boolean;
	user: User | null;
	onClose: () => void;
	onSaved: (updated: User) => void;
}

const EditUserForm: React.FC<Props> = ({ open, user, onClose, onSaved }) => {
	const [showPassword, setShowPassword] = useState(false);

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

	useEffect(() => {
		if (user) {
			reset({
				email: user.email,
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				userName: user.userName,
				phoneNumber: user.phoneNumber || "",
				role: user.role,
				password: "",
				address: user.address || "",
				gender: user.gender || Gender.OTHER,
				dateOfBirth: user.dateOfBirth
					? new Date(user.dateOfBirth)
					: null,
			});
		}
	}, [user, reset]);

	const onSubmit = async (data: UserForm) => {
		if (!user) return;
		try {
			const res = await callApi<User>({
				method: "PUT",
				url: API_ENDPOINTS.ADMIN.UPDATE(String(user.id)),
				data: {
					...data,
					dateOfBirth: data.dateOfBirth
						? data.dateOfBirth.toISOString()
						: undefined,
					password: data.password || undefined, // Only send if provided
				},
			});
			const updated = (res as any).user ?? (res as any).data ?? res;
			onSaved(updated as User);
			onClose();
		} catch (err) {
			console.error("Failed to update user", err);
		}
	};

	const handleTogglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
				<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
					Edit User
					<IconButton aria-label="close" onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<Divider />
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent sx={{ pt: 3 }}>
						<Grid container spacing={3}>
							{/* Account Information Section */}
							<Grid size={{ xs: 12 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
											fullWidth
											error={!!errors.userName}
											helperText={errors.userName?.message}
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
											fullWidth
											error={!!errors.role}
											helperText={errors.role?.message}
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
											<MenuItem value={Role.USER}>User</MenuItem>
											<MenuItem value={Role.ADMIN}>Admin</MenuItem>
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
											type="email"
											fullWidth
											error={!!errors.email}
											helperText={errors.email?.message}
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
											type={showPassword ? "text" : "password"}
											fullWidth
											error={!!errors.password}
											helperText={
												errors.password?.message ||
												"Leave blank to keep current password"
											}
											slotProps={{
												input: {
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																onClick={handleTogglePasswordVisibility}
																edge="end"
															>
																{showPassword ? <VisibilityOff /> : <Visibility />}
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
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
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
											fullWidth
											error={!!errors.firstName}
											helperText={errors.firstName?.message}
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
											fullWidth
											error={!!errors.lastName}
											helperText={errors.lastName?.message}
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
											fullWidth
											error={!!errors.phoneNumber}
											helperText={errors.phoneNumber?.message}
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
											value={field.value ? new Date(field.value) : null}
											onChange={(newValue) => field.onChange(newValue)}
											slotProps={{
												textField: {
													fullWidth: true,
													error: !!errors.dateOfBirth,
													helperText: errors.dateOfBirth?.message as string,
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
											{Object.values(VehicleStatus).map((status) => (
												<MenuItem key={status} value={status}>
													{status.charAt(0).toUpperCase() +
														status.slice(1).toLowerCase()}
												</MenuItem>
											))}
										</TextField>
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
											value={field.value || ""}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}>
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
					<DialogActions sx={{ p: 2 }}>
						<Button onClick={onClose} color="inherit" disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
							startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
							sx={{ px: 4 }}
						>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</LocalizationProvider>
	);
};

export default EditUserForm;