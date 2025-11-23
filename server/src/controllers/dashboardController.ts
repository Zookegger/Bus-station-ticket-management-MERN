import { Request, Response, NextFunction } from "express";
import * as dashboardService from "@services/dashboardServices";
import { subDays } from "date-fns";

export const GetDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Default to last 30 days if no dates provided
        const from = req.query.from 
            ? new Date(req.query.from as string) 
            : subDays(new Date(), 30);
            
        const to = req.query.to 
            ? new Date(req.query.to as string) 
            : new Date();

        const stats = await dashboardService.getDashboardStats(from, to);
        res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
};