import React, { useState, useEffect, type FC } from "react";
import {
	Box,
	Button,
	Grid,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Save as SaveIcon,
} from "@mui/icons-material";
import type { EditVehicleTypeFormProps } from "./types";
import type { SeatLayout } from "@my-types/vehicleType";
import SeatLayoutEditor from "@components/seatmap/SeatLayoutEditor";
import type { UpdateVehicleTypeDTO } from "@my-types/vehicleType";

const EditVehicleTypeForm: FC<EditVehicleTypeFormProps> = ({
	open,
	onClose,
	vehicleType,
	onUpdate,
}) => {
	const [formData, setFormData] = useState<Partial<UpdateVehicleTypeDTO>>({});

	useEffect(() => {
		if (vehicleType) {
			setFormData({
				id: vehicleType.id,
				name: vehicleType.name,
				price: vehicleType.price,
				totalFloors: vehicleType.totalFloors,
				totalSeats: vehicleType.totalSeats,
				seatLayout: vehicleType.seatLayout,
			});
		}
	}, [vehicleType]);

	const handleInputChange =
		(field: keyof UpdateVehicleTypeDTO) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				event.target.type === "number"
					? Number(event.target.value) || null
					: event.target.value;
			setFormData((prev) => ({ ...prev, [field]: value }));
		};

	const handleLayoutChange = (layout: SeatLayout, totalSeats: number) => {
		setFormData((prev) => ({
			...prev,
			seatLayout: JSON.stringify(layout),
			totalSeats: totalSeats,
			totalFloors: layout.length,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.id) {
			onUpdate(formData as UpdateVehicleTypeDTO);
			onClose();
		}
	};

	if (!vehicleType) {
		return null;
	}

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
								value={formData.name || ""}
								onChange={handleInputChange("name")}
								required
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Floors"
								type="number"
								value={formData.totalFloors || ""}
								slotProps={{
									input: {
										readOnly: true,
									},
								}}
								helperText="Set in layout editor"
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
								helperText="Calculated from layout"
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								fullWidth
								label="Price"
								type="number"
								value={formData.price || ""}
								onChange={handleInputChange("price")}
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
					startIcon={<SaveIcon />}
					onClick={handleSubmit}
				>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleTypeForm;
