import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Clock, MapPin, Star, Calendar, Award, Zap, BookOpen, Home, MessageCircle, Map, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import toast from 'react-hot-toast';

const StudyGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState(new Set([2, 4])); // Pre-join some groups for demo
  const [filter, setFilter] = useState('all'); // all, available, joined
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'joined', group: 'MAT265 Calculus Study Circle', time: '2 hours ago' },
    { id: 2, action: 'joined', group: 'Physics Study Jam - PHY101', time: '1 day ago' },
    { id: 3, action: 'completed', group: 'CSE110 Final Prep Session', time: '2 days ago' }
  ]);

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = () => {
    // Demo data - in production this would come from API
    const demoGroups = [
      {
        id: 1,
        name: 'CSE110 Final Prep Intensive',
        course: 'CSE110',
        subject: 'Computer Science',
        members: 4,
        maxMembers: 6,
        time: 'Tonight 7:00 PM',
        date: '2025-09-27',
        location: 'Hayden Library - Room 203',
        coordinates: { lat: 33.4242, lng: -111.9281 },
        description: 'Final exam prep covering algorithms, data structures, and programming fundamentals. We\'ll work through past exams and challenging problems together.',
        difficulty: 'Advanced',
        tags: ['Final Exam', 'Algorithms', 'Data Structures', 'Practice Problems'],
        organizer: {
          name: 'Alex Johnson',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=ffffff',
          year: 3,
          major: 'Computer Science'
        },
        rating: 4.8,
        isActive: true,
        meetingFrequency: 'One-time intensive',
        studyStyle: 'Collaborative problem solving'
      },
      {
        id: 2,
        name: 'MAT265 Calculus Study Circle',
        course: 'MAT265',
        subject: 'Mathematics',
        members: 6,
        maxMembers: 8,
        time: 'Daily 3:00 PM',
        date: 'Ongoing',
        location: 'Noble Library - Study Room B',
        coordinates: { lat: 33.4255, lng: -111.9400 },
        description: 'Regular calculus study sessions covering derivatives, integrals, and applications. Perfect for students who need consistent practice and support.',
        difficulty: 'Intermediate',
        tags: ['Calculus', 'Derivatives', 'Integrals', 'Homework Help'],
        organizer: {
          name: 'Sarah Chen',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=ffffff',
          year: 2,
          major: 'Mathematics'
        },
        rating: 4.9,
        isActive: true,
        meetingFrequency: 'Daily weekdays',
        studyStyle: 'Step-by-step explanations'
      },
      {
        id: 3,
        name: 'CSE240 Systems Programming Lab',
        course: 'CSE240',
        subject: 'Computer Science',
        members: 3,
        maxMembers: 5,
        time: 'Tomorrow 2:00 PM',
        date: '2025-09-28',
        location: 'Engineering Center - Lab 201',
        coordinates: { lat: 33.4234, lng: -111.9289 },
        description: 'Hands-on programming sessions focusing on C/C++, memory management, and system calls. Great for working through challenging assignments together.',
        difficulty: 'Advanced',
        tags: ['C Programming', 'System Calls', 'Memory Management', 'Coding'],
        organizer: {
          name: 'Mike Rodriguez',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=f59e0b&color=ffffff',
          year: 4,
          major: 'Software Engineering'
        },
        rating: 4.7,
        isActive: true,
        meetingFrequency: 'Twice weekly',
        studyStyle: 'Hands-on coding and debugging'
      },
      {
        id: 4,
        name: 'Physics Study Jam - PHY101',
        course: 'PHY101',
        subject: 'Physics',
        members: 5,
        maxMembers: 7,
        time: 'Weekend 10:00 AM',
        date: 'Saturdays',
        location: 'Physics Building - Room 150',
        coordinates: { lat: 33.4245, lng: -111.9275 },
        description: 'Tackling physics problems together! We focus on mechanics, forces, and motion. Visual learners welcome - we use lots of diagrams and examples.',
        difficulty: 'Beginner',
        tags: ['Mechanics', 'Problem Solving', 'Visual Learning', 'Exam Prep'],
        organizer: {
          name: 'Emma Wilson',
          avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=8b5cf6&color=ffffff',
          year: 2,
          major: 'Engineering'
        },
        rating: 4.6,
        isActive: true,
        meetingFrequency: 'Weekly weekends',
        studyStyle: 'Visual and interactive'
      },
      {
        id: 5,
        name: 'Data Structures & Algorithms Club',
        course: 'CSE355',
        subject: 'Computer Science',
        members: 8,
        maxMembers: 10,
        time: 'Wednesdays 6:00 PM',
        date: 'Weekly',
        location: 'Memorial Union - Meeting Room C',
        coordinates: { lat: 33.4249, lng: -111.9292 },
        description: 'Advanced algorithms study group for competitive programming and technical interviews. We solve LeetCode problems, discuss time complexity, and practice whiteboarding.',
        difficulty: 'Expert',
        tags: ['Algorithms', 'LeetCode', 'Interview Prep', 'Competitive Programming'],
        organizer: {
          name: 'Jordan Kim',
          avatar: 'https://ui-avatars.com/api/?name=Jordan+Kim&background=ef4444&color=ffffff',
          year: 3,
          major: 'Computer Science'
        },
        rating: 4.9,
        isActive: true,
        meetingFrequency: 'Weekly',
        studyStyle: 'Competitive problem solving'
      },
      {
        id: 6,
        name: 'Business Statistics Workshop',
        course: 'STP420',
        subject: 'Statistics',
        members: 7,
        maxMembers: 12,
        time: 'Sundays 1:00 PM',
        date: 'Weekly',
        location: 'Business Building - Room 425',
        coordinates: { lat: 33.4238, lng: -111.9295 },
        description: 'Learn statistics concepts and applications for business majors. We cover hypothesis testing, regression analysis, and real-world case studies.',
        difficulty: 'Intermediate',
        tags: ['Statistics', 'Business Applications', 'Hypothesis Testing', 'Regression'],
        organizer: {
          name: 'Taylor Brown',
          avatar: 'https://ui-avatars.com/api/?name=Taylor+Brown&background=06b6d4&color=ffffff',
          year: 4,
          major: 'Business Analytics'
        },
        rating: 4.4,
        isActive: true,
        meetingFrequency: 'Weekly',
        studyStyle: 'Case study focused'
      },
      {
        id: 3,
        name: 'Physics Study Circle',
        course: 'PHY101',
        subject: 'Physics',
        members: 2,
        maxMembers: 4,
        time: 'Friday 4:00 PM',
        date: '2025-09-29',
        location: 'Engineering Building Lab 1',
        coordinates: { lat: 33.4256, lng: -111.9267 },
        description: 'Weekly physics problem solving and concept review. Bring your questions!',
        difficulty: 'Beginner',
        tags: ['Weekly Meetup', 'Concept Review', 'Q&A'],
        organizer: {
          name: 'Mike Rodriguez',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=f59e0b&color=ffffff'
        },
        rating: 4.6
      },
      {
        id: 4,
        name: 'Data Structures Deep Dive',
        course: 'CSE110',
        subject: 'Computer Science',
        members: 5,
        maxMembers: 8,
        time: 'Saturday 10:00 AM',
        date: '2025-09-30',
        location: 'Computing Commons',
        coordinates: { lat: 33.4248, lng: -111.9275 },
        description: 'Advanced study group focusing on trees, graphs, and algorithms. Perfect for interview prep.',
        difficulty: 'Advanced',
        tags: ['Data Structures', 'Algorithms', 'Interview Prep'],
        organizer: {
          name: 'Emma Davis',
          avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=8b5cf6&color=ffffff'
        },
        rating: 4.7
      },
      {
        id: 5,
        name: 'Statistics Study Session',
        course: 'STA270',
        subject: 'Statistics',
        members: 1,
        maxMembers: 6,
        time: 'Sunday 3:00 PM',
        date: '2025-10-01',
        location: 'Library Quiet Zone',
        coordinates: { lat: 33.4245, lng: -111.9283 },
        description: 'Collaborative statistics problem solving. Great for homework and exam prep.',
        difficulty: 'Intermediate',
        tags: ['Statistics', 'Homework', 'Exam Prep'],
        organizer: {
          name: 'Jordan Kim',
          avatar: 'https://ui-avatars.com/api/?name=Jordan+Kim&background=ef4444&color=ffffff'
        },
        rating: 4.5
      }
    ];
    
    setGroups(demoGroups);
  };

  const handleJoinGroup = async (groupId) => {
    setLoading(true);
    try {
      // Show immediate feedback
      toast.loading('Joining group...', { duration: 800 });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const group = groups.find(g => g.id === groupId);
      if (group && group.members < group.maxMembers) {
        // Update group members count
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === groupId 
              ? { ...g, members: g.members + 1 }
              : g
          )
        );
        
        // Add to joined groups
        setJoinedGroups(prev => new Set([...prev, groupId]));
        
        // Enhanced success messages based on group type
        const successMessages = {
          1: `Welcome to CSE110 Final Prep! 📚 Check your email for study materials and meeting details.`,
          2: `Joined the Calculus Circle! 📐 You'll receive daily study reminders and homework help.`,
          3: `You're now in the Systems Programming Lab! 💻 Get ready for some serious coding sessions.`,
          4: `Physics Study Jam awaits! ⚡ Saturday sessions will help you master mechanics.`,
          5: `Data Structures Club membership confirmed! 🏆 Prepare for algorithm challenges and interview prep.`,
          6: `Business Statistics Workshop joined! 📊 Sunday sessions will boost your analytical skills.`
        };
        
        toast.success(successMessages[groupId] || `Successfully joined "${group.name}"! 🎉`, {
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
          },
        });
      } else {
        toast.error('Group is full or unavailable');
      }
    } catch (error) {
      toast.error('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGroups = groups.filter(group => {
    switch (filter) {
      case 'available':
        return group.members < group.maxMembers && !joinedGroups.has(group.id);
      case 'joined':
        return joinedGroups.has(group.id);
      default:
        return true;
    }
  });

  const getAvailableSpots = (group) => group.maxMembers - group.members;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-indigo-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <BookOpen className="h-8 w-8 text-indigo-600 mr-2" />
                <span className="text-2xl font-bold text-neutral-900">
                  StudySync
                </span>
              </div>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                🚀 Demo Mode
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="default" onClick={() => navigate('/groups')} className="flex items-center gap-2 text-sm">
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
              <Button variant="ghost" onClick={() => navigate('/calendar')} className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4" />
                Exit Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="whitepace-text-hero text-neutral-900 mb-2">
              Study Groups
            </h1>
            <p className="text-neutral-600">Join or create study groups for your classes</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button 
              onClick={() => {
                toast.success('Group creation feature coming soon! 🚀', {
                  duration: 3000,
                  style: {
                    background: '#6366f1',
                    color: 'white',
                  },
                });
              }}
              className="whitepace-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Available Groups</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{groups.filter(g => g.members < g.maxMembers).length}</div>
              <p className="text-xs text-blue-600">Ready to join</p>
            </CardContent>
          </Card>
          <Card className="whitepace-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Joined Groups</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{joinedGroups.size}</div>
              <p className="text-xs text-green-600">Active memberships</p>
            </CardContent>
          </Card>
          <Card className="whitepace-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Study Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">8</div>
              <p className="text-xs text-purple-600">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-indigo-600' : ''}
          >
            All Groups ({groups.length})
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            onClick={() => setFilter('available')}
            className={filter === 'available' ? 'bg-green-600' : ''}
          >
            Available ({groups.filter(g => g.members < g.maxMembers && !joinedGroups.has(g.id)).length})
          </Button>
          <Button
            variant={filter === 'joined' ? 'default' : 'outline'}
            onClick={() => setFilter('joined')}
            className={filter === 'joined' ? 'bg-purple-600' : ''}
          >
            Joined ({joinedGroups.size})
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {group.course}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{group.rating}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg leading-tight">{group.name}</CardTitle>
                <CardDescription className="text-sm">{group.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Group Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{group.members}/{group.maxMembers} members</span>
                  </div>
                  <Badge className={getDifficultyColor(group.difficulty)} variant="secondary">
                    {group.difficulty}
                  </Badge>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{group.time}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{group.location}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {group.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {group.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.tags.length - 2} more
                    </Badge>
                  )}
                </div>

                {/* Organizer */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={group.organizer.avatar} />
                    <AvatarFallback className="text-xs">{group.organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Organized by {group.organizer.name}
                  </span>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {joinedGroups.has(group.id) ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                      disabled
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Joined
                    </Button>
                  ) : group.members >= group.maxMembers ? (
                    <Button variant="outline" className="w-full" disabled>
                      Group Full
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={loading}
                      className="whitepace-button-primary w-full"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Joining...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Join Group ({getAvailableSpots(group)} spots left)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <Card className="text-center p-12">
            <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <CardTitle className="mb-2">No groups found</CardTitle>
            <CardDescription className="mb-6">
              {filter === 'joined' 
                ? "You haven't joined any study groups yet." 
                : "No study groups match your current filter."}
            </CardDescription>
            <Button className="whitepace-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Group
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;