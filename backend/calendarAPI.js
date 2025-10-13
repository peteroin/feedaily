import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Minimal mapping of region to Google Public Holidays calendarId
// Ref: https://developers.google.com/calendar/api/v3/reference/calendarList
const REGION_TO_CALENDAR_ID = {
  IN: "en.indian#holiday@group.v.calendar.google.com",
  US: "en.usa#holiday@group.v.calendar.google.com",
  GB: "en.uk#holiday@group.v.calendar.google.com",
  AU: "en.australian#holiday@group.v.calendar.google.com",
  CA: "en.canadian#holiday@group.v.calendar.google.com",
  SG: "en.singapore#holiday@group.v.calendar.google.com",
};

function getCalendarIdForRegion(region) {
  const key = String(region || "IN").toUpperCase();
  return REGION_TO_CALENDAR_ID[key] || REGION_TO_CALENDAR_ID.IN;
}

// GET /api/calendar-events?region=IN&days=7
// Returns upcoming public holiday-like events for the next N days
router.get("/calendar-events", async (req, res) => {
  try {
    const { region = "IN", days = "7" } = req.query;
    const apiKey = "AIzaSyDZUKLjaLKZsc2mIkDDW3iS-MWUmI3unqw";

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Missing GOOGLE_CALENDAR_API_KEY in environment",
      });
    }

    const calendarId = encodeURIComponent(getCalendarIdForRegion(region));
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + parseInt(days, 10) * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      timeMin
    )}&timeMax=${encodeURIComponent(timeMax)}&key=${apiKey}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ success: false, message: "Calendar API error", detail: text });
    }
    const json = await resp.json();

    const events = (json.items || []).map((e) => ({
      id: e.id,
      summary: e.summary,
      description: e.description,
      start: e.start?.date || e.start?.dateTime,
      end: e.end?.date || e.end?.dateTime,
      htmlLink: e.htmlLink,
    }));

    return res.json({ success: true, region: region.toUpperCase(), days: parseInt(days, 10), events });
  } catch (err) {
    console.error("calendar-events error", err);
    return res.status(500).json({ success: false, message: "Internal error", error: err.message });
  }
});

export default router;


