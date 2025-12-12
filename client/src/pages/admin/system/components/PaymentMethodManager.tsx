import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Paper,
	IconButton,
	Switch,
	FormControlLabel,
	Chip,
	Snackbar,
	Alert,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Save as SaveIcon,
	Close as CloseIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import type { PaymentMethod } from "@my-types";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	paymentMethodSchema,
	type PaymentMethodForm,
} from "@schemas/paymentMethodSchema";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

interface EditDialogState {
	open: boolean;
	editing: PaymentMethod | null;
}

const PaymentMethodManager: React.FC = () => {
	const [methods, setMethods] = useState<PaymentMethod[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [dialog, setDialog] = useState<EditDialogState>({
		open: false,
		editing: null,
	});
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PaymentMethodForm>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			name: "",
			code: "",
			isActive: true,
			configJson: "{}",
		},
	});

	// Fetch Methods
	const fetchMethods = useCallback(async () => {
		setLoading(true);
		try {
			const { status, data } = await callApi(
				{ method: "GET", url: API_ENDPOINTS.PAYMENT_METHOD.ALL },
				{ returnFullResponse: true }
			);
			if (status === 200) {
				setMethods(data);
			}
		} catch (err) {
			console.error("Failed to load payment methods", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useAdminRealtime({
		entity: "payment_method",
		onRefresh: fetchMethods,
		onNotify: (message, severity) =>
			setSnackbar({
				open: true,
				message,
				severity: severity || "info",
			}),
	});

	useEffect(() => {
		fetchMethods();
	}, [fetchMethods]);

	// Filter
	const filteredMethods = useMemo(() => {
		const term = searchTerm.toLowerCase();
		if (!term) return methods;
		return methods.filter(
			(m) =>
				m.name.toLowerCase().includes(term) ||
				m.code.toLowerCase().includes(term)
		);
	}, [methods, searchTerm]);

	// Handlers
	const handleOpenCreate = () => {
		setDialog({ open: true, editing: null });
		reset({
			name: "",
			code: "",
			isActive: true,
			configJson: "{\n  \n}",
		});
	};

	const handleOpenEdit = (row: PaymentMethod) => {
		setDialog({ open: true, editing: row });
		reset({
			name: row.name,
			code: row.code,
			isActive: row.isActive,
			configJson: JSON.stringify(row.configJson || {}, null, 2),
		});
	};

	const handleCloseDialog = () => {
		if (isSubmitting) return;
		setDialog({ open: false, editing: null });
		reset();
	};

	const onSubmit: SubmitHandler<PaymentMethodForm> = async (data) => {
		const payload = {
			name: data.name,
			code: data.code,
			isActive: data.isActive,
			configJson: JSON.parse(data.configJson),
		};

		try {
			if (dialog.editing) {
				// Update
				await callApi({
					method: "PUT",
					url: API_ENDPOINTS.PAYMENT_METHOD.UPDATE(
						dialog.editing.id as any
					),
					data: payload,
				});
				setSnackbar({
					open: true,
					message: "Payment method updated successfully",
					severity: "success",
				});
			} else {
				// Create
				await callApi({
					method: "POST",
					url: API_ENDPOINTS.PAYMENT_METHOD.CREATE,
					data: payload,
				});
				setSnackbar({
					open: true,
					message: "Payment method created successfully",
					severity: "success",
				});
			}
			await fetchMethods();
			handleCloseDialog();
		} catch (err) {
			console.error("Failed to save payment method", err);
			setSnackbar({
				open: true,
				message: "Failed to save payment method",
				severity: "error",
			});
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this payment method?"))
			return;
		try {
			await callApi({
				method: "DELETE",
				url: API_ENDPOINTS.PAYMENT_METHOD.DELETE(id as any),
			});
			setSnackbar({
				open: true,
				message: "Payment method deleted successfully",
				severity: "success",
			});
			fetchMethods();
		} catch (err) {
			console.error("Failed to delete", err);
			setSnackbar({
				open: true,
				message: "Failed to delete payment method",
				severity: "error",
			});
		}
	};

	const columns: GridColDef[] = [
		{ field: "name", headerName: "Name", flex: 1, minWidth: 150 },
		{ field: "code", headerName: "Code", width: 120 },
		{
			field: "isActive",
			headerName: "Status",
			width: 120,
			renderCell: (params) => (
				<Chip
					label={params.value ? "Active" : "Inactive"}
					color={params.value ? "success" : "default"}
					size="small"
					variant="outlined"
				/>
			),
		},
		{
			field: "configJson",
			headerName: "Config (Preview)",
			flex: 1.5,
			valueGetter: (val: any) => JSON.stringify(val),
		},
		{
			field: "updatedAt",
			headerName: "Last Updated",
			width: 180,
			valueFormatter: (val: string) => new Date(val).toLocaleDateString(),
		},
		{
			field: "actions",
			headerName: "Actions",
			width: 100,
			sortable: false,
			renderCell: (params) => {
				const row = params.row as PaymentMethod;
				return (
					<Box>
						<IconButton
							size="small"
							color="primary"
							onClick={() => handleOpenEdit(row)}
						>
							<EditIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							color="error"
							onClick={() => handleDelete(row.id)}
						>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Box>
				);
			},
		},
	];

	return (
		<Box>
			<Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
				<Button
					variant="contained"
					className="hvr-icon-pop"
					startIcon={<AddIcon className="hvr-icon" />}
					onClick={handleOpenCreate}
				>
					Add Method
				</Button>
				<TextField
					size="small"
					placeholder="Search methods..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					slotProps={{
						input: {
							startAdornment: (
								<SearchIcon
									sx={{ mr: 1, color: "text.secondary" }}
								/>
							),
						},
					}}
				/>
				<IconButton
					onClick={fetchMethods}
					disabled={loading}
					title="Refresh"
				>
					<RefreshIcon />
				</IconButton>
			</Box>

			<Paper elevation={3}>
				<DataGrid
					rows={filteredMethods}
					columns={columns}
					loading={loading}
					pagination
					initialState={{
						pagination: { paginationModel: { pageSize: 10 } },
					}}
					pageSizeOptions={[5, 10]}
					autoHeight
					sx={{ border: "none" }}
				/>
			</Paper>

			<Dialog
				open={dialog.open}
				onClose={handleCloseDialog}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{dialog.editing
						? "Edit Payment Method"
						: "New Payment Method"}
				</DialogTitle>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
							mt: 1,
						}}
					>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Name"
									fullWidth
									required
									error={!!errors.name}
									helperText={errors.name?.message}
								/>
							)}
						/>
						<Controller
							name="code"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Code (Unique Identifier)"
									fullWidth
									required
									disabled={!!dialog.editing} // Usually codes shouldn't change
									helperText={
										errors.code?.message ||
										"e.g., MOMO, VNPAY, STRIPE"
									}
									error={!!errors.code}
								/>
							)}
						/>
						<Controller
							name="isActive"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Switch
											checked={field.value}
											onChange={(e) =>
												field.onChange(
													e.target.checked
												)
											}
										/>
									}
									label="Is Active"
								/>
							)}
						/>
						<Controller
							name="configJson"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Configuration (JSON)"
									fullWidth
									multiline
									minRows={5}
									helperText={
										errors.configJson?.message ||
										"Enter API keys and specific settings as valid JSON."
									}
									error={!!errors.configJson}
									sx={{ fontFamily: "monospace" }}
								/>
							)}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={handleCloseDialog}
							startIcon={<CloseIcon />}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
							startIcon={<SaveIcon />}
						>
							Save
						</Button>
					</DialogActions>
				</form>
			</Dialog>

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
		</Box>
	);
};

export default PaymentMethodManager;