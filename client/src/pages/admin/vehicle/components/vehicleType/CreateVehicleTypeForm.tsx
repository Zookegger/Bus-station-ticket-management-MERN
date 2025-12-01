import React, { useCallback } from "react";
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
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleTypeSchema, type VehicleTypeFormData } from "@schemas/vehicleTypeSchema";

const CreateVehicleTypeForm: React.FC<CreateVehicleTypeFormProps> = ({
	open,
	onClose,
	onCreate,
}) => {
	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<VehicleTypeFormData>({
		resolver: zodResolver(vehicleTypeSchema),
		defaultValues: {
			name: "",
			price: 0,
			totalFloors: 0,
			totalSeats: 0,
			seatLayout: {},
		},
	});

	const seatLayout = watch("seatLayout");
	const totalFloors = watch("totalFloors");

	const onSubmit = async (data: VehicleTypeFormData) => {
		try {
			const { data: responseData, status } = await callApi({
				method: "POST",
				url: `${API_ENDPOINTS.VEHICLE_TYPE.CREATE}`,
				data: data,
			}, { returnFullResponse: true });

			if (status === 200) {
				alert(responseData.message);
			}

			onCreate(data as CreateVehicleTypeDTO);
			onClose();
		} catch (err) {
			console.error(err);
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
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Create Vehicle Type</DialogTitle>
			<DialogContent>
				<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 2 }}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12 }}>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
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
										fullWidth
										label="Total Floors"
										variant="outlined"
										type="number"
										error={!!errors.totalFloors}
										helperText={errors.totalFloors?.message || "Set in layout editor"}
										slotProps={{
											htmlInput: {
												min: 0,
											},
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
								name="totalSeats"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										label="Total Seats"
										variant="outlined"
										type="number"
										error={!!errors.totalSeats}
										helperText={errors.totalSeats?.message || "Calculated from layout"}
										slotProps={{
											htmlInput: {
												min: 0,
											},
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
								initialLayout={seatLayout || undefined}
								totalFloors={totalFloors || 1}
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
					onClick={handleSubmit(onSubmit)}
					disabled={isSubmitting}
				>
					{isSubmitting ? "Creating..." : "Create"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateVehicleTypeForm;
