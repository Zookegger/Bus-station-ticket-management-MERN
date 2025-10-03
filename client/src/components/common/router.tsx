import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "../layout/Layout";
import { ROUTES } from "@constants/index";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout>
				<Outlet />
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
				path: "*",
				element: <Navigate to={ROUTES.NOT_FOUND} replace />,
			},
		],
	},
]);