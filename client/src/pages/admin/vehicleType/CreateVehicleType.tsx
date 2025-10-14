import React from "react";
import { useNavigate } from "react-router-dom";
import CreateVehicleTypeForm from "./components/CreateVehicleTypeForm";

const CreateVehicleType: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = (vehicleType: any) => {
    console.log("Creating vehicle type:", vehicleType);
    // TODO: Implement API call
    // After successful creation, navigate back to list
    navigate("/dashboard/vehicle-type");
  };

  const handleCancel = () => {
    navigate("/dashboard/vehicle-type");
  };

  return (
    <CreateVehicleTypeForm onCreate={handleCreate} onCancel={handleCancel} />
  );
};

export default CreateVehicleType;
