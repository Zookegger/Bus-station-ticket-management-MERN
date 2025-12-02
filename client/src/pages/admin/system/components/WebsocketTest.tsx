import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	TextField,
	Grid,
	Paper,
	Alert,
	List,
	ListItem,
	ListItemText,
	Divider,
} from "@mui/material";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import { useSocket } from "@contexts/SocketContext";

const WebsocketTest: React.FC = () => {
	const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
	const [wsTestRoom, setWsTestRoom] = useState("trip:1");
	const [wsTestEvent, setWsTestEvent] = useState("test:event");
	const [wsTestData, setWsTestData] = useState(
		'{"message": "Hello from debug!"}'
	);
	const [wsStats, setWsStats] = useState<any>(null);
	const [receivedEvents, setReceivedEvents] = useState<any[]>([]);
	const [alert, setAlert] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Listen for test events
	useEffect(() => {
		if (!socket) return;

		const handleTestEvent = (data: any) => {
			setReceivedEvents((prev) => [
				...prev,
				{ event: "test:event", data, timestamp: new Date() },
			]);
		};

		socket.on("test:event", handleTestEvent);

		return () => {
			socket.off("test:event", handleTestEvent);
		};
	}, [socket]);

	const showAlert = (type: "success" | "error", message: string) => {
		setAlert({ type, message });
		setTimeout(() => setAlert(null), 5000);
	};

	const handleTestWebsocket = async () => {
		try {
			let data;
			try {
				data = JSON.parse(wsTestData);
			} catch {
				data = wsTestData;
			}

			await callApi({
				method: "POST",
				url: API_ENDPOINTS.DEBUG.TEST_WEBSOCKET,
				data: {
					room: wsTestRoom || undefined,
					event: wsTestEvent,
					data,
				},
			});

			showAlert("success", "WebSocket test broadcast sent!");
		} catch (error: any) {
			showAlert(
				"error",
				`Failed to send WebSocket test: ${error.message}`
			);
		}
	};

	const handleGetWebsocketStats = async () => {
		try {
			const response = await callApi({
				method: "GET",
				url: API_ENDPOINTS.DEBUG.WEBSOCKET_STATS,
			});
			setWsStats(response.data);
			showAlert("success", "WebSocket stats retrieved!");
		} catch (error: any) {
			showAlert(
				"error",
				`Failed to get WebSocket stats: ${error.message}`
			);
		}
	};

	const handleJoinRoom = () => {
		if (wsTestRoom) {
			joinRoom(wsTestRoom);
			showAlert("success", `Joined room: ${wsTestRoom}`);
		}
	};

	const handleLeaveRoom = () => {
		if (wsTestRoom) {
			leaveRoom(wsTestRoom);
			showAlert("success", `Left room: ${wsTestRoom}`);
		}
	};

	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
			<Typography variant="h4" gutterBottom>
				Developer Debug Tools
			</Typography>

			{alert && (
				<Alert severity={alert.type} sx={{ mb: 2 }}>
					{alert.message}
				</Alert>
			)}

			<Grid container spacing={3}>
				{/* WebSocket Test Section */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							WebSocket Testing
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							Connection Status:{" "}
							{isConnected ? "Connected" : "Disconnected"}
						</Typography>

						<TextField
							fullWidth
							label="Room (optional)"
							value={wsTestRoom}
							onChange={(e) => setWsTestRoom(e.target.value)}
							sx={{ mb: 2 }}
							placeholder="e.g., trip:1 or user:123"
						/>

						<TextField
							fullWidth
							label="Event Name"
							value={wsTestEvent}
							onChange={(e) => setWsTestEvent(e.target.value)}
							sx={{ mb: 2 }}
						/>

						<TextField
							fullWidth
							label="Event Data (JSON)"
							value={wsTestData}
							onChange={(e) => setWsTestData(e.target.value)}
							multiline
							rows={3}
							sx={{ mb: 2 }}
						/>

						<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
							<Button
								variant="contained"
								onClick={handleTestWebsocket}
							>
								Send Test Event
							</Button>
							<Button
								variant="outlined"
								onClick={handleGetWebsocketStats}
							>
								Get Stats
							</Button>
							<Button variant="outlined" onClick={handleJoinRoom}>
								Join Room
							</Button>
							<Button
								variant="outlined"
								onClick={handleLeaveRoom}
							>
								Leave Room
							</Button>
						</Box>
					</Paper>
				</Grid>

				{/* WebSocket Stats */}
				<Grid size={{ xs: 12, md: 6 }}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							WebSocket Stats
						</Typography>
						{wsStats ? (
							<Box>
								<Typography>
									<strong>Connected Clients:</strong>{" "}
									{wsStats.connectedClients}
								</Typography>
								<Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
									Rooms:
								</Typography>
								{Object.keys(wsStats.rooms).length > 0 ? (
									Object.entries(wsStats.rooms).map(
										([room, count]) => (
											<Typography
												key={room}
												sx={{ ml: 2 }}
											>
												{room}: {count as number} clients
											</Typography>
										)
									)
								) : (
									<Typography color="text.secondary">
										No active rooms
									</Typography>
								)}
							</Box>
						) : (
							<Typography color="text.secondary">
								No stats loaded
							</Typography>
						)}
					</Paper>
				</Grid>

				{/* Received Events */}
				<Grid size={{ xs: 12 }}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Received Events (Last 10)
						</Typography>
						<List sx={{ maxHeight: 300, overflow: "auto" }}>
							{receivedEvents.length > 0 ? (
								receivedEvents
									.slice(-10)
									.map((event, index) => (
										<React.Fragment key={index}>
											<ListItem>
												<ListItemText
													primary={`${
														event.event
													} - ${event.timestamp.toLocaleTimeString()}`}
													secondary={
														<pre>
															{JSON.stringify(
																event.data,
																null,
																2
															)}
														</pre>
													}
												/>
											</ListItem>
											{index <
												receivedEvents.length - 1 && (
												<Divider />
											)}
										</React.Fragment>
									))
							) : (
								<ListItem>
									<ListItemText primary="No events received yet" />
								</ListItem>
							)}
						</List>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default WebsocketTest;
