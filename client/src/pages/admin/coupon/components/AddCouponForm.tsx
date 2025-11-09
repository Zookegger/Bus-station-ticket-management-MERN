import { useEffect, useState } from "react";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers";
import { isValid } from "date-fns";

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

	/**
	 * Resets the form state whenever the dialog closes so the next open starts fresh.
	 */
	const resetForm = (): void => {
		setFormData({ ...INITIAL_FORM_STATE });
		setErrors({});
		setServerError(null);
	};

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

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
				imgUrl: formData.imgUrl?.trim() || undefined,
				title: formData.title?.trim() || undefined,
			};

			const response = await axios.post(
				API_ENDPOINTS.COUPON.ADD,
				payload
			);
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
				<DialogTitle>Add New Coupon</DialogTitle>
				<DialogContent>
					<Box component="form" p={1} onSubmit={handleSubmit}>
						{serverError && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{serverError}
							</Alert>
						)}

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12, md: 6 }}>
								<FormControl
									fullWidth
									required
									error={!!errors.maxUsage}
								>
									<TextField
										label="Max usage"
										type="number"
										value={formData.maxUsage ?? 1}
										slotProps={{ htmlInput: { min: 1 } }}
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

							<Grid size={{ xs: 12, md: 6 }} display={"flex"}>
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
									/>
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12, md: 6 }}>
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

							<Grid size={{ xs: 12 }}>
								<FormControl  fullWidth error={!!errors.imgUrl}>
									{/* <InputLabel id="coupon-img-label"  label="Image URL" ></InputLabel> */}
									<TextField
										label="Image Upload"
										slotProps={{ inputLabel: { shrink: true }}}
										type="file"

										variant="outlined"
										placeholder="https://cdn.example.com/coupons/summer.jpg"
										value={formData.imgUrl ?? ""}
										onChange={(event) =>
											handleInputChange(
												"imgUrl",
												event.target.value
											)
										}
									/>
									{errors.imgUrl && (
										<FormHelperText>
											{errors.imgUrl}
										</FormHelperText>
									)}
								</FormControl>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<FormControl
									fullWidth
									error={!!errors.description}
								>
									<TextField
										label="Description"
										placeholder="Describe when and how this coupon should be used"
										value={formData.description ?? ""}
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
					</Box>
				</DialogContent>
			</Dialog>
		</LocalizationProvider>
	);
};

export default AddCouponForm;
