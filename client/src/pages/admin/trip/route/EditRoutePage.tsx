// EditRoutePage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditRouteForm from "@pages/admin/trip/route/EditRouteForm";

const EditRoutePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeToEdit = location.state?.route;

  if (!routeToEdit) {
    return <div style={{ padding: 30 }}>No route selected!</div>; 
  }

  const handleSave = (updatedRoute: any) => {
    console.log("Updated route:", updatedRoute);
    navigate("/dashboard/trip");
  };

  const handleBack = () => {
    navigate("/dashboard/trip");
  };

  return <EditRouteForm routeToEdit={routeToEdit} onSave={handleSave} onBack={handleBack} />;
};

export default EditRoutePage;
