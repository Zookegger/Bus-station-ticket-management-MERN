
import { configService, getAllSettings } from "@services/settingServices";
import { NextFunction, Request, Response } from "express";

export const GetAllCachedSettings = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        const settings = configService.getAll();
        res.status(200).json(settings);
    } catch (err) {
        next(err);
    }
};

export const GetAllSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const settings = await getAllSettings();
        res.status(200).json(settings);
    } catch (err) {
        next(err);
    }
};

export const UpdateSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (key === undefined) {
            throw { status: 400, message: "Key is required." };
        }

        if (value === undefined) {
            throw { status: 400, message: "Value is required." };
        }
        const updatedSetting = await configService.set(key, value, description);
        
        res.status(200).json(updatedSetting);
    } catch (err) {
        next(err);
    }
}

