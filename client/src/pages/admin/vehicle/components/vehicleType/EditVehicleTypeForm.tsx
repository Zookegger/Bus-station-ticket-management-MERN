import React, { useEffect, useCallback } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	vehicleTypeSchema,
	type VehicleTypeFormData,
	type VehicleTypeInput,
} from "@schemas/vehicleTypeSchema";

const EditVehicleTypeForm: React.FC<EditVehicleTypeFormProps> = ({
	open,
	onClose,
	vehicleType,
	onUpdate,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<VehicleTypeInput, any, VehicleTypeFormData>({
		resolver: zodResolver(vehicleTypeSchema),
		defaultValues: {
			name: "",
			totalFloors: 0,
			totalSeats: 0,
			price: 0,
			seatLayout: "",
		},
	});

	useEffect(() => {
		if (vehicleType) {
			reset({
				name: vehicleType.name,
				price: vehicleType.price,
				totalFloors: vehicleType.totalFloors,
				totalSeats: vehicleType.totalSeats,
				seatLayout: vehicleType.seatLayout,
			});
		}
	}, [vehicleType, reset]);

	const seatLayout = watch("seatLayout");
	const totalFloors = watch("totalFloors");

	const onSubmit = (data: VehicleTypeFormData) => {
		if (vehicleType) {
			onUpdate({
				id: vehicleType.id,
				...data,
			} as UpdateVehicleTypeDTO);
			onClose();
		}
	};

	const handleLayoutChange = useCallback(
		(layout: SeatLayout, totalSeats: number) => {
			setValue("seatLayout", JSON.stringify(layout));
			setValue("totalSeats", totalSeats);
			setValue("totalFloors", layout.length);
		},
		[setValue]
	);

	if (!vehicleType) {
		return null;
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Edit Vehicle Type</DialogTitle>
			<DialogContent>
				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					sx={{ pt: 2 }}
				>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12 }}>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Name"
										error={!!errors.name}
										helperText={errors.name?.message}
										required
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<Controller
								name="totalFloors"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Floors"
										type="number"
										error={!!errors.totalFloors}
										helperText={
											errors.totalFloors?.message ||
											"Set in layout editor"
										}
										slotProps={{
											input: {
												readOnly: true,
											},
										}}
									/>
								)}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<Controller
								name="totalSeats"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Seats"
										type="number"
										error={!!errors.totalSeats}
										helperText={
											errors.totalSeats?.message ||
											"Calculated from layout"
										}
										slotProps={{
											input: {
												readOnly: true,
											},
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<Controller
								name="price"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Price"
										type="number"
										error={!!errors.price}
										helperText={errors.price?.message}
										slotProps={{
											input: {
												endAdornment: "₫",
											},
										}}
									/>
								)}
							/>
						</Grid>
						<Grid size={{ xs: 12 }}>
							<SeatLayoutEditor
								onLayoutChange={handleLayoutChange}
								initialLayout={
									typeof seatLayout === "string"
										? seatLayout
										: undefined
								}
								totalFloors={
									typeof totalFloors === "number"
										? totalFloors
										: 1
								}
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
					onClick={handleSubmit(onSubmit)}
					disabled={isSubmitting}
				>
					Update
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleTypeForm;
