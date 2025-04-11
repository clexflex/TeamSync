// server/cron.js
import cron from "node-cron";
import { createBirthdayNotifications, createWorkAnniversaryNotifications } from "./controllers/notificationController.js";
import logger from "./utils/logger.js";

// Set up cron jobs for scheduled notifications
const setupCronJobs = () => {
    // Run daily at 00:01
    cron.schedule("1 0 * * *", async () => {
        logger.info("Running daily notification checks");
        
        try {
            // Generate birthday notifications
            const birthdayResult = await createBirthdayNotifications();
            logger.info(`Birthday notification job: ${birthdayResult.success ? 'Success' : 'Failed'}`);
            
            // Generate work anniversary notifications
            const anniversaryResult = await createWorkAnniversaryNotifications();
            logger.info(`Work anniversary notification job: ${anniversaryResult.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            logger.error(`Error in notification cron job: ${error.message}`);
        }
    });
    
    logger.info("Notification cron jobs initialized");
};

export default setupCronJobs;