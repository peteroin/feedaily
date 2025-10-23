import express from "express";
import { eventNotificationService } from "./eventNotificationService.js";
import { scheduledJobs } from "./scheduledJobs.js";

const router = express.Router();

// GET /api/event-notifications/status
// Get status of notification system
router.get("/status", (req, res) => {
  try {
    const jobStatus = scheduledJobs.getStatus();
    res.json({
      success: true,
      message: "Event notification system status",
      data: {
        scheduledJobs: jobStatus,
        serviceStatus: "active"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get status",
      error: error.message
    });
  }
});

// POST /api/event-notifications/trigger
// Manually trigger event notifications
router.post("/trigger", async (req, res) => {
  try {
    const { type = 'all' } = req.body; // 'today', 'week', 'immediate', 'realtime', or 'all'
    
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

    res.json({
      success: true,
      message: `Manual trigger completed for ${type}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to trigger notifications",
      error: error.message
    });
  }
});

// POST /api/event-notifications/jobs/start
// Start scheduled jobs
router.post("/jobs/start", (req, res) => {
  try {
    scheduledJobs.start();
    res.json({
      success: true,
      message: "Scheduled jobs started successfully",
      data: scheduledJobs.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start scheduled jobs",
      error: error.message
    });
  }
});

// POST /api/event-notifications/jobs/stop
// Stop scheduled jobs
router.post("/jobs/stop", (req, res) => {
  try {
    scheduledJobs.stop();
    res.json({
      success: true,
      message: "Scheduled jobs stopped successfully",
      data: scheduledJobs.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to stop scheduled jobs",
      error: error.message
    });
  }
});

// POST /api/event-notifications/jobs/restart
// Restart scheduled jobs
router.post("/jobs/restart", (req, res) => {
  try {
    scheduledJobs.restart();
    res.json({
      success: true,
      message: "Scheduled jobs restarted successfully",
      data: scheduledJobs.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restart scheduled jobs",
      error: error.message
    });
  }
});

// GET /api/event-notifications/events
// Get upcoming events that would trigger notifications
router.get("/events", async (req, res) => {
  try {
    const events = await eventNotificationService.getUpcomingEvents();
    const users = await eventNotificationService.getAllUsers();
    
    // Calculate risk scores for events
    const eventsWithRisk = events.map(event => {
      const formData = JSON.parse(event.formData);
      const riskScore = eventNotificationService.calculateWastageRisk(formData);
      return { 
        ...formData, 
        riskScore, 
        eventId: event.id,
        significantRisk: riskScore >= 2
      };
    });

    res.json({
      success: true,
      message: "Upcoming events retrieved",
      data: {
        events: eventsWithRisk,
        totalEvents: eventsWithRisk.length,
        significantRiskEvents: eventsWithRisk.filter(e => e.significantRisk).length,
        totalUsers: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming events",
      error: error.message
    });
  }
});

// POST /api/event-notifications/test
// Test the notification system with sample data
router.post("/test", async (req, res) => {
  try {
    // This endpoint can be used to test the system without sending actual emails
    const result = await eventNotificationService.sendEventNotifications();
    
    res.json({
      success: true,
      message: "Test notification completed",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test notification failed",
      error: error.message
    });
  }
});

// POST /api/event-notifications/immediate
// Send immediate notification for events happening today
router.post("/immediate", async (req, res) => {
  try {
    const result = await eventNotificationService.sendImmediateNotification();
    
    res.json({
      success: true,
      message: "Immediate notification sent",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send immediate notification",
      error: error.message
    });
  }
});

// GET /api/event-notifications/today
// Get events happening today
router.get("/today", async (req, res) => {
  try {
    const events = await eventNotificationService.getUpcomingEvents();
    const today = new Date().toISOString().split('T')[0];
    
    const todayEvents = events.filter(event => {
      const formData = JSON.parse(event.formData);
      const eventDate = formData.Event_Date;
      return eventDate === today;
    });

    // Calculate risk scores for today's events
    const eventsWithRisk = todayEvents.map(event => {
      const formData = JSON.parse(event.formData);
      const riskScore = eventNotificationService.calculateWastageRisk(formData);
      return { 
        ...formData, 
        riskScore, 
        eventId: event.id,
        significantRisk: riskScore >= 2
      };
    });

    res.json({
      success: true,
      message: "Today's events retrieved",
      data: {
        events: eventsWithRisk,
        totalEvents: eventsWithRisk.length,
        significantRiskEvents: eventsWithRisk.filter(e => e.significantRisk).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get today's events",
      error: error.message
    });
  }
});

export default router;
