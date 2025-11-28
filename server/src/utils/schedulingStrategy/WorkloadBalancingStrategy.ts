import db from "@models/index";
import { TripStatus } from "@my_types/trip";
import { IDriverAssignmentStrategy } from "@utils/schedulingStrategy";
import { Op } from "sequelize";

/**
 * Workload balancing strategy.
 * Selects the driver with the fewest upcoming trip assignments.
 */
class WorkloadBalancingStrategy implements IDriverAssignmentStrategy {
	async selectDriver(tripId: number): Promise<number | null> {
		const trip = await db.Trip.findByPk(tripId);
		if (!trip) throw { status: 404, message: `Trip ${tripId} not found.` };

		// Count upcoming assignments per driver
		const drivers_with_counts = await db.Driver.findAll({
			where: {
				isActive: true,
				isSuspended: false,
				licenseExpiryDate: { [Op.gt]: new Date() },
			},
			include: [
				{
					model: db.TripSchedule,
					as: "tripAssignments",
					required: false,
					include: [
						{
							model: db.Trip,
							as: "trips",
							where: {
								startTime: { [Op.gte]: new Date() },
								status: {
									[Op.notIn]: [
										TripStatus.CANCELLED,
										TripStatus.COMPLETED,
										TripStatus.SCHEDULED,
									],
								},
							},
							required: false,
						},
					],
				},
			],
			order: [[{ model: db.TripSchedule, as: "schedule" }, "id", "ASC"]],
		});

        // Sort by assignment count (fewest first)
		drivers_with_counts.sort(
			(a, b) =>
				(a.tripAssignments?.length || 0) -
				(b.tripAssignments?.length || 0)
		);

		return drivers_with_counts.length > 0
			? drivers_with_counts[0]!.id
			: null;
	}
}

export default WorkloadBalancingStrategy;