import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  metadata: any;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'success':
      return 'default';
    case 'warning':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, isMarkingRead } = useNotifications();

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  return (
    <div 
      className={`p-4 hover:bg-muted/50 transition-colors ${
        !notification.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium truncate ${
              !notification.is_read ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </h4>
            
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={handleMarkAsRead}
                disabled={isMarkingRead}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
            
            <Badge 
              variant={getTypeBadgeVariant(notification.type)}
              className="text-xs"
            >
              {notification.type}
            </Badge>
          </div>
          
          {/* Additional metadata display */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
              {notification.type === 'warning' && notification.metadata.currentCredits && (
                <span>Credits remaining: {notification.metadata.currentCredits}</span>
              )}
              {notification.metadata.daysSinceLastCheckIn && (
                <span>Last check-in: {notification.metadata.daysSinceLastCheckIn} days ago</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};