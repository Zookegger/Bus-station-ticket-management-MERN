export interface Customer {
  name: string;
  email: string | null;
  phone: string;
  isGuest: boolean;
}

export interface Vehicle {
  plate: string;
  type: string;
}

export interface Ticket {
  id: string;
  seat: string;
  vehicle: Vehicle;
  driver: string;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Order {
  id: string;
  customer: Customer;
  createdAt: string;
  departureDate: string;
  departureTime: string;
  departure: string; // Thêm
  destination: string; // Thêm
  tripCode: string;
  quantity: number;
  total: number;
  status: "paid" | "pending" | "cancelled";
  paymentMethod: string;
  transactionId: string | null;
  tickets: Ticket[];
}
