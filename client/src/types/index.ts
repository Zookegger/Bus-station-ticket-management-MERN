// Global TypeScript type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "guest";
}

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}
