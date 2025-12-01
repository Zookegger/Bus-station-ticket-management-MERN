import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Stack,
} from "@mui/material";
import { Gender, type User } from "@my-types/user";
import { Role } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@schemas/userSchema";
import type { UserForm } from "@schemas/userSchema";

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

	useEffect(() => {
		if (user) {
			reset({
				email: user.email,
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				userName: user.userName,
				phoneNumber: user.phoneNumber || "",
				role: user.role as any, // Cast because of potential type mismatch in existing code
				password: "", // Don't populate password
				address: user.address || "",
				gender: (user.gender as unknown as Gender) || Gender.OTHER,
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

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Edit User</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<Stack direction="row" spacing={2}>
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
									/>
								)}
							/>
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
									/>
								)}
							/>
						</Stack>
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
								/>
							)}
						/>
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
								/>
							)}
						/>
						<Controller
							name="phoneNumber"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Phone"
									fullWidth
									error={!!errors.phoneNumber}
									helperText={errors.phoneNumber?.message}
								/>
							)}
						/>
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
								>
									<MenuItem value={Role.USER}>User</MenuItem>
									<MenuItem value={Role.ADMIN}>
										Admin
									</MenuItem>
								</TextField>
							)}
						/>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Password"
									type="password"
									fullWidth
									error={!!errors.password}
									helperText={
										errors.password?.message ||
										"Leave blank to keep current password"
									}
								/>
							)}
						/>
						<Controller
							name="address"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Address"
									fullWidth
									error={!!errors.address}
									helperText={errors.address?.message}
									value={field.value || ""}
								/>
							)}
						/>
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
									<MenuItem value={Gender.MALE}>
										Male
									</MenuItem>
									<MenuItem value={Gender.FEMALE}>
										Female
									</MenuItem>
									<MenuItem value={Gender.OTHER}>
										Other
									</MenuItem>
								</TextField>
							)}
						/>
						<Controller
							name="dateOfBirth"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Date of Birth"
									type="date"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									error={!!errors.dateOfBirth}
									helperText={
										errors.dateOfBirth?.message as string
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
								/>
							)}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting}
					>
						Save
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditUserForm;
