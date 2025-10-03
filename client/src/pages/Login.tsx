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
} from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	Key,
	Email,
	Google,
	Facebook,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "@constants/index";

const Login: React.FC = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	const state = { error: null, isLoading: false };

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.password) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setTimeout(() => setIsLoading(false), 800);
		setIsLoading(false);
	};

	return (
		<Container maxWidth="sm" sx={{ py: 6 }}>
			<Card sx={{ borderRadius: 2, boxShadow: 6 }}>
				<Box
					sx={{
						bgcolor: "success.main",
						color: "#fff",
						textAlign: "center",
						py: 2,
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
					}}
				>
					<Typography variant="h5" fontWeight={700}>
						Log in
					</Typography>
				</Box>
				<CardContent>
					{state.error && (
						<MUIAlert severity="error" sx={{ mb: 2 }}>
							{state.error}
						</MUIAlert>
					)}
					<Box component="form" onSubmit={handleSubmit} noValidate>
						<Stack spacing={2}>
							<TextField
								label="Email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								error={!!errors.email}
								helperText={errors.email}
								
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Email fontSize="small" />
										</InputAdornment>
									),
								}}
							/>
							<TextField
								label="Password"
								name="password"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleChange}
								error={!!errors.password}
								helperText={errors.password}
								InputProps={{
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
								}}
							/>
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
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
										<Typography variant="body2">
											Remember me
										</Typography>
									}
								/>
								<Button
									component={RouterLink}
									to="#"
									variant="text"
									size="small"
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
								>
									Log In
								</Button>
								<Button
									component={RouterLink}
									to={ROUTES.REGISTER}
									variant="outlined"
									size="small"
									fullWidth
								>
									Register
								</Button>
							</Stack>
							<Divider>Or log in using</Divider>
							<Stack spacing={1}>
								<Button
									variant="outlined"
									size="small"
									startIcon={<Google fontSize="small" />}
								>
									Google
								</Button>
								<Button
									variant="outlined"
									size="small"
									startIcon={<Facebook fontSize="small" />}
								>
									Facebook
								</Button>
							</Stack>
						</Stack>
					</Box>
				</CardContent>
			</Card>
			<Backdrop open={isLoading} sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Container>
	);
};

export default Login;
