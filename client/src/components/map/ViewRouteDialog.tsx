import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import RouteMap from "./RouteMap";
import type { RouteStop } from "@my-types/route";

interface ViewRouteDialogProps {
    open: boolean;
    onClose: () => void;
    stops: RouteStop[];
    title?: string;
}

const ViewRouteDialog: React.FC<ViewRouteDialogProps> = ({ open, onClose, stops, title }) => {
    const mapStops = stops
        .sort((a, b) => a.stopOrder - b.stopOrder)
        .map(stop => ({
            latitude: stop.locations?.latitude || 0,
            longitude: stop.locations?.longitude || 0,
            name: stop.locations?.name,
            address: stop.locations?.address
        }))
        .filter(s => s.latitude !== 0 && s.longitude !== 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title || "Route Map"}</DialogTitle>
            <DialogContent>
                <Box sx={{ height: 500, width: "100%", mt: 1 }}>
                    <RouteMap stops={mapStops} height={500} showMarkers showRoute />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewRouteDialog;
