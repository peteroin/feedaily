# Event Notification System

## Overview

The Event Notification System automatically monitors upcoming events and sends email alerts to registered users about potential food wastage. This system helps prevent food waste by alerting the community about events that might generate excess food.

## Features

### 🚨 Automated Risk Assessment
- **Risk Scoring**: Events are scored from 0-7 based on multiple factors:
  - Event size (number of expected attendees)
  - Time proximity (how soon the event is)
  - Event type (weddings, parties, conferences have higher risk)
- **Smart Filtering**: Only events with significant risk (score ≥ 2) trigger notifications

### 📧 Email Notifications
- **Comprehensive Alerts**: Detailed email with event information and risk assessment
- **Action Items**: Clear instructions on how to prevent food waste
- **Environmental Impact**: Shows potential environmental benefits of preventing waste

### ⏰ Scheduled Monitoring
- **Daily Check**: Runs at 9:00 AM to check for events happening today
- **Weekly Check**: Runs every Monday at 10:00 AM to check for events this week
- **Manual Triggers**: Admin can manually trigger notifications for testing

### 🎛️ Admin Management
- **Real-time Status**: View system status and job status
- **Manual Controls**: Start, stop, and restart scheduled jobs
- **Event Overview**: See all upcoming events with risk assessments
- **Notification History**: View results of recent notification triggers

## How It Works

### 1. Event Monitoring
The system continuously monitors the `collaborations` table for events that are:
- Type: "event"
- Status: "Accepted" by admin
- Date: Within the next 7 days

### 2. Risk Calculation
Events are scored based on:
- **Size Risk**: 1-3 points based on expected attendees
- **Time Risk**: 1-2 points based on proximity to event date
- **Type Risk**: 1-2 points based on event type keywords

### 3. Notification Process
When events with risk score ≥ 2 are found:
1. Fetch all registered users
2. Generate personalized email content
3. Send notifications to all users
4. Log results and update metrics

## API Endpoints

### System Management
- `GET /api/event-notifications/status` - Get system status
- `POST /api/event-notifications/trigger` - Manually trigger notifications
- `POST /api/event-notifications/jobs/start` - Start scheduled jobs
- `POST /api/event-notifications/jobs/stop` - Stop scheduled jobs
- `POST /api/event-notifications/jobs/restart` - Restart scheduled jobs

### Event Data
- `GET /api/event-notifications/events` - Get upcoming events with risk scores
- `POST /api/event-notifications/test` - Test notification system

## Admin Interface

Access the admin interface at `/admin/event-notifications` after logging in as admin.

### Features:
- **System Status Dashboard**: View job status and system health
- **Manual Triggers**: Test the system with different trigger types
- **Event Overview**: See all upcoming events with risk assessments
- **Job Controls**: Start, stop, and restart scheduled jobs

## Email Template

The system generates comprehensive emails that include:
- **Event Details**: Name, date, time, venue, expected attendees
- **Risk Assessment**: Clear indication of risk level
- **Action Items**: Specific steps to prevent food waste
- **Environmental Impact**: Quantified benefits of preventing waste
- **Platform Links**: Direct links to take action

## Configuration

### Scheduled Jobs
- **Daily Check**: `0 9 * * *` (9:00 AM daily)
- **Weekly Check**: `0 10 * * 1` (10:00 AM Mondays)
- **Test Job**: `*/5 * * * *` (Every 5 minutes - for testing only)

### Risk Factors
- **High Risk Keywords**: wedding, party, celebration, festival, conference, meeting, seminar, workshop, dinner, lunch, buffet
- **Medium Risk Keywords**: gathering, event, function, ceremony, reception

## Installation

1. Install dependencies:
```bash
npm install node-cron
```

2. The system automatically starts when the backend server starts

3. Access admin interface at `/admin/event-notifications`

## Usage Examples

### Manual Trigger
```javascript
// Trigger notifications for today's events
POST /api/event-notifications/trigger
{
  "type": "today"
}

// Trigger notifications for this week's events
POST /api/event-notifications/trigger
{
  "type": "week"
}
```

### Check System Status
```javascript
GET /api/event-notifications/status
```

## Environmental Impact

The system calculates and reports:
- **Food Waste Prevented**: Estimated kg of food saved
- **CO₂ Emissions Avoided**: Estimated CO₂ prevented
- **Water Saved**: Estimated liters of water conserved

## Troubleshooting

### Common Issues
1. **Jobs not running**: Check system status and restart jobs
2. **No emails sent**: Verify email service configuration
3. **No events found**: Check if events are properly accepted by admin

### Logs
The system provides detailed console logging for:
- Job execution status
- Email sending results
- Error conditions
- Performance metrics

## Future Enhancements

- **User Preferences**: Allow users to customize notification settings
- **Geographic Filtering**: Only notify users near event locations
- **Event Type Filtering**: Allow users to choose which event types to be notified about
- **Mobile Notifications**: Add push notification support
- **Analytics Dashboard**: Detailed reporting on notification effectiveness
