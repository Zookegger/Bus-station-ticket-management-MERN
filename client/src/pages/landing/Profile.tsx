import React, { useEffect, useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
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
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import axios from "axios";
import { APP_CONFIG, API_ENDPOINTS, ROUTES } from "@constants/index";
import type { UpdateProfileDTO } from "@my-types/user";
import { formatDateForInput } from "@utils/formatting";
import { useNavigate } from "react-router-dom";

const InfoListItem: React.FC<{
	icon: React.ReactNode;
	primary: string;
	secondary?: string;
}> = ({ icon, primary, secondary }) => (
	<ListItem>
		<ListItemIcon>{icon}</ListItemIcon>
		<ListItemText primary={primary} secondary={secondary} />
	</ListItem>
);

const Profile: React.FC = () => {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UpdateProfileDTO | null>(null);
	const [editedProfile, setEditedProfile] = useState<UpdateProfileDTO>({});
	const [isEditing, setIsEditing] = useState(false);
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
				email: data.email ?? "",
				phoneNumber: data.phoneNumber ?? "",
				address: data.address ?? null,
				dateOfBirth: formatDateForInput(data.dateOfBirth),
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

			const payload: UpdateProfileDTO = { ...editedProfile };
			if (!payload.dateOfBirth) delete payload.dateOfBirth;
			if (!payload.address) delete payload.address;

			await axios.put(
				`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.USERS.UPDATE_PROFILE}`,
				payload,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			fetchProfile();

			setIsEditing(false);
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
			// window.location.href = "/";
			navigate(ROUTES.HOME);
		} catch (err) {
			setError("Failed to delete account.");
			setDeleteDialogOpen(false);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
			>
				<Box
					sx={{ width: { xs: "100%", md: "80%", lg: "60%" }, mb: 2 }}
				>
					<Typography variant="h4" fontWeight="bold">
						Manage your account
					</Typography>
					<Typography variant="h5" fontWeight="semibold" color="gray">
						Change your account settings
					</Typography>
				</Box>
				<Card sx={{ width: { xs: "100%", md: "80%", lg: "60%" } }}>
					<CardHeader
						avatar={
							<Avatar
								src={editedProfile.avatar ?? ""}
								sx={{ width: 72, height: 72 }}
							/>
						}
						action={
							<IconButton
								onClick={() => setIsEditing(!isEditing)}
							>
								<EditIcon />
							</IconButton>
						}
						title={
							<Typography variant="h6">
								{editedProfile.fullName ?? ""}
							</Typography>
						}
					/>

					<CardContent>
						{successMessage && (
							<Alert severity="success" sx={{ mb: 2 }}>
								{successMessage}
							</Alert>
						)}

						<List>
							{isEditing ? (
								<>
									<TextField
										label="Full Name"
										name="fullName"
										value={editedProfile.fullName ?? ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
									/>
									<TextField
										label="Phone Number"
										name="phoneNumber"
										value={editedProfile.phoneNumber ?? ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
									/>
									<TextField
										label="Address"
										name="address"
										value={editedProfile.address ?? ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
									/>
									<TextField
										label="Date of Birth"
										name="dateOfBirth"
										type="date"
										value={editedProfile.dateOfBirth ?? ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
										InputLabelProps={{ shrink: true }}
									/>
									<TextField
										label="Avatar URL"
										name="avatar"
										value={editedProfile.avatar ?? ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
									/>

									<Button
										variant="contained"
										color="primary"
										onClick={handleSaveClick}
										disabled={isLoading}
									>
										{isLoading ? (
											<CircularProgress size={24} />
										) : (
											"Save Changes"
										)}
									</Button>
								</>
							) : (
								<>
									<InfoListItem
										icon={<EmailIcon />}
										primary={profile.email ?? ""}
										secondary="Email"
									/>
									<InfoListItem
										icon={<PhoneIcon />}
										primary={profile.phoneNumber ?? ""}
										secondary="Phone Number"
									/>
									<InfoListItem
										icon={<LocationOnIcon />}
										primary={profile.address ?? ""}
										secondary="Address"
									/>
									<InfoListItem
										icon={<CakeIcon />}
										primary={
											profile.dateOfBirth
												? new Date(
														profile.dateOfBirth
												  ).toLocaleDateString()
												: ""
										}
										secondary="Date of Birth"
									/>
								</>
							)}
						</List>

						{!isEditing && (
							<Box
								mt={3}
								display="flex"
								justifyContent="flex-end"
							>
								<Button
									variant="outlined"
									color="error"
									onClick={() => setDeleteDialogOpen(true)}
								>
									Delete Account
								</Button>
							</Box>
						)}
					</CardContent>
				</Card>

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
			</Box>
		</div>
	);
};

export default Profile;
