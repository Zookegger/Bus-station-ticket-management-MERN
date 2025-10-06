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
} from "@mui/material";
import { Grid } from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	Key,
	Email,
	CalendarToday,
} from "@mui/icons-material";

const Register: React.FC = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		address: "",
		gender: "Male",
		dateOfBirth: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	const state = { error: null, isLoading: false };

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
		setTimeout(() => setIsLoading(false), 800);
	};

	return (
		<Container maxWidth="lg" sx={{ py: 6 }}>
			<Card sx={{ borderRadius: 2, boxShadow: 6 }}>
				<Box
					sx={{
						bgcolor: "success.main",
						color: "#fff",
						py: 2,
						px: 3,
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
					}}
				>
					<Typography variant="h5" fontWeight={700}>
						Register
					</Typography>
				</Box>
				<CardContent sx={{ p: 0 }}>
					{state.error && (
						<MUIAlert severity="error" sx={{ m: 4, mb: 0 }}>
							{state.error}
						</MUIAlert>
					)}
					<Grid container>
						<Grid size={{ xs: 12, md: 8 }} sx={{ p: 3 }}>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								mb={2}
							>
								Create a new account.
							</Typography>
							<Box component="form" onSubmit={handleSubmit}>
								<Grid container spacing={2}>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Email fontSize="small" />
													</InputAdornment>
												),
											}}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Password"
											name="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											value={formData.password}
											onChange={handleChange}
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
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Confirm Password"
											name="confirmPassword"
											type="password"
											value={formData.confirmPassword}
											onChange={handleChange}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Full Name"
											name="name"
											value={formData.name}
											onChange={handleChange}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Phone Number"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											label="Address"
											name="address"
											value={formData.address}
											onChange={handleChange}
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
										>
											<MenuItem value="Male">
												Male
											</MenuItem>
											<MenuItem value="Female">
												Female
											</MenuItem>
											<MenuItem value="Other">
												Other
											</MenuItem>
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
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<CalendarToday fontSize="small" />
													</InputAdornment>
												),
											}}
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
								</Grid>
								<Button
									type="submit"
									variant="contained"
									size="small"
									sx={{ mt: 2 }}
									disabled={state.isLoading || isLoading}
								>
									{isLoading
										? "Creating Account..."
										: "Register"}
								</Button>
							</Box>
						</Grid>
						<Grid
							size={{ xs: 12, md: 4 }}
							sx={{
								bgcolor: "action.hover",
								p: 3,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Box textAlign="center" width="100%">
								<Typography
									variant="subtitle2"
									color="text.secondary"
									mb={2}
								>
									Or sign up using
								</Typography>
								<Stack spacing={2}>
									<Button variant="outlined" size="small">
										Google
									</Button>
									<Button variant="outlined" size="small">
										Facebook
									</Button>
								</Stack>
							</Box>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Container>
	);
};

export default Register;
