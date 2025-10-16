import React, { useState } from "react";
import {
	Container,
	Box,
	Card,
	CardContent,
	Typography,
	Alert as MUIAlert,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	Stack,
	Divider,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Backdrop,
	CardHeader,
	Paper,
} from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	Key,
	Google,
	Facebook,
	Login,
	PersonAdd,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "@constants/index";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		login: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [openForget, setOpenForget] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!formData.login) newErrors.login = "Email or username is required";
		if (!formData.password) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await axios.post(
				APP_CONFIG.apiBaseUrl + API_ENDPOINTS.AUTH.LOGIN,
				{
					login: formData.login,
					password: formData.password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 7000,
					timeoutErrorMessage: "Connection timeout, try again",
				}
			);

			if (response.data.user === null) {
				console.log("Login failed: ", response.data);
				setErrors({ general: "Invalid credentials" });
				return;
			}

			console.log("Login successful: ", response.data);
			// Redirect to dashboard home on successful login
			if (response.data.user.role === "admin") {
				navigate(ROUTES.DASHBOARD_HOME);
			} else {
				navigate(ROUTES.HOME);
			}
		} catch (err: unknown) {
			// Fixed: Use 'unknown' instead of specific type or 'any'
			// Narrow the type safely
			let errorMessage = "Login failed. Please try again.";

			if (isAxiosError(err) && err.response?.data?.message) {
				errorMessage = err.response.data.message; // Now TypeScript knows it's a string
			} else if (err instanceof Error) {
				errorMessage = err.message; // Fallback for other Errors
			} // Else: Use the default message for non-Error throws (e.g., strings)

			setErrors({ general: errorMessage }); // Or merge: setErrors((prev) => ({ ...prev, general: errorMessage }));
			console.error("Login error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ py: 6 }}>
			<Paper elevation={6}>
				<Card>
					<CardHeader
						sx={{
							bgcolor: "success.main",
							color: "#fff",
							textAlign: "center",
							py: 2,
						}}
						title="Log in"
						slotProps={{
							title: {
								fontWeight: "bold",
							},
						}}
					/>
					<CardContent sx={{ py: 3 }}>
						{Object.keys(errors).length > 0 && (
							<MUIAlert severity="error" sx={{ mb: 2 }}>
								{Object.values(errors).map((errMsg, index) => (
									<Typography key={index}>
										{errMsg}
									</Typography>
								))}
							</MUIAlert>
						)}
						<Box
							component="form"
							onSubmit={handleSubmit}
							noValidate
						>
							<Stack spacing={2}>
								<TextField
									label="Username or Email"
									name="login"
									type="text"
									autoComplete="username"
									placeholder="Enter username or email"
									value={formData.login}
									onChange={handleChange}
									error={!!errors.login}
									helperText={errors.login}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<Login fontSize="small" />
												</InputAdornment>
											),
										},
									}}
								/>
								<TextField
									label="Password"
									name="password"
									placeholder="Enter your password"
									autoComplete="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
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
														edge="end"
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
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									sx={{
										flexDirection: {
											isMobile: "column",
											isTablet: "column",
											isDesktop: "column",
										},
									}}
								>
									<FormControlLabel
										control={
											<Checkbox
												size="small"
												checked={formData.rememberMe}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														rememberMe:
															e.target.checked,
													}))
												}
											/>
										}
										label={
											<Typography>Remember me</Typography>
										}
									/>
									<Button
										component={RouterLink}
										to="#"
										variant="text"
										size="small"
										onClick={() => setOpenForget(true)}
									>
										Forgot your password?
									</Button>
								</Box>
								<Stack direction="row" spacing={2}>
									<Button
										type="submit"
										variant="contained"
										size="small"
										fullWidth
										startIcon={<Login />}
									>
										Log In
									</Button>
									<Button
										component={RouterLink}
										to={ROUTES.REGISTER}
										variant="outlined"
										size="small"
										fullWidth
										startIcon={<PersonAdd />}
									>
										Register
									</Button>
								</Stack>
								<Divider>
									<Typography>Or log in using</Typography>
								</Divider>
								<Stack spacing={1}>
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
							</Stack>
						</Box>
					</CardContent>
				</Card>
			</Paper>

			<ForgotPasswordDialog open={openForget} onClose={() => { setOpenForget(false) }}/>

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

export default LoginPage;
