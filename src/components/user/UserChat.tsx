import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useUserPurchases } from '@/hooks/useUserPurchases';
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
  Calendar,
  Star,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface CoachProfile {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  rating: number;
  specialties: string[];
  experience: string;
}

interface PurchasedCourse {
  id: string;
  programId: string;
  title: string;
  category: 'short-program' | '1-1-sessions';
  coach: CoachProfile;
  purchaseDate: string;
  progress?: number;
  description: string;
}

export const UserChat: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { isPurchased } = useUserPurchases();
  const { chats, loading: chatsLoading, createDirectChat } = useChats();
  const { assignments } = useAssignments();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PurchasedCourse | null>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage } = useChatMessages(activeChat?.id || '');

  // Static programs with assigned coaches
  const staticPrograms = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Financial Fitness Bootcamp (Flagship)',
      description: '7-day program covering budgeting, saving, investing, and debt control.',
      category: 'short-program' as const,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Investment Mastery Series',
      description: '14-day deep dive into equity, mutual funds, and alternative assets.',
      category: 'short-program' as const,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Smart Tax Planning',
      description: '1:1 session for tax optimization strategies tailored to your situation',
      category: 'short-program' as const,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Financial Blueprint Session',
      description: 'Personalized financial roadmap with expert coach - one-on-one session',
      category: '1-1-sessions' as const,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Debt-Free Journey',
      description: 'Personal debt elimination strategy session with actionable plan',
      category: '1-1-sessions' as const,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Investing in 3 Hours',
      description: 'Complete beginner guide to smart investing - learn fundamentals, risk management, and portfolio building',
      category: '1-1-sessions' as const,
    }
  ];

  // Coach profiles
  const coachProfiles: { [key: string]: CoachProfile } = {
    'coach_sarah': {
      id: 'coach_sarah',
      name: 'Sarah Johnson',
      bio: 'Certified Financial Planner with 8+ years experience in debt management and financial planning.',
      rating: 4.9,
      specialties: ['Debt Management', 'Financial Planning', 'Budgeting'],
      experience: '8+ years'
    },
    'coach_michael': {
      id: 'coach_michael',
      name: 'Michael Chen',
      bio: 'Investment specialist focusing on equity markets, mutual funds, and portfolio optimization.',
      rating: 4.8,
      specialties: ['Equity Investing', 'Portfolio Management', 'Risk Assessment'],
      experience: '12+ years'
    },
    'coach_emma': {
      id: 'coach_emma',
      name: 'Emma Davis',
      bio: 'Tax planning expert and financial advisor specializing in comprehensive financial blueprints.',
      rating: 4.9,
      specialties: ['Tax Planning', 'Financial Strategy', 'Retirement Planning'],
      experience: '10+ years'
    },
    'coach_raj': {
      id: 'coach_raj',
      name: 'Raj Patel',
      bio: 'Financial wellness coach with expertise in behavioral finance and debt elimination.',
      rating: 4.7,
      specialties: ['Behavioral Finance', 'Debt Elimination', 'Financial Psychology'],
      experience: '6+ years'
    }
  };

  // Map programs to coaches
  const programCoachMapping: { [key: string]: string } = {
    '550e8400-e29b-41d4-a716-446655440000': 'coach_sarah', // Financial Fitness Bootcamp
    '550e8400-e29b-41d4-a716-446655440001': 'coach_michael', // Investment Mastery Series
    '550e8400-e29b-41d4-a716-446655440002': 'coach_emma', // Smart Tax Planning
    '550e8400-e29b-41d4-a716-446655440003': 'coach_emma', // Financial Blueprint Session
    '550e8400-e29b-41d4-a716-446655440004': 'coach_raj', // Debt-Free Journey
    '550e8400-e29b-41d4-a716-446655440005': 'coach_michael', // Investing in 3 Hours
  };

  // Get purchased courses
  const purchasedCourses: PurchasedCourse[] = staticPrograms
    .filter(program => isPurchased('program', program.id))
    .map(program => {
      const coachId = programCoachMapping[program.id];
      const coach = coachProfiles[coachId];
      
      return {
        id: program.id,
        programId: program.id,
        title: program.title,
        category: program.category,
        description: program.description,
        coach,
        purchaseDate: new Date().toISOString(),
        progress: Math.floor(Math.random() * 100) // Mock progress
      };
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedCourse && userProfile) {
      findOrCreateCoachChat();
    }
  }, [selectedCourse, userProfile]);

  const findOrCreateCoachChat = async () => {
    if (!selectedCourse || !userProfile) return;

    const mockChat = {
      id: `chat_${userProfile.id}_${selectedCourse.coach.id}_${selectedCourse.programId}`,
      name: `${selectedCourse.title} - ${selectedCourse.coach.name}`,
      chat_type: 'coaching',
      created_by: userProfile.id,
      participants: [
        {
          user_id: userProfile.id,
          user: { name: userProfile.name, email: userProfile.email }
        },
        {
          user_id: selectedCourse.coach.id,
          user: { name: selectedCourse.coach.name, email: `${selectedCourse.coach.id}@coaches.finsage.com` }
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
      
      // Simulate coach response
      setTimeout(() => {
        const coachResponses = [
          `Great question! As your coach for ${selectedCourse?.title}, I'm here to help you succeed. Let me provide some guidance on this topic.`,
          `Thank you for reaching out! I can see you're making progress in ${selectedCourse?.title}. Here's my take on your question.`,
          `I appreciate you asking! This is exactly the kind of discussion that will help you get the most out of ${selectedCourse?.title}.`,
          `Excellent question! Based on my experience with students in ${selectedCourse?.title}, here's what I recommend.`,
        ];
        
        const randomResponse = coachResponses[Math.floor(Math.random() * coachResponses.length)];
        sendMessage(randomResponse);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const renderCourseCard = (course: PurchasedCourse) => (
    <Card 
      key={course.id} 
      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
      onClick={() => setSelectedCourse(course)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {course.coach.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate pr-2">{course.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">with {course.coach.name}</p>
              </div>
              <Badge variant={course.category === '1-1-sessions' ? 'default' : 'secondary'} className="text-xs shrink-0">
                {course.category === '1-1-sessions' ? '1:1 Session' : 'Program'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{course.coach.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{course.coach.experience}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {course.coach.specialties.slice(0, 2).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs px-2 py-0">
                  {specialty}
                </Badge>
              ))}
            </div>

            {course.progress !== undefined && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-full rounded-full transition-all" 
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span>{course.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (purchasedCourses.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-4">
            Purchase a program to get access to your dedicated coach and start chatting.
          </p>
          <Button onClick={() => window.location.href = '/individual-dashboard?tab=programs'}>
            Browse Programs
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Your Coaching Sessions</h2>
        </div>
        
        <div className="grid gap-4">
          {purchasedCourses.map(course => renderCourseCard(course))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCourse(null)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-12 w-12 border-2 border-background shadow-md">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {selectedCourse.coach.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedCourse.coach.name}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-normal">{selectedCourse.coach.rating}</span>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-2">{selectedCourse.coach.bio}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="truncate">{selectedCourse.title}</span>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {selectedCourse.category === '1-1-sessions' ? '1:1 Session' : 'Program'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCourse.coach.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
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
                  <p>Start your conversation with {selectedCourse.coach.name}!</p>
                  <p className="text-sm mt-2">Ask questions about {selectedCourse.title} or get personalized guidance.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === userProfile?.id;
                  const senderName = isOwn ? userProfile?.name?.split(' ')[0] : selectedCourse.coach.name.split(' ')[0];
                  
                  return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {isOwn 
                            ? userProfile?.name?.split(' ').map(n => n[0]).join('') || 'Y'
                            : selectedCourse.coach.name.split(' ').map(n => n[0]).join('')
                          }
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
              placeholder={`Message ${selectedCourse.coach.name}...`}
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