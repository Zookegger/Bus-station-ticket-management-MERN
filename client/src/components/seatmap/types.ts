export interface SeatLayoutEditorProps {
	onLayoutChange: (layout: SeatLayout, totalSeats: number) => void;
	onCancel?: () => void;
	initialLayout?: string | null;
	totalFloors?: number | null;
}

export type SeatType = "available" | "aisle" | "disabled" | "occupied";
export type SeatLayout = SeatType[][][];