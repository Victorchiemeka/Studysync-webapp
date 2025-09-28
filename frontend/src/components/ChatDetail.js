import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Calendar, MapPin, Phone, Video, ArrowLeft, MoreVertical, Settings, Clock, Users, BookOpen, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import toast from 'react-hot-toast';
import SessionScheduler from './SessionScheduler';

const ChatDetail = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (matchId) {
      loadChatData();
      // Set up polling for new messages
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    try {
      // Get current user
      const userResponse = await fetch('http://localhost:8081/api/auth/user', {
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        toast.error('Please sign in to access chat');
        navigate('/login');
        return;
      }
      
      const user = await userResponse.json();
      setCurrentUser(user);

      // Get match details
      const matchResponse = await fetch(`http://localhost:8081/api/matching/match/${matchId}`, {
        credentials: 'include'
      });
      
      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        setMatch(matchData);
        
        // Determine the other user
        const other = matchData.user1.id === user.id ? matchData.user2 : matchData.user1;
        setOtherUser(other);
      }

      // Load messages
      await loadMessages();
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/chat/${matchId}/messages`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await fetch(`http://localhost:8081/api/chat/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId: currentUser.id,
          message: newMessage.trim(),
          messageType: 'TEXT'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Network error sending message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPlaceholderAvatar = (name, size = 40) => {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=${size}`;
  };

  const handleSessionCreated = (session) => {
    toast.success('Study session created! Both participants have been notified.');
    loadMessages(); // Reload to show the session message
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!match || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Not Found</h2>
          <p className="text-gray-600 mb-4">This conversation may not exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/chat')} className="bg-indigo-600 hover:bg-indigo-700">
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-indigo-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/chat')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser.profilePictureUrl || getPlaceholderAvatar(otherUser.firstName + ' ' + otherUser.lastName)} />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {(otherUser.firstName + ' ' + otherUser.lastName).split(' ').map(n => n[0]).join('').slice(0,2)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {otherUser.firstName} {otherUser.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  {otherUser.major} • {match.compatibilityScore}% match
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowScheduler(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
              
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility Info */}
      {match.sharedClasses && match.sharedClasses.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 py-3">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-green-800">
                  Shared classes: {match.sharedClasses.join(', ')}
                </span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {match.compatibilityScore}% Compatible
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
                  <div className="text-6xl mb-4">👋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start your conversation!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You matched with {otherUser.firstName}! Say hello and start planning your study sessions.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>💡 Try: "Hi! I saw we're both taking {match.sharedClasses?.[0]}. Want to study together?"</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender?.id === currentUser.id;
                const isSystemMessage = message.messageType === 'SYSTEM';
                
                if (isSystemMessage) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm max-w-md text-center">
                        {message.message}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isCurrentUser 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white/90 backdrop-blur-lg p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${otherUser.firstName}...`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={sending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Session Scheduler Modal */}
      {showScheduler && (
        <SessionScheduler
          currentUser={currentUser}
          otherUser={otherUser}
          matchId={matchId}
          onClose={() => setShowScheduler(false)}
          onSessionCreated={handleSessionCreated}
        />
      )}
    </div>
  );
};

export default ChatDetail;