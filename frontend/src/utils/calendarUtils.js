// Google Calendar Integration Utilities
// This file contains helper functions for Google Calendar integration

/**
 * Generate Google Calendar event creation link
 * @param {Object} eventData - Event data object
 * @returns {string} Google Calendar URL
 */
export const generateGoogleCalendarLink = (eventData) => {
  const startDate = new Date(eventData.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(eventData.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventData.title,
    dates: `${startDate}/${endDate}`,
    details: eventData.description || '',
    location: eventData.location || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Create ICS file content for calendar export
 * @param {Array} events - Array of events
 * @returns {string} ICS file content
 */
export const generateICSContent = (events) => {
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudySync//StudySync Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.map(event => [
      'BEGIN:VEVENT',
      `UID:${event.id}@studysync.app`,
      `DTSTART:${formatDate(event.startTime)}`,
      `DTEND:${formatDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      `CATEGORIES:${event.eventType || 'STUDY'}`,
      `STATUS:CONFIRMED`,
      `CREATED:${formatDate(new Date())}`,
      `LAST-MODIFIED:${formatDate(new Date())}`,
      'END:VEVENT'
    ]).flat(),
    'END:VCALENDAR'
  ].join('\\r\\n');

  return icsContent;
};

/**
 * Download ICS file
 * @param {Array} events - Array of events
 * @param {string} filename - File name
 */
export const downloadICSFile = (events, filename = 'studysync-calendar.ics') => {
  const icsContent = generateICSContent(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Common study session templates
 */
export const STUDY_TEMPLATES = {
  studyGroup: {
    title: 'Study Group Session',
    description: 'Collaborative study session with classmates',
    duration: 2, // hours
    eventType: 'STUDY_SESSION'
  },
  exam: {
    title: 'Exam',
    description: 'Scheduled examination',
    duration: 2,
    eventType: 'EXAM'
  },
  assignment: {
    title: 'Assignment Due',
    description: 'Assignment submission deadline',
    duration: 0.25, // 15 minutes
    eventType: 'ASSIGNMENT_DUE'
  },
  lecture: {
    title: 'Class Lecture',
    description: 'Regular class session',
    duration: 1.5,
    eventType: 'CLASS'
  }
};

/**
 * Popular ASU study locations
 */
export const ASU_STUDY_LOCATIONS = [
  'Hayden Library - Room 203',
  'Noble Library - Study Room B',
  'Engineering Center - Room 280',
  'Memorial Union - Meeting Room C',
  'Computing Commons',
  'Business Building - Room 425',
  'Physics Building - Room 150',
  'Biodesign Institute - Study Area',
  'Student Union - Quiet Zone',
  'Tempe Campus - Outdoor Study Area'
];

/**
 * Time zone handling for ASU (Arizona)
 */
export const ASU_TIMEZONE = 'America/Phoenix'; // Arizona doesn't observe DST

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatEventDate = (date) => {
  const eventDate = new Date(date);
  return eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ASU_TIMEZONE
  });
};

/**
 * Check if Google Calendar API is available
 * @returns {boolean} True if API is loaded
 */
export const isGoogleAPIAvailable = () => {
  return typeof window !== 'undefined' && 
         window.gapi && 
         window.gapi.client && 
         window.gapi.client.calendar;
};

/**
 * Validate event data
 * @param {Object} eventData - Event data to validate
 * @returns {Object} Validation result
 */
export const validateEventData = (eventData) => {
  const errors = [];
  
  if (!eventData.title || eventData.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!eventData.startTime) {
    errors.push('Start time is required');
  }
  
  if (!eventData.endTime) {
    errors.push('End time is required');
  }
  
  if (eventData.startTime && eventData.endTime) {
    const start = new Date(eventData.startTime);
    const end = new Date(eventData.endTime);
    
    if (start >= end) {
      errors.push('End time must be after start time');
    }
    
    if (start < new Date()) {
      errors.push('Start time cannot be in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get event type color class
 * @param {string} eventType - Type of event
 * @returns {string} CSS class string
 */
export const getEventTypeColorClass = (eventType) => {
  const colorMap = {
    'STUDY_SESSION': 'bg-brand-blue-100 text-brand-blue-800 border-brand-blue-200',
    'EXAM': 'bg-red-100 text-red-800 border-red-200',
    'ASSIGNMENT_DUE': 'bg-brand-yellow-100 text-brand-yellow-800 border-brand-yellow-200',
    'CLASS': 'bg-green-100 text-green-800 border-green-200',
    'BREAK': 'bg-purple-100 text-purple-800 border-purple-200',
    'PERSONAL': 'bg-gray-100 text-gray-800 border-gray-200',
    'GOOGLE_CALENDAR': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return colorMap[eventType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get next available time slots
 * @param {Array} events - Existing events
 * @param {number} days - Number of days to look ahead
 * @returns {Array} Available time slots
 */
export const getAvailableTimeSlots = (events = [], days = 7) => {
  const slots = [];
  const now = new Date();
  
  // Common study hours (8 AM to 10 PM)
  const studyHours = [
    { start: 8, end: 10, label: '8:00 AM - 10:00 AM' },
    { start: 10, end: 12, label: '10:00 AM - 12:00 PM' },
    { start: 12, end: 14, label: '12:00 PM - 2:00 PM' },
    { start: 14, end: 16, label: '2:00 PM - 4:00 PM' },
    { start: 16, end: 18, label: '4:00 PM - 6:00 PM' },
    { start: 18, end: 20, label: '6:00 PM - 8:00 PM' },
    { start: 20, end: 22, label: '8:00 PM - 10:00 PM' }
  ];
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let day = 0; day < days; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    
    // Skip weekends for some slots (optional)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    studyHours.forEach(hour => {
      // Skip early morning slots on weekends
      if (isWeekend && hour.start < 10) return;
      
      const slotStart = new Date(date);
      slotStart.setHours(hour.start, 0, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(hour.end, 0, 0, 0);
      
      // Check if slot conflicts with existing events
      const hasConflict = events.some(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        return (slotStart < eventEnd && slotEnd > eventStart);
      });
      
      if (!hasConflict && slotStart > now) {
        slots.push(`${weekdays[dayOfWeek]} ${hour.label}`);
      }
    });
  }
  
  return slots.slice(0, 20); // Return first 20 available slots
};