import React, { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { useMatches } from "react-router-dom";

const PageTitleUpdater = () => {
	const matches = useMatches();
	const default_title = "EasyRide - Bus Ticket Booking";

	const title = useMemo(() => {
		// find the deepest route with a handle.title
		const match = [...matches].reverse().find((match) => {
			return (match as any).handle;
		});

		if (match) {
			const h = (match as any).handle;

			return typeof h.title === "function"
				? h.title(match.data)
				: h.title;
		}

		return default_title;
	}, [matches]);

	useEffect(() => {
		document.title = title;
	}, [title]);

	return null;
};

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Header />

			<Box
				component="main"
				sx={{
					flex: 1,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					maxWidth: "100vw",
				}}
			>
				<PageTitleUpdater />
				{children}
			</Box>

			<Footer />
		</Box>
	);
};

export default Layout;
