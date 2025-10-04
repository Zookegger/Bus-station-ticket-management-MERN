import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "../layout/Layout";
import AdminLayout from "../layout/AdminLayout";
import { ROUTES } from "@constants/index";
import { Suspense } from "react";
import LoadingSkeleton from "@components/layout/LoadingSkeleton";

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
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => {
          const { default: Home } = await import("@pages/landing/Home");
          return { Component: Home };
        },
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => {
          const { default: Login } = await import("@pages/landing/Login");
          return { Component: Login };
        },
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => {
          const { default: Register } = await import("@pages/landing/Register");
          return { Component: Register };
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
        path: ROUTES.PRIVACY_POLICY,
        lazy: async () => {
          const { default: PrivacyPolicy } = await import(
            "@pages/PrivacyPolicy"
          );
          return { Component: PrivacyPolicy };
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
      <AdminLayout>
        <Suspense fallback={<LoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="home" replace />,
      },
      {
        path: "home",
        lazy: async () => {
          const { default: Home } = await import("@pages/admin/home/Home");
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
          {
            path: "create",
            lazy: async () => {
              const { default: CreateVehicle } = await import(
                "@pages/admin/vehicle/CreateVehicle"
              );
              return { Component: CreateVehicle };
            },
          },
        ],
      },
      {
        path: "trip",
        lazy: async () => {
          const { default: Trip } = await import("@pages/admin/trip/Trip");
          return { Component: Trip };
        },
      },
      {
        path: "user",
        lazy: async () => {
          const { default: User } = await import("@pages/admin/user/User");
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
