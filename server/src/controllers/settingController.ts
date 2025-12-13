
import { configService, getAllSettings } from "@services/settingServices";
import { NextFunction, Request, Response } from "express";
import { emitCrudChange } from "@services/realtimeEvents";

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
        
        const user = (req as any).user;
        emitCrudChange(
            "setting",
            "update",
            updatedSetting,
            user ? { id: user.id, name: user.userName } : undefined
        );

        res.status(200).json(updatedSetting);
    } catch (err) {
        next(err);
    }
}

