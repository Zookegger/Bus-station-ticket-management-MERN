import React, { useEffect, useState, useMemo } from "react";
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
	Chip
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Save as SaveIcon,
	Close as CloseIcon,
	Refresh as RefreshIcon
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";;
import type { PaymentMethod } from "@my-types"; // Assuming this is where types/paymentMethods is exported, or import directly

// If types aren't exported globally yet, use the local definition matching your file:
// import { PaymentMethod, CreatePaymentMethodDTO, UpdatePaymentMethodDTO } from "../../../types/paymentMethods";

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
	const [saving, setSaving] = useState(false);

	// Form State
	const [formName, setFormName] = useState("");
	const [formCode, setFormCode] = useState("");
	const [formIsActive, setFormIsActive] = useState(true);
	const [formConfig, setFormConfig] = useState("{}");

	// Fetch Methods
	const fetchMethods = async () => {
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
	};

	useEffect(() => {
		fetchMethods();
	}, []);

	// Filter
	const filteredMethods = useMemo(() => {
		const term = searchTerm.toLowerCase();
		if (!term) return methods;
		return methods.filter((m) => 
			m.name.toLowerCase().includes(term) || 
			m.code.toLowerCase().includes(term)
		);
	}, [methods, searchTerm]);

	// Handlers
	const handleOpenCreate = () => {
		setDialog({ open: true, editing: null });
		setFormName("");
		setFormCode("");
		setFormIsActive(true);
		setFormConfig("{\n  \n}");
	};

	const handleOpenEdit = (row: PaymentMethod) => {
		setDialog({ open: true, editing: row });
		setFormName(row.name);
		setFormCode(row.code);
		setFormIsActive(row.isActive);
		setFormConfig(JSON.stringify(row.configJson || {}, null, 2));
	};

	const handleCloseDialog = () => {
		if (saving) return;
		setDialog({ open: false, editing: null });
	};

	const handleSave = async () => {
		setSaving(true);
		let parsedConfig = {};
		try {
			parsedConfig = JSON.parse(formConfig);
		} catch (e) {
			alert("Invalid JSON in Config field");
			setSaving(false);
			return;
		}

		const payload = {
			name: formName,
			code: formCode,
			isActive: formIsActive,
			configJson: parsedConfig
		};

		try {
			if (dialog.editing) {
				// Update
				// Note: Casting ID to any/number because api.ts defines it as number but types say string
				await callApi({
					method: "PUT",
					url: API_ENDPOINTS.PAYMENT_METHOD.UPDATE(dialog.editing.id as any),
					data: payload
				});
			} else {
				// Create
				await callApi({
					method: "POST",
					url: API_ENDPOINTS.PAYMENT_METHOD.CREATE,
					data: payload
				});
			}
			await fetchMethods();
			handleCloseDialog();
		} catch (err) {
			console.error("Failed to save payment method", err);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this payment method?")) return;
		try {
			await callApi({
				method: "DELETE",
				url: API_ENDPOINTS.PAYMENT_METHOD.DELETE(id as any),
			});
			fetchMethods();
		} catch (err) {
			console.error("Failed to delete", err);
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
			)
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
			valueFormatter: (val: string) => new Date(val).toLocaleDateString()
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
					startIcon={<AddIcon />}
					onClick={handleOpenCreate}
				>
					Add Method
				</Button>
				<TextField
					size="small"
					placeholder="Search methods..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
					}}
				/>
				<IconButton onClick={fetchMethods} disabled={loading} title="Refresh">
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

			<Dialog open={dialog.open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
				<DialogTitle>
					{dialog.editing ? "Edit Payment Method" : "New Payment Method"}
				</DialogTitle>
				<DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
					<TextField
						label="Name"
						value={formName}
						onChange={(e) => setFormName(e.target.value)}
						fullWidth
						required
					/>
					<TextField
						label="Code (Unique Identifier)"
						value={formCode}
						onChange={(e) => setFormCode(e.target.value)}
						fullWidth
						required
						disabled={!!dialog.editing} // Usually codes shouldn't change
						helperText="e.g., MOMO, VNPAY, STRIPE"
					/>
					<FormControlLabel
						control={
							<Switch
								checked={formIsActive}
								onChange={(e) => setFormIsActive(e.target.checked)}
							/>
						}
						label="Is Active"
					/>
					<TextField
						label="Configuration (JSON)"
						value={formConfig}
						onChange={(e) => setFormConfig(e.target.value)}
						fullWidth
						multiline
						minRows={5}
						helperText="Enter API keys and specific settings as valid JSON."
						sx={{ fontFamily: "monospace" }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
						Cancel
					</Button>
					<Button 
						onClick={handleSave} 
						variant="contained" 
						disabled={saving}
						startIcon={<SaveIcon />}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default PaymentMethodManager;