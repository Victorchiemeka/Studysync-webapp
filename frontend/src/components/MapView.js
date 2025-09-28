import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, BookOpen, Star, Home, MessageCircle, Calendar, Map, LogOut, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';

const MapView = ({ userId = 1 }) => {
  const navigate = useNavigate();
  const [studySpots, setStudySpots] = useState([]);
  const [filter, setFilter] = useState('all'); // all, groups, spots, partners
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadStudySpots();
  }, []);

  const loadStudySpots = () => {
    // Demo data for study locations around ASU campus
    const demoSpots = [
      {
        id: 1,
        type: 'study_group',
        name: 'CSE110 Final Prep',
        position: { lat: 33.4242, lng: -111.9281 },
        location: 'Hayden Library - Room 203',
        time: 'Tonight 7:00 PM',
        members: 4,
        maxMembers: 6,
        course: 'CSE110',
        organizer: 'Alex Johnson',
        difficulty: 'Advanced',
        rating: 4.8,
        description: 'Intensive final exam preparation with practice problems',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=ffffff'
      },
      {
        id: 2,
        type: 'study_spot',
        name: 'Hayden Library Quiet Zone',
        position: { lat: 33.4245, lng: -111.9283 },
        location: 'Hayden Library - 2nd Floor',
        amenities: ['WiFi', 'Power Outlets', 'Quiet', 'Individual Study'],
        hours: '24/7',
        occupancy: 'Low',
        rating: 4.9,
        description: 'Perfect for focused individual study sessions'
      },
      {
        id: 3,
        type: 'study_group',
        name: 'MAT265 Problem Solving',
        position: { lat: 33.4234, lng: -111.9289 },
        location: 'Student Center - Room B',
        time: 'Tomorrow 2:00 PM',
        members: 3,
        maxMembers: 5,
        course: 'MAT265',
        organizer: 'Sarah Chen',
        difficulty: 'Intermediate',
        rating: 4.7,
        description: 'Collaborative calculus problem solving workshop',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=ffffff'
      },
      {
        id: 4,
        type: 'study_spot',
        name: 'Computing Commons',
        position: { lat: 33.4248, lng: -111.9275 },
        location: 'Brickyard Engineering Building',
        amenities: ['Computers', 'WiFi', 'Group Tables', 'Whiteboards'],
        hours: '6 AM - 2 AM',
        occupancy: 'Medium',
        rating: 4.6,
        description: 'Great for coding and group projects'
      },
      {
        id: 5,
        type: 'study_partner',
        name: 'Emma Davis',
        position: { lat: 33.4256, lng: -111.9267 },
        location: 'Engineering Library',
        course: 'CSE110',
        year: 'Junior',
        studyStyle: 'Collaborative',
        availability: 'Available now',
        compatibilityScore: 89,
        description: 'Looking for study partner for data structures review',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=8b5cf6&color=ffffff'
      },
      {
        id: 6,
        type: 'study_group',
        name: 'Physics Study Circle',
        position: { lat: 33.4256, lng: -111.9267 },
        location: 'Engineering Building - Lab 1',
        time: 'Friday 4:00 PM',
        members: 2,
        maxMembers: 4,
        course: 'PHY101',
        organizer: 'Mike Rodriguez',
        difficulty: 'Beginner',
        rating: 4.5,
        description: 'Weekly physics concepts and problem solving',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=f59e0b&color=ffffff'
      },
      {
        id: 7,
        type: 'study_spot',
        name: 'Secret Garden Café',
        position: { lat: 33.4251, lng: -111.9285 },
        location: 'Memorial Union',
        amenities: ['Coffee', 'WiFi', 'Casual Seating', 'Background Music'],
        hours: '7 AM - 10 PM',
        occupancy: 'High',
        rating: 4.4,
        description: 'Relaxed atmosphere perfect for reading and light study'
      }
    ];

    setStudySpots(demoSpots);
    setLoading(false);
  };





  const filteredSpots = studySpots.filter(spot => {
    if (filter === 'all') return true;
    if (filter === 'groups') return spot.type === 'study_group';
    if (filter === 'spots') return spot.type === 'study_spot';
    if (filter === 'partners') return spot.type === 'study_partner';
    return true;
  });

  const handleJoinGroup = (spotId) => {
    const spot = studySpots.find(s => s.id === spotId);
    if (spot && spot.type === 'study_group') {
      toast.success(`Joined "${spot.name}"! 🎉`, {
        duration: 4000,
        style: {
          background: '#10b981',
          color: 'white',
        },
      });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading study locations...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
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
                🚀 Demo Mode
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
              <Button variant="default" onClick={() => navigate('/map')} className="flex items-center gap-2 text-sm">
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
                  variant="default" 
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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="whitepace-text-hero text-neutral-900 mb-2">
              Study Map
            </h1>
            <p className="text-neutral-600">Find study groups, spots, and partners near you</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              className={filter === 'all' ? 'bg-brand-blue-600' : ''}
            >
              All ({studySpots.length})
            </Button>
            <Button
              variant={filter === 'groups' ? 'default' : 'outline'}
              onClick={() => setFilter('groups')}
              size="sm"
              className={filter === 'groups' ? 'bg-indigo-600' : ''}
            >
              Groups ({studySpots.filter(s => s.type === 'study_group').length})
            </Button>
            <Button
              variant={filter === 'spots' ? 'default' : 'outline'}
              onClick={() => setFilter('spots')}
              size="sm"
              className={filter === 'spots' ? 'bg-brand-blue-600' : ''}
            >
              Spots ({studySpots.filter(s => s.type === 'study_spot').length})
            </Button>
            <Button
              variant={filter === 'partners' ? 'default' : 'outline'}
              onClick={() => setFilter('partners')}
              size="sm"
              className={filter === 'partners' ? 'bg-brand-blue-600' : ''}
            >
              Partners ({studySpots.filter(s => s.type === 'study_partner').length})
            </Button>
          </div>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand-blue-600 rounded-full"></div>
                <span className="text-sm">Study Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand-blue-500 rounded-full"></div>
                <span className="text-sm">Study Spots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand-yellow-500 rounded-full"></div>
                <span className="text-sm">Study Partners</span>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="overflow-hidden shadow-xl">
          <div className="h-96 bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-brand-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Interactive Map</h3>
              <p className="text-neutral-600 mb-4">Google Maps integration available with API key</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Study Groups</span>
                  </div>
                  <p className="text-xs text-neutral-600">12 active groups nearby</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-brand-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Study Spots</span>
                  </div>
                  <p className="text-xs text-neutral-600">8 popular locations</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-brand-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Study Partners</span>
                  </div>
                  <p className="text-xs text-neutral-600">25 online now</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Libraries</span>
                  </div>
                  <p className="text-xs text-neutral-600">5 open locations</p>
                </div>
              </div>
              <Button 
                onClick={() => toast.success('Demo mode - Interactive map requires Google Maps API key', {
                  duration: 3000,
                  style: {
                    background: '#3b82f6',
                    color: 'white',
                  },
                })}
                className="mt-4"
                variant="outline"
              >
                Enable Interactive Map
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Study Groups</CardTitle>
              <Users className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-blue-600">
                {studySpots.filter(s => s.type === 'study_group').length}
              </div>
              <p className="text-xs text-neutral-600">Available to join</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Locations</CardTitle>
              <MapPin className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-blue-600">
                {studySpots.filter(s => s.type === 'study_spot').length}
              </div>
              <p className="text-xs text-neutral-600">On campus</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Partners</CardTitle>
              <Star className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-yellow-600">
                {studySpots.filter(s => s.type === 'study_partner').length}
              </div>
              <p className="text-xs text-neutral-600">Looking to study</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Locations List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            {filter === 'all' && 'All Study Locations'}
            {filter === 'groups' && 'Study Groups'}
            {filter === 'spots' && 'Study Spots'}
            {filter === 'partners' && 'Study Partners'}
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot) => (
              <Card key={spot.id} className="whitepace-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {spot.type === 'study_group' && (
                        <div className="w-3 h-3 bg-brand-blue-600 rounded-full"></div>
                      )}
                      {spot.type === 'study_spot' && (
                        <div className="w-3 h-3 bg-brand-blue-500 rounded-full"></div>
                      )}
                      {spot.type === 'study_partner' && (
                        <div className="w-3 h-3 bg-brand-yellow-500 rounded-full"></div>
                      )}
                      <div>
                        <h3 className="font-semibold text-neutral-900">{spot.name}</h3>
                        <p className="text-sm text-neutral-600">{spot.location}</p>
                      </div>
                    </div>
                    {spot.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-brand-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{spot.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-neutral-600 mb-4">{spot.description}</p>

                  {spot.type === 'study_group' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Course:</span>
                        <Badge className="bg-brand-blue-100 text-brand-blue-700 border-brand-blue-200">
                          {spot.course}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Members:</span>
                        <span className="font-medium">{spot.members}/{spot.maxMembers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Time:</span>
                        <span className="font-medium">{spot.time}</span>
                      </div>
                      <Button 
                        onClick={() => handleJoinGroup(spot.id)}
                        className="whitepace-button-primary w-full"
                        size="sm"
                      >
                        Join Group
                      </Button>
                    </div>
                  )}

                  {spot.type === 'study_spot' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Hours:</span>
                        <span className="font-medium">{spot.hours}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Occupancy:</span>
                        <Badge variant="outline" className={`
                          ${spot.occupancy === 'Low' ? 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200' : ''}
                          ${spot.occupancy === 'Medium' ? 'bg-brand-yellow-50 text-brand-yellow-700 border-brand-yellow-200' : ''}
                          ${spot.occupancy === 'High' ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : ''}
                        `}>
                          {spot.occupancy}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-neutral-600">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {spot.amenities?.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-neutral-50 text-neutral-600 border-neutral-200">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={() => toast.success(`Added ${spot.name} to favorites!`)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Add to Favorites
                      </Button>
                    </div>
                  )}

                  {spot.type === 'study_partner' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Course:</span>
                        <Badge className="bg-brand-blue-100 text-brand-blue-700 border-brand-blue-200">
                          {spot.course}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Year:</span>
                        <span className="font-medium">{spot.year}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Study Style:</span>
                        <span className="font-medium">{spot.studyStyle}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Compatibility:</span>
                        <Badge className="bg-brand-blue-100 text-brand-blue-700 border-brand-blue-200">
                          {spot.compatibilityScore}%
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => {
                          toast.success(`Connected with ${spot.name}!`);
                          navigate('/chat');
                        }}
                        className="whitepace-button-primary w-full"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;