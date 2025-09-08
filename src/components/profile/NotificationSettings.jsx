import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationSettings({ user }) {
  const [settings, setSettings] = useState({
    push_notifications_enabled: true,
    email_notifications_enabled: true,
  });

  useEffect(() => {
    if (user) {
      setSettings({
        push_notifications_enabled: user.push_notifications_enabled ?? true,
        email_notifications_enabled: user.email_notifications_enabled ?? true,
      });
    }
  }, [user]);

  const handleToggle = async (key, value) => {
    // Optimistically update UI
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      await User.updateMyUserData({ [key]: value });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: !value }));
      // You could add a toast here to inform the user of the failure
    }
  };

  return (
    <div className="border-t pt-3 space-y-4">
      <div className="flex items-center justify-between p-2 rounded-lg">
        <div>
          <Label htmlFor="push-notifications" className="font-medium text-gray-700 text-sm">Push Notifications</Label>
          <p className="text-xs text-gray-500">For booking updates and alerts.</p>
        </div>
        <Switch
          id="push-notifications"
          checked={settings.push_notifications_enabled}
          onCheckedChange={(value) => handleToggle('push_notifications_enabled', value)}
        />
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg">
        <div>
          <Label htmlFor="email-notifications" className="font-medium text-gray-700 text-sm">Email Notifications</Label>
          <p className="text-xs text-gray-500">For summaries and receipts.</p>
        </div>
        <Switch
          id="email-notifications"
          checked={settings.email_notifications_enabled}
          onCheckedChange={(value) => handleToggle('email_notifications_enabled', value)}
        />
      </div>
    </div>
  );
}