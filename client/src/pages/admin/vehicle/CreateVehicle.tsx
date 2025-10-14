import React from "react";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import CreateVehicleForm from "./components/CreateVehicleForm";

const CreateVehicle: React.FC = () => {
  return (
    <DashboardLayout>
      <CreateVehicleForm />
    </DashboardLayout>
  );
};

export default CreateVehicle;
