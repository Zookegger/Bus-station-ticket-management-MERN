import { Router } from "express";
import { ReviewController } from "@controllers/reviewController";
import { authenticateJwt } from "@middlewares/auth";
import { csrfUserProtectionRoute } from "@middlewares/csrf";

const router = Router();

router.post("/", csrfUserProtectionRoute, ReviewController.createReview);
router.get("/trip/:tripId", ReviewController.getReviewsByTrip);
router.get("/user/me", authenticateJwt, ReviewController.getReviewsByUser);

export default router;
