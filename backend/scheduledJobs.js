import cron from 'node-cron';
import { eventNotificationService } from './eventNotificationService.js';

// Scheduled jobs for event notifications
export class ScheduledJobs {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      console.log("⚠️ Scheduled jobs already running");
      return;
    }

    console.log("🚀 Starting scheduled jobs for event notifications...");

    // Early morning check at 6:00 AM for events happening today
    const earlyMorningJob = cron.schedule('0 6 * * *', async () => {
      console.log("🌅 Running early morning event check...");
      try {
        const result = await eventNotificationService.checkTodayEvents();
        console.log("✅ Early morning check completed:", result);
      } catch (error) {
        console.error("❌ Early morning check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Mid-morning check at 9:00 AM for events happening today
    const morningJob = cron.schedule('0 9 * * *', async () => {
      console.log("🌞 Running morning event check...");
      try {
        const result = await eventNotificationService.checkTodayEvents();
        console.log("✅ Morning check completed:", result);
      } catch (error) {
        console.error("❌ Morning check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Afternoon check at 2:00 PM for events happening today
    const afternoonJob = cron.schedule('0 14 * * *', async () => {
      console.log("☀️ Running afternoon event check...");
      try {
        const result = await eventNotificationService.checkTodayEvents();
        console.log("✅ Afternoon check completed:", result);
      } catch (error) {
        console.error("❌ Afternoon check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Weekly check every Monday at 10:00 AM for events happening this week
    const weeklyJob = cron.schedule('0 10 * * 1', async () => {
      console.log("📅 Running weekly event check...");
      try {
        const result = await eventNotificationService.checkWeekEvents();
        console.log("✅ Weekly check completed:", result);
      } catch (error) {
        console.error("❌ Weekly check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Real-time check every 30 minutes for immediate event detection
    const realtimeJob = cron.schedule('*/30 * * * *', async () => {
      console.log("⚡ Running real-time event check...");
      try {
        const result = await eventNotificationService.checkImmediateEvents();
        console.log("✅ Real-time check completed:", result);
      } catch (error) {
        console.error("❌ Real-time check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Immediate notification job every 15 minutes for urgent events
    const immediateJob = cron.schedule('*/15 * * * *', async () => {
      console.log("🚨 Running immediate event notification check...");
      try {
        const result = await eventNotificationService.sendImmediateNotification();
        console.log("✅ Immediate notification check completed:", result);
      } catch (error) {
        console.error("❌ Immediate notification check failed:", error);
      }
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });

    // Store job references
    this.jobs = [
      { name: 'early-morning', job: earlyMorningJob, description: 'Early morning event check at 6:00 AM' },
      { name: 'morning', job: morningJob, description: 'Morning event check at 9:00 AM' },
      { name: 'afternoon', job: afternoonJob, description: 'Afternoon event check at 2:00 PM' },
      { name: 'weekly', job: weeklyJob, description: 'Weekly event check on Mondays at 10:00 AM' },
      { name: 'realtime', job: realtimeJob, description: 'Real-time event check every 30 minutes' },
      { name: 'immediate', job: immediateJob, description: 'Immediate event notification every 15 minutes' }
    ];

    // Start all jobs
    this.jobs.forEach(({ name, job, description }) => {
      job.start();
      console.log(`✅ Started ${name} job: ${description}`);
    });

    this.isRunning = true;
    console.log("🎯 All scheduled jobs started successfully");
  }

  // Stop all scheduled jobs
  stop() {
    if (!this.isRunning) {
      console.log("⚠️ No scheduled jobs running");
      return;
    }

    console.log("🛑 Stopping scheduled jobs...");
    
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`⏹️ Stopped ${name} job`);
    });

    this.jobs = [];
    this.isRunning = false;
    console.log("✅ All scheduled jobs stopped");
  }

  // Get status of all jobs
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: this.jobs.map(({ name, job, description }) => ({
        name,
        description,
        isRunning: job.running
      }))
    };
  }

  // Manual trigger for testing
  async triggerManualCheck(type = 'all') {
    console.log(`🔧 Manual trigger for ${type} check...`);
    
    try {
      let result;
      switch (type) {
        case 'today':
          result = await eventNotificationService.checkTodayEvents();
          break;
        case 'week':
          result = await eventNotificationService.checkWeekEvents();
          break;
        case 'immediate':
          result = await eventNotificationService.sendImmediateNotification();
          break;
        case 'realtime':
          result = await eventNotificationService.checkImmediateEvents();
          break;
        case 'all':
        default:
          result = await eventNotificationService.sendEventNotifications();
          break;
      }
      
      console.log("✅ Manual check completed:", result);
      return result;
    } catch (error) {
      console.error("❌ Manual check failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Restart jobs (useful for configuration changes)
  restart() {
    console.log("🔄 Restarting scheduled jobs...");
    this.stop();
    setTimeout(() => {
      this.start();
    }, 1000);
  }
}

// Create singleton instance
export const scheduledJobs = new ScheduledJobs();

// Auto-start jobs when this module is imported
// scheduledJobs.start();
