import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function MessageDetailView({ message, onBack }) {
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

  return (
    <div className="bg-white rounded-xl shadow-lg border">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg truncate">{message.subject}</h2>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Sender Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={getSenderAvatar(message.sender_id)} />
            <AvatarFallback>{getSenderName(message.sender_id).charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{getSenderName(message.sender_id)}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {format(new Date(message.created_date), 'MMM d, yyyy, hh:mm a')}
            </p>
          </div>
        </div>

        {/* Message Content */}
        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}