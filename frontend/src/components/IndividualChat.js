import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Phone, Video, Info, Smile } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import toast from 'react-hot-toast';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const IndividualChat = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    checkAuthAndLoadData();
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        await loadChatData(user.id);
        await connectWebSocket(user);
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

  const loadChatData = async (userId) => {
    try {
      // Load match details
      const matchResponse = await fetch(`http://localhost:8081/api/matching/match/${matchId}`, {
        credentials: 'include'
      });
      
      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        setMatch(matchData);
        
        // Set chat partner (the other user in the match)
        const partner = matchData.user1.id === userId ? matchData.user2 : matchData.user1;
        setChatPartner(partner);
      }

      // Load messages
      const messagesResponse = await fetch(`http://localhost:8081/api/chat/${matchId}/messages`, {
        credentials: 'include'
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load chat data');
    }
    setLoading(false);
  };

  const connectWebSocket = async (user) => {
    try {
      const socket = new SockJS('http://localhost:8081/ws');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, (frame) => {
        console.log('Connected to WebSocket:', frame);
        setConnected(true);
        
        // Subscribe to chat messages for this match
        stompClient.subscribe(`/topic/chat/${matchId}`, (messageOutput) => {
          const newMessage = JSON.parse(messageOutput.body);
          if (newMessage.type === 'CHAT' || !newMessage.type) {
            setMessages(prev => [...prev, newMessage]);
          }
        });

        // Join the chat room
        stompClient.send(`/app/chat/${matchId}/addUser`, {}, JSON.stringify({
          userId: user.id.toString(),
          userName: user.firstName + ' ' + user.lastName
        }));
      }, (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      });

      stompClientRef.current = stompClient;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      // Send via REST API for persistence
      const response = await fetch(`http://localhost:8081/api/chat/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          senderId: currentUser.id.toString(),
          message: message.trim()
        }),
      });

      if (response.ok) {
        // Also send via WebSocket for real-time updates
        if (stompClientRef.current && connected) {
          stompClientRef.current.send(`/app/chat/${matchId}/sendMessage`, {}, JSON.stringify({
            senderId: currentUser.id.toString(),
            message: message.trim()
          }));
        }
        setMessage('');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Network error sending message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPlaceholderAvatar = (name, size = 40) => {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=${size}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!match || !chatPartner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Found</h2>
          <p className="text-gray-600 mb-6">This chat conversation doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/chat')} className="bg-indigo-600 hover:bg-indigo-700">
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={chatPartner.profilePictureUrl || getPlaceholderAvatar(chatPartner.firstName + ' ' + chatPartner.lastName)} />
              <AvatarFallback>
                {(chatPartner.firstName?.[0] || '') + (chatPartner.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {chatPartner.firstName} {chatPartner.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {chatPartner.major} • {connected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const isOwnMessage = msg.sender?.id === currentUser?.id || msg.senderId === currentUser?.id;
              const senderName = msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : msg.senderName;
              
              return (
                <div key={msg.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the Conversation</h3>
                <p className="text-gray-500">Send a message to {chatPartner.firstName} to get started!</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${chatPartner.firstName}...`}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!connected}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || !connected}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!connected && (
            <p className="text-sm text-red-500 mt-2">Connecting to chat...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualChat;