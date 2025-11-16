import { API_ENDPOINTS } from "@constants";
import { Button, Paper } from "@mui/material";
import type { Coupon } from "@my-types";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
	AddCouponForm,
	CouponDetailsDrawer,
	DeleteCouponForm,
} from "./components";
import EditCouponForm from "./components/EditCouponForm";
import { DataGridPageLayout } from "@components/admin";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const CouponPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [addOpen, setAddOpen] = useState<boolean>(false);
	const [editOpen, setEditOpen] = useState<boolean>(false);
	const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	const [detailOpen, setDetailOpen] = useState<boolean>(false);
	const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

	const handleOpenDrawer = (id: number) => {
		if (coupons === null || typeof coupons === "undefined") {
			return;
		}

		const detail = coupons.find((c) => c.id === id);
		if (detail) {
			setSelectedCoupon(detail);
			setDetailOpen(true);
		}
	};

	const handleOpenEdit = (id: number) => {
		if (coupons === null || typeof coupons === "undefined") {
			return;
		}

		const detail = coupons.find((c) => c.id === id);
		if (detail) {
			setSelectedCoupon(detail);
			setDetailOpen(false);
			setEditOpen(true);
		}
	};

	const handleOpenDelete = (id: number) => {
		if (coupons === null || typeof coupons === "undefined") {
			return;
		}

		const detail = coupons.find((c) => c.id === id);
		if (detail) {
			setSelectedCoupon(detail);
			setDetailOpen(false);
			setDeleteOpen(true);
		}
	};

	const handleCloseDrawer = () => {
		setDetailOpen(false);
		setSelectedCoupon(null);
	};

	useEffect(() => {
		let mounted = true;

		if (!isLoading) return;

		const fetchData = async () => {
			try {
				const response = await axios.get(
					`${API_ENDPOINTS.COUPON.SEARCH}`
				);
				if (response.status !== 200) {
					throw new Error("Failed to fetch data");
				}

				const coupon_response = response.data;

				// Only update state if the component is still mounted.
				// The `mounted` flag is set to false in the cleanup function
				// to avoid calling `setState` on an unmounted component
				// which would otherwise trigger a React warning.
				if (mounted) {
					setCoupons(coupon_response);
				}
			} catch (err) {
				const message = handleAxiosError(err);
				console.error(message);
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		};

		fetchData();
		return () => {
            mounted = false;
        };
	}, [isLoading]);

	const actionBar = (
		<Button
			onClick={() => {
				setAddOpen(true);
			}}
			variant="contained"
		>
			Add new coupon
		</Button>
	);

	return (
		<DataGridPageLayout title="Coupon Management" actionBar={actionBar}>
			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					sx={{ maxWidth: "100%" }}
					rows={coupons.map((c) => ({
						id: c.id,
						code: c.code,
						maxUsage: c.maxUsage ?? null,
						description: c.description,
						type: c.type,
						updatedAt: format(
							new Date(c.updatedAt),
							"dd/MM/yyyy - HH:mm:ss"
						).toString(),
						createdAt: format(
							new Date(c.createdAt),
							"dd/MM/yyyy - HH:mm:ss"
						).toString(),
					}))}
					onRowClick={(e) =>
						handleOpenDrawer(Number.parseInt(e.id.toString()))
					}
					rowHeight={35}
					columns={
						[
							{
								field: "code",
								headerName: "Code",
								flex: 1,
							},
							{
								field: "maxUsage",
								headerName: "Max Usage",
								width: 120,
							},
							{
								field: "description",
								headerName: "Description",
								flex: 2,
							},
							{
								field: "type",
								headerName: "Type",
								width: 120,
								valueFormatter: (value: string) => {
									return (
										value.charAt(0).toUpperCase() +
										value.slice(1).toLowerCase()
									);
								},
							},
							{
								field: "updatedAt",
								headerName: "Updated At",
								width: 190,
							},
							{
								field: "createdAt",
								headerName: "Created At",
								width: 190,
							},
						] as GridColDef[]
					}
					loading={isLoading}
					pagination
				/>
			</Paper>
			<EditCouponForm
				coupon={selectedCoupon}
				key={selectedCoupon ? selectedCoupon.id : "new"}
				open={editOpen}
				onClose={() => setEditOpen(false)}
				onEdited={() => {
					setEditOpen(false);
					setIsLoading(true);
				}}
			/>
			<AddCouponForm
				open={addOpen}
				onClose={() => setAddOpen(false)}
				onCreated={() => setIsLoading(true)}
			/>
			{selectedCoupon && (
				<>
					<CouponDetailsDrawer
						coupon={selectedCoupon}
						open={detailOpen}
						onClose={handleCloseDrawer}
						onDelete={() => {
							handleOpenDelete(selectedCoupon.id);
							setIsLoading(false);
						}}
						onEdit={() => {
							handleOpenEdit(selectedCoupon.id);
							setIsLoading(false);
						}}
					/>
					<DeleteCouponForm
						id={selectedCoupon.id}
						open={deleteOpen}
						onClose={() => {
							setDeleteOpen(false);
							setIsLoading(false);
						}}
						onConfirm={() => setIsLoading(true)}
					/>
				</>
			)}
		</DataGridPageLayout>
	);
};

export default CouponPage;
