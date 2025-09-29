import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../layout/Layout";
import { ROUTES } from "@constants/index";

// Router configuration with lazy loading
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
          return {
            Component: () => (
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => {
          const { default: Register } = await import("@pages/Register");
          return {
            Component: () => (
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            ),
          };
        },
      },

      {
        path: ROUTES.NOT_FOUND,
        lazy: async () => {
          const { default: NotFound } = await import("@pages/NotFound");
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
