import { Box, Chip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { Order } from "@my-types/order";
import type { Ticket } from "@my-types/ticket";
import type { Trip } from "@my-types";
import { Stack } from "@mui/system";

interface OrderTableProps {
	orders: Order[];
	loading?: boolean;
	onViewDetail: (order: Order) => void;
}

const OrderTable = ({ orders, loading, onViewDetail }: OrderTableProps) => {
	const columns: GridColDef<Order>[] = [
		{
			field: "id",
			headerName: "Order ID",
			width: 250,
			minWidth: 150,
			renderCell: (params: GridRenderCellParams<Order>) => {
				return (
					<Typography
						sx={{
							textOverflow: "ellipsis",
							overflow: "hidden",
							textWrap: "nowrap",
						}}
					>
						{params.row.id}
					</Typography>
				);
			},
		},
		{
			field: "customer",
			headerName: "Customer",
			width: 150,
			renderCell: (params: GridRenderCellParams<Order>) => {
				const order = params.row;
				return (
					<Box sx={{ py: 1 }}>
						<Typography variant="body2" fontWeight="medium">
							{order.guestPurchaserName ||
								(order.userId
									? order.user?.fullName
									: order.guestPurchaserName)}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{order.guestPurchaserEmail ||
								order.guestPurchaserPhone ||
								""}
						</Typography>
					</Box>
				);
			},
		},
		{
			field: "tripTime",
			headerName: "Departure Time",
			width: 185,
			renderCell: (params: GridRenderCellParams<Order>) => {
				const order = params.row;
				const first: Ticket | undefined = order.tickets?.at(0);
				const trip: Trip = first?.seat?.trip as any;
				const depTime = trip?.startTime
					? new Date(trip.startTime).toLocaleString("vn-VN")
					: "-";

				return <Typography variant="body2">{depTime}</Typography>;
			},
		},
		{
			field: "tripInfo",
			headerName: "Trip Info",
			width: 300,
			renderCell: (params: GridRenderCellParams<Order>) => {
				const order = params.row;
				const first: Ticket | undefined = order.tickets?.at(0);
				const trip: Trip = first?.seat?.trip as any;
				const origin = trip?.route?.stops[0]?.locations?.name || "N/A";
				const destination =
					trip?.route?.stops[trip?.route?.stops.length - 1]?.locations
						?.name || "N/A";

				return (
					<Typography
						variant="body2"
						fontWeight="medium"
						sx={{
							textOverflow: "ellipsis",
							overflow: "hidden",
							textWrap: "nowrap",
						}}
					>
						{origin} → {destination}
					</Typography>
				);
			},
		},
		{
			field: "tickets",
			headerName: "Qty",
			width: 80,
			valueGetter: (_value, row) => row.tickets?.length || 0,
		},
		{
			field: "totalFinalPrice",
			headerName: "Total Amount",
			width: 150,
			valueFormatter: (value: number) =>
				`${value.toLocaleString("vi-VN")} ₫`,
		},
		{
			field: "status",
			headerName: "Status",
			width: 180,
			renderCell: (params: GridRenderCellParams<Order>) => {
				const status = params.value as string;
				let label = status;
				let color:
					| "default"
					| "primary"
					| "secondary"
					| "error"
					| "info"
					| "success"
					| "warning" = "default";

				switch (status) {
					case "CONFIRMED":
						label = "Paid";
						color = "success";
						break;
					case "PENDING":
						label = "Awaiting Payment";
						color = "warning";
						break;
					case "PARTIALLY_REFUNDED":
						label = "Partially Refunded";
						color = "info";
						break;
					case "REFUNDED":
						label = "Refunded";
						color = "info";
						break;
					case "CANCELLED":
						label = "Cancelled";
						color = "error";
						break;
					case "EXPIRED":
						label = "Expired";
						color = "default";
						break;
				}

				return (
					<Chip
						label={label}
						color={color}
						size="small"
						variant="outlined"
					/>
				);
			},
		},
		{
			field: "updatedAt",
			headerName: "Updated At",
			width: 190,
			valueFormatter: (value: Date) => {
				return value
					? `${new Date(value).toLocaleDateString()} - ${new Date(
							value
					  ).toLocaleTimeString()}`
					: "N/A";
			},
		},
		{
			field: "createdAt",
			headerName: "Created At",
			width: 190,
			valueFormatter: (value: Date) => {
				return value
					? `${new Date(value).toLocaleDateString()} - ${new Date(
							value
					  ).toLocaleTimeString()}`
					: "N/A";
			},
		},
	];

	return (
		<DataGrid
			rows={orders}
			columns={columns}
			loading={loading}
			disableRowSelectionOnClick
			initialState={{
				pagination: { paginationModel: { pageSize: 10 } },
			}}
			onRowClick={(params) => onViewDetail(params.row)}
			pageSizeOptions={[5, 10, 25]}
			getRowHeight={() => "auto"}
			sx={{
				"& .MuiDataGrid-cell": {
					display: "flex",
					alignItems: "center",
				},
			}}
		/>
	);
};

export default OrderTable;
