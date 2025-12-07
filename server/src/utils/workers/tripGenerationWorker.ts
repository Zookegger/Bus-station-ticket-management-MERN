import { Worker, Job } from "bullmq";
import redis from "@config/redis";
import db from "@models/index";
import logger from "@utils/logger";
import { Op } from "sequelize";
import { TripStatus, TripRepeatFrequency } from "@my_types/trip";
import { tripSchedulingQueue } from "@utils/queues/tripSchedulingQueue";
import { TripGenerationJobData } from "@utils/queues/tripGenerationQueue";
import { SchedulingStrategies } from "@utils/schedulingStrategy";

const tripGenerationWorker = new Worker<TripGenerationJobData>(
    "trip-generation",
    async (job: Job<TripGenerationJobData>): Promise<void> => {
        logger.info(`Starting daily trip generation...`);
        
        const transaction = await db.sequelize.transaction();
        const createdTripIds: number[] = []; // Store IDs to queue later
        
        try {
            // 1. Identify "Today" (or target date)
            const targetDate = job.data.date ? new Date(job.data.date) : new Date();
            targetDate.setHours(0, 0, 0, 0); // Normalize to midnight

            // 2. Fetch all Active Templates
            const templates = await db.Trip.findAll({
                where: {
                    isTemplate: true,
                    status: { [Op.ne]: TripStatus.CANCELLED },
                    // Ensure template is active for this date
                    [Op.and]: [
                        { startTime: { [Op.lte]: targetDate } },
                        { 
                            [Op.or]: [
                                { repeatEndDate: null },
                                { repeatEndDate: { [Op.gte]: targetDate } }
                            ]
                        }
                    ]
                },
                transaction
            });

            const processedTemplateIds = new Set<number>();
            let generatedCount = 0;

            for (const template of templates) {
                // SKIP if already processed (e.g., was the return leg of a previous loop)
                if (processedTemplateIds.has(template.id)) continue;

                // 3. Check Frequency (Does this template run today?)
                if (!shouldRunToday(template, targetDate)) continue;

                // Mark as processed
                processedTemplateIds.add(template.id);

                // 4. Generate OUTBOUND Instance
                const outboundInstance = await createInstance(template, targetDate, transaction);
                createdTripIds.push(outboundInstance.id); // Capture ID
                
                let returnInstance = null;

                // 5. Handle Template Pairs (Linked Return Trip)
                if (template.returnTripId) {
                    const returnTemplate = templates.find(t => t.id === template.returnTripId);
                    
                    if (returnTemplate) {
                        // Mark return template as processed so we don't generate it again as a standalone
                        processedTemplateIds.add(returnTemplate.id);

                        // Generate RETURN Instance
                        const daysOffset = getDayDifference(template.startTime, returnTemplate.startTime);
                        const returnTargetDate = new Date(targetDate);
                        returnTargetDate.setDate(returnTargetDate.getDate() + daysOffset);

                        returnInstance = await createInstance(returnTemplate, returnTargetDate, transaction);
                        createdTripIds.push(returnInstance.id); // Capture ID

                        // 6. Link the Instances
                        await outboundInstance.update({ returnTripId: returnInstance.id }, { transaction });
                        await returnInstance.update({ returnTripId: outboundInstance.id }, { transaction });
                    }
                }

                generatedCount++;
                if (returnInstance) generatedCount++;
            }

            await transaction.commit();
            logger.info(`Generated ${generatedCount} trips for ${targetDate.toDateString()}`);

            // 7. Queue Driver Assignments (Executed safely AFTER commit)
            if (createdTripIds.length > 0) {
                logger.info(`Queuing driver assignment for ${createdTripIds.length} new trips...`);
                
                const queuePromises = createdTripIds.map(tripId => 
                    tripSchedulingQueue.add("assign-driver", {
                        tripId,
                        strategy: SchedulingStrategies.AVAILABILITY
                    })
                );
                
                await Promise.all(queuePromises);
            }

        } catch (err) {
            await transaction.rollback();
            logger.error(`Trip generation failed: ${(err as Error).message}`);
            throw err;
        }
    },
    { connection: redis }
);

// --- Helper Functions ---

async function createInstance(template: any, date: Date, transaction: any) {
    // Merge Date (YYYY-MM-DD) with Template Time (HH:MM:SS)
    const instanceStartTime = new Date(date);
    const templateTime = new Date(template.startTime);
    instanceStartTime.setHours(templateTime.getHours(), templateTime.getMinutes(), 0, 0);

    return await db.Trip.create({
        ...template.toJSON(),
        id: undefined, // Let DB generate new ID
        isTemplate: false,
        templateTripId: template.id,
        returnTripId: null, // Will be linked manually
        startTime: instanceStartTime,
        returnStartTime: null, // Logic handles linked objects, not just this field
        status: TripStatus.PENDING, // Pending until driver assigned
        createdAt: new Date(),
        updatedAt: new Date()
    }, { transaction });
}

function shouldRunToday(template: any, targetDate: Date): boolean {
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday
    
    switch (template.repeatFrequency) {
        case TripRepeatFrequency.DAILY: return true;
        case TripRepeatFrequency.WEEKDAY: return dayOfWeek >= 1 && dayOfWeek <= 5;
        case TripRepeatFrequency.WEEKLY: 
            return dayOfWeek === new Date(template.startTime).getDay();
        // Add other cases as needed
        default: return false;
    }
}

function getDayDifference(d1: Date, d2: Date): number {
    const start1 = new Date(d1).setHours(0,0,0,0);
    const start2 = new Date(d2).setHours(0,0,0,0);
    return (start2 - start1) / (1000 * 60 * 60 * 24);
}

export default tripGenerationWorker;