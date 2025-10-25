import express from 'express';
import { eventNotificationService } from './eventNotificationService.js';
import { ScheduledJobs } from './scheduledJobs.js';

const router = express.Router();

// Simple HTML test interface
router.get('/test-interface', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Notification System - Test Interface</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .test-section h3 { color: #34495e; margin-top: 0; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #2980b9; }
        .result { margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #3498db; }
        .success { border-left-color: #27ae60; background: #d5f4e6; }
        .error { border-left-color: #e74c3c; background: #fadbd8; }
        .info { border-left-color: #3498db; background: #d6eaf8; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-running { background: #27ae60; }
        .status-stopped { background: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Email Notification System - Test Interface</h1>
        
        <div class="test-section">
            <h3>🔍 System Status</h3>
            <button onclick="checkStatus()">Check System Status</button>
            <div id="status-result" class="result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <h3>📅 Events Information</h3>
            <button onclick="checkEvents()">View All Events</button>
            <button onclick="checkTodayEvents()">Check Today's Events</button>
            <div id="events-result" class="result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <h3>📧 Email Testing</h3>
            <button onclick="testImmediate()">Test Immediate Notifications</button>
            <button onclick="testAllNotifications()">Test All Notifications</button>
            <div id="email-result" class="result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <h3>⚙️ System Control</h3>
            <button onclick="startJobs()">Start Automatic Jobs</button>
            <button onclick="stopJobs()">Stop Automatic Jobs</button>
            <div id="control-result" class="result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <h3>📊 Quick Stats</h3>
            <button onclick="getQuickStats()">Get Quick Stats</button>
            <div id="stats-result" class="result" style="display: none;"></div>
        </div>
    </div>

    <script>
        async function makeRequest(url, method = 'GET') {
            try {
                const response = await fetch(url, { method });
                const data = await response.json();
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        function showResult(elementId, result, type = 'info') {
            const element = document.getElementById(elementId);
            element.style.display = 'block';
            element.className = \`result \${type}\`;
            
            if (result.success) {
                element.innerHTML = \`<pre>\${JSON.stringify(result.data, null, 2)}</pre>\`;
            } else {
                element.innerHTML = \`<strong>Error:</strong> \${result.error}\`;
            }
        }

        async function checkStatus() {
            const result = await makeRequest('/api/event-notifications/status');
            showResult('status-result', result, result.success ? 'success' : 'error');
        }

        async function checkEvents() {
            const result = await makeRequest('/api/event-notifications/events');
            showResult('events-result', result, result.success ? 'success' : 'error');
        }

        async function checkTodayEvents() {
            const result = await makeRequest('/api/event-notifications/today');
            showResult('events-result', result, result.success ? 'success' : 'error');
        }

        async function testImmediate() {
            const result = await makeRequest('/api/event-notifications/immediate', 'POST');
            showResult('email-result', result, result.success ? 'success' : 'error');
        }

        async function testAllNotifications() {
            const result = await makeRequest('/api/event-notifications/trigger', 'POST');
            showResult('email-result', result, result.success ? 'success' : 'error');
        }

        async function startJobs() {
            const result = await makeRequest('/api/event-notifications/jobs/start', 'POST');
            showResult('control-result', result, result.success ? 'success' : 'error');
        }

        async function stopJobs() {
            const result = await makeRequest('/api/event-notifications/jobs/stop', 'POST');
            showResult('control-result', result, result.success ? 'success' : 'error');
        }

        async function getQuickStats() {
            const [statusResult, eventsResult] = await Promise.all([
                makeRequest('/api/event-notifications/status'),
                makeRequest('/api/event-notifications/events')
            ]);

            if (statusResult.success && eventsResult.success) {
                const stats = {
                    systemRunning: statusResult.data.scheduled,
                    totalEvents: eventsResult.data.data?.totalEvents || 0,
                    significantRiskEvents: eventsResult.data.data?.significantRiskEvents || 0,
                    totalUsers: eventsResult.data.data?.totalUsers || 0,
                    activeJobs: statusResult.data.activeJobs || 0
                };
                showResult('stats-result', { success: true, data: stats }, 'success');
            } else {
                showResult('stats-result', { success: false, error: 'Failed to get stats' }, 'error');
            }
        }

        // Auto-load status on page load
        window.onload = function() {
            checkStatus();
        };
    </script>
</body>
</html>
  `;
  res.send(html);
});

// API endpoint for quick stats
router.get('/quick-stats', async (req, res) => {
  try {
    const [events, users] = await Promise.all([
      eventNotificationService.getUpcomingEvents(),
      eventNotificationService.getAllUsers()
    ]);

    const eventsWithRisk = events.map(event => {
      const formData = JSON.parse(event.formData);
      const riskScore = eventNotificationService.calculateWastageRisk(formData);
      return { ...formData, riskScore };
    });

    const significantRiskEvents = eventsWithRisk.filter(event => event.riskScore >= 2);

    res.json({
      success: true,
      data: {
        totalEvents: events.length,
        significantRiskEvents: significantRiskEvents.length,
        totalUsers: users.length,
        todayEvents: events.filter(event => {
          const formData = JSON.parse(event.formData);
          const today = new Date().toISOString().split('T')[0];
          return formData.Event_Date === today;
        }).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
