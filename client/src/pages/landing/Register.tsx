import React, { useState } from "react";
import {
	Container,
	Card,
	CardContent,
	Typography,
	Alert as MUIAlert,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	MenuItem,
	Box,
	Stack,
	Backdrop,
	CircularProgress,
	Divider,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	Key,
	Email,
	Facebook,
	Google,
	PersonAdd,
} from "@mui/icons-material";
import type { Gender } from "@my-types/user";
import axios, { isAxiosError } from "axios";
import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "@constants/index";
import { useNavigate } from "react-router-dom";
import { useDeviceType } from "@utils/deviceHooks";

const Register: React.FC = () => {
	const navigate = useNavigate();
	const genderOptions: Gender[] = ["male", "female", "other"];
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phoneNumber: "",
		address: "",
		gender: "male" as Gender,
		dateOfBirth: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { isMobile, isTablet } = useDeviceType();

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrors({}); // Clear previous errors

		try {
			const response = await axios.post(
				APP_CONFIG.apiBaseUrl + API_ENDPOINTS.AUTH.REGISTER,
				formData, // Use the full form data
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

			if (
				!response.data.csrfToken ||
				!response.data.user
			) {
				console.log("Registration failed: ", response.data);
				setErrors({ general: "Registration failed: Invalid server response." });
				return;
			}

			setMessage(response.data.message);

			// Handle successful registration, maybe store tokens and user data
			// For now, just navigate after a delay
			setTimeout(() => {
				if (response.data.user.role === "Admin") {
					navigate(ROUTES.DASHBOARD_HOME);
				} else {
					navigate(ROUTES.HOME);
				}
			}, 3000);
		} catch (err: unknown) {
			const newErrors: Record<string, string> = {};

			if (isAxiosError(err) && err.response?.data?.errors) {
				// Handle express-validator array of errors
				if (Array.isArray(err.response.data.errors)) {
					err.response.data.errors.forEach(
						(error: { path: string; msg: string }) => {
							if (error.path) {
								newErrors[error.path] = error.msg;
							}
						}
					);
				}
			} else if (isAxiosError(err) && err.response?.data?.message) {
				// Handle single error message from server
				newErrors.general = err.response.data.message;
			} else if (err instanceof Error) {
				newErrors.general = err.message;
			} else {
				newErrors.general = "Registration failed. Please try again.";
			}

			setErrors(newErrors);
			console.error("Registration error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container
			maxWidth="lg"
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				py: {
					xs: 3,
					sm: 3,
				},
			}}
		>
			<Card sx={{ borderRadius: 2, boxShadow: 6 }}>
				<Box
					sx={{
						bgcolor: "success.main",
						color: "#fff",
						py: 2,
						px: 3,
					}}
					className="card-header"
				>
					<Typography variant="h5" fontWeight={700}>
						Register
					</Typography>
				</Box>
				<CardContent
					sx={{
						p: 0,
						"&:last-child": {
							paddingBottom: 0,
						},
					}}
				>
					{errors.general && (
						<MUIAlert severity="error" sx={{ m: 1, mb: 0 }}>
							{errors.general}
						</MUIAlert>
					)}

					{message && (
						<MUIAlert severity="success" sx={{ m: 1, mb: 0 }}>
							{message}
						</MUIAlert>
					)}
					<Grid container sx={{ paddingBottom: 0 }}>
						<Grid size={{ xs: 12, md: 8 }} sx={{ p: 3 }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								mb={2}
							>
								Create a new account.
							</Typography>
							<Box component="form" onSubmit={handleSubmit}>
								<Grid container spacing={2} marginBottom={3}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Email"
											name="email"
											value={formData.email}
											placeholder="Email"
											onChange={handleChange}
											error={!!errors.email}
											helperText={errors.email}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<Email fontSize="small" />
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Password"
											autoComplete="new-password"
											name="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											value={formData.password}
											placeholder="Password"
											onChange={handleChange}
											error={!!errors.password}
											helperText={errors.password}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<Key fontSize="small" />
														</InputAdornment>
													),
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																size="small"
																onClick={() =>
																	setShowPassword(
																		!showPassword
																	)
																}
															>
																{showPassword ? (
																	<VisibilityOff />
																) : (
																	<Visibility />
																)}
															</IconButton>
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Confirm Password"
											name="confirmPassword"
											type="password"
											value={formData.confirmPassword}
											onChange={handleChange}
											error={!!errors.confirmPassword}
											helperText={errors.confirmPassword}
										/>
									</Grid>
								</Grid>

								<Grid container spacing={2}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="First Name"
											name="firstName"
											value={formData.firstName}
											onChange={handleChange}
											error={!!errors.firstName}
											helperText={errors.firstName}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Last Name"
											name="lastName"
											value={formData.lastName}
											onChange={handleChange}
											error={!!errors.lastName}
											helperText={errors.lastName}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Phone Number"
											name="phoneNumber"
											value={formData.phoneNumber}
											onChange={handleChange}
											error={!!errors.phoneNumber}
											helperText={errors.phoneNumber}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Address"
											name="address"
											value={formData.address}
											onChange={handleChange}
											error={!!errors.address}
											helperText={errors.address}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											select
											label="Gender"
											name="gender"
											value={formData.gender}
											onChange={handleChange}
											error={!!errors.gender}
											helperText={errors.gender}
										>
											{genderOptions.map((gender) => (
												<MenuItem
													key={gender}
													value={gender}
												>
													{gender
														.charAt(0)
														.toUpperCase() +
														gender.slice(1)}
												</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Date of Birth"
											name="dateOfBirth"
											type="date"
											value={formData.dateOfBirth}
											onChange={handleChange}
											error={!!errors.dateOfBirth}
											helperText={errors.dateOfBirth}
											slotProps={{
												inputLabel: {
													shrink: true,
												},
											}}
										/>
									</Grid>
								</Grid>
								<Button
									type="submit"
									variant="contained"
									size="medium"
									fullWidth={true}
									sx={{ mt: 2 }}
									disabled={isLoading}
									startIcon={<PersonAdd />}
								>
									{isLoading
										? "Creating Account..."
										: "Register"}
								</Button>
							</Box>
						</Grid>
						{(isMobile || isTablet) && (
							<Divider
								orientation={"horizontal"}
								sx={{
									color: "black",
									borderWidth: 1,
									width: "100%",
								}}
							/>
						)}

						<Grid
							container
							size={{ xs: 12, md: 4 }}
							sx={{
								bgcolor: {
									xs: "inherit",
									sm: "inherit",
									md: "action.hover",
								},
								p: 3,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Grid textAlign="center" width="100%">
								<Typography
									variant="subtitle2"
									color="text.secondary"
									mb={2}
								>
									Or sign up using
								</Typography>
								<Stack spacing={2}>
									<Button
										variant="outlined"
										size="small"
										color="error"
										startIcon={
											<Google
												fontSize="small"
												color="inherit"
											/>
										}
										className="hvr-sweep-to-right"
										sx={{
											":before": {
												backgroundColor: "red",
											},
										}}
									>
										Google
									</Button>
									<Button
										variant="outlined"
										size="small"
										color="primary"
										startIcon={
											<Facebook
												fontSize="small"
												color="inherit"
											/>
										}
										className="hvr-sweep-to-right"
										sx={{
											":before": {
												backgroundColor: "#184fa1ff",
											},
										}}
									>
										Facebook
									</Button>
								</Stack>
							</Grid>
							<Grid
								display={"flex"}
								flexDirection={"column"}
								alignItems={"center"}
								justifyContent={"center"}
								sx={{
									marginTop: 4,
								}}
							>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									mb={2}
								>
									Already have an account?
								</Typography>
								<Button
									onClick={() => {
										navigate("/login");
									}}
								>
									Sign in
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
			<Backdrop
				open={isLoading}
				sx={(theme) => ({
					color: "#fff",
					zIndex: theme.zIndex.drawer + 1,
				})}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Container>
	);
};

export default Register;
