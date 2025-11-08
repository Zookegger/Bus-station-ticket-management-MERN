import { Queue } from "bullmq";
import redis from "@config/redis";
import { SchedulingStrategies } from "@utils/schedulingStrategy";

/**
 * Job data structure for trip driver assignment.
 * @interface TripSchedulingJobData
 */
export interface TripSchedulingJobData {
	tripId: number;
	strategy?: SchedulingStrategies;
}

/**
 * Queue for processing trip driver auto-assignments.
 * Handles background assignment of drivers to trips.
 */
export const tripSchedulingQueue = new Queue<TripSchedulingJobData>(
	"trip-scheduling",
	{
		connection: redis,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: {
                count: 500,
                age: 7 * 24 * 3600, // 7 Days
            },
            removeOnFail: {
                count: 1000,
            }
        }
	}
);
