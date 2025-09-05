import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Send, 
  MessageSquare, 
  User, 
  GraduationCap,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  sender_id: string;
  chat_id: string;
  content: string;
  message_type?: string;
  created_at: string;
  sender?: {
    name: string;
    email: string;
  };
}

interface ChatRoom {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at?: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  coach_id?: string;
  program_name?: string;
  coach?: {
    name: string;
  };
}

export const UserChat: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userProfile) {
      fetchEnrollment();
    }
  }, [userProfile]);

  const fetchEnrollment = async () => {
    if (!userProfile) return;

    try {
      // For now, create a mock enrollment since we need to implement proper enrollment tracking
      // This would typically come from the enrollment system
      const mockEnrollment = {
        id: '1',
        user_id: userProfile.id,
        coach_id: 'coach_123', // This would come from actual enrollment
        program_name: 'Financial Wellness Program',
        coach: {
          name: 'Coach Smith'
        }
      };
      
      setEnrollment(mockEnrollment);
      // fetchMessages would be called here when we have actual chat rooms
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (coachId: string) => {
    // This would fetch messages from the chat system when implemented
    // For now, we'll show empty state
    setMessages([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !enrollment || !userProfile) return;

    // This would send a message when the chat system is implemented
    toast({
      title: "Feature Coming Soon",
      description: "Chat functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Coach Assigned</h3>
          <p className="text-muted-foreground">
            You need to enroll in a program to start chatting with your coach.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {enrollment.coach?.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{enrollment.coach?.name || 'Coach'}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{enrollment.program_name || 'Program'}</span>
                </div>
                <Badge variant="secondary">
                  Individual learner
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 rounded-none border-b-0">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No messages yet. Start the conversation with your coach!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === userProfile?.id;
                  return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {isOwn ? 'Y' : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block max-w-[75%] p-3 rounded-lg ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="rounded-t-none">
        <CardContent className="p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${enrollment.coach?.name || 'coach'}...`}
              className="resize-none min-h-[40px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};