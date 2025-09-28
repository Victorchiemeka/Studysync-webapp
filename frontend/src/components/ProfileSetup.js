import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, BookOpen, Clock, Target, Brain, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { completeProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    email: '', // Will be set from auth context
    major: '',
    year: 1,
    classes: [],
    availability: JSON.stringify({}),
    studyStyle: '',
    goals: '',
    preferredLocations: []
  });

  const steps = [
    {
      title: 'Basic Info',
      icon: <User className="w-6 h-6" />,
      component: BasicInfoStep
    },
    {
      title: 'Classes',
      icon: <BookOpen className="w-6 h-6" />,
      component: ClassesStep
    },
    {
      title: 'Availability',
      icon: <Clock className="w-6 h-6" />,
      component: AvailabilityStep
    },
    {
      title: 'Study Style',
      icon: <Brain className="w-6 h-6" />,
      component: StudyStyleStep
    },
    {
      title: 'Goals & Location',
      icon: <Target className="w-6 h-6" />,
      component: GoalsLocationStep
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Complete profile setup
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const result = await completeProfile(profileData);
      
      if (result.success) {
        toast.success('Profile completed successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(result.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile setup failed:', error);
      toast.error('Profile setup failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8"
      >
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Study Profile</h1>
          <p className="text-gray-600">Help us find your perfect study partner</p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center mt-6">
            {steps.map((stepInfo, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index + 1 <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {index + 1 <= step ? stepInfo.icon : <span>{index + 1}</span>}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index + 1 < step ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            Step {step} of {steps.length}: {steps[step - 1].title}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {React.createElement(steps[step - 1].component, {
            profileData,
            setProfileData,
            toast
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              step === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="whitepace-button-primary px-8 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            {step === steps.length ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Basic Info Step Component
const BasicInfoStep = ({ profileData, setProfileData }) => {
  const years = [1, 2, 3, 4, 5];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tell us about yourself</h2>
        <p className="text-gray-600">Basic information to get started</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major *
          </label>
          <input
            type="text"
            value={profileData.major}
            onChange={(e) => setProfileData({...profileData, major: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="e.g. Computer Science, Business, Biology"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Year *
          </label>
          <select
            value={profileData.studentYear}
            onChange={(e) => setProfileData({...profileData, studentYear: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year === 1 ? 'Freshman' : year === 2 ? 'Sophomore' : year === 3 ? 'Junior' : year === 4 ? 'Senior' : 'Graduate'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio (Optional)
        </label>
        <textarea
          value={profileData.bio || ''}
          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Tell potential study partners about yourself..."
          rows={3}
        />
      </div>
    </div>
  );
};

// Classes Step Component
const ClassesStep = ({ profileData, setProfileData }) => {
  const [newClass, setNewClass] = useState('');
  
  const addClass = () => {
    if (newClass.trim() && !profileData.classes?.includes(newClass.trim())) {
      setProfileData({
        ...profileData,
        classes: [...(profileData.classes || []), newClass.trim()]
      });
      setNewClass('');
    }
  };

  const removeClass = (classToRemove) => {
    setProfileData({
      ...profileData,
      classes: profileData.classes?.filter(cls => cls !== classToRemove) || []
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">What classes are you taking?</h2>
        <p className="text-gray-600">Add your current courses to find study partners</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addClass()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="e.g. CSE 110, MATH 242, BIO 181"
        />
        <button
          onClick={addClass}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {profileData.classes?.map((cls, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium">{cls}</span>
            <button
              onClick={() => removeClass(cls)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )) || (
          <div className="col-span-full text-center text-gray-500 py-8">
            No classes added yet. Add your first class above!
          </div>
        )}
      </div>

      {(profileData.classes?.length || 0) > 0 && (
        <div className="text-center text-sm text-gray-600">
          Added {profileData.classes.length} class{profileData.classes.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
};

// Availability Step Component
const AvailabilityStep = ({ profileData, setProfileData }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const toggleAvailability = (day, time) => {
    const availability = profileData.availability || {};
    const daySlots = availability[day] || [];
    
    const newDaySlots = daySlots.includes(time)
      ? daySlots.filter(slot => slot !== time)
      : [...daySlots, time];
    
    setProfileData({
      ...profileData,
      availability: {
        ...availability,
        [day]: newDaySlots
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">When are you available to study?</h2>
        <p className="text-gray-600">Select your preferred study times</p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          {/* Header */}
          <div className="font-semibold text-center py-2">Time</div>
          {days.map(day => (
            <div key={day} className="font-semibold text-center py-2 text-sm">
              {day.substring(0, 3)}
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="text-sm py-2 px-1 text-center font-medium">
                {time}
              </div>
              {days.map(day => {
                const isSelected = profileData.availability?.[day]?.includes(time) || false;
                return (
                  <button
                    key={`${day}-${time}`}
                    onClick={() => toggleAvailability(day, time)}
                    className={`h-8 rounded transition-colors ${
                      isSelected 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        Click time slots to toggle your availability
      </div>
    </div>
  );
};

// Study Style Step Component
const StudyStyleStep = ({ profileData, setProfileData }) => {
  const studyStyles = [
    {
      id: 'QUIET',
      name: 'Quiet Study',
      description: 'Prefer silent, focused study sessions',
      icon: '🤫'
    },
    {
      id: 'COLLABORATIVE',
      name: 'Group Discussion',
      description: 'Learn best through talking and explaining',
      icon: '💬'
    },
    {
      id: 'WHITEBOARD',
      name: 'Visual Learning',
      description: 'Love diagrams, charts, and visual aids',
      icon: '📝'
    },
    {
      id: 'FLASHCARDS',
      name: 'Practice & Drill',
      description: 'Memorization through repetition',
      icon: '🃏'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">What's your study style?</h2>
        <p className="text-gray-600">Choose the style that works best for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studyStyles.map(style => (
          <button
            key={style.id}
            onClick={() => setProfileData({...profileData, studyStyle: style.id})}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
              profileData.studyStyle === style.id
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-3">{style.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
            <p className="text-gray-600 text-sm">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Goals & Location Step Component
const GoalsLocationStep = ({ profileData, setProfileData }) => {
  const goals = [
    {
      id: 'ACE_FINAL',
      name: 'Ace the Final',
      description: 'Aiming for top grades',
      icon: '🎯'
    },
    {
      id: 'PASS_CLASS',
      name: 'Pass the Class',
      description: 'Focus on understanding basics',
      icon: '✅'
    },
    {
      id: 'HOMEWORK_HELP',
      name: 'Homework Help',
      description: 'Need assistance with assignments',
      icon: '📚'
    }
  ];

  const campusLocations = [
    'Hayden Library',
    'Noble Library',
    'Student Union',
    'Memorial Union',
    'Computing Commons',
    'Tempe Campus',
    'Downtown Campus',
    'West Campus',
    'Online/Virtual'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Goals & Study Locations</h2>
        <p className="text-gray-600">Final step to complete your profile</p>
      </div>

      {/* Study Goals */}
      <div>
        <h3 className="text-lg font-semibold mb-4">What's your primary study goal?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setProfileData({...profileData, studyGoal: goal.id})}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-center hover:shadow-lg ${
                profileData.studyGoal === goal.id
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{goal.icon}</div>
              <h4 className="font-semibold mb-1">{goal.name}</h4>
              <p className="text-gray-600 text-sm">{goal.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Study Locations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferred Study Locations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {campusLocations.map(location => {
            const isSelected = profileData.preferredLocations?.includes(location) || false;
            return (
              <button
                key={location}
                onClick={() => {
                  const current = profileData.preferredLocations || [];
                  const updated = isSelected
                    ? current.filter(loc => loc !== location)
                    : [...current, location];
                  setProfileData({...profileData, preferredLocations: updated});
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {location}
              </button>
            );
          })}
        </div>
      </div>

      {/* Group Preference Toggle */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Study Preference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setProfileData({...profileData, prefersGroups: false})}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center hover:shadow-lg ${
              profileData.prefersGroups === false
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">👥</div>
            <h4 className="font-semibold mb-1">Study Partners</h4>
            <p className="text-gray-600 text-sm">One-on-one study sessions</p>
          </button>
          
          <button
            onClick={() => setProfileData({...profileData, prefersGroups: true})}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-center hover:shadow-lg ${
              profileData.prefersGroups === true
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
            <h4 className="font-semibold mb-1">Study Groups</h4>
            <p className="text-gray-600 text-sm">Group study sessions (3+ people)</p>
          </button>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City/Location (Optional)
        </label>
        <input
          type="text"
          value={profileData.location || ''}
          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="e.g. Tempe, Phoenix, Scottsdale"
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
