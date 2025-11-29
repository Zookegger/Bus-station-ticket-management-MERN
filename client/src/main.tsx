import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "hover.css";
import App from "./App";
import { AuthProvider } from "@contexts/AuthContext";
import { SocketProvider } from "@contexts/SocketContext";
import { NotificationProvider } from "@contexts/NotificationContext";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<SocketProvider>
				<NotificationProvider>
					<App />
				</NotificationProvider>
			</SocketProvider>
		</AuthProvider>
	</StrictMode>
);
