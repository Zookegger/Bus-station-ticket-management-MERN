// Protected Route component

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { ROUTES } from "@constants/index";
import { PageLoading } from "../ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  if (state.isLoading) {
    return <PageLoading text="Checking authentication..." />;
  }

  if (requireAuth && !state.isAuthenticated) {
    const redirect = redirectTo || ROUTES.LOGIN;
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  if (!requireAuth && state.isAuthenticated) {
    const redirect = redirectTo || ROUTES.DASHBOARD;
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
