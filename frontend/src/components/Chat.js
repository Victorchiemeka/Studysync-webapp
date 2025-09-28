import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Users, BookOpen, Home, Map, Calendar, LogOut } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import toast from 'react-hot-toast';

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        if (!user.profileCompleted) {
          navigate('/setup');
          return;
        }
        setCurrentUser(user);
        await loadUserChats(user.id);
      } else {
        toast.error('Please sign in to access chat');
        navigate('/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      toast.error('Authentication failed. Please sign in.');
      navigate('/login');
    }
  };

  const loadUserChats = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8081/api/matching/user/${userId}/matches`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const matches = await response.json();
        console.log('Loaded matches:', matches);
        
        // Transform matches to conversations format
        const chatConversations = await Promise.all(matches.map(async (match) => {
          const otherUser = match.user1.id === userId ? match.user2 : match.user1;
          
          // Get last message for this match
          try {
            const messagesResponse = await fetch(`http://localhost:8081/api/chat/${match.id}/messages`, {
              credentials: 'include'
            });
            
            let lastMessage = 'Start your conversation';
            let lastMessageTime = new Date();
            
            if (messagesResponse.ok) {
              const messages = await messagesResponse.json();
              if (messages && messages.length > 0) {
                const latest = messages[messages.length - 1];
                lastMessage = latest.message;
                lastMessageTime = new Date(latest.timestamp);
              }
            }
            
            return {
              id: match.id,
              matchId: match.id,
              user: {
                id: otherUser.id,
                name: `${otherUser.firstName} ${otherUser.lastName}`,
                avatar: otherUser.profilePictureUrl,
                major: otherUser.major,
                status: 'online'
              },
              lastMessage,
              lastMessageTime,
              unread: 0
            };
          } catch (error) {
            console.error('Error loading messages for match:', match.id, error);
            return {
              id: match.id,
              matchId: match.id,
              user: {
                id: otherUser.id,
                name: `${otherUser.firstName} ${otherUser.lastName}`,
                avatar: otherUser.profilePictureUrl,
                major: otherUser.major,
                status: 'online'
              },
              lastMessage: 'Start your conversation',
              lastMessageTime: new Date(),
              unread: 0
            };
          }
        }));
        
        setConversations(chatConversations);
      } else {
        console.error('Error loading matches:', response.status);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setConversations([]);
    }
    setLoading(false);
  };

  const getPlaceholderAvatar = (name, size = 40) => {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=${size}`;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleChatClick = (conversation) => {
    navigate(`/chat/${conversation.matchId}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8081/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-indigo-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <BookOpen className="h-8 w-8 text-brand-blue-500 mr-2" />
                <span className="text-2xl font-bold text-neutral-900">
                  StudySync
                </span>
              </div>

            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate('/groups')} className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Study Groups
              </Button>
              <Button variant="default" onClick={() => navigate('/chat')} className="flex items-center gap-2 text-sm">
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
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="whitepace-text-hero text-neutral-900 mb-2">
              {currentUser ? `${currentUser.firstName}'s Messages` : 'Messages'}
            </h1>
            <p className="text-neutral-600">
              {currentUser ? `Hey ${currentUser.firstName}, chat with your study partners` : 'Chat with your study partners'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-brand-blue-100 text-brand-blue-800 border-brand-blue-200">
            {conversations.length} conversations
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" 
                onClick={() => handleChatClick(conversation)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={conversation.user.avatar || getPlaceholderAvatar(conversation.user.name)} />
                      <AvatarFallback className="bg-indigo-500 text-white">
                        {conversation.user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.user.name}
                        </h3>
                        {conversation.unread > 0 && (
                          <Badge variant="default" className="bg-red-500 text-white">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{conversation.user.major}</p>
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchTerm ? (
            <div className="col-span-full">
              <Card className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </Card>
            </div>
          ) : (
            <div className="col-span-full">
              <Card className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Conversations Yet</h3>
                <p className="text-gray-500 mb-4">Start matching with study partners to begin chatting!</p>
                <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700">
                  Find Study Partners
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;