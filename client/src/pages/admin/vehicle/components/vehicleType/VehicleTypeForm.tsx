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
	CircularProgress,
	Alert,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Save as SaveIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import type { SeatLayout } from "@my-types/vehicleType";
import SeatLayoutEditor from "@components/seatmap/SeatLayoutEditor";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	vehicleTypeSchema,
	type VehicleTypeFormData,
	type VehicleTypeInput,
} from "@schemas/vehicleTypeSchema";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";

interface VehicleTypeFormProps {
	open: boolean;
	onClose: () => void;
	onSaved: (vehicleType: any, message?: string) => void;
	initialData?: any;
}

const VehicleTypeForm: React.FC<VehicleTypeFormProps> = ({
	open,
	onClose,
	onSaved,
	initialData,
}) => {
	const isEditMode = !!initialData;
	const [serverError, setServerError] = React.useState<string | null>(null);

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
		if (open) {
			if (initialData) {
				reset({
					name: initialData.name,
					price: initialData.price,
					totalFloors: initialData.totalFloors,
					totalSeats: initialData.totalSeats,
					seatLayout: initialData.seatLayout,
				});
			} else {
				reset({
					name: "",
					totalFloors: 0,
					totalSeats: 0,
					price: 0,
					seatLayout: "",
				});
			}
			setServerError(null);
		}
	}, [open, initialData, reset]);

	const seatLayout = watch("seatLayout");
	const totalFloors = watch("totalFloors");

	const onSubmit = async (data: VehicleTypeFormData) => {
		try {
			let res;
			if (isEditMode) {
				res = await callApi({
					method: "PUT",
					url: API_ENDPOINTS.VEHICLE_TYPE.UPDATE(initialData.id),
					data: data,
				});
			} else {
				res = await callApi({
					method: "POST",
					url: API_ENDPOINTS.VEHICLE_TYPE.CREATE,
					data: data,
				});
			}

			const savedData = (res as any).vehicle_type ?? (res as any).data ?? res;
			onSaved(savedData, isEditMode ? "Vehicle type updated successfully" : "Vehicle type added successfully");
			onClose();
		} catch (err: any) {
			console.error(err);
			setServerError(err.message || "Failed to save vehicle type");
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

	return (
		<Dialog
			open={open}
			maxWidth="md"
			fullWidth
			// Prevent accidental closure when clicking backdrop
			onClose={(_event, reason) => {
				if (reason !== "backdropClick") onClose();
			}}
		>
			<DialogTitle>
				{isEditMode ? "Edit Vehicle Type" : "Create Vehicle Type"}
			</DialogTitle>
			<DialogContent>
				{serverError && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{serverError}
					</Alert>
				)}
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
										placeholder="e.g. Electric Bus"
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
										label="Total Floors"
										variant="outlined"
										type="number"
										error={!!errors.totalFloors}
										helperText={
											errors.totalFloors?.message ||
											"Set in layout editor"
										}
										slotProps={{
											input: {
												readOnly: true,
												inputProps: { min: 0 },
											},
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 4 }}>
							<Controller
								name="totalSeats"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										value={field.value || ""}
										fullWidth
										label="Total Seats"
										variant="outlined"
										type="number"
										error={!!errors.totalSeats}
										helperText={
											errors.totalSeats?.message ||
											"Calculated from layout"
										}
										slotProps={{
											input: {
												readOnly: true,
												inputProps: { min: 0 },
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
										variant="outlined"
										type="number"
										placeholder="e.g. 100000"
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
								onCancel={onClose}
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
					startIcon={
						isSubmitting ? (
							<CircularProgress size={20} />
						) : isEditMode ? (
							<SaveIcon />
						) : (
							<AddIcon />
						)
					}
					onClick={handleSubmit(onSubmit)}
					disabled={isSubmitting}
				>
					{isSubmitting
						? "Saving..."
						: isEditMode
						? "Update"
						: "Create"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default VehicleTypeForm;
