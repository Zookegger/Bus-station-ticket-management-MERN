import { Router } from "express";
import * as adminController from "@controllers/adminController";
import { authenticateJwt, isAdmin } from "@middlewares/auth";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";
import { errorHandler } from "@middlewares/errorHandler";

const router = Router();

// Users management
router.get("/users", authenticateJwt, isAdmin, adminController.ListUsers, errorHandler);
router.post("/users", csrfAdminProtectionRoute, adminController.CreateUser, errorHandler);
router.put("/users/:id", csrfAdminProtectionRoute, adminController.UpdateUser, errorHandler);
router.delete("/users/:id", csrfAdminProtectionRoute, adminController.DeleteUser, errorHandler);

export default router;
