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
	Tooltip,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Search as SearchIcon,
	Save as SaveIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingSchema, type SettingForm } from "@schemas/settingSchema";
import { useAdminRealtime } from "@hooks/useAdminRealtime";

/**
 * Interface representing a system setting record loaded from the backend.
 * @property {string} key - Unique setting key.
 * @property {any} value - Parsed setting value (original type if JSON parsable, else string).
 * @property {string} rawValue - Original string value stored (for editing display).
 * @property {string} [description] - Optional description for context.
 */
interface SystemSetting {
	key: string;
	value: any;
	rawValue: string;
	description?: string;
}

/**
 * Dialog state for creating or editing a setting.
 * @property {boolean} open - Whether dialog is visible.
 * @property {SystemSetting | null} editing - The setting being edited, null when creating.
 */
interface EditDialogState {
	open: boolean;
	editing: SystemSetting | null;
}

/**
 * SystemSettingsManager component.
 * Provides CRUD (create/update) functionality over system settings via /settings endpoints.
 * Fetches all settings, renders them in a DataGrid with search + edit/create dialog.
 */
const SystemSettingsManager: React.FC = () => {
	// All settings loaded from server (as array for DataGrid)
	const [settings, setSettings] = useState<SystemSetting[]>([]);
	// Search term for filtering
	const [searchTerm, setSearchTerm] = useState("");
	// Dialog state for create/edit
	const [dialog, setDialog] = useState<EditDialogState>({
		open: false,
		editing: null,
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SettingForm>({
		resolver: zodResolver(settingSchema),
		defaultValues: {
			key: "",
			value: "",
			description: "",
		},
	});

	/**
	 * Fetch all settings from backend and normalize into array.
	 */
	const fetchSettings = useCallback(async () => {
		try {
			const { status, data } = await callApi(
				{ method: "GET", url: API_ENDPOINTS.SETTINGS.BASE },
				{ returnFullResponse: true }
			);
			if (status === 200) {
				setSettings(data);
			}
		} catch (err) {
			console.error("Failed to load settings", err);
		}
	}, []);

	useAdminRealtime({
		entity: "setting",
		onRefresh: fetchSettings,
	});

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	/**
	 * Memoized filtered settings based on search term matching key, description or raw value.
	 */
	const filteredSettings = useMemo(() => {
		const term = searchTerm.toLowerCase();
		if (!term) return settings;
		return settings.filter((s) => {
			const key = (s.key ?? "").toLowerCase();
			const raw = (s.rawValue ?? "").toString().toLowerCase();
			const desc = (s.description ?? "").toLowerCase();
			return (
				key.includes(term) || raw.includes(term) || desc.includes(term)
			);
		});
	}, [settings, searchTerm]);

	/**
	 * Open dialog for creating a new setting.
	 */
	const handleOpenCreate = () => {
		setDialog({ open: true, editing: null });
		reset({
			key: "",
			value: "",
			description: "",
		});
	};

	/**
	 * Open dialog for editing an existing setting.
	 */
	const handleOpenEdit = (row: SystemSetting) => {
		setDialog({ open: true, editing: row });
		reset({
			key: row.key,
			value: row.rawValue,
			description: row.description || "",
		});
	};

	/**
	 * Close dialog and reset form state.
	 */
	const handleCloseDialog = () => {
		if (isSubmitting) return; // prevent closing while saving
		setDialog({ open: false, editing: null });
		reset();
	};

	/**
	 * Persist setting via PUT /settings/:key (upsert).
	 * Attempts to parse formValue as JSON; falls back to raw string.
	 */
	const onSubmit = async (formData: SettingForm) => {
		let valueForServer: any = formData.value;
		try {
			valueForServer = JSON.parse(formData.value);
		} catch {
			// keep as string
		}
		try {
			const response = await callApi(
				{
					method: "PUT",
					url: API_ENDPOINTS.SETTINGS.UPDATE.replace(
						":key",
						formData.key
					),
					data: {
						value: valueForServer,
						description: formData.description,
					},
				},
				{ returnFullResponse: true }
			);

			if (response.status === 200) {
				// Update local state
				setSettings(response.data);
				handleCloseDialog();
			}
		} catch (err) {
			console.error("Failed to save setting", err);
		}
	};

	// DataGrid columns definition
	const columns: GridColDef[] = [
		{ field: "key", headerName: "Key", flex: 1.5, minWidth: 180 },
		{
			field: "value",
			headerName: "Value",
			flex: 1,
			minWidth: 150,
			valueGetter: (value: any) => {
				if (value === null || value === undefined) return "";
				if (typeof value === "object") return JSON.stringify(value);
				return String(value);
			},
		},
		{
			field: "description",
			headerName: "Description",
			flex: 2,
			minWidth: 220,
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
		{
			field: "actions",
			headerName: "",
			width: 60,
			maxWidth: 60,
			minWidth: 60,
			sortable: false,
			renderCell: (params) => {
				const row = params.row as SystemSetting;
				return (
					<IconButton
						size="small"
						color="primary"
						onClick={(e) => {
							e.stopPropagation();
							handleOpenEdit(row);
						}}
						title="Edit"
					>
						<EditIcon sx={{ fontSize: 16 }} />
					</IconButton>
				);
			},
		},
	];

	// Rows for DataGrid come directly from filtered settings; attach id=key for Grid requirements
	const rows = useMemo(
		() => filteredSettings.map((s) => ({ id: s.key, ...s })),
		[filteredSettings]
	);

	return (
		<Box>
			{/* Action bar: create + search */}
			<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleOpenCreate}
				>
					New Setting
				</Button>
				<TextField
					size="small"
					placeholder="Search settings"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					slotProps={{
						input: {
							startAdornment: <SearchIcon />,
						},
					}}
				/>
			</Box>
			<Paper elevation={3}>
				<DataGrid
					rows={rows}
					columns={columns}
					pagination
					initialState={{
						pagination: { paginationModel: { pageSize: 10 } },
					}}
					pageSizeOptions={[5, 10, 20, 50]}
					rowHeight={27}
					sx={{ border: "none" }}
				/>
			</Paper>

			{/* Edit/Create Dialog */}
			<Dialog
				open={dialog.open}
				onClose={handleCloseDialog}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{dialog.editing
						? `Edit Setting: ${dialog.editing.key}`
						: "Create Setting"}
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
							name="key"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Key"
									disabled={!!dialog.editing}
									fullWidth
									size="small"
									error={!!errors.key}
									helperText={errors.key?.message}
								/>
							)}
						/>
						<Controller
							name="value"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Value (JSON or plain text)"
									multiline
									minRows={4}
									fullWidth
									size="small"
									error={!!errors.value}
									helperText={errors.value?.message}
								/>
							)}
						/>
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Description"
									fullWidth
									size="small"
									error={!!errors.description}
									helperText={errors.description?.message}
									value={field.value || ""}
								/>
							)}
						/>
					</DialogContent>
					<DialogActions>
						<Tooltip title="Cancel">
							<span>
								<Button
									onClick={handleCloseDialog}
									disabled={isSubmitting}
									startIcon={<CloseIcon />}
								>
									Cancel
								</Button>
							</span>
						</Tooltip>
						<Tooltip title="Save setting">
							<span>
								<Button
									type="submit"
									disabled={isSubmitting}
									variant="contained"
									startIcon={<SaveIcon />}
								>
									Save
								</Button>
							</span>
						</Tooltip>
					</DialogActions>
				</form>
			</Dialog>
		</Box>
	);
};

export default SystemSettingsManager;
