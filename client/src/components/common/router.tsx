import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "../layout/Layout";
import { ROUTES } from "@constants/index";
import { Suspense } from "react";
import LoadingSkeleton from "@components/layout/LoadingSkeleton";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout>
				<Suspense fallback={<LoadingSkeleton/>}>
					<Outlet />
				</Suspense>
			</Layout>
		),
		children: [
			{
				path: ROUTES.HOME,
				lazy: async () => {
					const { default: Home } = await import("@pages/Home");
					return { Component: Home };
				},
			},
			{
				path: ROUTES.LOGIN,
				lazy: async () => {
					const { default: Login } = await import("@pages/Login");
					return { Component: Login };
				},
			},
			{
				path: ROUTES.REGISTER,
				lazy: async () => {
					const { default: Register } = await import(
						"@pages/Register"
					);
					return { Component: Register };
				},
			},

			{
				path: ROUTES.NOT_FOUND,
				lazy: async () => {
					const { default: NotFound } = await import(
						"@pages/NotFound"
					);
					return { Component: NotFound };
				},
			},

			{
				path: ROUTES.PRIVACY_POLICY,
				lazy: async () => {
					const { default: PrivacyPolicy } = await import (
						"@pages/PrivacyPolicy"
					)
					return { Component: PrivacyPolicy };
				}
			},

			{
				path: "*",
				element: <Navigate to={ROUTES.NOT_FOUND} replace />,
			},
		],
	},
]);