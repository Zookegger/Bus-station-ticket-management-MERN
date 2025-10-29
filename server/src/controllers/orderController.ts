import { CreateOrderDTO, CreateOrderResult, OrderQueryOptions } from "@my_types/order";
import { NextFunction, Request, Response } from "express";
import * as orderServices from "@services/orderServices";
import { OrderAttributes, OrderStatus } from "@models/orders";

// Valid sort fields for OrderAttributes
const VALID_ORDER_SORT_FIELDS: (keyof OrderAttributes)[] = [
    'id', 'userId', 'paymentId', 'totalBasePrice', 'totalDiscount', 
    'totalFinalPrice', 'guestPurchaserEmail', 'guestPurchaserName', 
    'guestPurchaserPhone', 'status', 'createdAt', 'updatedAt'
];

const getOptions = (req: Request): OrderQueryOptions => {
    const options: OrderQueryOptions = {};

    if (req.query.dateFrom) options.dateFrom = new Date(req.query.dateFrom as string);
    if (req.query.dateTo) options.dateTo = new Date(req.query.dateTo as string);
    if (req.query.updatedFrom) options.updatedFrom = new Date(req.query.updatedFrom as string);
    if (req.query.updatedTo) options.updatedTo = new Date(req.query.updatedTo as string);
    if (req.query.status) options.status = req.query.status as OrderStatus;
    if (req.query.include) options.include = req.query.include as ("tickets" | "payment" | "couponUsage")[];
    if (req.query.limit) options.limit = Number.parseInt(req.query.limit.toString());
    if (req.query.offset) options.offset = Number.parseInt(req.query.offset.toString());
    if (req.query.sortBy && VALID_ORDER_SORT_FIELDS.includes(req.query.sortBy as keyof OrderAttributes)) options.sortBy = req.query.sortBy as keyof OrderAttributes;
    if (req.query.sortOrder === 'ASC' || req.query.sortOrder === 'DESC') options.sortOrder = req.query.sortOrder as "ASC" | "DESC";

    return options;
}

export const CreateOrder = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const dto: CreateOrderDTO = req.body;
        if (!dto) throw { status: 400, message: "" }
        
        const order: CreateOrderResult = await orderServices.createOrder(dto);
        if (!order) throw { status: 500, message: "" }
        res.status(200).json(order);
    } catch (err) {
        next(err);
    }
}

export const RefundTickets = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    const dto = req.body;
    // TODO: Implement refund logic
}

export const ListAllOrders = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const options = getOptions(req);
        const orders = await orderServices.listAllOrders(options);
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
}

export const GetOrderById = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const orderId: string = (req.params as any).id;
        const options = getOptions(req);
        // TODO: Implement get order by ID logic
        const order = await orderServices.getOrderById(orderId, options);
        if (!order) throw { status: 404, message: "" }
        
        res.status(200).json(order);
    } catch (err) {
        next(err);
    }
}

export const GetUserOrders = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const userId: string = (req.params as any).id;
        const options = getOptions(req);
        // TODO: Implement get user orders logic

        const orders = await orderServices.getUserOrders(userId, options);
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
}

export const GetGuestOrders = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const guestEmail: string = (req.params as any).email;
        const guestPhone: string = (req.params as any).phone;
        if (Number.parseInt(guestPhone)) throw { status: 400, message: "" }
        if (guestPhone.length < 11 || guestPhone.length > 15) throw { status: 400, message: "" }

        const options = getOptions(req);
        // TODO: Implement get guest orders logic

        const orders = await orderServices.getGuestOrders(guestEmail, guestPhone, options);
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
}