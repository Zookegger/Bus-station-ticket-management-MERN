import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Stack,
} from "@mui/material";
import type { User } from "@my-types/user";
import { Role } from "@my-types/user";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";

interface Props {
	open: boolean;
	onClose: () => void;
	onSaved: (created: User) => void;
}

const AddUserForm: React.FC<Props> = ({ open, onClose, onSaved }) => {
	const [form, setForm] = useState({
		fullName: "",
		userName: "",
		email: "",
		phoneNumber: "",
		role: Role.USER,
		password: "",
	});
	const [saving, setSaving] = useState(false);

	const handleChange = (k: string, v: any) =>
		setForm((s) => ({ ...s, [k]: v }));

	const handleCreate = async () => {
		// Basic required fields
		if (!form.userName || !form.email) return;
		setSaving(true);
		try {
			const res = await callApi<User>({
				method: "POST",
				url: API_ENDPOINTS.ADMIN.ADD,
				data: {
					fullName: form.fullName,
					userName: form.userName,
					email: form.email,
					phoneNumber: form.phoneNumber,
					role: form.role,
					password: form.password || undefined,
				},
			});

			const created = (res as any).user ?? (res as any).data ?? res;
			onSaved(created as User);
			onClose();
		} catch (err) {
			console.error("Failed to create user", err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Add New User</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<TextField
						label="Full name"
						value={form.fullName}
						onChange={(e) =>
							handleChange("fullName", e.target.value)
						}
						fullWidth
					/>
					<TextField
						label="Username"
						value={form.userName}
						onChange={(e) =>
							handleChange("userName", e.target.value)
						}
						fullWidth
					/>
					<TextField
						label="Email"
						value={form.email}
						onChange={(e) => handleChange("email", e.target.value)}
						fullWidth
					/>
					<TextField
						label="Phone"
						value={form.phoneNumber}
						onChange={(e) =>
							handleChange("phoneNumber", e.target.value)
						}
						fullWidth
					/>
					<TextField
						select
						label="Role"
						value={form.role}
						onChange={(e) => handleChange("role", e.target.value)}
					>
						<MenuItem value={Role.USER}>User</MenuItem>
						<MenuItem value={Role.ADMIN}>Admin</MenuItem>
					</TextField>
					<TextField
						label="Password"
						type="password"
						value={form.password}
						onChange={(e) =>
							handleChange("password", e.target.value)
						}
						helperText="Optional: set a password or leave blank to auto-generate"
						fullWidth
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleCreate}
					variant="contained"
					disabled={saving || !form.userName || !form.email}
				>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddUserForm;
