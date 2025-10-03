import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";

const apiRouter = Router();

apiRouter.use("/user", userRoutes);
apiRouter.use("/auth", authRoutes);

export default apiRouter;