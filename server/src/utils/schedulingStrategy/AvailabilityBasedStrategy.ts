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
		const trip = await db.Trip.findByPk(tripId, {
			include: [{ model: db.Route, as: "route" }],
		});
		if (!trip) throw { status: 404, message: `Trip ${tripId} not found.` };

		const durationHours = trip.route?.duration || 2; // Default 2 hours if missing
		const tripStartTime = new Date(trip.startTime);
		const tripEndTime = new Date(
			tripStartTime.getTime() + durationHours * 60 * 60 * 1000
		);

		// Find drivers
		const eligible_drivers = await db.Driver.findAll({
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
								status: {
									[Op.notIn]: [
										TripStatus.CANCELLED,
										TripStatus.COMPLETED,
										TripStatus.SCHEDULED,
									],
								},
							},
							include: [{ model: db.Route, as: "route" }],
						},
					],
				},
			],
		});

		// Filter Overlaps
		const available = eligible_drivers.filter((driver) => {
			if (!driver.tripAssignments || driver.tripAssignments.length === 0)
				return true;

			const hasOverlap = driver.tripAssignments.some((schedule) => {
				const assignedTrip = schedule.trip;
				if (!assignedTrip) return false;

				// Skip if checking against the trip itself (shouldn't happen in creation, but good safety)
				if (assignedTrip.id === tripId) return false;

				const startA = new Date(assignedTrip.startTime);
				const durationA = assignedTrip.route?.duration || 2;
				const endA = new Date(
					startA.getTime() + durationA * 60 * 60 * 1000
				);

				// Overlap formula: (StartA < EndB) and (EndA > StartB)
				// We add a 30-minute buffer for turnaround time
				const bufferMs = 30 * 60 * 1000;
				return (
					startA.getTime() < tripEndTime.getTime() + bufferMs &&
					endA.getTime() + bufferMs > tripStartTime.getTime()
				);
			});

			return !hasOverlap;
		});

		// Optimization: If this is a return trip, prioritize the driver of the outbound trip
		if (trip.returnTripId) {
			// Find who is driving the linked trip
			const linkedSchedule = await db.TripSchedule.findOne({
				where: { tripId: trip.returnTripId },
			});
			if (linkedSchedule) {
				const sameDriver = available.find(
					(d) => d.id === linkedSchedule.driverId
				);
				if (sameDriver) return sameDriver.id;
			}
		}

		// Safely return the first available driver's id or null if none found
		const first_available = available[0];
		return first_available ? first_available.id : null;
	}
}

export default AvailabilityBasedStrategy;
