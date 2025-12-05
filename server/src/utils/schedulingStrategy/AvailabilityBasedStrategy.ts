import db from "@models/index";
import { IDriverAssignmentStrategy } from ".";
import { Op } from "sequelize";
import { TripStatus } from "@my_types/trip";

/**
 * Availability-based driver assignment strategy.
 * STRICT VERSION: Respects specific TripStatus Enum.
 */
class AvailabilityBasedStrategy implements IDriverAssignmentStrategy {
   
   // Buffer time (30 mins) to ensure driver has time to reset/rest
   private readonly BUFFER_MS = 30 * 60 * 1000;
   
   // Optimization: Limit the "Conflict Search" to trips starting +/- 24h from target
   private readonly MAX_LOOKBACK_MS = 24 * 60 * 60 * 1000;

   async selectDriver(tripId: number): Promise<number | null> {
      // 1. Fetch Target Trip Data
      const trip = await db.Trip.findByPk(tripId, {
         attributes: ['id', 'startTime', 'returnTripId'],
         include: [{ 
            model: db.Route, 
            as: "route", 
            attributes: ['duration'] 
         }],
      });

      if (!trip) throw { status: 404, message: `Trip ${tripId} not found.` };

      // 2. Calculate the Time Window for THIS trip
      const durationHours = trip.route?.duration || 2;
      const targetStart = new Date(trip.startTime);
      const targetEnd = new Date(targetStart.getTime() + durationHours * 3600 * 1000);

      // 3. Find "Busy" Drivers (Collision Detection)
      // We look for any trip schedule that physically overlaps with our target window.
      const searchWindowStart = new Date(targetStart.getTime() - this.MAX_LOOKBACK_MS);
      const searchWindowEnd = new Date(targetEnd.getTime() + this.BUFFER_MS);

      const potentialConflicts = await db.TripSchedule.findAll({
         attributes: ['driverId'],
         include: [{
            model: db.Trip,
            as: 'trip',
            attributes: ['id', 'startTime', 'status'],
            where: {
               startTime: {
                  [Op.between]: [searchWindowStart, searchWindowEnd]
               },
               status: {
                  [Op.ne]: TripStatus.CANCELLED 
               },
               id: { [Op.ne]: tripId } // Exclude self
            },
            include: [{ 
               model: db.Route, 
               as: 'route', 
               attributes: ['duration'] 
            }]
         }]
      });

      // 4. Refine Conflicts (Exact Time Overlap)
      const busyDriverIds = new Set<number>();
      
      for (const schedule of potentialConflicts) {
         const conflictTrip = schedule.trip;
         if (!conflictTrip) continue;

         const conflictStart = new Date(conflictTrip.startTime);
         const conflictDuration = conflictTrip.route?.duration || 2;
         const conflictEnd = new Date(conflictStart.getTime() + conflictDuration * 3600 * 1000);

         // Overlap Formula: (StartA < EndB) and (EndA > StartB)
         // We include the buffer in the check to ensure gap between trips
         const isOverlapping = (
            conflictStart.getTime() < targetEnd.getTime() + this.BUFFER_MS &&
            conflictEnd.getTime() + this.BUFFER_MS > targetStart.getTime()
         );

         if (isOverlapping) {
            busyDriverIds.add(schedule.driverId);
         }
      }

      // --- PRIORITY CHECK: Return Trip Driver ---
      // If this is a return leg (meaning there is an outbound trip that points to this one),
      // try to assign the outbound driver first.
      // Note: The 'returnTripId' on THIS trip points to a FUTURE return trip (if this is outbound).
      // To find the OUTBOUND trip (if this is return), we need to search for the trip that points to US.
      
      // Case A: This is the Outbound trip. We might want to check if the driver is free for the Return trip too?
      // (Skipping for now to keep it simple, as requested)

      // Case B: This is the Return trip. We want the driver from the Outbound trip.
      const outboundTrip = await db.Trip.findOne({
         where: { returnTripId: tripId },
         attributes: ['id']
      });

      if (outboundTrip) {
         const outboundSchedule = await db.TripSchedule.findOne({
            where: { tripId: outboundTrip.id },
            attributes: ['driverId']
         });
         
         // If outbound driver exists and is NOT busy during this return trip, assign them.
         if (outboundSchedule && !busyDriverIds.has(outboundSchedule.driverId)) {
            return outboundSchedule.driverId;
         }
      }

      // 5. Select First Available Driver
      // Find one active driver who is NOT in the busy set.
      const candidate = await db.Driver.findOne({
         attributes: ['id'],
         where: {
            isActive: true,
            isSuspended: false,
            // Allow NULL expiry date (no expiry) OR future expiry date
            licenseExpiryDate: { 
               [Op.or]: [
                  { [Op.gt]: new Date() },
                  { [Op.eq]: null }
               ]
            },
            id: { 
               [Op.notIn]: Array.from(busyDriverIds) 
            }
         }
      });

      return candidate ? candidate.id : null;
   }

   // Removed checkLinkedDriver as it is now integrated into the main flow efficiently
}

export default AvailabilityBasedStrategy;