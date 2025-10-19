
import { configService } from "@services/settingServices";
import { NextFunction, Request, Response } from "express";

export const getAllSettings = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        const settings = configService.getAll();
        res.status(200).json(settings);
    } catch (err) {
        next(err);
    }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (key === undefined) {
            throw { status: 400, message: "Key is required." };
        }

        if (value === undefined) {
            throw { status: 400, message: "Value is required." };
        }
        const updatedSetting = await configService.set(key, value);
        
        res.status(200).json(updatedSetting);
    } catch (err) {
        next(err);
    }
}

