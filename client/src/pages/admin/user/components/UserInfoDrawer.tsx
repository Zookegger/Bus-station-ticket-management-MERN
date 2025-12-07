import {
	Close as CloseIcon,
	EventRounded as EventRoundedIcon,
	HomeRounded as HomeRoundedIcon,
	MailOutlineRounded as MailOutlineRoundedIcon,
	PhoneIphoneRounded as PhoneIphoneRoundedIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	FacebookSharp as FacebookIcon,
	Google as GoogleIcon,
	AccountCircle as AccountIcon,
	CheckCircle,
} from "@mui/icons-material";
import {
	Avatar,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	Divider,
	Drawer,
	IconButton,
	Paper,
	Typography,
	useTheme,
} from "@mui/material";
import { Box, Grid, Stack } from "@mui/system";
import type { User } from "@my-types";

interface UserInfoDrawerProps {
	user: User;
	open: boolean;
	onClose: () => void;
	onEdit: (user: User) => void;
	onDelete: (id: string) => void;
}

const UserInfoDrawer: React.FC<UserInfoDrawerProps> = ({
	user,
	open,
	onClose,
	onEdit,
	onDelete,
}) => {
	const theme = useTheme();

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

	const getIcon = (provider: string) => {
		switch (provider) {
			case "google":
				return <GoogleIcon sx={{ color: "#DB4437", fontSize: 40 }} />;
			case "facebook":
				return <FacebookIcon sx={{ color: "#1877F2", fontSize: 40 }} />;
			default:
				return <AccountIcon />;
		}
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						width: 400,
						bgcolor: "#f8f9fa",
					},
				},
			}}
		>
			{user ? (
				<Card
					sx={{
						p: 1,
						height: "100%",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<CardHeader
						title={
							<Typography
								variant="h5"
								sx={{ fontWeight: 700, color: "#2E7D32" }}
							>
								User Details
							</Typography>
						}
						action={
							<IconButton
								className="hvr-icon-grow"
								onClick={onClose}
							>
								<CloseIcon className="hvr-icon" />
							</IconButton>
						}
					/>

					<Divider />

					<CardContent sx={{ flex: 1, overflow: "auto" }}>
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
						<Paper variant="outlined" sx={{ mb: 3 }} elevation={5}>
							<Card>
								<CardHeader
									sx={{
										p: 1.5,
									}}
									title={
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 700 }}
										>
											Contact Information
										</Typography>
									}
								/>

								<Divider sx={{ bgcolor: "#000" }} />

								<CardContent sx={{ p: 2 }}>
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
								</CardContent>
							</Card>
						</Paper>

						{/* Personal Info Section */}
						<Paper variant="outlined" sx={{ mb: 3 }}>
							<CardHeader
								sx={{
									p: 1.5,
								}}
								title={
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 700 }}
									>
										Personal Information
									</Typography>
								}
							/>

							<Divider sx={{ bgcolor: "#000" }} />

							<CardContent sx={{ p: 2 }}>
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
							</CardContent>
						</Paper>

						{user.federatedCredentials &&
							user.federatedCredentials.length > 0 && (
								<Card>
									<CardHeader
										sx={{
											p: 1.5,
										}}
										title={
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 700 }}
											>
												Connected Accounts
											</Typography>
										}
									/>

									<Divider sx={{ bgcolor: "#000" }} />

									<CardContent sx={{ p: 1 }}>
										<Grid container spacing={1}>
											{user.federatedCredentials.map(
												(oauth) => (
													<Grid
														size={{
															xs: 12,
															sm: 6,
														}}
														key={oauth.id}
													>
														<Paper
															variant="outlined"
															sx={{
																borderRadius: 2,
																py: 2,
																transition:
																	"all 0.2s",
																"&:hover": {
																	borderColor:
																		"primary.main",
																	bgcolor:
																		"action.hover",
																	boxShadow:
																		theme
																			.shadows?.[2] ||
																		"none",
																},
															}}
														>
															<Stack
																direction="row"
																alignItems="center"
																spacing={1}
															>
																{/* Icon Container */}
																<Stack
																	sx={{
																		width: 40,
																		height: 40,
																		px: 0.75,
																		borderRadius:
																			"50%",
																		bgcolor:
																			"action.selected",
																		color: "primary.main",
																	}}
																>
																	{getIcon(
																		oauth.provider
																	)}
																</Stack>

																<Stack
																	flex={1}
																	alignItems={
																		"flex-start"
																	}
																>
																	<Typography
																		variant="subtitle2"
																		sx={{
																			textTransform:
																				"capitalize",
																			fontWeight: 600,
																		}}
																	>
																		{
																			oauth.provider
																		}
																	</Typography>
																	<Chip
																		label="Connected"
																		color="success"
																		size="small"
																		variant="outlined" // or "filled" for more pop
																		icon={
																			<CheckCircle
																				sx={{
																					"&&": {
																						fontSize: 16,
																					},
																				}}
																			/>
																		}
																		sx={{
																			mt: 0.5,
																			height: 20,
																			fontSize:
																				"0.75rem",
																			fontWeight: 500,
																		}}
																	/>
																</Stack>
															</Stack>
														</Paper>
													</Grid>
												)
											)}
										</Grid>
									</CardContent>
								</Card>
							)}
					</CardContent>

					<Divider />

					<CardActions sx={{ gap: 1 }}>
						<Button
							variant="contained"
							startIcon={<EditIcon />}
							onClick={() => onEdit(user)}
							sx={{
								bgcolor: "#1976d2",
								flex: 1,
								"&:hover": {
									borderColor: "primary.main",
									bgcolor: "#165799ff",
									boxShadow: theme.shadows?.[2] || "none",
								},
							}}
						>
							Edit
						</Button>
						<Button
							variant="contained"
							startIcon={<DeleteIcon />}
							onClick={() => onDelete(user.id)}
							sx={{
								bgcolor: "#d32f2f",
								flex: 1,
								"&:hover": {
									borderColor: "primary.main",
									bgcolor: "#811e1eff",
									boxShadow: theme.shadows?.[2] || "none",
								},
							}}
						>
							Delete
						</Button>
					</CardActions>
				</Card>
			) : (
				<>No information provided</>
			)}
		</Drawer>
	);
};

export default UserInfoDrawer;
