# Automatic Email System for Event Notifications

## Overview

The Feedaily platform now features a fully automated email notification system that sends emails directly when events occur, without requiring admin approval. The system is designed to prevent food waste by alerting users about events that may result in food wastage.

## Key Features

### 🚨 Automatic Email Sending
- **No Admin Approval Required**: Emails are sent automatically for all events
- **Real-time Detection**: System checks for events every 15-30 minutes
- **Immediate Notifications**: Special alerts for events happening today
- **Smart Scheduling**: Multiple daily checks at optimal times

### 📅 Event Detection Schedule

| Time | Frequency | Purpose |
|------|-----------|---------|
| 6:00 AM | Daily | Early morning event check |
| 9:00 AM | Daily | Morning event check |
| 2:00 PM | Daily | Afternoon event check |
| Every 15 minutes | Continuous | Immediate notification check |
| Every 30 minutes | Continuous | Real-time event detection |
| Monday 10:00 AM | Weekly | Weekly event summary |

### 🎯 Email Types

#### 1. Urgent Notifications (Events Today)
- **Subject**: "🚨 URGENT: X Event(s) Happening TODAY - Help Prevent Food Waste!"
- **Content**: Immediate action required, contact organizers now
- **Priority**: Highest - sent every 15 minutes

#### 2. Regular Notifications (Upcoming Events)
- **Subject**: "🍽️ Feedaily Alert: Events with Potential Food Wastage"
- **Content**: Weekly event summary with action items
- **Priority**: High - sent daily

#### 3. High-Risk Event Alerts
- **Subject**: "🚨 High Priority: X Event(s) May Lead to Food Wastage"
- **Content**: Focus on events with high food wastage risk
- **Priority**: High - based on risk score

## Risk Assessment System

The system calculates food wastage risk based on:

### Risk Factors
- **Event Size**: Large events (>100 people) = +3 points
- **Time Proximity**: Events today/tomorrow = +2 points
- **Event Type**: Weddings, parties, conferences = +2 points
- **Medium Events**: 50-100 people = +2 points
- **Small Events**: 20-50 people = +1 point

### Risk Levels
- **HIGH RISK**: 4+ points (immediate action required)
- **MEDIUM RISK**: 2-3 points (action recommended)
- **LOW RISK**: 0-1 points (monitoring)

## API Endpoints

### Event Notifications
- `GET /api/event-notifications/status` - System status
- `POST /api/event-notifications/trigger` - Manual trigger
- `POST /api/event-notifications/immediate` - Send immediate notification
- `GET /api/event-notifications/today` - Get today's events
- `GET /api/event-notifications/events` - Get all upcoming events

### Manual Triggers
```bash
# Trigger all notifications
curl -X POST http://localhost:5000/api/event-notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'

# Send immediate notification for today's events
curl -X POST http://localhost:5000/api/event-notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "immediate"}'

# Check real-time events
curl -X POST http://localhost:5000/api/event-notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "realtime"}'
```

## Email Content Structure

### Urgent Email (Events Today)
```
🚨 URGENT: EVENTS HAPPENING TODAY!
We have X event(s) happening TODAY that may result in food wastage.

• Event Name
  📅 Date: 2024-XX-XX (TODAY!)
  ⏰ Time: XX:XX
  📍 Venue: Location
  👥 Expected Attendees: XXX
  🎯 Purpose: Event purpose
  ⚠️ Risk Level: HIGH (X/7)

🎯 IMMEDIATE ACTION REQUIRED:
1. Contact the event organizer NOW
2. Share Feedaily platform
3. Volunteer to help
4. Prepare containers
```

### Regular Email (Upcoming Events)
```
📅 UPCOMING EVENTS THIS WEEK:
• Event details with risk assessment

💡 HOW YOU CAN HELP PREVENT FOOD WASTE:
1. Contact Event Organizers
2. Share Feedaily
3. Volunteer
4. Plan Ahead
5. Spread the Word

🌱 ENVIRONMENTAL IMPACT:
• Save X kg of food from waste
• Prevent X kg of CO₂ emissions
• Save X liters of water
```

## System Configuration

### Email Settings
- **SMTP**: Gmail (smtp.gmail.com:587)
- **From**: "Feedaily" <s.victor2205@gmail.com>
- **Authentication**: App password required

### Database Requirements
- Events stored in `collaborations` table
- Users stored in `users` table with email addresses
- No admin approval required (`acceptedByAdmin` not checked)

### Timezone
- All scheduled jobs use "Asia/Kolkata" timezone
- Event dates compared in local time

## Testing the System

### Manual Testing
```bash
# Test the system
node testEmailSystem.js

# Check system status
curl http://localhost:5000/api/event-notifications/status

# Get today's events
curl http://localhost:5000/api/event-notifications/today
```

### Automated Testing
The system includes built-in testing capabilities:
- Risk score calculation
- Email content generation
- Event filtering
- User retrieval

## Monitoring and Logs

### Console Logs
- `🔔 Starting event notification process...`
- `✅ Email sent to user@example.com`
- `📧 Event notifications completed: X sent, Y failed`
- `⚡ Running real-time event check...`

### Error Handling
- Failed email sends are logged but don't stop the process
- Database errors are caught and logged
- Invalid event data is filtered out

## Benefits

### For Users
- **Immediate Awareness**: Know about events as they happen
- **Actionable Information**: Clear steps to prevent food waste
- **Environmental Impact**: Understand the positive impact of their actions

### For Event Organizers
- **Automatic Outreach**: No need to manually contact the platform
- **Community Support**: Users can help coordinate food donation
- **Waste Prevention**: Proactive approach to food waste

### For the Platform
- **Automated Operation**: No manual intervention required
- **Scalable System**: Handles multiple events simultaneously
- **Real-time Response**: Immediate action on time-sensitive events

## Future Enhancements

### Planned Features
- **SMS Notifications**: Add SMS alerts for urgent events
- **WhatsApp Integration**: Send notifications via WhatsApp
- **Event Organizer Contact**: Direct integration with event organizers
- **Food Bank Integration**: Automatic connection to local food banks
- **Analytics Dashboard**: Track notification effectiveness

### Customization Options
- **User Preferences**: Allow users to set notification frequency
- **Event Categories**: Different notification types for different events
- **Geographic Filtering**: Location-based event notifications
- **Time-based Filtering**: Custom notification schedules

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check SMTP credentials and network
2. **Events not detected**: Verify event data format and dates
3. **Scheduled jobs not running**: Check server time and cron configuration
4. **High email volume**: Adjust notification frequency or add user preferences

### Support
For technical support or questions about the automatic email system, contact the development team or check the system logs for detailed error information.

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: Active and Operational
