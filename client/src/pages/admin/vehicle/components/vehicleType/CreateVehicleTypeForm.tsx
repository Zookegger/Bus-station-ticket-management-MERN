import React, { useCallback, useState } from "react";
import {
	Box,
	TextField,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import type { CreateVehicleTypeDTO } from "@my-types/vehicleType";
import SeatLayoutEditor from "@components/seatmap/SeatLayoutEditor";
import type { CreateVehicleTypeFormProps } from "./types";
import type { SeatLayout } from "@my-types/vehicleType";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants";

type CreateVehicleTypeErrors = Partial<
	Record<keyof CreateVehicleTypeDTO, string>
>;

const CreateVehicleTypeForm: React.FC<CreateVehicleTypeFormProps> = ({
	open,
	onClose,
	onCreate,
}) => {
	const [formData, setFormData] = useState<CreateVehicleTypeDTO>({
		name: "",
		totalFloors: 0,
		totalSeats: 0,
		price: 0,
		seatLayout: "",
	});
	const [errors, setErrors] = useState<CreateVehicleTypeErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange =
		(key: keyof CreateVehicleTypeDTO) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target;
			setFormData((prev) => ({ ...prev, [key]: value }));

			// Basic client-side validation
			if (value.trim() === "") {
				setErrors((prev) => ({ ...prev, [key]: `${key} is required` }));
			} else {
				setErrors((prev) => ({ ...prev, [key]: undefined }));
			}
		};

	const validateForm = (): boolean => {
		let newErrors: CreateVehicleTypeErrors = {};

		if (!formData.name || !formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (formData.totalFloors <= 0) {
			newErrors.totalFloors = "Total floors must be greater than 0";
		}

		if (formData.totalSeats <= 0) {
			newErrors.totalSeats = "Total seats must be greater than 0";
		}

		if (formData.price <= 0) {
			newErrors.price = "Price must be greater than 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			const { data, status } = await callApi({
				method: "POST",
				url: `${API_ENDPOINTS.VEHICLE_TYPE.CREATE}`,
				data: formData,
			}, { returnFullResponse: true });

			if (status === 200) {
				alert(data.message);
			}

			onCreate(formData as CreateVehicleTypeDTO);
			onClose();
		} catch (err) {
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLayoutChange = useCallback(
		(layout: SeatLayout, totalSeats: number) => {
			setFormData((prev) => ({
				...prev,
				seatLayout: JSON.stringify(layout),
				totalSeats: totalSeats,
				totalFloors: layout.length,
			}));
		},
		[]
	);

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
								value={formData.name || ""}
								onChange={handleInputChange("name")}
								error={!!errors.name}
								helperText={errors.name}
								required
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Total Floors"
								variant="outlined"
								type="number"
								value={formData.totalFloors || ""}
								onChange={handleInputChange("totalFloors")}
								error={!!errors.totalFloors}
								slotProps={{
									htmlInput: {
										min: 0,
									},
									input: {
										readOnly: true,
									},
								}}
								helperText="Set in layout editor"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Total Seats"
								variant="outlined"
								type="number"
								value={formData.totalSeats || ""}
								onChange={handleInputChange("totalSeats")}
								error={!!errors.totalSeats}
								slotProps={{
									htmlInput: {
										min: 0,
									},
									input: {
										readOnly: true,
									},
								}}
								helperText="Calculated from layout"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Price"
								variant="outlined"
								type="number"
								placeholder="e.g. 100000"
								value={formData.price || ""}
								onChange={handleInputChange("price")}
								error={!!errors.price}
								helperText={errors.price}
								slotProps={{
									input: {
										endAdornment: "₫",
									},
								}}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<SeatLayoutEditor
								onLayoutChange={handleLayoutChange}
								onCancel={onClose}
								initialLayout={formData.seatLayout}
								totalFloors={formData.totalFloors}
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
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? "Creating..." : "Create"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateVehicleTypeForm;
