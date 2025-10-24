import { eventNotificationService } from './eventNotificationService.js';
import { ScheduledJobs } from './scheduledJobs.js';

console.log('🚀 Quick Email System Test\n');

async function quickTest() {
  try {
    console.log('📊 System Overview:');
    console.log('==================');
    
    // Get basic stats
    const events = await eventNotificationService.getUpcomingEvents();
    const users = await eventNotificationService.getAllUsers();
    
    console.log(`📅 Upcoming Events: ${events.length}`);
    console.log(`👥 Registered Users: ${users.length}`);
    
    if (events.length > 0) {
      console.log('\n📋 Event Details:');
      events.forEach((event, index) => {
        const formData = JSON.parse(event.formData);
        const riskScore = eventNotificationService.calculateWastageRisk(formData);
        console.log(`   ${index + 1}. ${formData.Event_Name} (${formData.Event_Date}) - Risk: ${riskScore}/7`);
      });
    }
    
    console.log('\n🧪 Testing Fallback Logic:');
    console.log('==========================');
    
    // Test the fallback logic
    const result = await eventNotificationService.sendImmediateNotification();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      if (result.notificationType) {
        console.log(`📧 Notification Type: ${result.notificationType}`);
      }
      if (result.eventsNotified) {
        console.log(`📅 Events Notified: ${result.eventsNotified}`);
      }
      if (result.emailsSent) {
        console.log(`📧 Emails Sent: ${result.emailsSent}`);
      }
    } else {
      console.log(`❌ ${result.message}`);
    }
    
    console.log('\n⚙️ System Control:');
    console.log('==================');
    console.log('To start automatic emails, run:');
    console.log('curl -X POST http://localhost:5000/api/event-notifications/jobs/start');
    console.log('\nTo test manually, run:');
    console.log('curl -X POST http://localhost:5000/api/event-notifications/immediate');
    console.log('\nTo view web interface, open:');
    console.log('http://localhost:5000/api/test-interface');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
