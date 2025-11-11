import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { AddCouponFormProps } from "./types/Props";
import { COUPON_TYPES, type AddCouponDTO } from "@my-types";
import { API_ENDPOINTS } from "@constants";
import { handleAxiosError } from "@utils/handleError";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers";
import { isValid } from "date-fns";
import { Stack } from "@mui/system";
import { Clear } from "@mui/icons-material";

axios.defaults.withCredentials = true;

/**
 * Internal shape used to keep the form state strongly typed while allowing optional fields.
 */
type AddCouponFormState = Partial<AddCouponDTO> & {
	isActive: boolean;
	maxUsage: number;
};

/**
 * Default values applied whenever the dialog opens or resets.
 */
const INITIAL_FORM_STATE: AddCouponFormState = {
	code: "",
	value: undefined,
	startPeriod: "",
	endPeriod: "",
	maxUsage: 1,
	isActive: true,
	description: "",
	imgUrl: "",
	title: "",
};

/**
 * Collection of validation errors indexed by form field name.
 */
type FormErrorState = Partial<
	Record<keyof AddCouponFormState | "general", string>
>;

/**
 * Renders the modal dialog that lets admin users create new coupons.
 */
const AddCouponForm: React.FC<AddCouponFormProps> = ({
	open,
	onClose,
	onCreated,
}) => {
	const [errors, setErrors] = useState<FormErrorState>({});
	const [formData, setFormData] = useState<AddCouponFormState>({
		...INITIAL_FORM_STATE,
	});
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!("files" in e.target)) return;
		const file = e.target.files?.[0] ?? null;
		// restrict preview to image files only
		if (file && !file.type.startsWith("image/")) {
			setImageFile(null);
			setPreviewUrl(null);
			setErrors((prev) => ({
				...prev,
				imgUrl: "Selected file is not a valid image.",
			}));
			return;
		}
		setImageFile(file);
	};

	useEffect(() => {
		if (!imageFile) {
			setPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(imageFile);
		setPreviewUrl(url);
		console.log(previewUrl);
		return () => URL.revokeObjectURL(url);
	}, [imageFile]);

	/**
	 * Resets the form state whenever the dialog closes so the next open starts fresh.
	 */
	const resetForm = (): void => {
		setFormData({ ...INITIAL_FORM_STATE });
		setImageFile(null);
		setPreviewUrl(null);
		setErrors({});
		setServerError(null);
	};

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	const clearImage = () => {
		setImageFile(null);
		setPreviewUrl(null);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	/**
	 * Generic handler that keeps local state in sync with text, number, or boolean inputs.
	 */
	const handleInputChange = (
		field: keyof AddCouponFormState,
		value: string | number | boolean | undefined
	): void => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (errors[field]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}

		if (serverError) {
			setServerError(null);
		}
	};

	/**
	 * Normalises date changes from the picker before persisting in state.
	 */
	const handleDateChange = (
		field: "startPeriod" | "endPeriod",
		newValue: Date | null
	): void => {
		if (newValue && isValid(newValue)) {
			handleInputChange(field, newValue.toISOString());
		} else {
			handleInputChange(field, undefined);
		}
	};

	/**
	 * Validates the current form snapshot before attempting submission.
	 */
	const validateForm = (): boolean => {
		const nextErrors: FormErrorState = {};

		if (!formData.title || !formData.title.trim()) {
			nextErrors.title = "Coupon title is required.";
		}

		if (!formData.code || !formData.code.trim()) {
			nextErrors.code = "Coupon code is required.";
		}

		if (!formData.type) {
			nextErrors.type = "Pick a coupon type.";
		}

		if (formData.value == null || Number.isNaN(Number(formData.value))) {
			nextErrors.value = "Enter a valid coupon value.";
		} else if (formData.type === "percentage") {
			const value = Number(formData.value);
			if (value < 0 || value > 100) {
				nextErrors.value = "Percentage must be between 0 and 100.";
			}
		} else if (formData.type === "fixed") {
			if (Number(formData.value) <= 0) {
				nextErrors.value = "Fixed discount must be greater than 0.";
			}
		}

		if (!formData.startPeriod) {
			nextErrors.startPeriod = "Start date is required.";
		}

		if (!formData.endPeriod) {
			nextErrors.endPeriod = "End date is required.";
		}

		if (formData.startPeriod && formData.endPeriod) {
			const startDate = new Date(formData.startPeriod);
			const endDate = new Date(formData.endPeriod);

			if (!isValid(startDate)) {
				nextErrors.startPeriod = "Start date is invalid.";
			}

			if (!isValid(endDate)) {
				nextErrors.endPeriod = "End date is invalid.";
			}

			if (
				isValid(startDate) &&
				isValid(endDate) &&
				startDate >= endDate
			) {
				nextErrors.endPeriod = "End date must be after the start date.";
			}
		}

		if (!formData.maxUsage || Number(formData.maxUsage) < 1) {
			nextErrors.maxUsage = "Max usage must be at least 1.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	/**
	 * Handles the submit event by validating inputs and calling the backend API.
	 */
	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault(); // Prevent page reload.

		try {
			if (!validateForm()) {
				return;
			}

			setIsSubmitting(true);
			setServerError(null);

			const payload: AddCouponDTO = {
				code: formData.code!.trim(),
				type: formData.type!,
				value: Number(formData.value),
				maxUsage: Number(formData.maxUsage),
				startPeriod: new Date(
					formData.startPeriod as string
				).toISOString(),
				endPeriod: new Date(formData.endPeriod as string).toISOString(),
				isActive: formData.isActive,
				description: formData.description?.trim() || undefined,
				title: formData.title?.trim() || undefined,
			};

			let response;

			// If a file is selected, send multipart/form-data so multer can read req.file
			if (imageFile) {
				const formData = new FormData();
				Object.entries(payload).forEach(([k, v]) =>
					formData.append(k, v)
				);

				formData.append("file", imageFile, imageFile.name);

				response = await axios.post(API_ENDPOINTS.COUPON.ADD, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			} else {
				response = await axios.post(API_ENDPOINTS.COUPON.ADD, payload);
			}

			onCreated?.(response.data);
			resetForm();
			onClose();
		} catch (error: unknown) {
			const handled_error = handleAxiosError(error);
			setServerError(handled_error.message);

			if (handled_error.field_errors) {
				setErrors((prev) => ({
					...prev,
					...handled_error.field_errors,
				}));
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const displayValue =
		formData.value !== undefined && formData.value !== null
			? formData.type === "percentage"
				? String(formData.value)
				: Number(formData.value).toLocaleString("vi-VN")
			: "";

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<Box component="form" p={1} onSubmit={handleSubmit}>
					<DialogTitle>
						<Box
							display={"flex"}
							flexDirection={"row"}
							justifyContent={"space-between"}
							alignItems={"center"}
						>
							<Typography variant="h5" fontWeight={"600"}>
								Add New Coupon
							</Typography>
							<FormControl
								sx={{
									alignItems: "center",
									justifyContent: "center",
								}}
								error={!!errors.isActive}
							>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.isActive}
											onChange={(event) =>
												handleInputChange(
													"isActive",
													event.target.checked
												)
											}
										/>
									}
									label="Active"
									sx={{ margin: 0 }}
								/>
							</FormControl>
						</Box>
					</DialogTitle>
					<DialogContent>
						{serverError && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{serverError}
							</Alert>
						)}

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.title}
								>
									<TextField
										label="Title"
										placeholder="Summer Flash Sale"
										value={formData.title ?? ""}
										onChange={(event) =>
											handleInputChange(
												"title",
												event.target.value
											)
										}
									/>
									{errors.title && (
										<FormHelperText>
											{errors.title}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.code}
								>
									<TextField
										label="Coupon code"
										placeholder="SUMMER24"
										value={formData.code ?? ""}
										onChange={(event) =>
											handleInputChange(
												"code",
												event.target.value.toUpperCase()
											)
										}
										slotProps={{
											htmlInput: { maxLength: 32 },
										}}
									/>
									{errors.code && (
										<FormHelperText>
											{errors.code}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.type}
								>
									<InputLabel id="coupon-type-label">
										Coupon type
									</InputLabel>
									<Select
										labelId="coupon-type-label"
										label="Coupon type"
										value={formData.type ?? ""}
										onChange={(event) => {
											handleInputChange(
												"type",
												event.target
													.value as AddCouponDTO["type"]
											);

											if (formData.value !== undefined) {
												const numericValue = Number(
													formData.value
												);

												if (
													event.target.value ===
														"percentage" &&
													numericValue > 100
												) {
													handleInputChange(
														"value",
														100
													);
												}
											}
										}}
									>
										{COUPON_TYPES.map((type) => (
											<MenuItem key={type} value={type}>
												{type.charAt(0).toUpperCase() +
													type.slice(1).toLowerCase()}
											</MenuItem>
										))}
									</Select>
									{errors.type && (
										<FormHelperText>
											{errors.type}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.value}
								>
									<TextField
										label="Discount value"
										disabled={!formData.type}
										value={displayValue}
										onChange={(event) => {
											const raw =
												event.target.value.replace(
													/[^\d]/g,
													""
												);
											let nextValue = raw
												? Number(raw)
												: 0;

											if (
												formData.type === "percentage"
											) {
												nextValue = Math.max(
													0,
													Math.min(100, nextValue)
												);
											} else {
												nextValue = Math.max(
													0,
													nextValue
												);
											}

											handleInputChange(
												"value",
												nextValue
											);
										}}
										slotProps={{
											input: {
												endAdornment: (
													<InputAdornment position="end">
														{formData.type ===
														"percentage"
															? "%"
															: "đ"}
													</InputAdornment>
												),
												inputMode: "numeric",
											},
										}}
										helperText={
											!formData.type
												? "Select the coupon type first."
												: errors.value
										}
									/>
									{errors.value && (
										<FormHelperText>
											{errors.value}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.startPeriod}
								>
									<DateTimePicker
										label="Start period"
										format="dd/MM/yyyy - hh:mm aa"
										value={
											formData.startPeriod
												? new Date(formData.startPeriod)
												: null
										}
										onChange={(value) =>
											handleDateChange(
												"startPeriod",
												value
											)
										}
									/>

									{errors.startPeriod && (
										<FormHelperText>
											{errors.startPeriod}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.endPeriod}
								>
									<DateTimePicker
										label="End period"
										format="dd/MM/yyyy - hh:mm aa"
										value={
											formData.endPeriod
												? new Date(formData.endPeriod)
												: null
										}
										onChange={(value) =>
											handleDateChange("endPeriod", value)
										}
									/>
									{errors.endPeriod && (
										<FormHelperText>
											{errors.endPeriod}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, sm: 6 }}>
								<Stack rowGap={2} flex={1}>
									<Grid flexGrow={1} sx={{ maxHeight: 56 }}>
										<FormControl
											fullWidth
											required
											error={!!errors.maxUsage}
										>
											<TextField
												label="Max usage"
												type="number"
												value={formData.maxUsage ?? 1}
												slotProps={{
													htmlInput: { min: 1 },
												}}
												onChange={(event) => {
													const parsed = Number(
														event.target.value
													);
													handleInputChange(
														"maxUsage",
														Math.max(1, parsed)
													);
												}}
											/>
											{errors.maxUsage && (
												<FormHelperText>
													{errors.maxUsage}
												</FormHelperText>
											)}
										</FormControl>
									</Grid>

									<Grid flexGrow={1}>
										<FormControl
											fullWidth
											error={!!errors.description}
											sx={{ flex: 1 }}
										>
											<TextField
												label="Description"
												placeholder="Describe when and how this coupon should be used"
												value={
													formData.description ?? ""
												}
												onChange={(event) =>
													handleInputChange(
														"description",
														event.target.value
													)
												}
												multiline
												minRows={3}
											/>
											{errors.description && (
												<FormHelperText>
													{errors.description}
												</FormHelperText>
											)}
										</FormControl>
									</Grid>
								</Stack>
							</Grid>

							<Grid container size={{ xs: 12, sm: 6 }}>
								<Stack rowGap={2} flex={1}>
									<Grid flexGrow={1} sx={{ maxHeight: 56 }}>
										<FormControl
											fullWidth
											error={!!errors.imgUrl}
										>
											<TextField
												inputRef={fileInputRef}
												label="Image Upload"
												slotProps={{
													inputLabel: {
														shrink: true,
													},
													input: {
														endAdornment:
															imageFile &&
																previewUrl && (
																	<Button sx={{ minWidth:'25px', width: '25px', p: 0 }} variant="outlined" color="error" onClick={clearImage}><Clear/></Button>
																),
													},
												}}
												type="file"
												variant="outlined"
												accept="image/*"
												placeholder="https://cdn.example.com/coupons/summer.jpg"
												onChange={(event) => {
													handleFileChange(
														event as React.ChangeEvent<HTMLInputElement>
													);
												}}
											/>
											{errors.imgUrl && (
												<FormHelperText>
													{errors.imgUrl}
												</FormHelperText>
											)}
										</FormControl>
									</Grid>

									<Grid
										flexGrow={1}
										display={"flex"}
										justifyContent={"center"}
										alignItems={"center"}
									>
										<img
											src={previewUrl || ""}
											width={"100%"}
											height={"100%"}
											alt="No image uploaded"
										/>
									</Grid>
								</Stack>
							</Grid>
						</Grid>

						<DialogActions sx={{ px: 0, pt: 3 }}>
							<Button onClick={onClose} color="inherit">
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Creating..." : "Create coupon"}
							</Button>
						</DialogActions>
					</DialogContent>
				</Box>
			</Dialog>
		</LocalizationProvider>
	);
};

export default AddCouponForm;
