// Page exports

// Landing pages
export { default as Home } from "./landing/Home";
export { default as Login } from "./landing/Login";
export { default as Register } from "./landing/Register";

// Admin pages
export { default as AdminHome } from "./admin/home/Dashboard";
export { default as Vehicle } from "./admin/vehicle/Vehicle";
export { default as VehicleType } from "./admin/vehicle/components/vehicleType/VehicleTypeList";
export { default as CreateVehicleType } from "./admin/vehicle/components/vehicleType/CreateVehicleTypeForm";
export { default as EditVehicleType } from "./admin/vehicle/components/vehicleType/EditVehicleTypeForm";
export { default as VehicleList } from "./admin/vehicle/components/vehicle/VehicleList";
export { default as Trip } from "./admin/trip/cartrip/Trip";
export { default as User } from "./admin/user/User";
export { default as System } from "./admin/system/System";

// Common pages
export { default as NotFound } from "@pages/common/NotFound";
export { default as PrivacyPolicy } from "@pages/common/PrivacyPolicy";