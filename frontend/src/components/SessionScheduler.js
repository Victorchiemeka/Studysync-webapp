import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Send, X, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';

const SessionScheduler = ({ currentUser, otherUser, matchId, onClose, onSessionCreated }) => {
  const [step, setStep] = useState(1); // 1: Time selection, 2: Details, 3: Confirmation
  const [sessionData, setSessionData] = useState({
    course: '',
    location: '',
    startTime: '',
    endTime: '',
    description: '',
    type: 'STUDY_SESSION'
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [sharedAvailability, setSharedAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && otherUser) {
      calculateSharedAvailability();
    }
  }, [currentUser, otherUser]);

  const calculateSharedAvailability = () => {
    try {
      const currentUserAvail = currentUser.availability ? JSON.parse(currentUser.availability) : {};
      const otherUserAvail = otherUser.availability ? JSON.parse(otherUser.availability) : {};
      
      const shared = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      days.forEach(day => {
        const currentSlots = currentUserAvail[day] || [];
        const otherSlots = otherUserAvail[day] || [];
        
        const sharedSlots = currentSlots.filter(slot => otherSlots.includes(slot));
        
        if (sharedSlots.length > 0) {
          shared.push({
            day,
            slots: sharedSlots
          });
        }
      });
      
      setSharedAvailability(shared);
      generateAvailableSlots(shared);
    } catch (error) {
      console.error('Error calculating shared availability:', error);
      // Fallback to some default slots
      setSharedAvailability([]);
      generateDefaultSlots();
    }
  };

  const generateAvailableSlots = (sharedAvail) => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayAvail = sharedAvail.find(avail => avail.day === dayName);
      if (dayAvail && dayAvail.slots.length > 0) {
        dayAvail.slots.forEach(timeSlot => {
          const [time, period] = timeSlot.split(' ');
          const [hours, minutes] = time.split(':');
          const hour24 = period === 'PM' && hours !== '12' ? parseInt(hours) + 12 : 
                       (period === 'AM' && hours === '12' ? 0 : parseInt(hours));
          
          const slotDateTime = new Date(date);
          slotDateTime.setHours(hour24, parseInt(minutes || 0), 0, 0);
          
          if (slotDateTime > new Date()) { // Only future slots
            slots.push({
              date: date.toDateString(),
              time: timeSlot,
              datetime: slotDateTime,
              display: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeSlot}`
            });
          }
        });
      }
    }
    
    setAvailableSlots(slots.sort((a, b) => a.datetime - b.datetime).slice(0, 12));
  };

  const generateDefaultSlots = () => {
    const slots = [];
    const today = new Date();
    const defaultTimes = ['10:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];
    
    for (let i = 1; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      defaultTimes.forEach(time => {
        const [timeStr, period] = time.split(' ');
        const [hours, minutes] = timeStr.split(':');
        const hour24 = period === 'PM' && hours !== '12' ? parseInt(hours) + 12 : 
                     (period === 'AM' && hours === '12' ? 0 : parseInt(hours));
        
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour24, parseInt(minutes), 0, 0);
        
        slots.push({
          date: date.toDateString(),
          time: time,
          datetime: slotDateTime,
          display: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${time}`
        });
      });
    }
    
    setAvailableSlots(slots.slice(0, 12));
  };

  const selectTimeSlot = (slot) => {
    const endTime = new Date(slot.datetime);
    endTime.setHours(endTime.getHours() + 2); // Default 2-hour session
    
    setSessionData({
      ...sessionData,
      startTime: slot.datetime.toISOString(),
      endTime: endTime.toISOString()
    });
    setStep(2);
  };

  const handleCreateSession = async () => {
    if (!sessionData.course || !sessionData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...sessionData,
          organizerId: currentUser.id,
          matchId: matchId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Study session scheduled successfully!');
        
        // Send chat message about the session
        await fetch(`http://localhost:8081/api/chat/${matchId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            senderId: currentUser.id,
            message: `📅 Study session scheduled for ${sessionData.course} on ${new Date(sessionData.startTime).toLocaleDateString()} at ${new Date(sessionData.startTime).toLocaleTimeString()} - ${sessionData.location}`,
            messageType: 'SYSTEM'
          }),
        });
        
        onSessionCreated && onSessionCreated(result.session);
        onClose();
      } else {
        toast.error(result.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Network error creating session');
    } finally {
      setLoading(false);
    }
  };

  const getSharedClasses = () => {
    if (!currentUser.classes || !otherUser.classes) return [];
    const currentClasses = Array.from(currentUser.classes);
    const otherClasses = Array.from(otherUser.classes);
    return currentClasses.filter(cls => otherClasses.includes(cls));
  };

  const campusLocations = [
    'Hayden Library',
    'Noble Library', 
    'Student Union',
    'Memorial Union',
    'Computing Commons',
    'Engineering Center',
    'Life Sciences Building',
    'Online/Virtual'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Schedule Study Session</h3>
              <p className="text-gray-600">with {otherUser?.firstName} {otherUser?.lastName}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
          </div>

          {/* Step 1: Time Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">Choose a Time</h4>
                <p className="text-gray-600">
                  {sharedAvailability.length > 0 
                    ? "Times when both of you are available" 
                    : "Suggested times for your study session"
                  }
                </p>
              </div>

              {sharedAvailability.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Shared Availability Found</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    You both have {sharedAvailability.length} overlapping time slots this week!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => selectTimeSlot(slot)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                  >
                    <div className="font-medium text-gray-900">{slot.display}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {sharedAvailability.length > 0 ? '🟢 Both available' : '💡 Suggested time'}
                    </div>
                  </button>
                ))}
              </div>

              {availableSlots.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No shared availability found</p>
                  <Button onClick={generateDefaultSlots} variant="outline">
                    Show Suggested Times
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Session Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold mb-2">Session Details</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(sessionData.startTime).toLocaleDateString()} at {new Date(sessionData.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject/Course *
                </label>
                <select
                  value={sessionData.course}
                  onChange={(e) => setSessionData({...sessionData, course: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a course</option>
                  {getSharedClasses().map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                  <option value="OTHER">Other Subject</option>
                </select>
              </div>

              {sessionData.course === 'OTHER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Subject
                  </label>
                  <input
                    type="text"
                    value={sessionData.customCourse || ''}
                    onChange={(e) => setSessionData({...sessionData, customCourse: e.target.value, course: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Physics Study Group"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  value={sessionData.location}
                  onChange={(e) => setSessionData({...sessionData, location: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a location</option>
                  {campusLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionData.description}
                  onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="What will you focus on? Any materials to bring?"
                />
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!sessionData.course || !sessionData.location}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Review Session
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold mb-2">Confirm Study Session</h4>
                <p className="text-gray-600">Review your session details</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Participants</div>
                    <div className="text-sm text-gray-600">
                      You and {otherUser?.firstName} {otherUser?.lastName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-sm text-gray-600">
                      {new Date(sessionData.startTime).toLocaleDateString()} at {new Date(sessionData.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-gray-600">{sessionData.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Subject</div>
                    <div className="text-sm text-gray-600">{sessionData.course}</div>
                  </div>
                </div>

                {sessionData.description && (
                  <div className="border-t pt-4">
                    <div className="font-medium mb-1">Notes</div>
                    <div className="text-sm text-gray-600">{sessionData.description}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline">
                  Back
                </Button>
                <Button 
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionScheduler;