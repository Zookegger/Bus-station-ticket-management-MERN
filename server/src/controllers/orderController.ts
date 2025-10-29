import { CreateOrderDTO, CreateOrderResult, OrderQueryOptions, RefundTicketDTO } from "@my_types/order";
import { NextFunction, Request, Response } from "express";
import * as orderServices from "@services/orderServices";
import { OrderAttributes, OrderStatus } from "@models/orders";
import { getParamStringId } from "@utils/request";

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
        if (!dto || Object.keys(dto).length === 0) {
            throw { status: 400, message: "Request body is missing or empty." };
        }
        
        const order: CreateOrderResult = await orderServices.createOrder(dto);
        if (!order) {
            throw { status: 500, message: "Failed to create the order due to a server error." };
        }
        res.status(201).json(order); // Use 201 for resource creation
    } catch (err) {
        next(err);
    }
}

export const RefundTickets = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const dto: RefundTicketDTO = req.body;

        if (!dto || !dto.orderId || !dto.ticketIds || dto.ticketIds.length === 0) {
            throw { status: 400, message: "Invalid refund request. Please provide orderId and ticketIds." };
        }
        
        const result = await orderServices.refundTickets(dto);
        if (!result) {
            throw { status: 404, message: "Order or tickets not found, or they are not in a refundable state." };
        }
        res.status(200).json({ message: "Tickets have been successfully refunded.", order: result });

    } catch (err) {
        next(err);
    } 
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
        const orderId = getParamStringId(req);
        const options = getOptions(req);
        // TODO: Ensure user has permission to view this order (if not an admin).
        const order = await orderServices.getOrderById(orderId, options);
        if (!order) {
            throw { status: 404, message: "Order not found with the provided ID." };
        }
        
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
        const userId = getParamStringId(req);
        const options = getOptions(req);
        // TODO: Ensure the authenticated user is either the user in question or an admin.

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
        const guestEmail: string = req.query.email as string;
        const guestPhone: string = req.query.phone as string;

        if (!guestEmail || !guestPhone) {
            throw { status: 400, message: "Guest email and phone are required." };
        }

        const options = getOptions(req);
        // This endpoint is for guests to find their orders.
        // No authentication is required, but access is limited.

        const orders = await orderServices.getGuestOrders(guestEmail, guestPhone, options);
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
}