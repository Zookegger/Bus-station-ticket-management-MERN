import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "@components/layout/Layout";
import DashboardLayout from "@components/layout/DashboardLayout";
import { ROUTES } from "@constants/index";
import { Suspense } from "react";
import LoadingSkeleton from "@components/layout/LoadingSkeleton";

export const router = createBrowserRouter([
	// Default routes with separate layout (no header/footer)
	{
		path: "/",
		element: (
			<Layout>
				<Suspense fallback={<LoadingSkeleton />}>
					<Outlet />
				</Suspense>
			</Layout>
		),
		children: [
			{
				path: ROUTES.HOME,
				lazy: async () => {
					const { default: Home } = await import(
						"@pages/landing/Home"
					);
					return { Component: Home };
				},
			},
			{
				path: ROUTES.LOGIN,
				lazy: async () => {
					const { default: Login } = await import(
						"@pages/landing/Login"
					);
					return { Component: Login };
				},
			},
			{
				path: ROUTES.REGISTER,
				lazy: async () => {
					const { default: Register } = await import(
						"@pages/landing/Register"
					);
					return { Component: Register };
				},
			},
			{
				path: ROUTES.VERIFY_EMAIL,
				lazy: async () => {
					const { default: ConfirmEmail } = await import(
						"@pages/common/ConfirmEmail"
					);
					return { Component: ConfirmEmail };
				},
			},
			{
				path: ROUTES.NOT_FOUND,
				lazy: async () => {
					const { default: NotFound } = await import(
						"@pages/common/NotFound"
					);
					return { Component: NotFound };
				},
			},

			{
				path: ROUTES.PRIVACY_POLICY,
				lazy: async () => {
					const { default: PrivacyPolicy } = await import(
						"@pages/common/PrivacyPolicy"
					);
					return { Component: PrivacyPolicy };
				},
			},

			{
				path: ROUTES.PROFILE,
				lazy: async () => {
					const { default: Profile } = await import(
						"@pages/user/Profile"
					);
					return { Component: Profile };
				},
			},
			{
				path: "*",
				element: <Navigate to={ROUTES.NOT_FOUND} replace />,
			},
		],
	},
	// Dashboard routes with separate layout (no header/footer)
	{
		path: "/dashboard",
		element: (
			<DashboardLayout>
				<Suspense fallback={<LoadingSkeleton />}>
					<Outlet />
				</Suspense>
			</DashboardLayout>
		),
		children: [
			{
				path: "",
				element: <Navigate to="home" replace />,
			},
			{
				path: "home",
				lazy: async () => {
					const { default: Home } = await import(
						"@pages/admin/home/Dashboard"
					);
					return { Component: Home };
				},
			},
			{
				path: "vehicle",
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
					{
						path: "create",
						lazy: async () => {
							const { default: CreateTrip } = await import(
								"@pages/admin/trip/cartrip/CreateTrip"
							);
							return { Component: CreateTrip };
						},
					},
					{
						path: "edit/:id",
						lazy: async () => {
							const { default: EditTrip } = await import(
								"@pages/admin/trip/cartrip/EditTrip"
							);
							return { Component: EditTrip };
						},
					},
					{
						path: "delete/:id",
						lazy: async () => {
							const { default: DeleteTrip } = await import(
								"@pages/admin/trip/cartrip/DeleteTrip"
							);
							return { Component: DeleteTrip };
						},
					},
					{
						path: "createRoute",
						lazy: async () => {
							const { default: CreateRouteFrom } = await import(
								"@pages/admin/trip/route/CreateRoute"
							);
							return { Component: CreateRouteFrom };
						},
					},
					{
						path: "editRoute",
						lazy: async () => {
							const { default: EditRoutePage } = await import(
								"@pages/admin/trip/route/EditRoutePage"
							);
							return { Component: EditRoutePage };
						},
					},
				],
			},
			{
				path: "user",
				lazy: async () => {
					const { default: User } = await import(
						"@pages/admin/user/User"
					);
					return { Component: User };
				},
			},
			{
				path: "system",
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
