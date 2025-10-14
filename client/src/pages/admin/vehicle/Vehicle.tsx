import React from "react";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import VehicleList from "./components/VehicleList";

const Vehicle: React.FC = () => {
  return (
    <DashboardLayout>
      <VehicleList />
    </DashboardLayout>
  );
};

export default Vehicle;
