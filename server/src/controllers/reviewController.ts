import { Request, Response, NextFunction } from "express";
import { ReviewService } from "@services/reviewService";

export class ReviewController {
	static async createReview(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = (req as any).user?.id;
			if (!userId) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const { tripId, rating, comment } = req.body;
			const review = await ReviewService.createReview({
				userId,
				tripId,
				rating,
				comment,
			});
			res.status(201).json({
				data: review,
				message: "Review created successfully",
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewsByTrip(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const { tripId } = req.params;
			const reviews = await ReviewService.getReviewsByTrip(
				Number(tripId)
			);
			res.status(200).json({
				data: reviews,
				message: "Reviews fetched successfully",
			});
		} catch (error) {
			next(error);
		}
	}

	static async getReviewsByUser(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = (req as any).user?.id;
			if (!userId) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const reviews = await ReviewService.getReviewsByUser(userId);
			res.status(200).json({
				data: reviews,
				message: "Reviews fetched successfully",
			});
		} catch (error) {
			next(error);
		}
	}
}
