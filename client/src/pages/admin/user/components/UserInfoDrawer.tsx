import {
	EventRounded as EventRoundedIcon,
	HomeRounded as HomeRoundedIcon,
	MailOutlineRounded as MailOutlineRoundedIcon,
	PhoneIphoneRounded as PhoneIphoneRoundedIcon,
} from "@mui/icons-material";
import {
	Avatar,
	Button,
	Chip,
	Divider,
	Drawer,
	Paper,
	Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import type { User } from "@my-types";

interface UserInfoDrawerProps {
	user: User;
	open: boolean;
	handleClose: () => void;
}

const UserInfoDrawer: React.FC<UserInfoDrawerProps> = ({
	user,
	open,
	handleClose,
}) => {
	const getInitials = (name: string) => {
		return name
			? name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			: "U";
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={handleClose}
			slotProps={{
				paper: { sx: { width: { xs: 340, sm: 420, md: 480 } } },
			}}
		>
			<Box sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, color: "#2E7D32", mb: 3 }}
				>
					User Details
				</Typography>

				{user && (
					<>
						{/* User Header Profile */}
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
							sx={{ mb: 4 }}
						>
							<Avatar
								src={user.avatar || undefined}
								sx={{
									width: 64,
									height: 64,
									fontSize: 24,
									fontWeight: 600,
									bgcolor: "#e3f2fd",
									color: "#1565c0",
								}}
							>
								{getInitials(user.fullName)}
							</Avatar>
							<Box>
								<Typography
									variant="h6"
									sx={{ fontWeight: 700 }}
								>
									{user.fullName}
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									alignItems="center"
								>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										@{user.userName}
									</Typography>
									<Chip
										size="small"
										label={user.role}
										sx={{
											height: 20,
											fontSize: "0.75rem",
											bgcolor:
												user.role === "Admin"
													? "#f3e5f5"
													: "#e3f2fd",
											color:
												user.role === "Admin"
													? "#7b1fa2"
													: "#1565c0",
										}}
									/>
								</Stack>
							</Box>
						</Stack>

						{/* Contact Info Section */}
						<Paper variant="outlined" sx={{ mb: 3 }}>
							<Box
								sx={{
									p: 1.5,
									bgcolor: "#f5f5f5",
									borderBottom: 1,
									borderColor: "divider",
								}}
							>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700 }}
								>
									Contact Information
								</Typography>
							</Box>
							<Box sx={{ p: 2 }}>
								<Stack spacing={2}>
									<Stack
										direction="row"
										spacing={2}
										alignItems="center"
									>
										<MailOutlineRoundedIcon
											color="action"
											fontSize="small"
										/>
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
											>
												Email Address
											</Typography>
											<Typography variant="body2">
												{user.email}
											</Typography>
											<Chip
												label={
													user.emailConfirmed
														? "Verified"
														: "Unverified"
												}
												size="small"
												color={
													user.emailConfirmed
														? "success"
														: "warning"
												}
												variant="outlined"
												sx={{ height: 20, mt: 0.5 }}
											/>
										</Box>
									</Stack>

									<Stack
										direction="row"
										spacing={2}
										alignItems="center"
									>
										<PhoneIphoneRoundedIcon
											color="action"
											fontSize="small"
										/>
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
											>
												Phone Number
											</Typography>
											<Typography variant="body2">
												{user.phoneNumber ||
													"Not provided"}
											</Typography>
										</Box>
									</Stack>
								</Stack>
							</Box>
						</Paper>

						{/* Personal Info Section */}
						<Paper variant="outlined" sx={{ mb: 3 }}>
							<Box
								sx={{
									p: 1.5,
									bgcolor: "#f5f5f5",
									borderBottom: 1,
									borderColor: "divider",
								}}
							>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700 }}
								>
									Personal Information
								</Typography>
							</Box>
							<Box sx={{ p: 2 }}>
								<Stack spacing={2}>
									<Stack
										direction="row"
										spacing={2}
										alignItems="center"
									>
										<EventRoundedIcon
											color="action"
											fontSize="small"
										/>
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
											>
												Date of Birth
											</Typography>
											<Typography variant="body2">
												{user.dateOfBirth
													? new Date(
															user.dateOfBirth
													  ).toLocaleDateString()
													: "Not provided"}
											</Typography>
										</Box>
									</Stack>

									<Stack
										direction="row"
										spacing={2}
										alignItems="center"
									>
										<HomeRoundedIcon
											color="action"
											fontSize="small"
										/>
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
											>
												Address
											</Typography>
											<Typography variant="body2">
												{user.address || "Not provided"}
											</Typography>
										</Box>
									</Stack>
								</Stack>
							</Box>
						</Paper>

						<Divider sx={{ my: 2 }} />

						<Button
							variant="outlined"
							fullWidth
							onClick={handleClose}
						>
							Close Details
						</Button>
					</>
				)}
			</Box>
		</Drawer>
	);
};

export default UserInfoDrawer;