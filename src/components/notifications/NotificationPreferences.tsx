import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { Loader2, Mail, Calendar, CreditCard, AlertTriangle, Heart, Megaphone } from 'lucide-react';

export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, isUpdatingPreferences } = useNotifications();

  if (!preferences) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const preferenceGroups = [
    {
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      items: [
        {
          key: 'email_notifications' as const,
          label: 'All Email Notifications',
          description: 'Master switch for all email notifications',
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Booking & Sessions',
      description: 'Notifications about your coaching sessions and webinars',
      items: [
        {
          key: 'booking_reminders' as const,
          label: 'Booking Reminders',
          description: 'Reminders for upcoming 1:1 sessions',
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          key: 'webinar_reminders' as const,
          label: 'Webinar Reminders',
          description: 'Reminders for webinars and recordings',
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Financial',
      description: 'Payment and credit-related notifications',
      items: [
        {
          key: 'payment_notifications' as const,
          label: 'Payment Notifications',
          description: 'Receipts, failures, and invoices',
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          key: 'credit_alerts' as const,
          label: 'Credit Alerts',
          description: 'Low credit balance warnings',
          icon: <AlertTriangle className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Wellness',
      description: 'Your financial wellbeing journey',
      items: [
        {
          key: 'mood_check_nudges' as const,
          label: 'Mood Check Nudges',
          description: 'Gentle reminders to check in on your financial wellness',
          icon: <Heart className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Marketing',
      description: 'Optional promotional content',
      items: [
        {
          key: 'marketing_emails' as const,
          label: 'Marketing Emails',
          description: 'Product updates, tips, and promotional content',
          icon: <Megaphone className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Notification Preferences</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 mt-4">
        {preferenceGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div>
              <h3 className="font-medium text-sm">{group.title}</h3>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
            
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {item.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={item.key} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {item.label}
                      </Label>
                      <Switch
                        id={item.key}
                        checked={preferences[item.key]}
                        onCheckedChange={(checked) => handleToggle(item.key, checked)}
                        disabled={isUpdatingPreferences}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {group !== preferenceGroups[preferenceGroups.length - 1] && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Some notifications may still be sent for security and account management purposes.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};