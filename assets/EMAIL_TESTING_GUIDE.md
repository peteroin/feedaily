# 📧 Email Notification System - User Testing Guide

## 🎯 How to Test Email Notifications

### **Method 1: Using API Endpoints (Recommended)**

#### **1. Check System Status**
```bash
curl -X GET http://localhost:5000/api/event-notifications/status
```
**Response:** Shows if the system is running and job status

#### **2. View All Upcoming Events**
```bash
curl -X GET http://localhost:5000/api/event-notifications/events
```
**Response:** Shows all events that would trigger notifications

#### **3. Check Today's Events**
```bash
curl -X GET http://localhost:5000/api/event-notifications/today
```
**Response:** Shows events happening today

#### **4. Test Immediate Notifications (Fallback Logic)**
```bash
curl -X POST http://localhost:5000/api/event-notifications/immediate \
  -H "Content-Type: application/json"
```
**Response:** Tests the new fallback logic (today → week events)

#### **5. Trigger All Notifications**
```bash
curl -X POST http://localhost:5000/api/event-notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```
**Response:** Sends emails for all upcoming events

#### **6. Start Automatic Scheduling**
```bash
curl -X POST http://localhost:5000/api/event-notifications/jobs/start \
  -H "Content-Type: application/json"
```
**Response:** Starts automatic email scheduling

### **Method 2: Using Browser (Simple Testing)**

#### **1. Check System Status**
Open in browser: `http://localhost:5000/api/event-notifications/status`

#### **2. View Events**
Open in browser: `http://localhost:5000/api/event-notifications/events`

#### **3. Test Immediate Notifications**
Open in browser: `http://localhost:5000/api/event-notifications/immediate`

### **Method 3: Using Postman or Similar Tools**

1. **Set Base URL:** `http://localhost:5000`
2. **Use the endpoints above with appropriate HTTP methods**
3. **For POST requests, set Content-Type to `application/json`**

## 🧪 Testing Scenarios

### **Scenario 1: Test with No Events**
1. Run: `GET /api/event-notifications/events`
2. Expected: `"totalEvents": 0`
3. Run: `POST /api/event-notifications/immediate`
4. Expected: `"No events today or this week"`

### **Scenario 2: Test with Today's Events**
1. Add an event for today
2. Run: `POST /api/event-notifications/immediate`
3. Expected: Emails sent for today's events
4. Check: `"notificationType": "today"`

### **Scenario 3: Test Fallback Logic (No Today, But Week Events)**
1. Add events for tomorrow/this week (but not today)
2. Run: `POST /api/event-notifications/immediate`
3. Expected: Emails sent for week events
4. Check: `"notificationType": "week"`

### **Scenario 4: Test Automatic Scheduling**
1. Run: `POST /api/event-notifications/jobs/start`
2. Expected: `"scheduled": true`
3. Wait 15-30 minutes
4. Check logs for automatic email sending

## 📊 Understanding Test Results

### **Successful Email Response:**
```json
{
  "success": true,
  "message": "Immediate notifications sent to 2 users for week events",
  "eventsNotified": 2,
  "emailsSent": 2,
  "emailsFailed": 0,
  "notificationType": "week"
}
```

### **No Events Response:**
```json
{
  "success": true,
  "message": "No events today or this week"
}
```

### **System Status Response:**
```json
{
  "success": true,
  "scheduled": true,
  "activeJobs": 3,
  "lastCheck": "2024-01-15T10:30:00Z"
}
```

## 🔧 Troubleshooting

### **If No Emails Are Sent:**
1. Check if events exist: `GET /api/event-notifications/events`
2. Check if users exist: Look for `"totalUsers"` in response
3. Check risk scores: Events need risk score ≥ 2
4. Check email service: Verify email configuration

### **If System Not Running:**
1. Start jobs: `POST /api/event-notifications/jobs/start`
2. Check status: `GET /api/event-notifications/status`
3. Restart server if needed

### **If Events Not Found:**
1. Verify event format in database
2. Check date format (should be YYYY-MM-DD)
3. Ensure `type = 'event'` in collaborations table

## 📱 Quick Test Commands

### **Windows PowerShell:**
```powershell
# Check status
Invoke-RestMethod -Uri "http://localhost:5000/api/event-notifications/status" -Method GET

# Test immediate notifications
Invoke-RestMethod -Uri "http://localhost:5000/api/event-notifications/immediate" -Method POST
```

### **Linux/Mac Terminal:**
```bash
# Check status
curl -X GET http://localhost:5000/api/event-notifications/status

# Test immediate notifications
curl -X POST http://localhost:5000/api/event-notifications/immediate
```

## 🎉 Expected Behavior

When testing works correctly, you should see:
- ✅ **Emails sent to registered users**
- ✅ **Proper fallback logic** (today → week events)
- ✅ **Automatic scheduling** running
- ✅ **Risk-based filtering** (only high-risk events)
- ✅ **Clear logging** in console

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify database connection
3. Ensure email service is configured
4. Check that users have valid email addresses
