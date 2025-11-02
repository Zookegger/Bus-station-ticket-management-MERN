/**
 * Strategy interface for driver assignment algorithms.
 * Allows different assignment strategies (availability, workload balancing, etc.)
 * 
 * Interface for driver assignment algorithms.
 * @interface IDriverAssignmentStrategy
 * 
*/
export interface IDriverAssignmentStrategy {
	/**
     * Selects a driver for the provided trip id.
     * @param {number} trip_id
     * @returns {Promise<number | null>} selected driver id or null when none found
     */
    selectDriver(tripId: number): Promise<number | null>;
}

export enum SchedulingStrategies {
    AVAILABILITY = "AVAILABILITY",
    WORKLOAD_BALANCE = "WORKLOAD_BALANCE", 
}

export { default as AvailabilityBasedStrategy } from "./AvailabilityBasedStrategy"; 
export { default as WorkloadBalancingStrategy } from "./WorkloadBalancingStrategy";