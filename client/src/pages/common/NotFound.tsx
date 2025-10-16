import React from "react";
import {
	Container,
	Box,
	Card,
	CardContent,
	Typography,
	Stack,
	Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "@constants";

const NotFound: React.FC = () => {
	return (
		<Container maxWidth="sm" sx={{ py: 6 }}>
			<Card>
				<CardContent>
					<Box textAlign="center" mb={3}>
						<Typography variant="h2" color="text.secondary">
							404
						</Typography>
						<Typography variant="h5" gutterBottom>
							Page Not Found
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Sorry, the page you are looking for doesn't exist or
							has been moved.
						</Typography>
					</Box>
					<Stack direction="row" spacing={2} justifyContent="center">
						<Button
							component={RouterLink}
							to={ROUTES.HOME}
							variant="contained"
							size="small"
						>
							Go Home
						</Button>
						<Button
							variant="outlined"
							size="small"
							onClick={() => window.history.back()}
						>
							Go Back
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Container>
	);
};

export default NotFound;
