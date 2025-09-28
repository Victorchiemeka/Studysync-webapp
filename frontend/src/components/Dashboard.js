import React, { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Calendar, Star, Map, Brain, Users, BookOpen, Clock, MapPin, TrendingUp, Award, Zap, Target, Home, LogOut, Settings, Plus, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const getPlaceholderAvatar = (name, size = 150) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=${size}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalizedMessage = (user) => {
    const hour = new Date().getHours();
    const hasClasses = user.classes && Array.from(user.classes).length > 0;
    const hasMajor = user.major && user.major.trim() !== '';
    const firstClass = hasClasses ? Array.from(user.classes)[0] : null;
    
    if (!hasMajor || !hasClasses) {
      return `Complete your profile to unlock personalized study matching!`;
    }
    
    if (hour < 12 && hasClasses) {
      return `Ready to tackle ${firstClass} today? Let's find you study partners!`;
    } else if (hour >= 12 && hour < 17 && hasClasses) {
      return `How's your ${firstClass} going? Connect with fellow students!`;
    } else if (hour >= 17 && hasClasses) {
      return `Evening study session for ${firstClass}? Find your study group!`;
    } else {
      return `Welcome back! Your ${user.major} study partners are waiting.`;
    }
  };

  const { user: authUser, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [userMatches, setUserMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    studySessions: 0,
    compatibilityScore: 0,
    activeGroups: 0,
    weeklyGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !authUser) {
      return;
    }

    setCurrentUser(authUser);
    setCurrentUserId(authUser.id);

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadPotentialMatches(authUser.id),
          loadUserMatches(authUser.id)
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, authUser]);

  const loadPotentialMatches = async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8081/api/matching/potential-matches/${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMatches(data || []);
        setCurrentMatch(0);
      } else {
        console.log('Failed to load matches - user may not be authenticated');
        toast.error('Failed to load matches. Please try signing in again.');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Network error loading matches.');
    }
  };

  const loadUserMatches = async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/matching/matches/${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserMatches(data || []);
        
        const totalMatches = data?.length || 0;
        const studySessions = totalMatches > 0 ? Math.floor(totalMatches * 1.5) : 0;
        const compatibilityScore = totalMatches > 0 ? Math.round(totalMatches > 3 ? 85 : totalMatches * 25) : 0;
        const activeGroups = totalMatches > 0 ? Math.min(Math.floor(totalMatches / 2), 3) : 0;
        const weeklyGrowth = totalMatches > 2 ? 2 : (totalMatches > 0 ? 1 : 0);
        
        setUserStats({
          totalMatches,
          studySessions,
          compatibilityScore,
          activeGroups,
          weeklyGrowth
        });
        
        generateRecentActivity(data || [], currentUser);
      }
    } catch (error) {
      console.error('Error loading user matches:', error);
    }
  };
  
  const generateRecentActivity = (matches, user) => {
    const activities = [];
    
    if (matches && matches.length > 0) {
      matches.slice(0, 3).forEach((match, index) => {
        const partner = match.user1?.id === user?.id ? match.user2 : match.user1;
        if (partner?.firstName) {
          activities.push({
            id: `match-${match.id}`,
            type: 'match',
            message: `New match with ${partner.firstName}`,
            time: `${index + 1} hours ago`,
            icon: '💝'
          });
        }
      });
      
      if (user?.classes && user.classes.size > 0) {
        const firstClass = Array.from(user.classes)[0];
        activities.push({
          id: 'session-real',
          type: 'session',
          message: `Study session available for ${firstClass}`,
          time: '1 hour ago',
          icon: '📚'
        });
      }
      
      if (user?.goals && user.goals.size > 0) {
        const firstGoal = Array.from(user.goals)[0];
        activities.push({
          id: 'goal-real',
          type: 'goal',
          message: `Progress on ${firstGoal} goal`,
          time: '2 hours ago',
          icon: '🎯'
        });
      }
    }
    
    setRecentActivity(activities);
  };

  const handleLike = async () => {
    const match = matches[currentMatch];
    if (!match) {
      return;
    }
    try {
      const response = await fetch('http://localhost:8081/api/matching/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: match.id,
          liked: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isMatch) {
          toast.success(`It's a match with ${match.name}! 🎉`);
          loadUserMatches(currentUserId);
        } else {
          toast.success('Like sent!');
        }
      }
    } catch (error) {
      console.error('Error processing like:', error);
      toast.error('Error processing like');
    }
    
    nextMatch();
  };

  const handlePass = async () => {
    const match = matches[currentMatch];
    if (!match) {
      return;
    }
    try {
      await fetch('http://localhost:8081/api/matching/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: match.id,
          liked: false
        }),
      });
    } catch (error) {
      console.error('Error processing pass:', error);
    }
    
    nextMatch();
  };

  const nextMatch = () => {
    if (currentMatch < matches.length - 1) {
      setCurrentMatch(currentMatch + 1);
    } else {
      if (currentUserId) {
        loadPotentialMatches(currentUserId);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {currentUser ? `Loading ${currentUser.firstName}'s dashboard...` : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Navigation Component
  const NavigationBar = () => (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-neutral-200/50 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <BookOpen className="h-8 w-8 text-brand-blue-500 mr-2" />
              <span className="text-2xl font-bold text-neutral-900">
                StudySync
              </span>
            </div>
            <Badge variant="secondary" className="ml-2 bg-brand-yellow-100 text-brand-yellow-800 border-brand-yellow-200 hidden sm:inline-flex">
              🏠 Dashboard
            </Badge>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="default" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm">
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
              {userMatches.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {userMatches.length}
                </Badge>
              )}
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
                variant="default" 
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
                className="w-full justify-start gap-3 text-sm py-3 relative"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
                {userMatches.length > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {userMatches.length}
                  </Badge>
                )}
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
                variant="ghost" 
                onClick={() => {
                  navigate('/calendar');
                  setIsMobileMenuOpen(false);
                }} 
                className="w-full justify-start gap-3 text-sm py-3"
              >
                <Calendar className="h-4 w-4" />
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
  );

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="whitepace-text-hero text-neutral-900 mb-4">
              {currentUser ? `Welcome back, ${currentUser.firstName}!` : 'Welcome to StudySync!'}
            </h1>
            <p className="text-neutral-600 text-lg mb-6">
              {currentUser ? `Let's find you some study partners for ${currentUser.major || 'your courses'}!` : 'Let\'s get you connected with study partners!'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="whitepace-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  Get Started with StudySync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full whitepace-button-primary">
                  <Link to="/map">
                    <MapPin className="h-4 w-4 mr-2" />
                    Explore Study Locations
                  </Link>
                </Button>
                <Button 
                  onClick={() => {
                    toast.success('Refreshing matches...', { icon: '🔄' });
                    setTimeout(() => loadPotentialMatches(currentUserId), 1000);
                  }}
                  className="w-full whitepace-button-primary"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Find Study Partners
                </Button>
              </CardContent>
            </Card>

            <Card className="whitepace-card">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Available for Study</span>
                    <Badge>2:00 PM - 5:00 PM</Badge>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Full Calendar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const match = matches[currentMatch];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="whitepace-text-hero text-neutral-900 mb-2">
            {currentUser ? `${getGreeting()}, ${currentUser.firstName}!` : 'StudySync Dashboard'}
          </h1>
          <p className="text-neutral-600 text-lg">
            {currentUser ? getPersonalizedMessage(currentUser) : 'Find your perfect study partner'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-b from-white to-gray-50">
              <div className="relative">
                <img
                  src={match.profilePicture}
                  alt={match.name}
                  className="w-full h-80 object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  {match.compatibilityScore}% Match
                </Badge>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{match.name}</h2>
                    <p className="text-muted-foreground">{match.major} • Year {match.year}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Shared Classes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.sharedClasses.map(cls => (
                          <Badge key={cls} variant="secondary">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    <Button
                      onClick={handlePass}
                      variant="outline"
                      size="icon"
                      className="w-12 h-12 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleLike}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      size="icon"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      {currentMatch + 1} of {matches.length} potential matches
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  {userMatches.length > 0 ? (
                    <div className="space-y-3">
                      {userMatches.slice(0, 4).map((match) => (
                        <div key={match.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarImage src={match.user2?.profilePictureUrl || getPlaceholderAvatar(match.user2?.name || 'User', 40)} />
                            <AvatarFallback>
                              {(match.user2?.name || 'U').charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {match.user2?.name || 'Study Partner'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {match.user2?.major || 'Student'}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/chat/${match.id}`}>
                              <MessageCircle className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No matches yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;