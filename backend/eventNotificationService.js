import db from "./database.js";
import { sendEmail } from "./emailService.js";

// Event notification service for food wastage prevention
export class EventNotificationService {
  constructor() {
    this.emailSentToday = new Set(); // Track emails sent today to avoid duplicates
    this.emailSentThisWeek = new Set(); // Track emails sent this week to avoid duplicates
  }

  // Calculate food wastage risk score based on event details
  calculateWastageRisk(event) {
    let riskScore = 0;
    const expectedPersons = parseInt(event.Expected_Persons) || 0;
    const eventDate = new Date(event.Event_Date);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

    // Risk factors
    if (expectedPersons > 100) riskScore += 3; // Large events
    else if (expectedPersons > 50) riskScore += 2; // Medium events
    else if (expectedPersons > 20) riskScore += 1; // Small events

    // Time-based risk
    if (daysUntilEvent <= 1) riskScore += 2; // Event today or tomorrow
    else if (daysUntilEvent <= 3) riskScore += 1; // Event in next few days

    // Event type risk (based on common food wastage patterns)
    const eventName = (event.Event_name || "").toLowerCase();
    const purpose = (event.Purpose || "").toLowerCase();
    
    const highRiskKeywords = [
      "wedding", "party", "celebration", "festival", "conference", 
      "meeting", "seminar", "workshop", "dinner", "lunch", "buffet"
    ];
    
    const mediumRiskKeywords = [
      "gathering", "event", "function", "ceremony", "reception"
    ];

    if (highRiskKeywords.some(keyword => 
      eventName.includes(keyword) || purpose.includes(keyword))) {
      riskScore += 2;
    } else if (mediumRiskKeywords.some(keyword => 
      eventName.includes(keyword) || purpose.includes(keyword))) {
      riskScore += 1;
    }

    return riskScore;
  }

