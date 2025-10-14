import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditVehicleTypeForm from "./components/EditVehicleTypeForm";
import vehicleTypesData from "@data/vehicleTypes.json";
import type { VehicleType } from "./components/types";

const EditVehicleType: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the vehicle type by ID
  const vehicleType = vehicleTypesData.find(
    (vt) => vt.id === parseInt(id || "0")
  ) as VehicleType;

  const handleUpdate = (id: number, updatedData: any) => {
    console.log("Updating vehicle type:", id, updatedData);
    // TODO: Implement API call
    // After successful update, navigate back to list
    navigate("/dashboard/vehicle-type");
  };

  const handleCancel = () => {
    navigate("/dashboard/vehicle-type");
  };

  if (!vehicleType) {
    return <div>Vehicle type not found</div>;
  }

  return (
    <EditVehicleTypeForm
      vehicleType={vehicleType}
      onUpdate={handleUpdate}
      onCancel={handleCancel}
    />
  );
};

export default EditVehicleType;
