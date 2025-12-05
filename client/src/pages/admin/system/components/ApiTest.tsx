import { useRef, useState } from "react";
import {
	Paper,
	Stack,
	Typography,
	TextField,
	Select,
	MenuItem,
	Button,
	Divider,
	CircularProgress,
	Chip,
} from "@mui/material";
import callApi from "@utils/apiCaller";

/**
 * Dev API Test Component
 *
 * Purpose:
 * - Provide a simple, developer-facing UI to make arbitrary API calls
 *   using the shared `callApi` helper.
 * - Demonstrates usage of request cancellation via `AbortController`.
 * - Shows how to include `withCredentials` per-request (cookies/session).
 *
 * Usage notes:
 * - This page is only intended for development/debugging; do not ship to
 *   production public UIs.
 * - Enter a relative `url` (for example `/api/health` or `/api/orders?include=tickets`).
 * - For request bodies, provide JSON. If invalid JSON the body will be
 *   sent as a raw string.
 */
const ApiTest = () => {
	const [url, setUrl] = useState<string>("/health");
	const [method, setMethod] = useState<
		"GET" | "POST" | "PUT" | "DELETE" | "PATCH"
	>("GET");
	const [body, setBody] = useState<string>("");
	const [responseText, setResponseText] = useState<string>("");
	const [responseStatus, setResponseStatus] = useState<number | null>(null);
	const [responseHeaders, setResponseHeaders] = useState<Record<
		string,
		any
	> | null>(null);
	const [errorText, setErrorText] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Keep the current AbortController so the user can cancel the request.
	const abortRef = useRef<AbortController | null>(null);

	async function sendRequest() {
		setErrorText(null);
		setResponseText("");
		setLoading(true);

		const controller = new AbortController();
		abortRef.current = controller;

		// Try to parse JSON body, otherwise send raw string
		let data: any = undefined;
		if (body && body.trim().length > 0) {
			try {
				data = JSON.parse(body);
			} catch (e) {
				data = body;
			}
		}

		try {
			const res = await callApi<any, any>(
				{
					method,
					url,
					data,
					signal: controller.signal,
					withCredentials: true, // demonstrate per-request override
				},
				{ returnFullResponse: true }
			);

			// Save status, headers and pretty-print response body
			setResponseStatus(res.status ?? null);
			setResponseHeaders(res.headers ?? null);
			setResponseText(JSON.stringify(res.data ?? res.data, null, 4));
		} catch (err: any) {
			// callApi throws a handled error (string or Error)
			setErrorText(err?.message ?? String(err));
		} finally {
			setLoading(false);
			abortRef.current = null;
		}
	}

	function cancelRequest() {
		if (abortRef.current) {
			abortRef.current.abort();
			setLoading(false);
			setErrorText("Request cancelled");
			abortRef.current = null;
		}
	}

	return (
		<Paper sx={{ p: 2 }} elevation={2}>
			<Stack spacing={2}>
				<Typography variant="h6">Dev API Tester</Typography>

				<Stack
					direction="row"
					spacing={1}
					alignItems="start"
					justifyContent={"center"}
				>
					<Select
						value={method}
						onChange={(e) => setMethod(e.target.value as any)}
						size="small"
					>
						<MenuItem value="GET">GET</MenuItem>
						<MenuItem value="POST">POST</MenuItem>
						<MenuItem value="PUT">PUT</MenuItem>
						<MenuItem value="DELETE">DELETE</MenuItem>
						<MenuItem value="PATCH">PATCH</MenuItem>
					</Select>

					<TextField
						fullWidth
						size="small"
						label="URL"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						helperText="Relative to the API base URL configured in the app"
					/>

					<Button
						variant="contained"
						onClick={sendRequest}
						disabled={loading}
					>
						Send
					</Button>
					<Button
						variant="outlined"
						color="inherit"
						onClick={() => {
							setBody("");
							setResponseText("");
							setErrorText(null);
						}}
					>
						Clear
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={cancelRequest}
						disabled={!loading}
					>
						Cancel
					</Button>
					{loading && <CircularProgress size={20} />}
				</Stack>

				<TextField
					label="Request body (JSON)"
					multiline
					minRows={4}
					value={body}
					onChange={(e) => setBody(e.target.value)}
				/>

				<Divider />

				{errorText ? (
					<Paper
						variant="outlined"
						sx={{ p: 1, backgroundColor: "rgba(255,0,0,0.03)" }}
					>
						<Typography color="error">{errorText}</Typography>
					</Paper>
				) : (
					<>
						{/* Header paper: status chip and response headers */}
						<Paper
							variant="outlined"
							sx={{
								p: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "flex-start",
							}}
						>
							<Typography variant="h6" fontWeight={600} marginRight={1}>
								Response
							</Typography>
							<Chip
								label={
									responseStatus !== null
										? String(responseStatus)
										: "-"
								}
								color={
									responseStatus === null
										? "default"
										: responseStatus >= 500
										? "error"
										: responseStatus >= 400
										? "error"
										: responseStatus >= 300
										? "warning"
										: "success"
								}
								sx={{ fontWeight: "bold" }}
							/>
						</Paper>

						{/* Headers */}
						<Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
							<Typography variant="subtitle2">Headers</Typography>
							<Typography
								component="pre"
								sx={{
									fontFamily: "monospace",
									whiteSpace: "pre-wrap",
								}}
							>
								{responseHeaders
									? JSON.stringify(responseHeaders, null, 2)
									: "(no headers)"}
							</Typography>
						</Paper>

						{/* Response body */}
						<Paper
							variant="outlined"
							sx={{
								p: 1,
								mt: 1,
								whiteSpace: "pre",
								fontFamily: "monospace",
								maxHeight: 400,
								overflow: "auto",
							}}
						>
							<Typography component="pre">
								{responseText || "(no response yet)"}
							</Typography>
						</Paper>
					</>
				)}
			</Stack>
		</Paper>
	);
};

export default ApiTest;