  // Get events happening today or this week (automatically, no admin approval needed)
  async getUpcomingEvents() {
    return new Promise((resolve, reject) => {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Format dates for SQLite
      const todayStr = today.toISOString().split('T')[0];
      const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

      // Remove admin approval requirement - send emails for all events
      const query = `
        SELECT * FROM collaborations 
        WHERE type = 'event' 
        AND formData IS NOT NULL
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const upcomingEvents = rows.filter(row => {
          try {
            const formData = JSON.parse(row.formData);
            const eventDate = formData.Event_Date;
            
            if (!eventDate) return false;
            
            const eventDateObj = new Date(eventDate);
            return eventDateObj >= today && eventDateObj <= weekFromNow;
          } catch (error) {
            console.error("Error parsing event data:", error);
            return false;
          }
        });

        resolve(upcomingEvents);
      });
    });
  }

  // Get all registered users for notifications
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM users WHERE email IS NOT NULL", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  // Generate email content for event notification
  generateEmailContent(events) {
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.Event_Date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return eventDate === today;
    });
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.Event_Date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return eventDate !== today;
    });

    const highRiskEvents = events.filter(event => event.riskScore >= 4);
    const mediumRiskEvents = events.filter(event => event.riskScore === 2 || event.riskScore === 3);
    
    let subject = "🍽️ Feedaily Alert: Events with Potential Food Wastage";
    
    if (todayEvents.length > 0) {
      subject = `🚨 URGENT: ${todayEvents.length} Event(s) Happening TODAY - Help Prevent Food Waste!`;
    } else if (highRiskEvents.length > 0) {
      subject = `🚨 High Priority: ${highRiskEvents.length} Event(s) May Lead to Food Wastage`;
    }

    let emailBody = `
Hello Feedaily Community Member,

${todayEvents.length > 0 ? `
🚨 URGENT: EVENTS HAPPENING TODAY!
We have ${todayEvents.length} event(s) happening TODAY that may result in food wastage. Immediate action is needed!

${todayEvents.map(event => `
• ${event.Event_name || 'Untitled Event'}
  📅 Date: ${event.Event_Date} (TODAY!)
  ⏰ Time: ${event.Event_Time || 'Not specified'}
  📍 Venue: ${event.Venue || 'Not specified'}
  👥 Expected Attendees: ${event.Expected_Persons || 'Not specified'}
  🎯 Purpose: ${event.Purpose || 'Not specified'}
  ⚠️ Risk Level: ${event.riskScore >= 4 ? 'HIGH' : event.riskScore >= 2 ? 'MEDIUM' : 'LOW'} (${event.riskScore}/7)
`).join('')}

🎯 IMMEDIATE ACTION REQUIRED:
1. **Contact the event organizer NOW** - Call or message them about food donation
2. **Share Feedaily platform** - Let them know about our food redistribution service
3. **Volunteer to help** - Offer to coordinate food collection after the event
4. **Prepare containers** - If attending, bring containers for leftover food

` : ''}

${upcomingEvents.length > 0 ? `
📅 UPCOMING EVENTS THIS WEEK:
${upcomingEvents.map(event => `
• ${event.Event_name || 'Untitled Event'}
  📅 Date: ${event.Event_Date}
  ⏰ Time: ${event.Event_Time || 'Not specified'}
  📍 Venue: ${event.Venue || 'Not specified'}
  👥 Expected Attendees: ${event.Expected_Persons || 'Not specified'}
  🎯 Purpose: ${event.Purpose || 'Not specified'}
  ⚠️ Risk Level: ${event.riskScore >= 4 ? 'HIGH' : event.riskScore >= 2 ? 'MEDIUM' : 'LOW'} (${event.riskScore}/7)
`).join('')}

` : ''}

💡 HOW YOU CAN HELP PREVENT FOOD WASTE:

1. **Contact Event Organizers**: Reach out to event organizers and suggest food donation plans
2. **Share Feedaily**: Let them know about our platform for food redistribution
3. **Volunteer**: Offer to help coordinate food collection and distribution
4. **Plan Ahead**: If you're attending, bring containers for leftover food
5. **Spread the Word**: Share this alert with your network

🌱 ENVIRONMENTAL IMPACT:
By preventing food waste at these events, we can:
• Save approximately ${events.reduce((sum, event) => sum + (parseInt(event.Expected_Persons) || 0), 0) * 0.5} kg of food from going to waste
• Prevent ${events.reduce((sum, event) => sum + (parseInt(event.Expected_Persons) || 0), 0) * 0.5 * 4.3} kg of CO₂ emissions
• Save ${events.reduce((sum, event) => sum + (parseInt(event.Expected_Persons) || 0), 0) * 0.5 * 1500} liters of water

📱 TAKE ACTION NOW:
• Visit our platform: http://localhost:3000
• Create a food donation post
• Connect with local food banks
• Share this alert with your network

${todayEvents.length > 0 ? `
⚠️ REMEMBER: Events are happening TODAY! Don't wait - take action now to prevent food waste!
` : ''}

Thank you for being part of our mission to eliminate food waste!

Best regards,
The Feedaily Team

---
This is an automated notification. To unsubscribe from event alerts, please contact us.
    `;

    return { subject, emailBody };
  }

  // Send notifications to all users
  async sendEventNotifications() {
    try {
      console.log("🔔 Starting event notification process...");
      
      const events = await this.getUpcomingEvents();
      const users = await this.getAllUsers();
      
      if (events.length === 0) {
        console.log("📅 No upcoming events found for notifications");
        return { success: true, message: "No events to notify about" };
      }

      // Calculate risk scores for events
      const eventsWithRisk = events.map(event => {
        const formData = JSON.parse(event.formData);
        const riskScore = this.calculateWastageRisk(formData);
        return { ...formData, riskScore, eventId: event.id };
      });

      // Filter events with significant risk (score >= 2)
      const significantRiskEvents = eventsWithRisk.filter(event => event.riskScore >= 2);
      
      if (significantRiskEvents.length === 0) {
        console.log("📊 No events with significant food wastage risk found");
        return { success: true, message: "No high-risk events found" };
      }

      const { subject, emailBody } = this.generateEmailContent(significantRiskEvents);
      
      let successCount = 0;
      let errorCount = 0;

      // Send emails to all users
      for (const user of users) {
        try {
          await sendEmail(user.email, subject, emailBody);
          successCount++;
          console.log(`✅ Email sent to ${user.email}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to send email to ${user.email}:`, error.message);
        }
      }

      // Update impact calculations for email emissions
      await this.updateEmailImpactMetrics(successCount);

      console.log(`📧 Event notifications completed: ${successCount} sent, ${errorCount} failed`);
      
      return {
        success: true,
        message: `Notifications sent to ${successCount} users`,
        eventsNotified: significantRiskEvents.length,
        emailsSent: successCount,
        emailsFailed: errorCount
      };

    } catch (error) {
      console.error("❌ Error in event notification process:", error);
      return {
        success: false,
        message: "Failed to send event notifications",
        error: error.message
      };
    }
  }

  // Update email impact metrics
  async updateEmailImpactMetrics(emailCount) {
    // This could be integrated with the existing impact calculations
    console.log(`📊 Updated email impact metrics: ${emailCount} emails sent`);
  }

  // Check for events happening today specifically, or week events if no today events
  async checkTodayEvents() {
    try {
      const events = await this.getUpcomingEvents();
      const today = new Date().toISOString().split('T')[0];
      
      const todayEvents = events.filter(event => {
        try {
          const formData = JSON.parse(event.formData);
          const eventDate = formData.Event_Date;
          return eventDate === today;
        } catch (error) {
          console.error("Error parsing event data:", error);
          return false;
        }
      });

      if (todayEvents.length > 0) {
        console.log(`📅 Found ${todayEvents.length} events happening today`);
        return await this.sendEventNotifications();
      } else {
        // If no events today, check for events this week
        console.log("📅 No events today, checking for upcoming events this week...");
        if (events.length > 0) {
          console.log(`📅 Found ${events.length} events happening this week`);
          return await this.sendEventNotifications();
        }
      }
      
      return { success: true, message: "No events today or this week" };
    } catch (error) {
      console.error("❌ Error checking today's events:", error);
      return { success: false, error: error.message };
    }
  }

  // Check for events happening this week
  async checkWeekEvents() {
    try {
      const events = await this.getUpcomingEvents();
      
      if (events.length > 0) {
        console.log(`📅 Found ${events.length} events happening this week`);
        return await this.sendEventNotifications();
      }
      
      return { success: true, message: "No events this week" };
    } catch (error) {
      console.error("❌ Error checking week's events:", error);
      return { success: false, error: error.message };
    }
  }

  // Check for events happening right now (within the next few hours)
  async checkImmediateEvents() {
    try {
      const now = new Date();
      const nextFewHours = new Date(now.getTime() + 4 * 60 * 60 * 1000); // Next 4 hours
      
      return new Promise((resolve, reject) => {
        const query = `
          SELECT * FROM collaborations 
          WHERE type = 'event' 
          AND formData IS NOT NULL
        `;

        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          const immediateEvents = rows.filter(row => {
            try {
              const formData = JSON.parse(row.formData);
              const eventDate = formData.Event_Date;
              const eventTime = formData.Event_Time;
              
              if (!eventDate) return false;
              
              // Create event datetime
              let eventDateTime;
              if (eventTime) {
                eventDateTime = new Date(`${eventDate}T${eventTime}`);
              } else {
                eventDateTime = new Date(eventDate);
              }
              
              return eventDateTime >= now && eventDateTime <= nextFewHours;
            } catch (error) {
              console.error("Error parsing immediate event data:", error);
              return false;
            }
          });

          if (immediateEvents.length > 0) {
            console.log(`⚡ Found ${immediateEvents.length} events happening within the next 4 hours`);
            this.sendEventNotifications().then(resolve).catch(reject);
          } else {
            resolve({ success: true, message: "No immediate events found" });
          }
        });
      });
    } catch (error) {
      console.error("❌ Error checking immediate events:", error);
      return { success: false, error: error.message };
    }
  }

  // Send immediate notification for events happening today, or week events if no today events
  async sendImmediateNotification() {
    try {
      console.log("🚨 Sending immediate event notification...");
      
      const events = await this.getUpcomingEvents();
      const today = new Date().toISOString().split('T')[0];
      
      const todayEvents = events.filter(event => {
        try {
          const formData = JSON.parse(event.formData);
          const eventDate = formData.Event_Date;
          return eventDate === today;
        } catch (error) {
          console.error("Error parsing event data:", error);
          return false;
        }
      });

      let eventsToNotify = todayEvents;
      let notificationType = "today";

      // If no events today, check for events this week
      if (todayEvents.length === 0) {
        console.log("📅 No events today, checking for upcoming events this week...");
        eventsToNotify = events; // All upcoming events (within the week)
        notificationType = "week";
        
        if (eventsToNotify.length === 0) {
          return { success: true, message: "No events today or this week" };
        }
      }

      // Calculate risk scores for events
      const eventsWithRisk = eventsToNotify.map(event => {
        const formData = JSON.parse(event.formData);
        const riskScore = this.calculateWastageRisk(formData);
        return { ...formData, riskScore, eventId: event.id };
      });

      // Filter events with significant risk (score >= 2)
      const significantRiskEvents = eventsWithRisk.filter(event => event.riskScore >= 2);
      
      if (significantRiskEvents.length === 0) {
        return { 
          success: true, 
          message: `No events with significant risk found for ${notificationType}` 
        };
      }

      const { subject, emailBody } = this.generateEmailContent(significantRiskEvents);
      const users = await this.getAllUsers();
      
      let successCount = 0;
      let errorCount = 0;

      // Send emails to all users
      for (const user of users) {
        try {
          await sendEmail(user.email, subject, emailBody);
          successCount++;
          console.log(`✅ Immediate email sent to ${user.email} for ${notificationType} events`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to send immediate email to ${user.email}:`, error.message);
        }
      }

      console.log(`📧 Immediate notifications completed: ${successCount} sent, ${errorCount} failed`);
      
      return {
        success: true,
        message: `Immediate notifications sent to ${successCount} users for ${notificationType} events`,
        eventsNotified: significantRiskEvents.length,
        emailsSent: successCount,
        emailsFailed: errorCount,
        notificationType: notificationType
      };

    } catch (error) {
      console.error("❌ Error in immediate notification process:", error);
      return {
        success: false,
        message: "Failed to send immediate notifications",
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const eventNotificationService = new EventNotificationService();
