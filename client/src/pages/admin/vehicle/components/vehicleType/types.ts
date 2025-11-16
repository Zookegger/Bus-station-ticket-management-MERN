import type {
	CreateVehicleTypeDTO,
	UpdateVehicleTypeDTO,
	VehicleType,
} from "@my-types/vehicleType";

export type { VehicleType };

export type SeatType = "available" | "aisle" | "disabled" | "occupied";
export type SeatLayout = SeatType[][][];

export interface CreateVehicleTypeFormProps {
	open: boolean;
	onClose: () => void;
	onCreate: (data: CreateVehicleTypeDTO) => void;
}

export interface EditVehicleTypeFormProps {
	open: boolean;
	onClose: () => void;
	onUpdate: (data: UpdateVehicleTypeDTO) => void;
	vehicleType: VehicleType | null;
}

export interface DeleteVehicleTypeDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	vehicleType: VehicleType | null;
}

export interface VehicleTypeDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	vehicleType: VehicleType | null;
}

export interface SeatLayoutEditorProps {
	onLayoutChange: (layout: SeatLayout, totalSeats: number) => void;
	onCancel?: () => void;
	initialLayout?: string | null;
	totalFloors?: number | null;
}
