import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MessageToast({ message, onDismiss }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000); // Auto-dismiss after 7 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getSenderName = (senderId) => {
    if (senderId === 'system_notifications') return 'ChargePeer';
    if (senderId === 'support_team') return 'Support Team';
    return 'New Message';
  };

  const getSenderAvatar = (senderId) => {
    if (senderId === 'system_notifications') return 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=250&h=250&auto=format&fit=crop';
    if (senderId === 'support_team') return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&h=250&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&h=250&auto=format&fit=crop';
  };

  const handleToastClick = () => {
    navigate(createPageUrl('Messages'));
    onDismiss();
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-5 right-5 z-[99999] w-full max-w-sm"
          onClick={handleToastClick}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 cursor-pointer border">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src={getSenderAvatar(message.sender_id)} />
                <AvatarFallback className="bg-blue-100"><MessageSquare className="text-blue-600" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{getSenderName(message.sender_id)}</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{message.subject}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{message.content}</p>
              </div>
              <Button variant="ghost" size="icon" className="w-7 h-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onDismiss(); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}