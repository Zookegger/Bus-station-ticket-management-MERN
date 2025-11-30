import { Queue, JobsOptions } from "bullmq";
import redis from "@config/redis";

/**
 * Job payload for vehicle status transitions.
 * @property vehicleId - Target vehicle primary key.
 * @property status - Status to set (e.g., BUSY).
 */
export interface VehicleStatusJobData {
    vehicleId: number;
    status: string;
}

/**
 * BullMQ queue handling scheduled vehicle status changes (ACTIVE -> BUSY, etc.).
 */
export const vehicleStatusQueue = new Queue<VehicleStatusJobData>("vehicle-status", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: { count: 500, age: 3 * 24 * 3600 },
        removeOnFail: { count: 500 }
    }
});

/**
 * Helper to enqueue a delayed status change.
 * @param data - Vehicle status job data.
 * @param delayMs - Milliseconds until execution.
 * @param opts - Additional Bull job options.
 */
export async function enqueueVehicleStatus(data: VehicleStatusJobData, delayMs: number, opts?: JobsOptions): Promise<void> {
    await vehicleStatusQueue.add("set-status", data, { delay: delayMs, ...(opts || {}) });
}
