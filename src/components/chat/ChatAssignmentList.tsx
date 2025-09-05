import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Chat } from '@/hooks/useChat';
import { Assignment } from '@/hooks/useAssignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatAssignmentListProps {
  chat: Chat;
  onAssignmentSelect?: (assignment: Assignment) => void;
}

const ChatAssignmentList: React.FC<ChatAssignmentListProps> = ({
  chat,
  onAssignmentSelect,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const fetchChatAssignments = async () => {
    if (!chat.participants || !userProfile) return;

    try {
      // Get user IDs from chat participants
      const participantIds = chat.participants.map(p => p.user_id);

      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .or(`created_by.in.(${participantIds.join(',')}),assigned_to.in.(${participantIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAssignments((data as Assignment[]) || []);
    } catch (error) {
      console.error('Error fetching chat assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatAssignments();

    // Set up real-time subscription
    const channel = supabase
      .channel('chat-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        () => {
          fetchChatAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.participants, userProfile]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Related Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Related Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No assignments found for this chat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Related Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <div key={assignment.id}>
                <div 
                  className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onAssignmentSelect?.(assignment)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(assignment.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(assignment.status)}`}
                    >
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(assignment.priority)}`}
                    >
                      {assignment.priority}
                    </Badge>
                  </div>

                  {assignment.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {assignment.created_by === userProfile?.id 
                          ? 'Created by you' 
                          : `Assigned to ${assignment.assignee?.name || 'Unknown'}`
                        }
                      </span>
                    </div>
                    
                    {assignment.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due {format(new Date(assignment.due_date), 'MMM dd')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < assignments.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatAssignmentList;