import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Stack,
	Typography,
} from "@mui/material";
import QRCode from "react-qr-code";
import { APP_CONFIG } from "@constants/config";

export interface TicketQRDialogProps {
	open: boolean;
	onClose: () => void;
	orderId: string;
	checkInToken: string;
}

/**
 * TicketQRDialog renders a QR code for check-in and provides a simple print action.
 * The QR encodes a URL of the form:
 * https://[CLIENT_URL]/check-in/[orderId]?token=[checkInToken]
 */
const TicketQRDialog: React.FC<TicketQRDialogProps> = ({
	open,
	onClose,
	orderId,
	checkInToken,
}) => {
	// Prefer client URL from window, fallback to serverBaseUrl host if needed
	const origin =
		typeof window !== "undefined"
			? window.location.origin
			: APP_CONFIG.serverBaseUrl;
	const qrUrl = `${origin}/check-in/${orderId}?token=${encodeURIComponent(
		checkInToken
	)}`;

	const handlePrint = () => {
		// Get the SVG QR code from the dialog to embed in print
		const qrElement = document.querySelector('#dialog-qr-code');
		const qrSvg = qrElement?.outerHTML || '';
		
		const now = new Date();
		const printDate = now.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
		
		const htmlContent = `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Boarding Pass - ${orderId.substring(0, 8).toUpperCase()}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { 
			font-family: 'Courier New', monospace; 
			max-width: 380px;
			margin: 0 auto;
			padding: 20px;
			background: #fff;
		}
		.receipt {
			border: 2px dashed #333;
			padding: 24px 20px;
			background: #fff;
		}
		.header {
			text-align: center;
			border-bottom: 2px dashed #333;
			padding-bottom: 16px;
			margin-bottom: 16px;
		}
		.header h1 {
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 4px;
			letter-spacing: 1px;
		}
		.header p {
			font-size: 11px;
			color: #666;
		}
		.section {
			margin-bottom: 16px;
			padding-bottom: 12px;
			border-bottom: 1px dashed #ddd;
		}
		.section:last-of-type {
			border-bottom: none;
		}
		.label {
			font-size: 10px;
			text-transform: uppercase;
			color: #888;
			letter-spacing: 0.5px;
			margin-bottom: 4px;
		}
		.value {
			font-size: 13px;
			font-weight: bold;
			color: #000;
			margin-bottom: 8px;
		}
		.qr-container {
			text-align: center;
			padding: 16px 0;
			margin: 16px 0;
		}
		.qr-container svg {
			max-width: 200px;
			height: auto;
		}
		.footer {
			text-align: center;
			margin-top: 16px;
			padding-top: 16px;
			border-top: 2px dashed #333;
			font-size: 10px;
			color: #888;
		}
		.important {
			background: #f9f9f9;
			border: 1px solid #ddd;
			padding: 8px;
			margin: 12px 0;
			font-size: 11px;
			text-align: center;
		}
		@media print {
			body { padding: 0; }
			.receipt { border: 2px dashed #333; }
		}
	</style>
</head>
<body>
	<div class="receipt">
		<div class="header">
			<h1>🚌 BOARDING PASS</h1>
			<p>${APP_CONFIG.name || 'Bus Ticket Management'}</p>
		</div>

		<div class="section">
			<div class="label">Order ID</div>
			<div class="value">#${orderId.substring(0, 8).toUpperCase()}</div>
		</div>

		<div class="section">
			<div class="label">Issued</div>
			<div class="value">${printDate}</div>
		</div>

		<div class="important">
			⚠️ Show this QR code to the conductor to check in
		</div>

		<div class="qr-container">
			${qrSvg}
		</div>

		<div class="section">
			<div class="label">Check-in URL</div>
			<div class="value" style="font-size: 9px; word-break: break-all; font-weight: normal;">
				${qrUrl}
			</div>
		</div>

		<div class="footer">
			<p>This is your official boarding pass.</p>
			<p>Please present this to the conductor before boarding.</p>
			<p style="margin-top: 8px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
			<p style="margin-top: 4px;">Thank you for choosing ${APP_CONFIG.name || 'our service'}!</p>
		</div>
	</div>
	<script>
		window.addEventListener('load', function() {
			setTimeout(function() { 
				window.print();
			}, 300);
		});
	</script>
</body>
</html>`;
		
		const printWindow = window.open('about:blank', '_blank');
		if (!printWindow) return;
		
		printWindow.document.open();
		printWindow.document.write(htmlContent);
		printWindow.document.close();
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle>Boarding Pass</DialogTitle>
			<DialogContent>
				<Stack alignItems="center" spacing={2} sx={{ py: 1 }}>
					<QRCode id="dialog-qr-code" value={qrUrl} size={192} />
					<Typography variant="caption" color="text.secondary">
						Show this code to the conductor to check in.
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={handlePrint} variant="outlined">
					Print Ticket
				</Button>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TicketQRDialog;
