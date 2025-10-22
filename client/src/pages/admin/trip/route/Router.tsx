import React from "react";
import DashboardLayout from "../../../../components/layout/DashboardLayout";
import RouteList from "./Routelist";

const RoutePage: React.FC = () => {
  return (
    <DashboardLayout>
      <RouteList />
    </DashboardLayout>
  );
};

export default RoutePage;
