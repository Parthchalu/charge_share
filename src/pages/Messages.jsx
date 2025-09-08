
import React, { useState, useEffect } from 'react';
import { Message, User } from '@/api/entities';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import MessageDetailView from '../components/messages/MessageDetailView'; // Import the new component

const formatShortTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const seconds = differenceInSeconds(now, date);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;

  const days = differenceInDays(now, date);
  return `${days}d ago`;
};

function MessageCard({ message, onMessageClick }) {
  const getSenderName = (senderId) => {
    if (senderId === 'system_notifications') return 'ChargePeer';
    if (senderId === 'support_team') return 'Support Team';
    if (senderId.includes('host')) return 'Host User';
    if (senderId.includes('driver')) return 'Driver User';
    return 'User';
  };

  const getSenderAvatar = (senderId) => {
    if (senderId === 'system_notifications') return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=250&h=250&auto=format&fit=crop';
    if (senderId === 'support_team') return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&h=250&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&h=250&auto=format&fit=crop';
  };

  const getMessageTypeColor = (type) => {
    switch(type) {
      case 'booking_inquiry': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${!message.is_read ? 'border-blue-200 bg-blue-50/30' : ''}`}
      onClick={() => onMessageClick(message)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={getSenderAvatar(message.sender_id)} alt={getSenderName(message.sender_id)} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {getSenderName(message.sender_id).charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900 truncate">
                  {getSenderName(message.sender_id)}
                </h3>
                <Badge className={getMessageTypeColor(message.message_type)} variant="outline">
                  {message.message_type.replace('_', ' ')}
                </Badge>
                {!message.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              {/* Timestamp removed */}
            </div>
            
            <h4 className={`text-sm mb-2 truncate ${!message.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
              {message.subject}
            </h4>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {message.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const messagesData = await Message.list('-created_date', 20);
      const userMessages = messagesData.filter(msg => 
        msg.sender_id === user.id || msg.receiver_id === user.id || msg.receiver_id === 'all_users'
      );
      setMessages(userMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message) => {
    if (!message.is_read) {
      try {
        await Message.update(message.id, { is_read: true });
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id ? { ...msg, is_read: true } : msg
          )
        );
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (selectedMessage) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <MessageDetailView message={selectedMessage} onBack={handleBackToList} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-500">
                {messages.filter(m => !m.is_read).length} unread messages
              </p>
            </div>
          </div>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} onMessageClick={handleMessageClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-500">
              Your conversations with hosts and support will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
