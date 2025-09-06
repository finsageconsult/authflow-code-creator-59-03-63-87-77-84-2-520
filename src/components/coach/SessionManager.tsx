import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, FileText, Tags, Video, Send, Paperclip, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CourseEnrollment {
  id: string;
  course: {
    id: string;
    title: string;
    category: string;
    duration: string;
  };
  enrollments: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    scheduledAt: string;
    status: string;
    paymentStatus: string;
    meetingLink?: string;
    linkGeneratedAt?: string;
    linkActiveAt?: string;
    linkExpiresAt?: string;
    isLinkActive?: boolean;
    notes?: string;
    outcomeTags: string[];
  }[];
}

const OUTCOME_TAGS = [
  'TAX_CLARITY',
  'DEBT_PLAN', 
  'SALARY_STRUCT',
  'EMERGENCY_FUND',
  'INVESTMENT_START',
  'BUDGET_CREATE',
  'CREDIT_IMPROVE',
  'RETIREMENT_PLAN',
  'INSURANCE_REVIEW',
  'EXPENSE_REDUCE',
  'INCOME_INCREASE',
  'FINANCIAL_GOAL_SET',
  'RISK_ASSESSMENT',
  'PORTFOLIO_REVIEW'
];

export const SessionManager = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  // Fetch courses and enrollments for current coach
  const fetchCourseEnrollments = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      
      // Use the same RPC function as the chat interface
      const { data: studentsData, error } = await supabase
        .rpc('get_students_for_current_coach');

      if (error) throw error;

      if (!studentsData || studentsData.length === 0) {
        setCourseEnrollments([]);
        return;
      }

      // Get coaching sessions for meeting links
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', userProfile.id);

      // Group enrollments by course
      const courseMap = new Map();
      
      studentsData.forEach((student: any) => {
        if (!student.enrollments || student.enrollments.length === 0) return;
        
        student.enrollments.forEach((enrollment: any) => {
          const courseTitle = enrollment.program_title;
          const courseCategory = enrollment.program_category || 'coaching';
          
          // Find matching coaching session
          const session = sessions?.find(s => 
            s.client_id === student.id && 
            enrollment.scheduled_at && new Date(s.scheduled_at).getTime() === new Date(enrollment.scheduled_at).getTime()
          );

          const enrollmentData = {
            id: enrollment.id,
            user: {
              id: student.id,
              name: student.name,
              email: student.email
            },
            scheduledAt: enrollment.scheduled_at,
            status: enrollment.status,
            paymentStatus: enrollment.payment_status,
            notes: '',
            outcomeTags: session?.outcome_tags || [],
            meetingLink: session?.meeting_link,
            linkGeneratedAt: session?.created_at,
            linkActiveAt: enrollment.scheduled_at ? new Date(new Date(enrollment.scheduled_at).getTime() - 30 * 60 * 1000).toISOString() : null,
            linkExpiresAt: enrollment.scheduled_at ? new Date(new Date(enrollment.scheduled_at).getTime() + 2 * 60 * 60 * 1000).toISOString() : null,
            isLinkActive: session?.meeting_link && enrollment.scheduled_at && checkLinkActive(enrollment.scheduled_at)
          };

          const courseKey = `${courseTitle}-${courseCategory}`;
          
          if (!courseMap.has(courseKey)) {
            courseMap.set(courseKey, {
              id: courseKey,
              course: {
                id: enrollment.id, // Use enrollment id as course id for this context
                title: courseTitle,
                category: courseCategory,
                duration: courseCategory === '1-1-sessions' ? '1 hour' : courseCategory === 'short-program' ? '2-4 weeks' : '60 minutes'
              },
              enrollments: []
            });
          }
          
          courseMap.get(courseKey).enrollments.push(enrollmentData);
        });
      });

      setCourseEnrollments(Array.from(courseMap.values()));
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load course enrollments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLinkActive = (scheduledAt: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const linkActiveTime = new Date(sessionTime.getTime() - 30 * 60 * 1000); // 30 minutes before
    const linkExpireTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after
    
    return now >= linkActiveTime && now <= linkExpireTime;
  };

  useEffect(() => {
    fetchCourseEnrollments();
  }, [userProfile]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleSaveSession = async () => {
    if (!selectedEnrollment) return;
    
    try {
      // Update enrollment notes
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({ notes: noteText })
        .eq('id', selectedEnrollment.id);

      if (enrollmentError) throw enrollmentError;

      // Update or create coaching session with outcome tags
      const { error: sessionError } = await supabase
        .from('coaching_sessions')
        .upsert({
          coach_id: userProfile?.id,
          client_id: selectedEnrollment.user.id,
          scheduled_at: selectedEnrollment.scheduledAt,
          session_type: selectedEnrollment.course?.title || 'Coaching Session',
          status: 'completed',
          notes: noteText,
          outcome_tags: selectedTags,
          organization_id: userProfile?.organization_id,
          duration_minutes: 60
        });

      if (sessionError) throw sessionError;

      toast({
        title: "Session Updated",
        description: "Session notes and outcome tags have been saved successfully.",
      });

      fetchCourseEnrollments(); // Refresh data
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session data",
        variant: "destructive"
      });
    }
  };

  const generateJoinLink = async (enrollment: any) => {
    if (!meetingLinkInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting link",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create or update coaching session with meeting link
      const { error } = await supabase
        .from('coaching_sessions')
        .upsert({
          coach_id: userProfile?.id,
          client_id: enrollment.user.id,
          scheduled_at: enrollment.scheduledAt,
          session_type: enrollment.course?.title || 'Coaching Session',
          meeting_link: meetingLinkInput,
          status: 'scheduled',
          organization_id: userProfile?.organization_id,
          duration_minutes: 60
        });

      if (error) throw error;

      toast({
        title: "Join Link Generated",
        description: "Meeting link has been set and will be active 30 minutes before the session",
      });

      setMeetingLinkInput('');
      fetchCourseEnrollments(); // Refresh data
    } catch (error) {
      console.error('Error generating join link:', error);
      toast({
        title: "Error",
        description: "Failed to generate join link",
        variant: "destructive"
      });
    }
  };

  const sendReminder = async (enrollment: any) => {
    try {
      // Call edge function to send session reminder
      const { error } = await supabase.functions.invoke('send-session-reminder', {
        body: {
          userEmail: enrollment.user.email,
          userName: enrollment.user.name,
          sessionDate: enrollment.scheduledAt,
          sessionType: enrollment.course?.title || 'Coaching Session',
          meetingLink: enrollment.meetingLink
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder Sent",
        description: `Session reminder sent to ${enrollment.user.name}`,
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading course enrollments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your courses, enrollments, and session links with auto-expire system
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {courseEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No course enrollments found</p>
            </div>
          ) : (
            courseEnrollments.map((courseEnrollment) => (
              <div key={courseEnrollment.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{courseEnrollment.course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {courseEnrollment.course.category} • {courseEnrollment.course.duration}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{courseEnrollment.enrollments.length} enrolled</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {courseEnrollment.enrollments.map((enrollment) => {
                    const { date, time } = formatDateTime(enrollment.scheduledAt);
                    const now = new Date();
                    const sessionTime = new Date(enrollment.scheduledAt);
                    const linkActiveTime = new Date(sessionTime.getTime() - 30 * 60 * 1000);
                    const linkExpireTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
                    const isLinkActive = enrollment.meetingLink && now >= linkActiveTime && now <= linkExpireTime;
                    const isLinkExpired = enrollment.meetingLink && now > linkExpireTime;

                    return (
                      <div key={enrollment.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-full bg-background">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <h4 className="font-medium">{enrollment.user.name}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={getStatusColor(enrollment.status)}>
                                  {enrollment.status}
                                </Badge>
                                <Badge variant="outline" className={getPaymentStatusColor(enrollment.paymentStatus)}>
                                  {enrollment.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{enrollment.user.email}</p>
                            <p className="text-sm text-muted-foreground">{date} • {time}</p>
                            
                            {enrollment.meetingLink && (
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground">
                                  Link active: {linkActiveTime.toLocaleString()} - {linkExpireTime.toLocaleString()}
                                </p>
                                <p className="text-xs font-medium">
                                  Status: {isLinkExpired ? '🔴 Expired' : isLinkActive ? '🟢 Active' : '🟡 Pending'}
                                </p>
                              </div>
                            )}
                            
                            {enrollment.outcomeTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {enrollment.outcomeTags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                          {enrollment.meetingLink && isLinkActive && (
                            <Button size="sm" variant="outline" className="flex-1 lg:flex-none" asChild>
                              <a href={enrollment.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-1" />
                                Join Session
                              </a>
                            </Button>
                          )}
                          
                          {!enrollment.meetingLink && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1 lg:flex-none">
                                  <Video className="w-4 h-4 mr-1" />
                                  Set Link
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Set Meeting Link - {enrollment.user.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="meetingLink">Meeting Link</Label>
                                    <Input
                                      id="meetingLink"
                                      placeholder="https://meet.google.com/... or https://zoom.us/..."
                                      value={meetingLinkInput}
                                      onChange={(e) => setMeetingLinkInput(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Link will be active 30 minutes before session and expire 2 hours after
                                    </p>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline">Cancel</Button>
                                    <Button onClick={() => generateJoinLink(enrollment)}>
                                      Set Link
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};