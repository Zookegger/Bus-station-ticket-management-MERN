import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Alert,
	CircularProgress,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Avatar,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { callApi } from "@utils/apiCaller";
import { API_ENDPOINTS, APP_CONFIG } from "@constants/index";
import { driverSchema, type DriverFormData } from "@schemas/driverSchema";
import type { Driver } from "@my-types/driver";
import { DriverStatus, Gender } from "@my-types";
import { formatDateForInput } from "@utils/formatting";

interface DriverFormProps {
	open: boolean;
	onClose: () => void;
	initialData?: Driver;
	onSaved?: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({
	open,
	onClose,
	initialData,
	onSaved,
}) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		formState: { errors, isSubmitting },
		setError,
	} = useForm({
		resolver: zodResolver(driverSchema),
		defaultValues: {
			gender: Gender.OTHER,
			status: DriverStatus.ACTIVE,
		},
	});

	const [serverError, setServerError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	// Watch avatar to update preview
	const avatarValue = watch("avatar");

	useEffect(() => {
		if (avatarValue instanceof FileList && avatarValue.length > 0) {
			const file = avatarValue[0];
			const url = URL.createObjectURL(file);
			setPreview(url);
			return () => URL.revokeObjectURL(url);
		} else if (typeof avatarValue === "string") {
			setPreview(
				avatarValue.startsWith("http")
					? avatarValue
					: `${APP_CONFIG.serverBaseUrl}${avatarValue}`
			);
		} else {
			setPreview(null);
		}
	}, [avatarValue]);

	useEffect(() => {
		if (open) {
			setServerError(null);
			if (initialData) {
				// Map initial data to form values
				const formattedData: Record<string, unknown> = {
					...initialData,
					fullname: initialData.fullname ?? "",
					email: initialData.email ?? "",
					phoneNumber: initialData.phoneNumber ?? "",
					citizenId: initialData.citizenId ?? "",
					address: initialData.address ?? "",
					dateOfBirth: formatDateForInput(initialData.dateOfBirth),
					hiredAt: formatDateForInput(initialData.hiredAt),
					licenseNumber: initialData.licenseNumber ?? "",
					licenseCategory: initialData.licenseCategory ?? "",
					licenseIssueDate: formatDateForInput(
						initialData.licenseIssueDate
					),
					licenseExpiryDate: formatDateForInput(
						initialData.licenseExpiryDate
					),
					issuingAuthority: initialData.issuingAuthority ?? "",
					status: initialData.status || DriverStatus.ACTIVE,
					avatar: initialData.avatar,
				};
				reset(formattedData);
				if (initialData.avatar) {
					setPreview(
						initialData.avatar.startsWith("http")
							? initialData.avatar
							: `${APP_CONFIG.serverBaseUrl}${initialData.avatar}`
					);
				}
			} else {
				reset({
					gender: Gender.OTHER,
					fullname: "",
					email: "",
					phoneNumber: "",
					citizenId: "",
					address: "",
					licenseNumber: "",
					licenseCategory: "",
					issuingAuthority: "",
					status: DriverStatus.ACTIVE,
					dateOfBirth: "",
					hiredAt: "",
					licenseIssueDate: "",
					licenseExpiryDate: "",
					avatar: undefined,
				});
				setPreview(null);
			}
		}
	}, [open, initialData, reset]);

	const onSubmit = async (data: DriverFormData) => {
		setServerError(null);
		try {
			const formData = new FormData();

			// Append all fields to FormData
			Object.entries(data).forEach(([key, value]) => {
				if (key === "avatar") {
					// Only append if it's a file (new upload)
					if (value instanceof FileList && value.length > 0) {
						formData.append("avatar", value[0]);
					}
					// If it's a string (existing URL), we don't need to send it for update
					// unless we want to clear it (not handled here)
				} else if (
					value !== null &&
					value !== undefined &&
					value !== ""
				) {
					formData.append(key, String(value));
				}
			});

			if (initialData?.id) {
				await callApi({
					method: "PUT",
					url: API_ENDPOINTS.DRIVER.UPDATE(initialData.id),
					data: formData,
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				await callApi({
					method: "POST",
					url: API_ENDPOINTS.DRIVER.CREATE,
					data: formData,
					headers: { "Content-Type": "multipart/form-data" },
				});
			}
			onSaved?.();
			onClose();
		} catch (err: any) {
			setServerError(err.message || "An error occurred");
			if (err.field_errors) {
				Object.entries(err.field_errors).forEach(([key, message]) => {
					setError(key as keyof DriverFormData, {
						type: "server",
						message: message as string,
					});
				});
			}
		}
	};

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason !== "backdropClick") onClose();
			}}
			fullWidth
			maxWidth="md"
		>
			<DialogTitle>
				{initialData ? "Edit Driver" : "Add New Driver"}
			</DialogTitle>
			<DialogContent>
				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					sx={{ mt: 1 }}
					noValidate
				>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<Stack spacing={3}>
						{/* Avatar Upload Section */}
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 2,
							}}
						>
							<Avatar
								src={preview || undefined}
								sx={{
									width: 100,
									height: 100,
									border: "1px solid #ccc",
								}}
							/>
							<Button
								component="label"
								variant="outlined"
								startIcon={<CloudUploadIcon />}
								size="small"
							>
								Upload Avatar
								<input
									type="file"
									hidden
									accept="image/*"
									{...register("avatar")}
								/>
							</Button>
							{errors.avatar && (
								<Typography color="error" variant="caption">
									{errors.avatar.message as string}
								</Typography>
							)}
						</Box>

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "primary.main" }}
						>
							Personal Information
						</Typography>

						<TextField
							label="Full Name"
							fullWidth
							required
							{...register("fullname")}
							error={!!errors.fullname}
							helperText={errors.fullname?.message}
						/>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="Date of Birth"
								type="date"
								fullWidth
								required
								slotProps={{ inputLabel: { shrink: true } }}
								{...register("dateOfBirth")}
								error={!!errors.dateOfBirth}
								helperText={errors.dateOfBirth?.message}
							/>

							<TextField
								label="Citizen ID"
								fullWidth
								required
								{...register("citizenId")}
								error={!!errors.citizenId}
								helperText={errors.citizenId?.message}
							/>
						</Stack>

						<TextField
							label="Address"
							fullWidth
							{...register("address")}
							error={!!errors.address}
							helperText={errors.address?.message}
						/>

						{/* Gender selector */}
						<FormControl fullWidth error={!!errors.gender}>
							<InputLabel>Gender</InputLabel>
							<Controller
								name="gender"
								control={control}
								render={({ field }) => (
									<Select {...field} label="Gender">
										{Object.values(Gender).map((g) => (
											<MenuItem key={String(g)} value={g}>
												{String(g)
													.charAt(0)
													.toUpperCase() +
													String(g)
														.slice(1)
														.toLowerCase()}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							<FormHelperText>
								{errors.gender?.message}
							</FormHelperText>
						</FormControl>

						<Divider />

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "primary.main" }}
						>
							Contact Information
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="Email"
								type="email"
								fullWidth
								required
								{...register("email")}
								error={!!errors.email}
								helperText={errors.email?.message}
							/>

							<TextField
								label="Phone Number"
								fullWidth
								required
								{...register("phoneNumber")}
								error={!!errors.phoneNumber}
								helperText={errors.phoneNumber?.message}
							/>
						</Stack>

						<Divider />

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "primary.main" }}
						>
							Employment & Status
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="Hired At"
								type="date"
								fullWidth
								slotProps={{ inputLabel: { shrink: true } }}
								{...register("hiredAt")}
								error={!!errors.hiredAt}
								helperText={errors.hiredAt?.message}
							/>

							<FormControl fullWidth error={!!errors.status}>
								<InputLabel>Status</InputLabel>
								<Controller
									name="status"
									control={control}
									render={({ field }) => (
										<Select {...field} label="Status">
											<MenuItem value="ACTIVE">
												Active
											</MenuItem>
											<MenuItem value="INACTIVE">
												Inactive
											</MenuItem>
											<MenuItem value="SUSPENDED">
												Suspended
											</MenuItem>
										</Select>
									)}
								/>
								<FormHelperText>
									{errors.status?.message}
								</FormHelperText>
							</FormControl>
						</Stack>

						{/* Status selection above replaces legacy boolean toggles. */}

						<Divider />

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "primary.main" }}
						>
							License Information
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<FormControl
								fullWidth
								error={!!errors.licenseNumber}
							>
								<TextField
									label="License Number"
									fullWidth
									required
									{...register("licenseNumber")}
									error={!!errors.licenseNumber}
									helperText={errors.licenseNumber?.message}
								/>
							</FormControl>

							<FormControl
								fullWidth
								required
								error={!!errors.licenseCategory}
							>
								<InputLabel>License Class</InputLabel>
								<Controller
									name="licenseCategory"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											label="License Class"
											value={field.value || ""}
										>
											<MenuItem value="" disabled>
												<em>Select a category</em>
											</MenuItem>
											{[
												"B1",
												"B2",
												"C",
												"D",
												"E",
												"F",
												"FC",
											].map((cat) => (
												<MenuItem key={cat} value={cat}>
													{cat}
												</MenuItem>
											))}
										</Select>
									)}
								/>
								<FormHelperText>
									{errors.licenseCategory?.message}
								</FormHelperText>
							</FormControl>
						</Stack>

						<TextField
							label="Issuing Authority"
							required
							fullWidth
							{...register("issuingAuthority")}
							error={!!errors.issuingAuthority}
							helperText={errors.issuingAuthority?.message}
						/>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="Issue Date"
								type="date"
								required
								fullWidth
								slotProps={{ inputLabel: { shrink: true } }}
								{...register("licenseIssueDate")}
								error={!!errors.licenseIssueDate}
								helperText={errors.licenseIssueDate?.message}
							/>

							<TextField
								label="Expiry Date"
								type="date"
								required
								fullWidth
								slotProps={{ inputLabel: { shrink: true } }}
								{...register("licenseExpiryDate")}
								error={!!errors.licenseExpiryDate}
								helperText={errors.licenseExpiryDate?.message}
							/>
						</Stack>
					</Stack>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					disabled={isSubmitting}
					variant="outlined"
					size="large"
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					disabled={isSubmitting}
					size="large"
					startIcon={isSubmitting && <CircularProgress size={20} />}
					onClick={handleSubmit(onSubmit)}
				>
					{isSubmitting
						? "Saving..."
						: initialData
						? "Save Changes"
						: "Add Driver"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DriverForm;
