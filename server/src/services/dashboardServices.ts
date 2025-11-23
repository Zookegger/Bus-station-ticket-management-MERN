import { Order, OrderStatus } from "@models/orders";
import { Ticket } from "@models/ticket";
import { Op, Sequelize } from "sequelize";
import { DashboardStats } from "../types/dashboard";
import {
    startOfMonth,
    endOfMonth,
    subMonths,
    format,
    startOfDay,
    endOfDay,
    subDays,
    startOfYear,
    endOfYear,
    subYears,
} from "date-fns";
import { TicketStatus } from "@my_types/ticket";
import db from "@models/index";
import { Role } from "@models/user";

/**
 * Helper to calculate revenue for a specific date range.
 */
const getRevenueForRange = async (start: Date, end: Date) => {
    return (
        (await Order.sum("totalFinalPrice", {
            where: {
                status: OrderStatus.CONFIRMED,
                createdAt: { [Op.between]: [start, end] },
            },
        })) || 0
    );
};

export const getDashboardStats = async (
    startDate: Date,
    endDate: Date
): Promise<DashboardStats> => {
    const now = new Date();

    // ==========================================
    // 1. Global Summaries
    // ==========================================
    
    // Total Revenue
    const totalRevenue =
        (await Order.sum("totalFinalPrice", {
            where: { status: OrderStatus.CONFIRMED },
        })) || 0;

    // Tickets Sold (Booked or Completed)
    const ticketsSold = await Ticket.count({
        where: {
            status: {
                [Op.or]: [TicketStatus.BOOKED, TicketStatus.COMPLETED],
            },
        },
    });

    // Cancelled Tickets
    const cancelledTickets = await Ticket.count({
        where: { status: TicketStatus.CANCELLED },
    });

    // Average Ticket Price
    const avgTicketPriceResult = (await Ticket.findOne({
        attributes: [
            [Sequelize.fn("AVG", Sequelize.col("finalPrice")), "avgPrice"],
        ],
        where: {
            status: {
                [Op.or]: [TicketStatus.BOOKED, TicketStatus.COMPLETED],
            },
        },
        raw: true,
    })) as any;

    const avgTicketPrice = parseFloat(avgTicketPriceResult?.avgPrice || "0");

    // Total Trips & Users
    const totalTrips = await db.Trip.count();
    const totalUsers = await db.User.count({ where: { role: Role.USER } });

    // ==========================================
    // 2. Daily Revenue (Chart Data)
    // ==========================================
    
    const dailyData = (await Order.findAll({
        attributes: [
            [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
            [Sequelize.fn("SUM", Sequelize.col("totalFinalPrice")), "revenue"],
        ],
        where: {
            status: OrderStatus.CONFIRMED,
            createdAt: {
                [Op.between]: [startOfDay(startDate), endOfDay(endDate)],
            },
        },
        group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
        order: [[Sequelize.col("date"), "ASC"]],
        raw: true,
    })) as any[];

    const formattedDailyRevenue = dailyData.map((d) => ({
        period: d.date, // SQL DATE usually returns string 'YYYY-MM-DD'
        value: parseFloat(d.revenue),
    }));

    // ==========================================
    // 3. Period Comparisons
    // ==========================================

    // A. Daily Comparison (Today vs Yesterday)
    const revenueToday = await getRevenueForRange(startOfDay(now), endOfDay(now));
    const revenueYesterday = await getRevenueForRange(
        startOfDay(subDays(now, 1)),
        endOfDay(subDays(now, 1))
    );

    const dailyComparison = [
        {
            period: format(now, "dd MMM"),
            current: revenueToday,
            previous: revenueYesterday,
        },
    ];

    // B. Monthly Comparison (This Month vs Last Month)
    const revenueThisMonth = await getRevenueForRange(
        startOfMonth(now),
        endOfMonth(now)
    );
    const revenueLastMonth = await getRevenueForRange(
        startOfMonth(subMonths(now, 1)),
        endOfMonth(subMonths(now, 1))
    );

    const monthlyComparison = [
        {
            period: format(now, "MMM yyyy"),
            current: revenueThisMonth,
            previous: revenueLastMonth,
        },
    ];

    // C. Yearly Comparison (This Year vs Last Year)
    const revenueThisYear = await getRevenueForRange(
        startOfYear(now),
        endOfYear(now)
    );
    const revenueLastYear = await getRevenueForRange(
        startOfYear(subYears(now, 1)),
        endOfYear(subYears(now, 1))
    );

    const yearlyComparison = [
        {
            period: format(now, "yyyy"),
            current: revenueThisYear,
            previous: revenueLastYear,
        },
    ];

    // ==========================================
    // 4. Cancellation Stats
    // ==========================================
    
    const cancellationRate = [
        {
            name: "General",
            count: cancelledTickets,
            total: ticketsSold + cancelledTickets,
        },
    ];

    return {
        totalRevenue,
        totalTrips,
        totalUsers,
        avgTicketPrice,
        ticketsSold,
        cancelledTickets,
        dailyRevenue: formattedDailyRevenue,
        dailyComparison,
        monthlyComparison,
        yearlyComparison,
        cancellationRate,
    };
};