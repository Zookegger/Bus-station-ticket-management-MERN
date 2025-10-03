import { Router } from "express";
import userRoutes from "./userRoutes";

const apiRouter = Router();

apiRouter.use("/user", userRoutes);

export default apiRouter;