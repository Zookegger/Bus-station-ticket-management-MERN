import type { Route } from "@my-types";

export interface CreateRouteFormProps {
	open: boolean;
	onClose: () => void;
	onCreated?: (route: Route) => void;
}

export interface EditRouteFormProps {
	route: Route | null;
	routeId?: number | null;
	open: boolean;
	onClose: () => void;
	onEdited?: (updated_route: Route) => void;
}

export interface DeleteRouteFormProps {
	id?: number;
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

export interface RouteDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	route: Route | null;
	onEdit?: (route: Route) => void;
	onDelete?: (route: Route) => void;
}
