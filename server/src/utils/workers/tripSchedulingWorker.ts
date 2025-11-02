import redis from "@config/redis";
import { autoAssignDriver } from "@services/tripSchedulingServices";
import logger from "@utils/logger";
import { TripSchedulingJobData } from "@utils/queues/tripSchedulingQueue";
import {
	AvailabilityBasedStrategy,
	SchedulingStrategies,
	WorkloadBalancingStrategy,
} from "@utils/schedulingStrategy";
import { Job, Worker } from "bullmq";

const tripSchedulingWorker = new Worker<TripSchedulingJobData>(
	"trip-scheduling",
	async (job: Job<TripSchedulingJobData>): Promise<void> => {
		logger.info(
			`Processing scheduling job ${job.id} for trip ${job.data.tripId}`
		);

		try {
			// Select strategy based on job data
			let strategy =
				job.data.strategy === SchedulingStrategies.WORKLOAD_BALANCE
					? new WorkloadBalancingStrategy()
					: new AvailabilityBasedStrategy();

			// Execute auto-assignment
			const schedule = await autoAssignDriver(job.data.tripId, strategy);

			logger.info(
				`Trip ${job.data.tripId} auto-assigned to driver ${schedule.driverId}`
			);
		} catch (err: any) {
			logger.error(
				`Failed to auto-assign trip ${job.data.tripId}: ${err.message}`
			);
			throw err;
		}
	},
	{
		connection: redis,
		concurrency: 3,
	}
);

// Event handlers for monitoring
tripSchedulingWorker.on("completed", (job) => {
	logger.info(`Scheduling job ${job.id} completed`);
});

tripSchedulingWorker.on("failed", (job, err) => {
	logger.error(`Scheduling job ${job?.id} failed:`, err);
});

export default tripSchedulingWorker; 