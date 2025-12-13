import React, { useMemo, useState } from "react";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Drawer,
	IconButton,
	Stack,
	Typography,
	Grid,
	CardActions,
	useTheme,
	Box,
	Divider,
	Tooltip,
	Avatar,
	alpha,
	InputAdornment,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	ContentCopy as CopyIcon,
	Event as CalendarIcon,
	ConfirmationNumber as TicketIcon,
	AttachMoney,
	Percent,
	Image as ImageIcon,
	CheckCircle as CheckIcon,
	Cancel as CancelIcon,
	AccessTime as CreatedClockIcon,
	AccessTimeFilled as UpdatedClockIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { CouponType } from "@my-types";
import type { Coupon } from "@my-types";
import buildImgUrl from "@utils/imageHelper";

interface CouponDetailsDrawerProps {
	open: boolean;
	onClose: () => void;
	coupon: Coupon | null;
	onEdit?: (coupon: Coupon) => void;
	onDelete?: (id: number) => void;
}

const CouponDetailsDrawer: React.FC<CouponDetailsDrawerProps> = ({
	open,
	onClose,
	coupon,
	onEdit,
	onDelete,
}) => {
	const theme = useTheme();
	const [copied, setCopied] = useState(false);

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const formatDateTime = (iso_value: string): string => {
		if (!iso_value) return "N/A";
		try {
			return format(new Date(iso_value), "dd MMM yyyy, HH:mm");
		} catch (e) {
			return "Invalid Date";
		}
	};

	const details = useMemo(() => {
		if (!coupon) return null;
		return {
			start: formatDateTime(coupon.startPeriod.toString()),
			end: formatDateTime(coupon.endPeriod.toString()),
			created: coupon.createdAt
				? formatDateTime(coupon.createdAt.toString())
				: "N/A",
			updated: coupon.updatedAt
				? formatDateTime(coupon.updatedAt.toString())
				: "N/A",
			valueLabel:
				coupon.type === CouponType.PERCENTAGE
					? `${coupon.value}% OFF`
					: coupon.value.toLocaleString("en-US", {
							style: "currency",
							currency: "USD",
					  }),
			usageColor:
				coupon.currentUsageCount >= coupon.maxUsage
					? "error.main"
					: "success.main",
			statusColor: coupon.isActive
				? theme.palette.success.main
				: theme.palette.text.disabled,
			headerBg: coupon.isActive
				? alpha(theme.palette.success.main, 0.08)
				: alpha(theme.palette.action.disabled, 0.08),
		};
	}, [coupon, theme]);

	if (!coupon || !details) return null;

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						width: 450,
						maxWidth: "100vw",
						bgcolor: theme.palette.background.default,
					},
				},
			}}
		>
			{/* Main Card Container - Fills the drawer height */}
			<Card
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					borderRadius: 3,
					boxShadow: theme.shadows[2],
					overflow: "hidden", // Prevent double scrollbars
				}}
			>
				{/* HEADER: Integrated Title, Status, and Close Button */}
				<CardHeader
					sx={{
						bgcolor: details.headerBg,
						pb: 2,
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
					avatar={
						<Avatar
							sx={{
								bgcolor: "background.paper",
								color: details.statusColor,
							}}
						>
							{coupon.isActive ? <CheckIcon /> : <CancelIcon />}
						</Avatar>
					}
					action={
						<Stack direction="row" alignItems="center" spacing={1}>
							<Chip
								label={coupon.isActive ? "Active" : "Inactive"}
								color={coupon.isActive ? "success" : "default"}
								size="small"
								variant="filled"
							/>
							<IconButton onClick={onClose} size="small">
								<GridCloseIcon />
							</IconButton>
						</Stack>
					}
					title={
						<Typography
							variant="h6"
							fontWeight="bold"
							sx={{ mr: 1 }}
						>
							{coupon.title || coupon.code}
						</Typography>
					}
					subheader={
						<Typography variant="caption" color="text.secondary">
							Coupon ID: #{coupon.id}
						</Typography>
					}
				/>

				{/* CONTENT: Scrollable Area */}
				<CardContent sx={{ flex: 1, overflowY: "auto", pt: 3 }}>
					<Stack spacing={3}>
						{/* Hero: Code */}
						<Box
							sx={{
								position: "relative",
								p: 2,
								border: `2px dashed ${theme.palette.primary.main}`,
								bgcolor: alpha(
									theme.palette.primary.main,
									0.04
								),
								borderRadius: 2,
								textAlign: "center",
							}}
						>
							<Typography
								variant="caption"
								color="text.secondary"
								textTransform="uppercase"
								fontWeight="bold"
							>
								Coupon Code
							</Typography>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
								gap={1}
								mt={0.5}
							>
								<Typography
									variant="h4"
									fontWeight="900"
									color="primary"
									sx={{
										letterSpacing: 1,
										wordBreak: "break-all",
									}}
								>
									{coupon.code}
								</Typography>
								<Tooltip
									title={copied ? "Copied!" : "Copy Code"}
								>
									<IconButton
										size="small"
										onClick={() =>
											handleCopyCode(coupon.code)
										}
									>
										{copied ? (
											<CheckIcon
												fontSize="small"
												color="success"
											/>
										) : (
											<CopyIcon fontSize="small" />
										)}
									</IconButton>
								</Tooltip>
							</Box>
						</Box>

						{/* Stats Grid */}
						<Grid container spacing={2}>
							<Grid size={{ xs: 6 }}>
								<Box
									display="flex"
									gap={1.5}
									alignItems="center"
								>
									<Avatar
										variant="rounded"
										sx={{
											width: 40,
											height: 40,
											bgcolor: alpha(
												theme.palette.warning.main,
												0.1
											),
											color: theme.palette.warning.main,
										}}
									>
										{coupon.type ===
										CouponType.PERCENTAGE ? (
											<Percent fontSize="small" />
										) : (
											<AttachMoney fontSize="small" />
										)}
									</Avatar>
									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											Value
										</Typography>
										<Typography
											variant="subtitle2"
											fontWeight="bold"
										>
											{details.valueLabel}
										</Typography>
									</Box>
								</Box>
							</Grid>
							<Grid size={{ xs: 6 }}>
								<Box
									display="flex"
									gap={1.5}
									alignItems="center"
								>
									<Avatar
										variant="rounded"
										sx={{
											width: 40,
											height: 40,
											bgcolor: alpha(
												theme.palette.info.main,
												0.1
											),
											color: theme.palette.info.main,
										}}
									>
										<TicketIcon fontSize="small" />
									</Avatar>
									<Box>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											Usage
										</Typography>
										<Typography
											variant="subtitle2"
											fontWeight="bold"
											sx={{ color: details.usageColor }}
										>
											{coupon.currentUsageCount} /{" "}
											{coupon.maxUsage}
										</Typography>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Divider />

						{/* Validity */}
						<Box>
							<Typography
								variant="overline"
								color="text.secondary"
								fontWeight="bold"
							>
								Validity Period
							</Typography>
							<Stack spacing={1.5} mt={1}>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box
										display="flex"
										gap={1}
										alignItems="center"
									>
										<CalendarIcon
											fontSize="small"
											color="action"
										/>
										<Typography variant="body2">
											Starts
										</Typography>
									</Box>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{details.start}
									</Typography>
								</Box>
								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box
										display="flex"
										gap={1}
										alignItems="center"
									>
										<CalendarIcon
											fontSize="small"
											color="action"
										/>
										<Typography variant="body2">
											Ends
										</Typography>
									</Box>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{details.end}
									</Typography>
								</Box>
							</Stack>
						</Box>

						<Divider />

						{/* Description & Image */}
						<Box flexDirection={"column"} sx={{ flex: 1 }}>
							<Typography
								variant="overline"
								color="text.secondary"
								fontWeight="bold"
							>
								Description
							</Typography>
							<Typography
								variant="body2"
								color="text.primary"
								paragraph
							>
								{coupon.description ||
									"No description provided."}
							</Typography>

							{coupon.imgUrl && (
								<Box
									sx={{
										borderRadius: 2,
										overflow: "hidden",
										border: `1px solid ${theme.palette.divider}`,
										mt: 1,
									}}
								>
									<Box
										component="img"
										src={buildImgUrl(coupon.imgUrl)}
										alt="Coupon Preview"
										sx={{
											width: "100%",
											height: 160,
											objectFit: "cover",
											display: "block",
										}}
										onError={(e: any) => {
											e.target.onerror = null;
											e.target.src =
												"https://via.placeholder.com/400x150?text=Image+Error";
										}}
									/>
									<Box
										p={1}
										bgcolor="background.default"
										display="flex"
										alignItems="center"
										gap={1}
									>
										<ImageIcon
											fontSize="small"
											color="disabled"
										/>
										<Typography
											variant="caption"
											color="text.secondary"
											noWrap
										>
											{coupon.imgUrl}
										</Typography>
									</Box>
								</Box>
							)}
						</Box>

						<Stack>
							<InputAdornment position="start">
								<CreatedClockIcon
									fontSize="small"
									sx={{ mr: 0.5 }}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Created at: {details.created}
								</Typography>
							</InputAdornment>
							<InputAdornment position="start">
								<UpdatedClockIcon
									fontSize="small"
									sx={{ mr: 0.5 }}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Last updated: {details.updated}
								</Typography>
							</InputAdornment>
						</Stack>
					</Stack>
				</CardContent>

				<Divider />

				<CardActions disableSpacing sx={{ gap: 1 }}>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<EditIcon />}
						onClick={() => onEdit && onEdit(coupon)}
					>
						Edit
					</Button>
					<Button
						fullWidth
						variant="contained"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => onDelete && onDelete(coupon.id)}
						sx={{ boxShadow: 0 }}
					>
						Delete
					</Button>
				</CardActions>
			</Card>
		</Drawer>
	);
};

export default CouponDetailsDrawer;
