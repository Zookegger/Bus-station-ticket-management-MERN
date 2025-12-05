import { Coupon, CouponAttributes } from "@models/coupon";
import db from "@models/index";
import {
	AddCouponDTO,
	CouponReservationDTO,
	CouponTypes,
	PreviewCouponDTO,
	UpdateCouponDTO,
} from "@my_types/coupon";
import { Op, Transaction } from "sequelize";

/**
 * Adds a new coupon to the system.
 *
 * @returns Promise resolving when the coupon is added.
 */
export const addCoupon = async (dto: AddCouponDTO): Promise<Coupon | null> => {
	const existing_coupon = await db.Coupon.findOne({
		where: {
			[Op.or]: [{ code: dto.code }, { title: dto.title }],
		},
	});

	if (existing_coupon)
		throw {
			status: 400,
			message: "A coupon with this code or title already exists.",
		};

	const current_date: Date = new Date();
	const start_period = new Date(dto.startPeriod);
	const end_period = new Date(dto.endPeriod);

	if (start_period >= end_period)
		throw { status: 400, message: "Start date must be before end date." };
	if (start_period < current_date)
		throw { status: 400, message: "Start date cannot be in the past." };
	if (end_period < current_date)
		throw { status: 400, message: "End date cannot be in the past." };
	if (dto.maxUsage <= 0)
		throw { status: 400, message: "Max usage must be greater than 0." };
	if (dto.type === CouponTypes.PERCENTAGE && (dto.value < 0 || dto.value > 100)) {
		throw {
			status: 400,
			message: "Percentage value must be between 0 and 100.",
		};
	}
	if (dto.type === CouponTypes.FIXED && dto.value <= 0) {
		throw { status: 400, message: "Fixed value must be greater than 0." };
	}

	const coupon = await db.Coupon.create({
		...dto,
		currentUsageCount: 0, // Ensure currentUsageCount starts at 0
	});
	if (!coupon) throw { status: 500, message: "Failed to create coupon." };

	return coupon;
};

/**
 * Updates an existing coupon.
 *
 * @returns Promise resolving when the coupon is updated.
 */
export const updateCoupon = async (
	id: number,
	dto: UpdateCouponDTO
): Promise<Coupon | null> => {
	const coupon = await db.Coupon.findByPk(id);

	if (!coupon)
		throw { status: 404, message: `Coupon with ID ${id} not found.` };

	// If code or title is being updated, check for uniqueness
	if (dto.code || dto.title) {
		const existing_coupon = await db.Coupon.findOne({
			where: {
				[Op.or]: [{ code: dto.code || "" }, { title: dto.title || "" }],
				id: { [Op.ne]: id }, // Exclude the current coupon
			},
		});
		if (existing_coupon)
			throw {
				status: 400,
				message: "A coupon with this code or title already exists.",
			};
	}

	if (!dto.startPeriod || !dto.endPeriod) throw { status: 400, message: "" };

	if (dto.startPeriod >= dto.endPeriod) {
		throw { status: 400, message: "Start date must be before end date." };
	}

	if (dto.maxUsage && dto.maxUsage < coupon.currentUsageCount) {
		throw {
			status: 400,
			message: `Max usage cannot be less than current usage (${coupon.currentUsageCount}).`,
		};
	}

	const coupon_type = dto.type || coupon.type;
	const coupon_value = dto.value || coupon.value;

	if (
		coupon_type === CouponTypes.PERCENTAGE &&
		(coupon_value < 0 || coupon_value > 100)
	)
		throw {
			status: 400,
			message: "Percentage value must be between 0 and 100.",
		};
	if (coupon_type === CouponTypes.FIXED && coupon_value <= 0)
		throw { status: 400, message: "Fixed value must be greater than 0." };

	await coupon.update(dto);

	return coupon;
};

/**
 * Deletes a coupon from the system.
 *
 * @returns Promise resolving when the coupon is deleted.
 */
export const deleteCoupon = async (id: number): Promise<void> => {
	const coupon = await db.Coupon.findByPk(id);

	if (!coupon)
		throw { status: 404, message: `Coupon with ID ${id} not found.` };

	await coupon.destroy();

	const deleted_coupon = await db.Coupon.findByPk(id);

	if (deleted_coupon) throw { status: 500, message: "Failed to delete coupon." };
};

