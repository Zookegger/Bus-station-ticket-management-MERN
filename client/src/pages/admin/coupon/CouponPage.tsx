import { API_ENDPOINTS } from "@constants/index";
import { Button, InputAdornment, Paper, TextField, Snackbar, Alert } from "@mui/material";
import type { Coupon, CouponType } from "@my-types";
import { handleAxiosError } from "@utils/handleError";
import axios from "axios";
import { useEffect, useMemo, useState, useCallback } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
	CouponForm,
	CouponDetailsDrawer,
	DeleteCouponForm,
} from "./components";
import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { Search as SearchIcon } from "@mui/icons-material";
import { Box } from "@mui/system";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const CouponPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [formOpen, setFormOpen] = useState<boolean>(false);
	const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	const [detailOpen, setDetailOpen] = useState<boolean>(false);
	const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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
			detail.type = detail.type.toUpperCase() as CouponType;
			setSelectedCoupon(detail);
			setDetailOpen(false);
			setFormOpen(true);
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

	const columns: GridColDef[] = [
		{
			field: "title",
			headerName: "Title",
			minWidth: 160,
			flex: 1,
		},
		{
			field: "code",
			headerName: "Code",
			flex: 1,
			minWidth: 140,
			width: 160,
		},
		{
			field: "maxUsage",
			headerName: "Max Usage",
			width: 120,
		},
		{
			field: "type",
			headerName: "Type",
			width: 120,
			valueFormatter: (value: string) => {
				return (
					value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
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

	const filteredCoupon = useMemo(() => {
		return coupons.filter((c) => {
			const term = searchTerm.toLowerCase();
			const matchesSearch =
				!term ||
				c.code.toLowerCase().includes(term) ||
				(c.title && c.title.toLowerCase().includes(term)) ||
				(c.createdAt &&
					String(c.createdAt).toLowerCase().includes(term)) ||
				(c.updatedAt &&
					String(c.updatedAt).toLowerCase().includes(term));

			return matchesSearch;
		});
	}, [coupons, searchTerm]);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await callApi<{ coupons: Coupon[] }>({
				method: "GET",
				url: API_ENDPOINTS.COUPON.BASE,
			});

			if (response) {
				const couponPayload =
					(response as any).coupons ??
					(response as any).data?.coupons ??
					(response as any);
				setCoupons(Array.isArray(couponPayload) ? couponPayload : []);
			}
		} catch (err) {
			const message = handleAxiosError(err);
			console.error(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useAdminRealtime({
		entity: "coupon",
		onRefresh: fetchData,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	const actionBar = (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<Button
				onClick={() => {
					setSelectedCoupon(null);
					setFormOpen(true);
				}}
				variant="contained"
			>
				Add new coupon
			</Button>
			{/* Search Field */}
			<TextField
				size="small"
				placeholder="Search by name, email..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
						),
					},
				}}
				sx={{ minWidth: 250 }}
			/>
		</Box>
	);

	return (
		<DataGridPageLayout title="Coupon Management" actionBar={actionBar}>
			<Paper elevation={3} sx={{ width: "100%" }}>
				<DataGrid
					sx={{ maxWidth: "100%" }}
					rows={filteredCoupon}
					onRowClick={(e) =>
						handleOpenDrawer(Number.parseInt(e.id.toString()))
					}
					rowHeight={35}
					columns={columns}
					loading={isLoading}
					pagination
				/>
			</Paper>
			<CouponForm
				open={formOpen}
				initialData={selectedCoupon}
				onClose={() => {
					setFormOpen(false);
					setSelectedCoupon(null);
				}}
				onSuccess={(message) => {
					fetchData();
					if (message) {
						setSnackbar({
							open: true,
							message,
							severity: "success",
						});
					}
				}}
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
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</DataGridPageLayout>
	);
};

export default CouponPage;
