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
	InputAdornment,
} from "@mui/material";
import { Gender, type User } from "@my-types/user";
import { Role } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@schemas/userSchema";
import type { UserForm } from "@schemas/userSchema";
import { Password as PasswordIcon } from "@mui/icons-material";

interface Props {
	open: boolean;
	user: User | null;
	onClose: () => void;
	onSaved: (updated: User) => void;
}

const EditUserForm: React.FC<Props> = ({ open, user, onClose, onSaved }) => {
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

	const [formError, setFormError] = useState<Record<string, string> | string | null>();

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
		} catch (err: any) {
			console.error("Failed to update user", err);
			// capture server-side validation errors (object) or message
			setFormError(err?.response?.data ?? err?.message ?? err);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle sx={{ pb: 1 }}>Edit User</DialogTitle>
			<Divider />
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent sx={{ pt: 3 }}>
					<Grid container spacing={3}>
						{/* Account Information Section */}
						<Grid size={{ xs: 12 }}>
							<Typography
								variant="subtitle1"
								fontWeight="bold"
								color="primary"
							>
								Account Information
							</Typography>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="userName"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Username"
										placeholder="e.g. jdoe"
										fullWidth
										error={
											!!errors.userName ||
											(!!formError && typeof formError === "object" && !!formError.userName)
										}
										helperText={
											errors.userName?.message ||
											(formError && typeof formError === "object" ? formError.userName : undefined)
										}
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
										placeholder="e.g. user@example.com"
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
										placeholder="Leave blank to keep current password"
										type="password"
										fullWidth
										error={
											!!errors.password ||
											(!!formError && typeof formError === "object" && !!formError.password)
										}
										helperText={
											errors.password?.message ||
											(formError && typeof formError === "object" ? formError.password : undefined) ||
											"Leave blank to keep current password"
										}
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<PasswordIcon />
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
							<Box mt={1}>
								<Typography
									variant="subtitle1"
									fontWeight="bold"
									color="primary"
								>
									Personal Details
								</Typography>
							</Box>
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
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="dateOfBirth"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Date of Birth"
										type="date"
										fullWidth
										slotProps={{
											inputLabel: { shrink: true },
										}}
										error={!!errors.dateOfBirth}
										helperText={
											errors.dateOfBirth
												?.message as string
										}
										value={
											field.value
												? new Date(field.value)
														.toISOString()
														.split("T")[0]
												: ""
										}
										onChange={(e) =>
											field.onChange(
												e.target.value
													? new Date(e.target.value)
													: null
											)
										}
										inputProps={{
											placeholder: "YYYY-MM-DD",
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
									>
										{Object.values(Gender).map((v, k) => {
											return (
												<MenuItem key={k} value={v}>
													{v.charAt(0).toUpperCase() +
														v
															.slice(1)
															.toLowerCase()}
												</MenuItem>
											);
										})}
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
										placeholder="Street, City, Country"
										fullWidth
										multiline
										rows={2}
										error={
											!!errors.address ||
											(!!formError && typeof formError === "object" && !!formError.address)
										}
										helperText={
											errors.address?.message ||
											(formError && typeof formError === "object" ? formError.address : undefined)
										}
										value={field.value || ""}
									/>
								)}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting}
						sx={{ px: 4 }}
					>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditUserForm;
