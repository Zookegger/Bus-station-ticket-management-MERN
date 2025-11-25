import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import PlaceIcon from "@mui/icons-material/Place";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
	IconButton,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
	Box,
	Chip,
} from "@mui/material";
// Adjust this import path to match your project structure
import type { LocationData } from "./types";

interface SortableStopItemProps {
	id: string; // REQUIRED: The stable ID used in SortableContext
	stop: LocationData;
	onRemove: () => void;

	// Optional visuals (used by CreateRouteForm, ignored by RouteMapDialog)
	index?: number;
	isStart?: boolean;
	isEnd?: boolean;
}

const SortableStopItem: React.FC<SortableStopItemProps> = ({
	id,
	stop,
	onRemove,
	index,
	isStart,
	isEnd,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 999 : "auto",
		backgroundColor: isDragging ? "#fafafa" : "background.paper",
		opacity: isDragging ? 0.8 : 1,
		position: "relative" as const,
	};

	// Dynamic styling based on props
	let borderColor = "transparent";
	let iconColor = "action.active";
	let textColor = "#ffffff";
	let labelText = "";

	if (isStart) {
		borderColor = "#2e7d32"; // Green
		iconColor = "success.main";
		labelText = "Start";
	} else if (isEnd) {
		borderColor = "#d32f2f"; // Red
		iconColor = "error.main";
		labelText = "End";
	}

	return (
		<ListItem
			ref={setNodeRef}
			style={style}
			divider
			disablePadding
			sx={{
				pr: 7,
				py: 1,
				pl: 1,
				borderLeft: `4px solid ${borderColor}`,
			}}
			secondaryAction={
				<IconButton
					edge="end"
					onClick={onRemove}
					size="small"
					sx={{ mr: 1 }}
				>
					<DeleteIcon fontSize="small" color="error" />
				</IconButton>
			}
		>
			<ListItemIcon
				sx={{
					minWidth: "32px",
					cursor: "grab",
					color: "text.disabled",
				}}
				{...attributes}
				{...listeners}
			>
				<DragHandleIcon />
			</ListItemIcon>

			<ListItemIcon sx={{ minWidth: "40px" }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: 24,
					}}
				>
					<PlaceIcon sx={{ color: iconColor }} fontSize="medium" />
					{/* Only show number if index is provided */}
					{index !== undefined && (
						<Typography
							variant="caption"
							sx={{
								fontWeight: "bold",
								mt: -0.5,
								color: "text.secondary",
							}}
						>
							{index + 1}
						</Typography>
					)}
				</Box>
			</ListItemIcon>

			<ListItemText
				primary={
					<Box display={"flex"} alignItems={"center"} gap={1}>
						<Typography
							variant="body2"
							fontWeight={isStart || isEnd ? "600" : "400"}
							noWrap
						>
							{stop.name || (
								<span
									style={{
										fontStyle: "italic",
										color: "#999",
									}}
								>
									Select location...
								</span>
							)}
						</Typography>

						{labelText && (
							<Chip
								label={labelText}
								sx={{
									backgroundColor: iconColor,
									color: textColor,
									fontWeight: "bold",
									fontSize: "0.75rem",
									padding: 0,
									height: 24,
								}}
							/>
						)}
					</Box>
				}
				secondary={
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{
							display: "block",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							maxWidth: "100%",
						}}
					>
						{stop.address || "No address provided"}
					</Typography>
				}
			/>
		</ListItem>
	);
};

export default SortableStopItem;