/**
 * Retrieves a coupon by its ID.
 *
 * @returns Promise resolving to the coupon data.
 */
export const getCouponById = async (
	id: number,
	...attributes: (keyof CouponAttributes)[]
): Promise<Coupon | null> => {
	const coupon =
		attributes.length > 0
			? await db.Coupon.findByPk(id, { attributes })
			: await db.Coupon.findByPk(id);

	if (!coupon)
		throw { status: 404, message: `Coupon with ID ${id} not found.` };
	return coupon;
};

/**
 * Lists all coupons with optional filtering.
 *
 * @returns Promise resolving to a list of coupons.
 */
export const listCoupons = async (
	...attributes: (keyof CouponAttributes)[]
): Promise<Coupon | Coupon[] | null> => {
	return attributes.length > 0
		? await db.Coupon.findAll({ attributes })
		: await db.Coupon.findAll();
};

/**
 * Retrieves a coupon by its code.
 *
 * @returns Promise resolving to the coupon data.
 */
export const getCouponByCode = async (
	code: string,
	...attributes: (keyof CouponAttributes)[]
): Promise<Coupon | null> => {
	const coupons = attributes.length > 0
		? await db.Coupon.findOne({ where: { code }, attributes })
		: await db.Coupon.findOne({ where: { code } });

	if (!coupons) {
		throw { status: 404, message: "Coupon not found, invalid coupon code."}
	}

	return coupons;
};

/**
 * INTERNAL: Validates a coupon and computes the discount amount.
 * Used during order creation within a transaction.
 * Does NOT mutate usage counts.
 *
 * @param dto - The validation request data (code, orderTotal, userId).
 * @param transaction - Sequelize transaction (required for order creation flow).
 * @returns The validated coupon and computed discount amount.
 * @throws {status: 404} If coupon not found.
 * @throws {status: 400} If coupon is inactive, expired, or usage limit reached.
 */
export const applyCoupon = async (
	dto: PreviewCouponDTO,
	transaction: Transaction
): Promise<{ coupon: Coupon; discountAmount: number }> => {
	// Load coupon with lock to keep checks consistent inside order transaction
	const coupon = await db.Coupon.findOne({
		where: { code: dto.code },
		lock: transaction.LOCK.UPDATE,
		transaction,
	});

	if (!coupon) throw { status: 404, message: "Coupon not found." };

	// Validate coupon eligibility (active, dates, limits)
	await validateCoupon(coupon, dto.userId, transaction);

	// Compute discount based on coupon type
	const value = Number(coupon.value ?? 0);
	if (!Number.isFinite(value) || value <= 0)
		throw { status: 400, message: "Invalid coupon configuration." };

	let discount = 0;
	if (coupon.type === CouponTypes.FIXED) discount = value;
	else if (coupon.type === CouponTypes.PERCENTAGE)
		discount = (dto.orderTotal * value) / 100;

	// Discount cannot exceed order total
	discount = Math.min(discount, dto.orderTotal);

	return { coupon, discountAmount: Number(discount.toFixed(2)) };
};

/**
 * PUBLIC API: Preview a coupon's discount for a given order total.
 * This is a READ-ONLY operation for client-side preview (no mutations).
 * Does NOT consume usage or lock rows.
 *
 * @param dto - The preview request data (code, orderTotal, userId).
 * @returns The coupon details and computed discount amount for display.
 * @throws {status: 404} If coupon not found.
 * @throws {status: 400} If coupon is inactive, expired, or usage limit reached.
 */
