import React, { useState, useEffect } from "react";
import {
	Box,
	TextField,
	Button,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Save as SaveIcon,
} from "@mui/icons-material";
import type { VehicleType, UpdateVehicleTypeDTO } from "./types";

interface EditVehicleTypeFormProps {
	open: boolean;
	onClose: () => void;
	vehicleType: VehicleType;
	onUpdate: (id: number, data: UpdateVehicleTypeDTO) => void;
}

const EditVehicleTypeForm: React.FC<EditVehicleTypeFormProps> = ({
	open,
	onClose,
	vehicleType,
	onUpdate,
}) => {
	const [formData, setFormData] = useState<UpdateVehicleTypeDTO>({
		name: vehicleType.name,
		baseFare: vehicleType.baseFare,
		totalSeats: vehicleType.totalSeats,
		totalFlooring: vehicleType.totalFlooring,
		totalRow: vehicleType.totalRow,
		totalColumn: vehicleType.totalColumn,
		description: vehicleType.description || "",
	});

	type UpdateVehicleTypeErrors = Partial<
		Record<keyof UpdateVehicleTypeDTO, string>
	>;
	const [errors, setErrors] = useState<UpdateVehicleTypeErrors>({});

	useEffect(() => {
		const { totalRow, totalColumn, totalFlooring } = formData;
		const calculatedSeats =
			(totalRow || 0) * (totalColumn || 0) * (totalFlooring || 0);
		setFormData((prev) => ({
			...prev,
			totalSeats: calculatedSeats,
		}));
	}, [formData.totalRow, formData.totalColumn, formData.totalFlooring, vehicleType, formData]);

	useEffect(() => {
		setFormData({
			name: vehicleType.name,
			baseFare: vehicleType.baseFare,
			totalSeats: vehicleType.totalSeats,
			totalFlooring: vehicleType.totalFlooring,
			totalRow: vehicleType.totalRow,
			totalColumn: vehicleType.totalColumn,
			description: vehicleType.description || "",
		});
	}, [vehicleType]);

	const handleInputChange =
		(field: keyof UpdateVehicleTypeDTO) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				field === "baseFare" || field.includes("total")
					? Number(event.target.value) || 0
					: event.target.value;

			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));

			if (errors[field]) {
				setErrors((prev) => ({
					...prev,
					[field]: undefined,
				}));
			}
		};

	const validateForm = (): boolean => {
		const newErrors: UpdateVehicleTypeErrors = {};

		if (!formData.name?.trim()) {
			newErrors.name = "Name is required";
		}

		if ((formData.baseFare || 0) <= 0) {
			newErrors.baseFare = "Price must be greater than 0";
		}

		if ((formData.totalSeats || 0) <= 0) {
			newErrors.totalSeats = "Total seats must be greater than 0";
		}

		if ((formData.totalFlooring || 0) <= 0) {
			newErrors.totalFlooring = "Total flooring must be greater than 0";
		}

		if ((formData.totalRow || 0) <= 0) {
			newErrors.totalRow = "Total rows must be greater than 0";
		}

		if ((formData.totalColumn || 0) <= 0) {
			newErrors.totalColumn = "Total columns must be greater than 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (validateForm()) {
			onUpdate(vehicleType.id, formData);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Edit Vehicle Type</DialogTitle>
			<DialogContent>
				<Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="Name"
								value={formData.name}
								onChange={handleInputChange("name")}
								error={!!errors.name}
								helperText={errors.name}
								required
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Floors"
								type="number"
								value={formData.totalFlooring || ""}
								onChange={handleInputChange("totalFlooring")}
								error={!!errors.totalFlooring}
								helperText={errors.totalFlooring}
								required
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Rows"
								type="number"
								value={formData.totalRow || ""}
								onChange={handleInputChange("totalRow")}
								error={!!errors.totalRow}
								helperText={errors.totalRow}
								required
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Columns"
								type="number"
								value={formData.totalColumn || ""}
								onChange={handleInputChange("totalColumn")}
								error={!!errors.totalColumn}
								helperText={errors.totalColumn}
								required
							/>
						</Grid>
						
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								fullWidth
								label="Seats"
								type="number"
								value={formData.totalSeats || ""}
								slotProps={{
									input: {
										readOnly: true,
									},
								}}
								helperText="Floors × Rows × Columns"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								fullWidth
								label="Price"
								type="number"
								value={formData.baseFare || ""}
								onChange={handleInputChange("baseFare")}
								error={!!errors.baseFare}
								helperText={errors.baseFare}
								required
								slotProps={{
									input: {
										endAdornment: "₫",
									},
								}}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="Description"
								multiline
								rows={3}
								value={formData.description}
								onChange={handleInputChange("description")}
							/>
						</Grid>
					</Grid>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIcon />}
					onClick={onClose}
					sx={{ color: "#666", borderColor: "#ddd" }}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="contained"
					startIcon={<SaveIcon />}
					sx={{ bgcolor: "#1976d2" }}
					onClick={handleSubmit}
				>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleTypeForm;
