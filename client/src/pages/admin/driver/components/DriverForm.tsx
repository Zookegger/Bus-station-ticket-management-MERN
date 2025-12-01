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
} from "@mui/material";
import axios from "axios";
import { handleAxiosError } from "@utils/handleError";
import type {
	CreateDriverDTO,
	UpdateDriverDTO,
	Driver,
} from "@my-types/driver";
import { API_ENDPOINTS } from "@constants/index";
import { MOCK_DRIVERS } from "@data/mockDrivers";
import { Gender } from "@my-types";

interface DriverCreateProps {
	open: boolean;
	onClose: () => void;
	initialData?: Driver;
	onSaved?: () => void;
}

type FormErrors = Partial<Record<keyof CreateDriverDTO | "general", string>>;

const INITIAL_FORM_STATE: CreateDriverDTO = {
	fullname: null,
	email: null,
	gender: Gender.MALE,
	phoneNumber: null,
	avatar: null,
	dateOfBirth: null,
	address: null,
	hiredAt: null,
	isActive: true,
	licenseNumber: null,
	licenseCategory: null,
	licenseIssueDate: null,
	licenseExpiryDate: null,
	issuingAuthority: null,
	isSuspended: false,
};

const DriverCreate: React.FC<DriverCreateProps> = ({
	open,
	onClose,
	initialData,
	onSaved,
}) => {
	const editingDriver = initialData as Driver | undefined;
	const [formData, setFormData] = useState<CreateDriverDTO>({
		...INITIAL_FORM_STATE,
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			if (editingDriver) {
				// Map server `Driver` shape to CreateDriverDTO (drop server-only fields)
				const mapped: CreateDriverDTO = {
					fullname: editingDriver.fullname ?? null,
					email: editingDriver.email ?? null,
					gender:
						editingDriver.gender ??
						(INITIAL_FORM_STATE.gender as any),
					phoneNumber: editingDriver.phoneNumber ?? null,
					avatar: editingDriver.avatar ?? null,
					dateOfBirth: editingDriver.dateOfBirth ?? null,
					address: editingDriver.address ?? null,
					hiredAt: editingDriver.hiredAt ?? null,
					isActive:
						typeof editingDriver.isActive === "boolean"
							? editingDriver.isActive
							: true,
					licenseNumber: editingDriver.licenseNumber ?? null,
					licenseCategory: editingDriver.licenseCategory ?? null,
					licenseIssueDate: editingDriver.licenseIssueDate ?? null,
					licenseExpiryDate: editingDriver.licenseExpiryDate ?? null,
					issuingAuthority: editingDriver.issuingAuthority ?? null,
					isSuspended:
						typeof editingDriver.isSuspended === "boolean"
							? editingDriver.isSuspended
							: false,
				};
				setFormData({ ...INITIAL_FORM_STATE, ...mapped });
			} else {
				setFormData({ ...INITIAL_FORM_STATE });
			}
			setErrors({});
			setServerError(null);
		}
	}, [open, editingDriver]);

	const handleInputChange = <K extends keyof CreateDriverDTO>(
		field: K,
		value: CreateDriverDTO[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if ((errors as any)[field]) {
			setErrors((prev) => {
				const next = { ...prev } as any;
				delete next[field as string];
				return next;
			});
		}
		if (serverError) setServerError(null);
	};

	const validateForm = (): boolean => {
		const next: FormErrors = {};
		if (!formData.fullname || !String(formData.fullname).trim()) {
			(next as any).fullname = "Full name is required.";
		}
		if (formData.phoneNumber && String(formData.phoneNumber).length > 16) {
			(next as any).phoneNumber =
				"Phone number must not exceed 16 characters.";
		}
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validateForm()) return;
		setIsSubmitting(true);
		setServerError(null);
		try {
			const payload: CreateDriverDTO | UpdateDriverDTO = {
				fullname: formData.fullname ?? null,
				email: formData.email ?? null,
				gender: formData.gender,
				phoneNumber: formData.phoneNumber ?? null,
				avatar: formData.avatar ?? null,
				dateOfBirth: formData.dateOfBirth ?? null,
				address: formData.address ?? null,
				hiredAt: formData.hiredAt ?? null,
				isActive:
					typeof formData.isActive === "boolean"
						? formData.isActive
						: true,
				licenseNumber: formData.licenseNumber ?? null,
				licenseCategory: formData.licenseCategory ?? null,
				licenseIssueDate: formData.licenseIssueDate ?? null,
				licenseExpiryDate: formData.licenseExpiryDate ?? null,
				issuingAuthority: formData.issuingAuthority ?? null,
				isSuspended:
					typeof formData.isSuspended === "boolean"
						? formData.isSuspended
						: false,
			};

			let response;
			if (editingDriver && editingDriver.id) {
				response = await axios.put(
					API_ENDPOINTS.DRIVER.UPDATE(editingDriver.id),
					payload as UpdateDriverDTO
				);
				// update mock fallback
				const idx = MOCK_DRIVERS.findIndex(
					(d) => d.id === editingDriver.id
				);
				if (idx >= 0)
					MOCK_DRIVERS[idx] = {
						...MOCK_DRIVERS[idx],
						...(payload as any),
					};
			} else {
				response = await axios.post(
					API_ENDPOINTS.DRIVER.CREATE,
					payload as CreateDriverDTO
				);
				MOCK_DRIVERS.push({ id: Date.now(), ...(payload as any) });
			}

			onSaved && onSaved();
			onClose();
		} catch (err: unknown) {
			const h = handleAxiosError(err);
			setServerError(h.message);
			if (h.field_errors)
				setErrors((prev) => ({ ...prev, ...(h.field_errors as any) }));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle>
				{editingDriver ? "Edit Driver" : "Add New Driver"}
			</DialogTitle>
			<DialogContent>
				<Box sx={{ p: 0 }} component={"form"} onSubmit={handleSubmit}>
					{serverError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{serverError}
						</Alert>
					)}
					<Stack spacing={3} sx={{ py: 1 }}>
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "#1565c0" }}
						>
							Personal Information
						</Typography>

						<TextField
							label="Full Name"
							fullWidth
							value={formData.fullname ?? ""}
							onChange={(e) =>
								handleInputChange("fullname", e.target.value)
							}
							error={!!errors.fullname}
							helperText={errors.fullname}
						/>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<FormControl fullWidth error={!!errors.gender}>
								<InputLabel>Gender</InputLabel>
								<Select
									value={formData.gender}
									label="Gender"
									onChange={(e) =>
										handleInputChange(
											"gender",
											e.target.value
										)
									}
								>
									<MenuItem value="MALE">Male</MenuItem>
									<MenuItem value="FEMALE">Female</MenuItem>
								</Select>
								<FormHelperText>{errors.gender}</FormHelperText>
							</FormControl>

							<TextField
								label="Date of Birth"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={formData.dateOfBirth ?? ""}
								onChange={(e) =>
									handleInputChange(
										"dateOfBirth",
										e.target.value
									)
								}
								error={!!errors.dateOfBirth}
								helperText={errors.dateOfBirth}
							/>
						</Stack>

						<TextField
							label="Address"
							fullWidth
							value={formData.address ?? ""}
							onChange={(e) =>
								handleInputChange("address", e.target.value)
							}
							error={!!errors.address}
							helperText={errors.address}
						/>

						<Divider />

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "#1565c0" }}
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
								value={formData.email ?? ""}
								onChange={(e) =>
									handleInputChange("email", e.target.value)
								}
								error={!!errors.email}
								helperText={errors.email}
							/>

							<TextField
								label="Phone Number"
								fullWidth
								value={formData.phoneNumber ?? ""}
								onChange={(e) =>
									handleInputChange(
										"phoneNumber",
										e.target.value
									)
								}
								error={!!errors.phoneNumber}
								helperText={
									errors.phoneNumber || "VD: 0901234567"
								}
							/>
						</Stack>

						<Divider />

						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 600, color: "#1565c0" }}
						>
							License Information
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="License Number"
								fullWidth
								value={formData.licenseNumber ?? ""}
								onChange={(e) =>
									handleInputChange(
										"licenseNumber",
										e.target.value
									)
								}
								error={!!errors.licenseNumber}
								helperText={errors.licenseNumber}
							/>

							<FormControl
								fullWidth
								error={!!errors.licenseCategory}
							>
								<InputLabel>License Class</InputLabel>
								<Select
									value={formData.licenseCategory ?? ""}
									label="License Class"
									onChange={(e) =>
										handleInputChange(
											"licenseCategory",
											e.target.value
										)
									}
								>
									<MenuItem value="B1">B1</MenuItem>
									<MenuItem value="B2">B2</MenuItem>
									<MenuItem value="C">C</MenuItem>
									<MenuItem value="D">D</MenuItem>
									<MenuItem value="E">E</MenuItem>
								</Select>
								<FormHelperText>
									{errors.licenseCategory}
								</FormHelperText>
							</FormControl>
						</Stack>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
						>
							<TextField
								label="Issue Date"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={formData.licenseIssueDate ?? ""}
								onChange={(e) =>
									handleInputChange(
										"licenseIssueDate",
										e.target.value
									)
								}
								error={!!errors.licenseIssueDate}
								helperText={errors.licenseIssueDate}
							/>

							<TextField
								label="Expiry Date"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={formData.licenseExpiryDate ?? ""}
								onChange={(e) =>
									handleInputChange(
										"licenseExpiryDate",
										e.target.value
									)
								}
								error={!!errors.licenseExpiryDate}
								helperText={errors.licenseExpiryDate}
							/>
						</Stack>

						<Divider />

						<DialogActions>
							<Button
								onClick={onClose}
								disabled={isSubmitting}
								variant="outlined"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={isSubmitting}
								startIcon={
									isSubmitting && (
										<CircularProgress size={20} />
									)
								}
							>
								{isSubmitting
									? "Saving..."
									: editingDriver
									? "Save"
									: "Add Driver"}
							</Button>
						</DialogActions>
					</Stack>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default DriverCreate;
