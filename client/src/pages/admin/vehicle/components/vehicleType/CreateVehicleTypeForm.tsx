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
	Add as AddIcon,
} from "@mui/icons-material";
import type { CreateVehicleTypeDTO } from "./types";

interface CreateVehicleTypeFormProps {
	open: boolean;
	onClose: () => void;
	onCreate: (vehicleType: CreateVehicleTypeDTO) => void;
}

const CreateVehicleTypeForm: React.FC<CreateVehicleTypeFormProps> = ({
	open,
	onClose,
	onCreate,
}) => {
	const [formData, setFormData] = useState<CreateVehicleTypeDTO>({
		name: "",
		baseFare: 0,
		totalSeats: 0,
		totalFlooring: 1,
		totalRow: 0,
		totalColumn: 0,
		description: "",
	});

	useEffect(() => {
		const { totalRow, totalColumn, totalFlooring } = formData;
		const calculatedSeats = totalRow * totalColumn * totalFlooring;
		setFormData((prev) => ({
			...prev,
			totalSeats: calculatedSeats,
		}));
	}, [formData.totalRow, formData.totalColumn, formData.totalFlooring, formData]);

	type CreateVehicleTypeErrors = Partial<
		Record<keyof CreateVehicleTypeDTO, string>
	>;
	const [errors, setErrors] = useState<CreateVehicleTypeErrors>({});

	const handleInputChange =
		(field: keyof CreateVehicleTypeDTO) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				field === "baseFare" || field.includes("total")
					? Number(event.target.value) || 0
					: event.target.value;

			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));

			// Clear error when user starts typing
			if (errors[field]) {
				setErrors((prev) => ({
					...prev,
					[field]: undefined,
				}));
			}
		};

	const validateForm = (): boolean => {
		const newErrors: CreateVehicleTypeErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (formData.baseFare <= 0) {
			newErrors.baseFare = "Price must be greater than 0";
		}

		if (formData.totalFlooring <= 0) {
			newErrors.totalFlooring = "Total flooring must be greater than 0";
		}

		if (formData.totalRow <= 0) {
			newErrors.totalRow = "Total rows must be greater than 0";
		}

		if (formData.totalColumn <= 0) {
			newErrors.totalColumn = "Total columns must be greater than 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (validateForm()) {
			onCreate(formData);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Create Vehicle Type</DialogTitle>
			<DialogContent>
				<Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12 }}>
							<TextField
								fullWidth
								label="Name"
								placeholder="e.g. Electric Bus"
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
								placeholder="e.g. 3"
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
								placeholder="e.g. 7"
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
								placeholder="e.g. 6"
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
								placeholder="e.g. 42"
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
								placeholder="e.g. 100000"
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
								placeholder="Enter description (optional)"
								value={formData.description}
								onChange={handleInputChange("description")}
							/>
						</Grid>
					</Grid>

					{/* Action Buttons */}
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
					startIcon={<AddIcon />}
					sx={{ bgcolor: "#2e7d32" }}
					onClick={handleSubmit}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateVehicleTypeForm;
