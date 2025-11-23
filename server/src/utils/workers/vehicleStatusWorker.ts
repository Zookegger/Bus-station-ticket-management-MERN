import { Worker, Job } from "bullmq";
import redis from "@config/redis";
import logger from "@utils/logger";
import { VehicleStatusJobData } from "@utils/queues/vehicleStatusQueue";
import * as vehicleServices from "@services/vehicleServices";
import { VehicleStatus } from "@models/vehicle";

/**
 * Worker that processes scheduled vehicle status transition jobs.
 * Ensures idempotency: only updates when a change is required.
 */
const vehicleStatusWorker = new Worker<VehicleStatusJobData>(
    "vehicle-status",
    async (job: Job<VehicleStatusJobData>): Promise<void> => {
        logger.info(`Vehicle status job ${job.id} -> vehicle ${job.data.vehicleId} => ${job.data.status}`);
        try {
            const vehicle = await vehicleServices.getVehicleById(job.data.vehicleId);
            if (!vehicle) {
                logger.warn(`Vehicle ${job.data.vehicleId} not found for status change.`);
                return;
            }
            // Only change if different
            if (vehicle.status !== job.data.status) {
                await vehicle.update({ status: job.data.status as VehicleStatus });
                logger.info(`Vehicle ${vehicle.id} status updated to ${job.data.status}`);
            } else {
                logger.info(`Vehicle ${vehicle.id} already in status ${job.data.status}`);
            }
        } catch (err: any) {
            logger.error(`Vehicle status job ${job.id} failed: ${err.message}`);
            throw err; // Allow BullMQ retry logic
        }
    },
    { connection: redis, concurrency: 5 }
);

vehicleStatusWorker.on("completed", (job) => {
    logger.info(`Vehicle status job ${job.id} completed.`);
});

vehicleStatusWorker.on("failed", (job, err) => {
    logger.error(`Vehicle status job ${job?.id} failed: ${err.message}`);
});

export default vehicleStatusWorker;
