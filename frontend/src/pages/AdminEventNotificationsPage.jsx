import React, { useEffect, useState } from "react";
import { FiLogOut, FiPlay, FiPause, FiRefreshCw, FiBell, FiCalendar, FiUsers, FiMail } from "react-icons/fi";
import "./AdminEventNotificationsPage.css";

export default function AdminEventNotificationsPage() {
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState(null);

  useEffect(() => {
    fetchNotificationStatus();
    fetchUpcomingEvents();
  }, []);

  const fetchNotificationStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/event-notifications/status");
      const data = await response.json();
      if (data.success) {
        setNotificationStatus(data.data);
      } else {
        setError("Failed to fetch notification status");
      }
    } catch (error) {
      setError("Network error while fetching status");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/event-notifications/events");
      const data = await response.json();
      if (data.success) {
        setUpcomingEvents(data.data.events);
      } else {
        setError("Failed to fetch upcoming events");
      }
    } catch (error) {
      setError("Network error while fetching events");
    }
  };

  const handleTriggerNotification = async (type = 'all') => {
    setIsTriggering(true);
    try {
      const response = await fetch("http://localhost:5000/api/event-notifications/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await response.json();
      if (data.success) {
        setLastTriggerResult(data.data);
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Network error while triggering notifications");
    } finally {
      setIsTriggering(false);
    }
  };

  const handleJobControl = async (action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/event-notifications/jobs/${action}`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchNotificationStatus();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Network error while controlling jobs");
    }
  };


  const getRiskLevelColor = (riskScore) => {
    if (riskScore >= 4) return "high-risk";
    if (riskScore >= 2) return "medium-risk";
    return "low-risk";
  };

  const getRiskLevelText = (riskScore) => {
    if (riskScore >= 4) return "HIGH RISK";
    if (riskScore >= 2) return "MEDIUM RISK";
    return "LOW RISK";
  };

  if (loading) {
    return (
      <div className="admin-notifications-page">
        <div className="loading">Loading notification system...</div>
      </div>
    );
  }

  return (
    <div className="admin-notifications-page">
        <div className="admin-page-header">
          <h1>🔔 Event Notification Management</h1>
          <p>Manage automated event notifications and email campaigns</p>
        </div>

      {error && <div className="error-message">{error}</div>}

      {/* System Status */}
      {notificationStatus && (
        <div className="status-section">
          <h2>System Status</h2>
          <div className="status-cards">
            <div className="status-card">
              <div className="status-icon">
                <FiRefreshCw size={20} />
              </div>
              <div className="status-info">
                <h3>Jobs Running</h3>
                <p className={notificationStatus.scheduledJobs.isRunning ? "status-active" : "status-inactive"}>
                  {notificationStatus.scheduledJobs.isRunning ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">
                <FiCalendar size={20} />
              </div>
              <div className="status-info">
                <h3>Active Jobs</h3>
                <p>{notificationStatus.scheduledJobs.jobs.filter(job => job.isRunning).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Controls */}
      <div className="controls-section">
        <h2>Job Controls</h2>
        <div className="control-buttons">
          <button 
            onClick={() => handleJobControl('start')}
            className="control-btn start-btn"
            disabled={notificationStatus?.scheduledJobs.isRunning}
          >
            <FiPlay size={16} />
            Start Jobs
          </button>
          <button 
            onClick={() => handleJobControl('stop')}
            className="control-btn stop-btn"
            disabled={!notificationStatus?.scheduledJobs.isRunning}
          >
            <FiPause size={16} />
            Stop Jobs
          </button>
          <button 
            onClick={() => handleJobControl('restart')}
            className="control-btn restart-btn"
          >
            <FiRefreshCw size={16} />
            Restart Jobs
          </button>
        </div>
      </div>

      {/* Manual Triggers */}
      <div className="triggers-section">
        <h2>Manual Triggers</h2>
        <div className="trigger-buttons">
          <button 
            onClick={() => handleTriggerNotification('today')}
            className="trigger-btn today-btn"
            disabled={isTriggering}
          >
            <FiCalendar size={16} />
            Check Today's Events
          </button>
          <button 
            onClick={() => handleTriggerNotification('week')}
            className="trigger-btn week-btn"
            disabled={isTriggering}
          >
            <FiCalendar size={16} />
            Check This Week's Events
          </button>
          <button 
            onClick={() => handleTriggerNotification('all')}
            className="trigger-btn all-btn"
            disabled={isTriggering}
          >
            <FiMail size={16} />
            Send All Notifications
          </button>
        </div>
      </div>

      {/* Last Trigger Result */}
      {lastTriggerResult && (
        <div className="result-section">
          <h2>Last Trigger Result</h2>
          <div className="result-card">
            <div className="result-info">
              <p><strong>Status:</strong> {lastTriggerResult.success ? "✅ Success" : "❌ Failed"}</p>
              <p><strong>Message:</strong> {lastTriggerResult.message}</p>
              {lastTriggerResult.eventsNotified && (
                <p><strong>Events Notified:</strong> {lastTriggerResult.eventsNotified}</p>
              )}
              {lastTriggerResult.emailsSent && (
                <p><strong>Emails Sent:</strong> {lastTriggerResult.emailsSent}</p>
              )}
              {lastTriggerResult.emailsFailed && (
                <p><strong>Emails Failed:</strong> {lastTriggerResult.emailsFailed}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="events-section">
        <h2>Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="no-events">No upcoming events found</div>
        ) : (
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.eventId} className={`event-card ${getRiskLevelColor(event.riskScore)}`}>
                <div className="event-header">
                  <h3>{event.Event_name || 'Untitled Event'}</h3>
                  <span className={`risk-badge ${getRiskLevelColor(event.riskScore)}`}>
                    {getRiskLevelText(event.riskScore)}
                  </span>
                </div>
                <div className="event-details">
                  <p><strong>Date:</strong> {event.Event_Date}</p>
                  <p><strong>Time:</strong> {event.Event_Time || 'Not specified'}</p>
                  <p><strong>Venue:</strong> {event.Venue || 'Not specified'}</p>
                  <p><strong>Expected Attendees:</strong> {event.Expected_Persons || 'Not specified'}</p>
                  <p><strong>Purpose:</strong> {event.Purpose || 'Not specified'}</p>
                  <p><strong>Risk Score:</strong> {event.riskScore}/7</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
