import { useEffect, useRef, useState } from "react";
import { CouponType, type Coupon } from "@my-types";
import { API_ENDPOINTS } from "@constants/index";
import axios from "axios";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
	IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Stack } from "@mui/system";
import { Clear } from "@mui/icons-material";
import buildImgUrl, { isSafeImageSrc } from "@utils/imageHelper";
import callApi from "@utils/apiCaller";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponFormData } from "@schemas/couponSchema";

axios.defaults.withCredentials = true;

interface CouponFormProps {
	open: boolean;
	onClose: () => void;
	onSuccess: (message?: string) => void;
	initialData?: Coupon | null;
}

/**
 * Renders the modal dialog that lets admin users create or edit coupons.
 */
const CouponForm: React.FC<CouponFormProps> = ({
	open,
	onClose,
	onSuccess,
	initialData,
}) => {
	const isEditMode = !!initialData;
	const [serverError, setServerError] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CouponFormData>({
		resolver: zodResolver(
			couponSchema
		) as unknown as Resolver<CouponFormData>,
		defaultValues: {
			code: "",
			title: "",
			description: "",
			value: 0,
			type: CouponType.PERCENTAGE,
			startPeriod: new Date(),
			endPeriod: new Date(),
			maxUsage: 1,
			isActive: true,
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!("files" in e.target)) return;
		const file = e.target.files?.[0] ?? null;
		// restrict preview to image files only
		if (file && !file.type.startsWith("image/")) {
			setImageFile(null);
			setPreviewUrl(null);
			setImageError("Selected file is not a valid image.");
			return;
		}
		setImageFile(file);

		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);
			setImageError(null);
		} else {
			setPreviewUrl(null);
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	useEffect(() => {
		if (open) {
			if (isEditMode && initialData) {
				reset({
					code: initialData.code,
					title: initialData.title ?? "",
					description: initialData.description ?? "",
					value: initialData.value,
					type: initialData.type as CouponType,
					startPeriod: new Date(initialData.startPeriod),
					endPeriod: new Date(initialData.endPeriod),
					maxUsage: initialData.maxUsage,
					isActive: initialData.isActive,
				});
				if (initialData.imgUrl && isSafeImageSrc(initialData.imgUrl)) {
					setPreviewUrl(initialData.imgUrl);
				}
			} else {
				reset({
					code: "",
					title: "",
					description: "",
					value: 0,
					type: CouponType.PERCENTAGE,
					startPeriod: new Date(),
					endPeriod: new Date(),
					maxUsage: 1,
					isActive: true,
				});
				setImageFile(null);
				setPreviewUrl(null);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			}
		}
	}, [open, isEditMode, initialData, reset]);

	// Cleanup object URL to avoid memory leaks
	useEffect(() => {
		return () => {
			if (previewUrl && previewUrl.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const onSubmit = async (data: CouponFormData) => {
		setServerError(null);

		try {
			const payload = new FormData();
			payload.append("code", data.code);
			payload.append("title", data.title);
			payload.append("description", data.description || "");
			payload.append("value", String(data.value));
			payload.append("type", data.type);
			payload.append("maxUsage", String(data.maxUsage));
			payload.append("isActive", String(data.isActive));

			if (data.startPeriod) {
				payload.append("startPeriod", data.startPeriod.toISOString());
			}
			if (data.endPeriod) {
				payload.append("endPeriod", data.endPeriod.toISOString());
			}

			if (imageFile) {
				payload.append("image", imageFile);
			}

			if (isEditMode && initialData) {
				await callApi({
					method: "PUT",
					url: API_ENDPOINTS.COUPON.UPDATE(initialData.id),
					data: payload,
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				await callApi({
					method: "POST",
					url: API_ENDPOINTS.COUPON.BASE,
					data: payload,
					headers: { "Content-Type": "multipart/form-data" },
				});
			}

			onSuccess(
				isEditMode
					? "Coupon updated successfully"
					: "Coupon created successfully"
			);
			onClose();
		} catch (err: any) {
			setServerError(err?.message || "An error occurred");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				{isEditMode ? "Edit Coupon" : "Add New Coupon"}
			</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}

					<Grid container spacing={2}>
						{/* Title */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="title"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Title"
										fullWidth
										error={!!errors.title}
										helperText={errors.title?.message}
									/>
								)}
							/>
						</Grid>

						{/* Code */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="code"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Code"
										fullWidth
										onChange={(e) =>
											field.onChange(
												e.target.value.toUpperCase()
											)
										}
										error={!!errors.code}
										helperText={errors.code?.message}
									/>
								)}
							/>
						</Grid>

						{/* Type */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<FormControl fullWidth>
										<InputLabel>Type</InputLabel>
										<Select {...field} label="Type">
											<MenuItem
												value={CouponType.PERCENTAGE}
											>
												Percentage
											</MenuItem>
											<MenuItem value={CouponType.FIXED}>
												Fixed Amount
											</MenuItem>
										</Select>
									</FormControl>
								)}
							/>
						</Grid>

						{/* Value */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="value"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Value"
										type="number"
										fullWidth
										slotProps={{
											input: {
												endAdornment: (
													<InputAdornment position="end">
														{control._formValues
															.type ===
														CouponType.PERCENTAGE
															? "%"
															: "VND"}
													</InputAdornment>
												),
											},
										}}
										error={!!errors.value}
										helperText={errors.value?.message}
									/>
								)}
							/>
						</Grid>

						{/* Start Period */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="startPeriod"
								control={control}
								render={({ field }) => (
									<LocalizationProvider
										dateAdapter={AdapterDateFns}
									>
										<DateTimePicker
											label="Start Period"
											value={field.value}
											onChange={(newValue) =>
												field.onChange(newValue)
											}
											slotProps={{
												textField: {
													fullWidth: true,
													error: !!errors.startPeriod,
													helperText:
														errors.startPeriod
															?.message,
												},
											}}
										/>
									</LocalizationProvider>
								)}
							/>
						</Grid>

						{/* End Period */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="endPeriod"
								control={control}
								render={({ field }) => (
									<LocalizationProvider
										dateAdapter={AdapterDateFns}
									>
										<DateTimePicker
											label="End Period"
											value={field.value}
											onChange={(newValue) =>
												field.onChange(newValue)
											}
											slotProps={{
												textField: {
													fullWidth: true,
													error: !!errors.endPeriod,
													helperText:
														errors.endPeriod
															?.message,
												},
											}}
										/>
									</LocalizationProvider>
								)}
							/>
						</Grid>

						{/* Max Usage */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="maxUsage"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Max Usage"
										type="number"
										fullWidth
										error={!!errors.maxUsage}
										helperText={errors.maxUsage?.message}
									/>
								)}
							/>
						</Grid>

						{/* Is Active */}
						<Grid
							size={{ xs: 12, sm: 6 }}
							sx={{ display: "flex", alignItems: "center" }}
						>
							<Controller
								name="isActive"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={(e) =>
													field.onChange(
														e.target.checked
													)
												}
											/>
										}
										label="Is Active"
									/>
								)}
							/>
						</Grid>

						{/* Description */}
						<Grid size={{ xs: 12 }}>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Description"
										fullWidth
										multiline
										rows={3}
										error={!!errors.description}
										helperText={errors.description?.message}
									/>
								)}
							/>
						</Grid>

						{/* Image Upload */}
						<Grid size={{ xs: 12 }}>
							<Typography variant="subtitle2" gutterBottom>
								Coupon Image
							</Typography>
							<Stack
								direction="row"
								spacing={2}
								alignItems="center"
							>
								<Button variant="outlined" component="label">
									Upload Image
									<input
										type="file"
										hidden
										accept="image/*"
										ref={fileInputRef}
										onChange={handleFileChange}
									/>
								</Button>
								{previewUrl && (
									<Box
										sx={{
											position: "relative",
											display: "inline-block",
										}}
									>
										<Box
											component="img"
											src={buildImgUrl(previewUrl)}
											alt="Preview"
											sx={{
												width: 100,
												height: 60,
												objectFit: "cover",
												borderRadius: 1,
												border: "1px solid #ccc",
											}}
										/>
										<IconButton
											size="small"
											onClick={handleRemoveImage}
											sx={{
												position: "absolute",
												top: -8,
												right: -8,
												bgcolor: "background.paper",
												boxShadow: 1,
												"&:hover": {
													bgcolor: "error.light",
													color: "white",
												},
											}}
										>
											<Clear fontSize="small" />
										</IconButton>
									</Box>
								)}
							</Stack>
							{imageError && (
								<FormHelperText error>
									{imageError}
								</FormHelperText>
							)}
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting
							? "Saving..."
							: isEditMode
							? "Update"
							: "Create"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CouponForm;
