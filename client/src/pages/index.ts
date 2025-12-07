// Page exports

// Landing pages
export { default as Home } from "./landing/Home";
export { default as Login } from "./landing/Login";
export { default as Register } from "./landing/Register";

// Admin pages
export { default as AdminHome } from "./admin/home/Dashboard";
export { default as Vehicle } from "./admin/vehicle/Vehicle";
export { default as VehicleType } from "./admin/vehicle/components/vehicleType/VehicleTypeList";
export { default as User } from "./admin/user/User";
export { default as System } from "./admin/system/System";
export { default as Trip } from "./admin/trip/Trip";
export { default as Order } from "./admin/order/Order";
export { default as Coupon } from "./admin/coupon/CouponPage";

// Common pages
export { default as NotFound } from "@pages/common/NotFound";
export { default as PrivacyPolicy } from "@pages/common/PrivacyPolicy";
export { default as WebsocketTest } from "./admin/system/components/WebsocketTest";