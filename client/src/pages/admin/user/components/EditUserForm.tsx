import React, { useEffect, useState } from "react";
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
  user: User | null;
  onClose: () => void;
  onSaved: (updated: User) => void;
}

const EditUserForm: React.FC<Props> = ({ open, user, onClose, onSaved }) => {
  const [form, setForm] = useState({ fullName: "", email: "", role: Role.USER, phoneNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        role: (user.role as Role) || Role.USER,
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleChange = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await callApi<User>({
        method: "PUT",
        url: API_ENDPOINTS.ADMIN.UPDATE(String(user.id)),
        data: form,
      });
      const updated = (res as any).user ?? (res as any).data ?? res;
      onSaved(updated as User);
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
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
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserForm;
