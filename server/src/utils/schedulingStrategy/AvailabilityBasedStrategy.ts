import db from "@models/index";
import { IDriverAssignmentStrategy } from ".";
import { Op } from "sequelize";
import { Driver } from "@models/driver";

/**
 * Availability-based driver assignment strategy.
 * Selects the first available driver who:
 * - Is active and not suspended
 * - Has no overlapping trip assignments
 * - License is not expired
 */
class AvailabilityBasedStrategy implements IDriverAssignmentStrategy {
	async selectDriver(tripId: number): Promise<number | null> {
		// Get trip details with time info
		const trip = await db.Trip.findByPk(tripId);
		if (!trip) throw { status: 404, message: `Trip ${tripId} not found.` };

		// Find drivers with no overlapping assignments
		const available_drivers = await db.Driver.findAll({
			where: {
				isActive: true,
				isSuspended: false,
				licenseExpiryDate: { [Op.gt]: new Date() },
			},
			include: [
				{
					model: db.TripSchedule,
					as: "schedule",
					required: true,
					include: [
						{
							model: db.Trip,
							as: "trip",
							where: {
								[Op.or]: [
									{
										// Check for time overlap
										startTime: {
											[Op.lte]:
												trip.endTime || trip.startTime,
										},
										endTime: { [Op.gte]: trip.startTime },
									},
								],
							},
							required: true,
						},
					],
				},
			],
		});

		// Filter out drivers with overlapping trips
		const eligible_drivers: Driver[] = available_drivers.filter(
			(driver) =>
				!driver.tripAssignments || driver.tripAssignments.length === 0
		);

		return eligible_drivers && eligible_drivers.length > 0
			? eligible_drivers[0]!.id
			: null;
	}
}

export default AvailabilityBasedStrategy;