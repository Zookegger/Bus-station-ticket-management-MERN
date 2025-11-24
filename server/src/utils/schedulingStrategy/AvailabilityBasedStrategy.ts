import db from "@models/index";
import { IDriverAssignmentStrategy } from ".";
import { Op } from "sequelize";
import { TripStatus } from "@my_types/trip";

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
		const trip = await db.Trip.findByPk(tripId, {
			include: [{ model: db.Route, as: "route" }],
		});
		if (!trip) throw { status: 404, message: `Trip ${tripId} not found.` };

		const durationHours = trip.route?.duration || 0;
		const tripStartTime = new Date(trip.startTime);
		const tripEndTime = new Date(
			tripStartTime.getTime() + durationHours * 60 * 60 * 1000
		);

		// Find drivers with no overlapping assignments
		// We filter by status first to ignore completed/cancelled trips
		const available_drivers = await db.Driver.findAll({
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
							as: "trip",
							where: {
								status: {
									[Op.notIn]: [
										TripStatus.CANCELLED,
										TripStatus.COMPLETED,
									],
								},
							},
							include: [{ model: db.Route, as: "route" }],
							required: false,
						},
					],
				},
			],
		});

		// Filter out drivers with overlapping trips
		const eligible_drivers = available_drivers.filter((driver) => {
			if (!driver.tripAssignments || driver.tripAssignments.length === 0)
				return true;

			// Check for time overlap among the relevant assignments
			const hasOverlap = driver.tripAssignments.some((schedule) => {
				const assignedTrip = schedule.trip;
				if (!assignedTrip || !assignedTrip.route) return false;

				const assignedStart = new Date(assignedTrip.startTime);
				const assignedDuration = assignedTrip.route.duration || 0;
				const assignedEnd = new Date(
					assignedStart.getTime() + assignedDuration * 60 * 60 * 1000
				);

				// Check overlap: (StartA < EndB) and (EndA > StartB)
				return (
					assignedStart < tripEndTime && assignedEnd > tripStartTime
				);
			});

			return !hasOverlap;
		});

		return eligible_drivers.length > 0 ? eligible_drivers[0]!.id : null;
	}
}

export default AvailabilityBasedStrategy;