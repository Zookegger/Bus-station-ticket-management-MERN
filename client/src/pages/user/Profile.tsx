import React, { useEffect, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Card,
	Typography,
	TextField,
	CircularProgress,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
} from "@mui/material";
import axios from "axios";
import { APP_CONFIG, API_ENDPOINTS, ROUTES } from "@constants/index";
import type { UpdateProfileDTO } from "@my-types/user";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UpdateProfileDTO | null>(null);
	const [editedProfile, setEditedProfile] = useState<
		UpdateProfileDTO & { gender?: string }
	>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const fetchProfile = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("jwt");

			const response = await axios.get(
				`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.AUTH.ME}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			const data = response.data.user;

			setProfile(data);
			setEditedProfile({
				fullName: data.fullName ?? "",
				phoneNumber: data.phoneNumber ?? "",
				address: data.address ?? null,
				dateOfBirth: data.dateOfBirth,
				avatar: data.avatar ?? "",
			});
		} catch {
			setError("Failed to fetch profile data.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const handleSaveClick = async () => {
		try {
			setIsLoading(true);
			setError(null);
			setSuccessMessage(null);

			const token = localStorage.getItem("jwt");

			const payload: UpdateProfileDTO & { gender?: string } = {
				...editedProfile,
			};
			if (!payload.dateOfBirth) delete payload.dateOfBirth;
			if (!payload.address) delete payload.address;

			await axios.put(
				`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.USERS.UPDATE_PROFILE}`,
				payload,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			fetchProfile();

			setSuccessMessage("Profile updated successfully!");
		} catch {
			setError("Failed to update profile.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		try {
			setDeleteLoading(true);
			const token = localStorage.getItem("jwt");
			const user_id = localStorage.getItem("user_id");

			await axios.delete(
				`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.USERS.BASE}/${user_id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// Clear local storage and redirect to home
			localStorage.clear();
			navigate(ROUTES.HOME);
		} catch (err) {
			setError("Failed to delete account.");
            console.error(err);
			setDeleteDialogOpen(false);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setEditedProfile((prev) => ({
			...prev,
			[e.target.name]: e.target.value || null,
		}));
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" minHeight="80vh">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box p={3} display="flex" justifyContent="center">
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	if (!profile) {
		return (
			<Box p={3} display="flex" justifyContent="center">
				<Alert severity="info">No profile data available.</Alert>
			</Box>
		);
	}

	return (
		<div>
			<Box
				p={3}
				display="flex"
				flexDirection="column"
				alignItems="center"
				gap={4}
			>
				<Typography variant="h4" sx={{ color: "green", mb: 2 }}>
					Personal Profile
				</Typography>

				{successMessage && (
					<Alert
						severity="success"
						sx={{
							mb: 2,
							width: { xs: "100%", md: "80%", lg: "60%" },
						}}
					>
						{successMessage}
					</Alert>
				)}

				<Card
					sx={{
						display: "flex",
						width: { xs: "100%", md: "80%", lg: "60%" },
						boxShadow: 3,
					}}
				>
					<Box
						sx={{
							p: 2,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							minWidth: 200,
						}}
					>
						<Typography variant="subtitle1" gutterBottom>
							Avatar
						</Typography>
						<Avatar
							src={editedProfile.avatar ?? ""}
							sx={{ width: 100, height: 100, mb: 2 }}
						>
							{editedProfile.fullName?.charAt(0).toUpperCase() ||
								"N"}
						</Avatar>
					</Box>

					<Box sx={{ p: 2, flex: 1 }}>
						<Typography variant="subtitle1" gutterBottom>
							Personal Information
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}
						>
							<TextField
								label="Full Name *"
								name="fullName"
								value={editedProfile.fullName ?? ""}
								onChange={handleChange}
								fullWidth
							/>
							<TextField
								label="Phone Number"
								name="phoneNumber"
								value={editedProfile.phoneNumber ?? ""}
								onChange={handleChange}
								fullWidth
							/>
							<TextField
								label="Birth"
								name="dateOfBirth"
								type="date"
								value={editedProfile.dateOfBirth ?? ""}
								onChange={handleChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="Address"
								name="address"
								value={editedProfile.address ?? ""}
								onChange={handleChange}
								fullWidth
							/>
							<TextField
								label="Avatar URL"
								name="avatar"
								value={editedProfile.avatar ?? ""}
								onChange={handleChange}
								fullWidth
							/>
						</Box>
					</Box>
				</Card>

				<Box
					mt={3}
					display="flex"
					justifyContent="center"
					gap={2}
					sx={{ width: { xs: "100%", md: "80%", lg: "60%" } }}
				>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSaveClick}
						disabled={isLoading}
					>
						{isLoading ? (
							<CircularProgress size={24} />
						) : (
							"UPDATE INFORMATION"
						)}
					</Button>
					<Button
						variant="outlined"
						onClick={() =>
							alert(
								"Change password functionality not implemented."
							)
						}
					>
						CHANGE PASSWORD
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={() => setDeleteDialogOpen(true)}
					>
						Delete Account
					</Button>
				</Box>
			</Box>

			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Confirm Account Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete your account? This
						action cannot be undone. All your data will be
						permanently deleted.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setDeleteDialogOpen(false)}
						color="primary"
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteAccount}
						color="error"
						disabled={deleteLoading}
					>
						{deleteLoading ? (
							<CircularProgress size={24} />
						) : (
							"Delete Account"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Profile;
