import React from "react";
import DashboardLayout from "../../../../components/layout/AdminLayout";
import CreateRouteForm from "./CreateRouteForm";

const CreateRoute: React.FC = () => {
  return (
    <DashboardLayout>
      <CreateRouteForm />
    </DashboardLayout>
  );
};

export default CreateRoute;
