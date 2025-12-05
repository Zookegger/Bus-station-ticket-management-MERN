export interface WebsocketEventHandlers {
	[key: string]: (data: any) => void;
}

export interface WebsocketOptions {
	events?: WebsocketEventHandlers;
	namespace?: string;
	auto_connect?: boolean;
	debug?: boolean;
	max_reconnect_attempts?: number;
	reconnect_delay?: number;
	requireAuth?: boolean;
}

export type NotificationEventData = {
	id: number;
	title: string;
	content: string;
	type: string;
	priority: string;
	status: string;
	metadata?: Record<string, any>;
	createdAt: string;
};

export type SeatEventData = {
	id: number;
	number: string;
	status: string;
	tripId: number | null;
	reservedBy?: string | null;
	reservedUntil?: string | null;
};

export type DashboardMetricsEventData = {
	generatedAt: string;
	totalRevenue: number;
	ticketsSold: number;
	cancelledTickets: number;
	avgTicketPrice: number;
	totalTrips: number;
	totalUsers: number;
	dailyRevenue: { period: string; value: number }[];
	dailyComparison: { period: string; current: number; previous: number }[];
	monthlyComparison: { period: string; current: number; previous: number }[];
	yearlyComparison: { period: string; current: number; previous: number }[];
	cancellationRate: { name: string; count: number; total: number }[];
};

export interface SocketCtx {
	joinRoom: (room: string) => void;
	leaveRoom: (room: string) => void;
}
