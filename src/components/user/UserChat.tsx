import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useChats, useChatMessages } from '@/hooks/useChat';
import { useAssignments } from '@/hooks/useAssignments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  Send, 
  MessageSquare, 
  User, 
  GraduationCap,
  Clock,
  FileText,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface CoachAssignment {
  coachId: string;
  coachName: string;
  programId: string;
  programName: string;
}

interface AssignmentCard {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  created_at: string;
}

export const UserChat: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { chats, loading: chatsLoading, createDirectChat } = useChats();
  const { assignments } = useAssignments();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [coachAssignment, setCoachAssignment] = useState<CoachAssignment | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage } = useChatMessages(activeChat?.id || '');

  // Static coach assignments based on purchased programs
  const staticCoachAssignments = {
    'f47ac10b-58cc-4372-a567-0e02b2c3d479': { // Debt-Free Journey
      coachId: 'coach_001',
      coachName: 'Sarah Johnson',
      programName: 'Debt-Free Journey'
    },
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8': { // Investing in 3 Hours  
      coachId: 'coach_002',
      coachName: 'Michael Chen',
      programName: 'Investing in 3 Hours'
    },
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8': { // Financial Blueprint Session
      coachId: 'coach_003', 
      coachName: 'Emma Davis',
      programName: 'Financial Blueprint Session'
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userProfile) {
      fetchUserEnrollments();
    }
  }, [userProfile]);

  useEffect(() => {
    if (coachAssignment && userProfile) {
      findOrCreateCoachChat();
    }
  }, [coachAssignment, userProfile]);

  const fetchUserEnrollments = async () => {
    if (!userProfile) return;

    try {
      // Get user's purchases to determine coach assignments
      const { data: purchases, error } = await supabase
        .from('individual_purchases')
        .select('program_id, status')
        .eq('user_id', userProfile.id)
        .eq('status', 'completed');

      if (error) throw error;

      // Find the first completed purchase and assign coach
      const completedPurchase = purchases?.[0];
      if (completedPurchase && staticCoachAssignments[completedPurchase.program_id as keyof typeof staticCoachAssignments]) {
        const assignment = staticCoachAssignments[completedPurchase.program_id as keyof typeof staticCoachAssignments];
        setCoachAssignment({
          coachId: assignment.coachId,
          coachName: assignment.coachName,
          programId: completedPurchase.program_id,
          programName: assignment.programName
        });
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const findOrCreateCoachChat = async () => {
    if (!coachAssignment || !userProfile) return;

    // For now, create a mock chat since we don't have actual coach users in the system
    const mockChat = {
      id: `chat_${userProfile.id}_${coachAssignment.coachId}`,
      name: `Chat with ${coachAssignment.coachName}`,
      chat_type: 'direct',
      created_by: userProfile.id,
      participants: [
        {
          user_id: userProfile.id,
          user: { name: userProfile.name, email: userProfile.email }
        },
        {
          user_id: coachAssignment.coachId,
          user: { name: coachAssignment.coachName, email: `${coachAssignment.coachId}@coaches.com` }
        }
      ]
    };
    
    setActiveChat(mockChat);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeChat) return;

    setSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      
      // Simulate coach response after 2 seconds
      setTimeout(() => {
        const coachResponses = [
          "Thank you for reaching out! I've reviewed your question and will provide some guidance.",
          "That's a great question about your financial journey. Let me share some insights.",
          "I'm here to support you through your learning. Here are my thoughts on that topic.",
          "Excellent progress! Keep up the good work. Let me know if you need any clarification.",
        ];
        
        const randomResponse = coachResponses[Math.floor(Math.random() * coachResponses.length)];
        sendMessage(randomResponse);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!coachAssignment) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Coach Assigned</h3>
          <p className="text-muted-foreground">
            Purchase a program to get assigned a coach and start chatting.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderAssignmentCard = (assignment: AssignmentCard) => (
    <Card key={assignment.id} className="mb-3 bg-blue-50 border-blue-200">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm">{assignment.title}</h4>
            </div>
            {assignment.description && (
              <p className="text-xs text-muted-foreground mb-2">{assignment.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(assignment.created_at), 'MMM dd')}</span>
              </div>
              {assignment.due_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Due {format(new Date(assignment.due_date), 'MMM dd')}</span>
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant={assignment.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {assignment.status === 'completed' ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            {assignment.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {coachAssignment.coachName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{coachAssignment.coachName}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{userProfile?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{coachAssignment.programName}</span>
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
              {/* Show assignments as inline cards at the top */}
              {assignments
                .filter(assignment => assignment.assigned_to === userProfile?.id)
                .slice(0, 2)
                .map(assignment => renderAssignmentCard(assignment))}
              
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Start the conversation with {coachAssignment.coachName}!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === userProfile?.id;
                  const senderName = isOwn ? userProfile?.name?.split(' ')[0] : coachAssignment.coachName.split(' ')[0];
                  
                  return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {senderName?.charAt(0) || (isOwn ? 'Y' : 'C')}
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
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${coachAssignment.coachName}...`}
              className="resize-none min-h-[40px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
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