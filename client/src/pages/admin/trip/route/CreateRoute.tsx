import React from "react";
import DashboardLayout from "../../../../components/layout/DashboardLayout";
import CreateRouteForm from "./CreateRouteForm";

const CreateRoute: React.FC = () => {
  return (
    <DashboardLayout>
      <CreateRouteForm />
    </DashboardLayout>
  );
};

export default CreateRoute;
