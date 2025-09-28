import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, ExternalLink, Settings, Users, Clock, MapPin, BookOpen, Home, MessageCircle, Map, LogOut, Download, Share, Eye, EyeOff, Menu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';
import { 
  generateGoogleCalendarLink, 
  downloadICSFile, 
  ASU_STUDY_LOCATIONS, 
  STUDY_TEMPLATES,
  validateEventData,
  getEventTypeColorClass,
  getAvailableTimeSlots,
  formatEventDate
} from '../utils/calendarUtils';

const Calendar = ({ userId = 1 }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [calendarView, setCalendarView] = useState('embedded'); // embedded, links
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    eventType: 'STUDY_SESSION'
  });

  useEffect(() => {
    loadDemoEvents();
    loadDemoSlots();
  }, [userId, selectedDate]);

  // Load demo events for development
  const loadDemoEvents = () => {
    const demoEvents = [
      {
        id: '1',
        title: 'CSE110 Study Group',
        description: 'Final exam preparation with group members',
        startTime: '2025-09-29T14:00:00Z',
        endTime: '2025-09-29T16:00:00Z',
        location: 'Hayden Library - Room 203',
        eventType: 'STUDY_SESSION',
        attendees: ['alice@asu.edu', 'bob@asu.edu']
      },
      {
        id: '2',
        title: 'MAT265 Calculus Exam',
        description: 'Midterm exam for Calculus III',
        startTime: '2025-09-30T10:00:00Z',
        endTime: '2025-09-30T12:00:00Z',
        location: 'Engineering Center - Room 280',
        eventType: 'EXAM'
      },
      {
        id: '3',
        title: 'Physics Lab Assignment Due',
        description: 'Lab report submission deadline',
        startTime: '2025-10-01T23:59:00Z',
        endTime: '2025-10-01T23:59:00Z',
        location: 'Online Submission',
        eventType: 'ASSIGNMENT_DUE'
      }
    ];
    setEvents(demoEvents);
  };

  const loadDemoSlots = () => {
    const slots = getAvailableTimeSlots(events, 7);
    setAvailableSlots(slots);
  };



  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...newEvent,
        userId: userId,
        startTime: new Date(newEvent.startTime).toISOString(),
        endTime: new Date(newEvent.endTime).toISOString()
      };

      // Validate event data
      const validation = validateEventData(eventData);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast.error(error);
        });
        return;
      }

      // Create in local state
      const newEventWithId = {
        ...eventData,
        id: Date.now().toString()
      };
      setEvents(prev => [...prev, newEventWithId]);

      // Generate Google Calendar link
      const googleLink = generateGoogleCalendarLink(eventData);
      toast.success(
        <div>
          <p>Event created locally!</p>
          <a 
            href={googleLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-300 underline mt-2 block"
          >
            Add to Google Calendar →
          </a>
        </div>,
        {
          duration: 6000,
          style: {
            background: '#10b981',
            color: 'white',
          },
        }
      );

      setShowEventForm(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        eventType: 'STUDY_SESSION'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const exportCalendar = () => {
    try {
      downloadICSFile(events, 'studysync-calendar.ics');
      toast.success('Calendar exported successfully!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
        },
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export calendar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue-50 via-white to-brand-yellow-50">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-brand-blue-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <BookOpen className="h-8 w-8 text-brand-blue-600 mr-2" />
                <span className="text-2xl font-bold text-neutral-900">
                  StudySync
                </span>
              </div>
              <Badge variant="secondary" className="ml-2 bg-brand-yellow-100 text-brand-yellow-800 hidden sm:inline-flex">
                📅 Calendar
              </Badge>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/groups')} className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Study Groups
              </Button>
              <Button variant="ghost" onClick={() => navigate('/chat')} className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
              <Button variant="ghost" onClick={() => navigate('/map')} className="flex items-center gap-2 text-sm">
                <Map className="h-4 w-4" />
                Map
              </Button>
              <Button variant="default" onClick={() => navigate('/calendar')} className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4" />
                Exit Demo
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-4 bg-white/95 backdrop-blur-lg">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/groups');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3"
                >
                  <Users className="h-4 w-4" />
                  Study Groups
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/chat');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate('/map');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3"
                >
                  <Map className="h-4 w-4" />
                  Map
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    navigate('/calendar');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </Button>
                <hr className="border-neutral-200 my-2" />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start gap-3 text-sm py-3 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Exit Demo
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="whitepace-text-hero text-neutral-900 mb-2">
              Study Calendar
            </h1>
            <p className="text-neutral-600">Manage your study schedule with Google Calendar integration</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button 
              onClick={() => setShowEventForm(true)}
              className="whitepace-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar View Options */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={calendarView === 'embedded' ? 'default' : 'outline'}
            onClick={() => setCalendarView('embedded')}
            className={calendarView === 'embedded' ? 'whitepace-button-primary' : ''}
          >
            📅 Embedded Calendar
          </Button>
          <Button
            variant={calendarView === 'links' ? 'default' : 'outline'}
            onClick={() => setCalendarView('links')}
            className={calendarView === 'links' ? 'whitepace-button-primary' : ''}
          >
            🚀 Quick Links
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar Content */}
          <div className="lg:col-span-2">
            {calendarView === 'embedded' && (
              <Card className="whitepace-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-brand-blue-600" />
                      Google Calendar
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGoogleCalendar(!showGoogleCalendar)}
                    >
                      {showGoogleCalendar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>
                    Your Google Calendar embedded directly in StudySync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showGoogleCalendar ? (
                    <div className="w-full h-96 border border-neutral-200 rounded-lg overflow-hidden">
                      {/* Google Calendar Embed - Replace src with your actual calendar embed URL */}
                      <iframe
                        src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FPhoenix&mode=WEEK&bgcolor=%23ffffff&color=%234285f4"
                        style={{ border: 0 }}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        title="Google Calendar"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="text-center">
                        <CalendarIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 mb-4">Calendar hidden for privacy</p>
                        <Button 
                          onClick={() => setShowGoogleCalendar(true)}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Show Calendar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}



            {calendarView === 'links' && (
              <Card className="whitepace-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-5 w-5 text-brand-blue-600" />
                    Quick Calendar Links
                  </CardTitle>
                  <CardDescription>
                    Direct links to Google Calendar actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={() => window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Study+Session&dates=20250929T140000Z/20250929T160000Z&details=StudySync+study+session&location=ASU+Campus', '_blank')}
                      className="whitepace-button-primary justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-semibold">📚 Create Study Session</div>
                        <div className="text-sm opacity-90">Pre-filled study event</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Exam&dates=20250930T100000Z/20250930T120000Z&details=Exam+from+StudySync&location=ASU+Campus', '_blank')}
                      className="whitepace-button-secondary justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-semibold">📝 Schedule Exam</div>
                        <div className="text-sm opacity-90">Add exam to calendar</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://calendar.google.com/calendar/u/0/r', '_blank')}
                      className="whitepace-button-primary justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-semibold">📅 Open Google Calendar</div>
                        <div className="text-sm opacity-90">View full calendar</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={exportCalendar}
                      className="whitepace-button-secondary justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-semibold">💾 Export Calendar</div>
                        <div className="text-sm opacity-90">Download ICS file</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Time Slots */}
            <Card className="whitepace-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-brand-blue-600" />
                  Available Slots
                </CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableSlots.slice(0, 6).map((slot, index) => (
                    <div key={index} className="bg-brand-blue-50 border border-brand-blue-200 p-3 rounded-lg text-sm">
                      <div className="font-medium text-brand-blue-900">{slot}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="whitepace-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-brand-blue-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 4).map(event => {
                    const eventTypeColors = {
                      'STUDY_SESSION': 'bg-brand-blue-100 text-brand-blue-800 border-brand-blue-200',
                      'EXAM': 'bg-red-100 text-red-800 border-red-200',
                      'ASSIGNMENT_DUE': 'bg-brand-yellow-100 text-brand-yellow-800 border-brand-yellow-200',
                      'CLASS': 'bg-green-100 text-green-800 border-green-200',
                      'GOOGLE_CALENDAR': 'bg-purple-100 text-purple-800 border-purple-200'
                    };
                    
                    return (
                      <div key={event.id} className="border border-neutral-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-neutral-900 text-sm">{event.title}</div>
                          <Badge className={`text-xs ${eventTypeColors[event.eventType] || 'bg-neutral-100 text-neutral-800 border-neutral-200'}`}>
                            {event.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-neutral-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="whitepace-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-brand-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={exportCalendar}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
                <Button 
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/settings', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Calendar Settings
                </Button>
                <Button 
                  onClick={() => window.open('https://calendar.google.com/calendar/u/0/r', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Creation Form */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-900">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                      placeholder="e.g., CSE110 Study Group"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-900">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                      rows="3"
                      placeholder="Event details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-neutral-900">Start Time</label>
                      <input
                        type="datetime-local"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-neutral-900">End Time</label>
                      <input
                        type="datetime-local"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-900">Location</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                      placeholder="e.g., Hayden Library - Room 203"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-900">Event Type</label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                      className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                    >
                      <option value="STUDY_SESSION">📚 Study Session</option>
                      <option value="CLASS">🏫 Class</option>
                      <option value="EXAM">📝 Exam</option>
                      <option value="ASSIGNMENT_DUE">⏰ Assignment Due</option>
                      <option value="BREAK">☕ Break</option>
                      <option value="PERSONAL">👤 Personal</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowEventForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="whitepace-button-primary"
                    >
                      Create Event
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;