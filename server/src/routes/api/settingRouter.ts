import { Router } from "express";
import { GetAllSettings, GetAllCachedSettings, UpdateSetting } from "@controllers/settingController";
import { csrfAdminProtectionRoute } from "@middlewares/csrf";

const settingsRouter = Router();

// Protect these routes so only authenticated admins can access them
settingsRouter.get("/", csrfAdminProtectionRoute, GetAllSettings);
settingsRouter.get("/cached", csrfAdminProtectionRoute, GetAllCachedSettings);
settingsRouter.put("/:key", csrfAdminProtectionRoute, UpdateSetting);

export default settingsRouter;