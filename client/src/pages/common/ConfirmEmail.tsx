import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ConfirmEmail: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const verifyEmail = async () => {
			const token = searchParams.get("token");

			if (!token) {
				setStatus("error");
				setMessage("Invalid verification link. No token provided.");
				return;
			}

			try {
				const response = await axios.post(
					`${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`,
					{ token }
				);

				setStatus("success");
				setMessage(
					response.data.message || "Email verified successfully!"
				);

				// Redirect to login after 4 seconds
				setTimeout(() => {
					navigate("/login");
				}, 4000);
			} catch (err) {
				console.error("Email verification error:", err);
				setStatus("error");
				
				if (axios.isAxiosError(err)) {
					if (err.response?.data?.message) {
						setMessage(err.response.data.message);
					} else if (err.code === "ERR_NETWORK") {
						setMessage("Cannot connect to server. Please check if the server is running.");
					} else {
						setMessage(`Connection error: ${err.message}`);
					}
				} else if (err instanceof Error) {
					setMessage(err.message);
				} else {
					setMessage("Email verification failed. The link may be invalid or expired.");
				}
			}
		};

		verifyEmail();
	}, [searchParams, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
				{status === "loading" && (
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<h2 className="text-xl font-semibold mb-2">
							Verifying Email...
						</h2>
						<p className="text-gray-600">
							Please wait while we verify your email address.
						</p>
					</div>
				)}

				{status === "success" && (
					<div className="text-center">
						<div className="text-green-600 mb-4">
							<svg
								className="w-16 h-16 mx-auto"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							Email Verified!
						</h2>
						<p className="text-gray-600 mb-4">{message}</p>
						<p className="text-sm text-gray-500">
							Redirecting to login page...
						</p>
					</div>
				)}

				{status === "error" && (
					<div className="text-center">
						<div className="text-red-600 mb-4">
							<svg
								className="w-16 h-16 mx-auto"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							Verification Failed
						</h2>
						<p className="text-gray-600 mb-4">{message}</p>
						<button
							onClick={() => navigate("/login")}
							className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
						>
							Go to Login
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ConfirmEmail;