import { Router } from "express";
import { getAllSettings, updateSetting } from "@controllers/settingController";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";

const settingsRouter = Router();

// Protect these routes so only authenticated admins can access them
settingsRouter.get("/", csrfAdminProtectionRoute, getAllSettings);
settingsRouter.put("/:key", csrfAdminProtectionRoute, updateSetting);

export default settingsRouter;