export const previewCouponDiscount = async (
	dto: PreviewCouponDTO
): Promise<{ coupon: Coupon; discountAmount: number; newTotal: number }> => {
	// Load coupon WITHOUT locking (read-only preview)
	const coupon = await db.Coupon.findOne({
		where: { code: dto.code },
	});

	if (!coupon) throw { status: 404, message: "Coupon not found." };

	// Validate coupon eligibility (without transaction/locks)
	await validateCoupon(coupon, dto.userId, undefined);

	// Compute discount based on coupon type
	const value = Number(coupon.value ?? 0);
	if (!Number.isFinite(value) || value <= 0)
		throw { status: 400, message: "Invalid coupon configuration." };

	let discount = 0;
	if (coupon.type === CouponTypes.FIXED) discount = value;
	else if (coupon.type === CouponTypes.PERCENTAGE)
		discount = (dto.orderTotal * value) / 100;

	// Discount cannot exceed order total
	discount = Math.min(discount, dto.orderTotal);
	const new_total = Math.max(0, dto.orderTotal - discount);

	return {
		coupon,
		discountAmount: Number(discount.toFixed(2)),
		newTotal: Number(new_total.toFixed(2)),
	};
};

/**
 * Reserves/records coupon usage at order creation time.
 * Increments usage count and creates a CouponUsage record within a transaction.
 * Use this if you consume usage immediately when order is created (before payment confirmation).
 *
 * @param args - Object containing couponId, orderId, userId, and discount amount.
 * @param transaction - Sequelize transaction for atomic operation.
 * @throws {status: 404} If coupon not found.
 * @throws {status: 400} If coupon expired, inactive, or usage limit reached.
 */
export const reserveCouponForOrder = async (
	dto: CouponReservationDTO,
	transaction: Transaction
): Promise<void> => {
	// Lock coupon row, re-check limits, increment usage, and create usage record
	const coupon = await db.Coupon.findByPk(dto.couponId, {
		lock: transaction.LOCK.UPDATE,
		transaction,
	});

	if (!coupon) throw { status: 404, message: "Coupon not found." };

	const is_valid = await validateCoupon(coupon!, dto.userId!, transaction);
	if (!is_valid)
		throw {
			status: 500,
			message: "Something happened while validating Coupon.",
		};

	await coupon.increment("currentUsageCount", { by: 1, transaction });

	await db.CouponUsage.create(
		{
			couponId: coupon.id,
			orderId: dto.orderId,
			userId: dto.userId,
			discountAmount: dto.discountAmount,
		},
		{ transaction }
	);
};

/**
 * Releases coupon usage when payment fails or order is cancelled.
 * Decrements currentUsageCount and deletes the CouponUsage record.
 * Use this in cleanup jobs or payment failure handlers.
 *
 * @param orderId - The order ID whose coupon usage should be released.
 * @param transaction - Sequelize transaction for atomic operation.
 * @throws {status: 404} If order or coupon usage not found.
 */
export const releaseCouponUsage = async (
	orderId: string,
	transaction: Transaction
): Promise<void> => {
	const coupon_usage = await db.CouponUsage.findOne({
		where: { orderId },
		lock: transaction.LOCK.UPDATE,
		transaction,
	});

	// If there is no usage, still continue with process
	if (!coupon_usage) return;

	// Lock and decrement the coupon's usage count
	const coupon = await db.Coupon.findByPk(coupon_usage.couponId, {
		lock: transaction.LOCK.UPDATE,
		transaction,
	});

	if (!coupon) throw { status: 404, message: "Coupon not found." };

	await coupon.decrement("currentUsageCount", { by: 1, transaction });
	await coupon_usage.destroy({ transaction });
};

const validateCoupon = async (
	coupon: Coupon,
	userId: string | null,
	transaction?: Transaction
) => {
	if (!coupon.isActive)
		throw { status: 400, message: "Coupon is not active." };

	const now = new Date();
	if (coupon.startPeriod && coupon.startPeriod > now)
		throw { status: 400, message: "Coupon is not yet valid." };
	if (coupon.endPeriod && coupon.endPeriod < now)
		throw { status: 400, message: "Coupon has expired." };

	const has_limit =
		typeof coupon.maxUsage === "number" && Number(coupon.maxUsage) > 0;
	if (has_limit && coupon.currentUsageCount >= coupon.maxUsage)
		throw { status: 400, message: "Coupon has reached its usage limit." };

	if (has_limit && userId) {
		const user_usage = await db.CouponUsage.count({
			where: { couponId: coupon.id, userId },
			transaction: transaction || null,
		});
		if (user_usage >= coupon.maxUsage)
			throw {
				status: 400,
				message:
					"You have already used this coupon the maximum number of times.",
			};
	}

	return true;
};
