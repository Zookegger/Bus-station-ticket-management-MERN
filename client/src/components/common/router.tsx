import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "@components/layout/Layout";
import DashboardLayout from "@components/layout/AdminLayout";
import { ROUTES } from "@constants/index";
import { Suspense } from "react";
import LoadingSkeleton from "@components/layout/LoadingSkeleton";
import { useAuth } from "@hooks/useAuth";

/**
 * Component to protect routes that require authentication.
 * Redirects to login if the user is not authenticated.
 */
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({
	children,
}) => {
	const { isLoading, isAuthenticated } = useAuth();
	if (isLoading) return <LoadingSkeleton />;
	if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
	return children;
};

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout>
				<Suspense fallback={<LoadingSkeleton />}>
					<Outlet />
				</Suspense>
			</Layout>
		),
		handle: { title: "EasyRide - Bus Ticket Booking" },
		children: [
			{
				path: ROUTES.HOME,
				handle: { title: "Home • EasyRide" },
				lazy: async () => {
					const { default: Home } = await import(
						"@pages/landing/Home"
					);
					return { Component: Home };
				},
			},
			{
				path: ROUTES.LOGIN,
				handle: { title: "Login • EasyRide" },
				lazy: async () => {
					const { default: Login } = await import(
						"@pages/landing/Login"
					);
					return { Component: Login };
				},
			},
			{
				path: ROUTES.REGISTER,
				handle: { title: "Register • EasyRide" },
				lazy: async () => {
					const { default: Register } = await import(
						"@pages/landing/Register"
					);
					return { Component: Register };
				},
			},
			{
				path: ROUTES.VERIFY_EMAIL,
				handle: { title: "Verify Email • EasyRide" },
				lazy: async () => {
					const { default: ConfirmEmail } = await import(
						"@pages/common/ConfirmEmail"
					);
					return { Component: ConfirmEmail };
				},
			},
			{
				path: ROUTES.PRIVACY_POLICY,
				handle: { title: "Privacy Policy • EasyRide" },
				lazy: async () => {
					const { default: PrivacyPolicy } = await import(
						"@pages/common/PrivacyPolicy"
					);
					return { Component: PrivacyPolicy };
				},
			},
			{
				path: ROUTES.CHECK_IN,
				handle: { title: "Check In • EasyRide" },
				lazy: async () => {
					const { default: CheckIn } = await import(
						"@pages/common/CheckInPage"
					);
					return { Component: CheckIn };
				},
			},
			{
				path: ROUTES.NOT_FOUND,
				handle: { title: "Not Found • EasyRide" },
				lazy: async () => {
					const { default: NotFound } = await import(
						"@pages/common/NotFound"
					);
					return { Component: NotFound };
				},
			},
			{ path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
		],
	},
	{
		path: "/user",
		element: (
			<RequireAuth>
				<Layout>
					<Suspense fallback={<LoadingSkeleton />}>
						<Outlet />
					</Suspense>
				</Layout>
			</RequireAuth>
		),
		handle: { title: "Account • EasyRide" },
		children: [
			{
				path: ROUTES.PROFILE,
				handle: { title: "Profile • EasyRide" },
				lazy: async () => {
					const { default: Profile } = await import(
						"@pages/user/Profile"
					);
					return { Component: Profile };
				},
			},
			{ path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
		],
	},
	{
		path: "/dashboard",
		element: (
			<RequireAuth>
				<DashboardLayout>
					<Suspense fallback={<LoadingSkeleton />}>
						<Outlet />
					</Suspense>
				</DashboardLayout>
			</RequireAuth>
		),
		handle: { title: "Dashboard • EasyRide" },
		children: [
			{ path: "", element: <Navigate to="home" replace /> },
			{
				path: "home",
				handle: { title: "Dashboard • EasyRide" },
				lazy: async () => {
					const { default: Home } = await import(
						"@pages/admin/home/Dashboard"
					);
					return { Component: Home };
				},
			},
			{
				path: "vehicle",
				handle: { title: "Vehicles • EasyRide" },
				children: [
					{
						path: "",
						lazy: async () => {
							const { default: Vehicle } = await import(
								"@pages/admin/vehicle/Vehicle"
							);
							return { Component: Vehicle };
						},
					},
				],
			},
			{
				path: "trip",
				handle: { title: "Trips • EasyRide" },
				children: [
					{
						path: "",
						lazy: async () => {
							const { default: Trip } = await import(
								"@pages/admin/trip/Trip"
							);
							return { Component: Trip };
						},
					},
				],
			},
			{
				path: "user",
				handle: { title: "Users • EasyRide" },
				lazy: async () => {
					const { default: User } = await import(
						"@pages/admin/user/User"
					);
					return { Component: User };
				},
			},
			{
				path: "coupon",
				handle: { title: "Coupons • EasyRide" },
				children: [
					{
						path: "",
						lazy: async () => {
							const { default: Coupon } = await import(
								"@pages/admin/coupon/CouponPage"
							);
							return { Component: Coupon };
						},
					},
				],
			},
			{
				path: "system",
				handle: { title: "System • EasyRide" },
				lazy: async () => {
					const { default: System } = await import(
						"@pages/admin/system/System"
					);
					return { Component: System };
				},
			},
		],
	},
]);
