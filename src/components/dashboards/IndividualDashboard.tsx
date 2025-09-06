import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { useUserPurchases } from '@/hooks/useUserPurchases';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { ToolShortcuts } from '@/components/individual/ToolShortcuts';
import { SecureQuestionnaireForm } from '@/components/security/SecureQuestionnaireForm';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { EnrollmentWorkflow } from '@/components/enrollment/EnrollmentWorkflow';
import { UserChat } from '@/components/user/UserChat';
import { UserAssignments } from '@/components/user/UserAssignments';
import { SupportQuery } from '@/components/support/SupportQuery';
import { IndividualSidebar } from './IndividualSidebar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  GraduationCap,
  Star,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  Calendar,
  FileText,
  Award,
  CreditCard,
  Menu,
  RefreshCw
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const IndividualDashboard = () => {
  const isMobile = useIsMobile();
  const { userProfile } = useAuth();
  const { programs, purchases, loading, formatPrice, getPurchaseByProgram, getFilteredPrograms, refetch } = useIndividualPrograms();
  const { isPurchased: isItemPurchased, refetch: refetchPurchases } = useUserPurchases();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'short-program' | '1-1-sessions'>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'programs';
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [processingPurchases, setProcessingPurchases] = useState<Set<string>>(new Set());
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Static programs for individual users (same as employee programs but with pricing)
  const staticIndividualPrograms = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Financial Fitness Bootcamp (Flagship)',
      description: '7-day program covering budgeting, saving, investing, and debt control.',
      price: 449900, // ₹4,499 in paisa
      duration: '7 days',
      level: 'Beginner to Advanced',
      category: 'short-program',
      tags: ['financial-planning', 'budgeting', 'investing']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Investment Mastery Series',
      description: '14-day deep dive into equity, mutual funds, and alternative assets.',
      price: 299900, // ₹2,999 in paisa
      duration: '14 days',
      level: 'Intermediate to Advanced',
      category: 'short-program',
      tags: ['investing', 'stocks', 'portfolio']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Smart Tax Planning',
      description: '1:1 session for tax optimization strategies tailored to your situation',
      price: 399900, // ₹3,999 in paisa
      duration: '3 days',
      level: 'Beginner to Intermediate',
      category: 'short-program',
      tags: ['tax', 'planning', 'optimization']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Financial Blueprint Session',
      description: 'Personalized financial roadmap with expert coach - one-on-one session',
      price: 499900, // ₹4,999 in paisa
      duration: '90 minutes',
      level: 'All Levels',
      category: '1-1-sessions',
      tags: ['1on1', 'financial', 'roadmap', 'personal']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Debt-Free Journey',
      description: 'Personal debt elimination strategy session with actionable plan',
      price: 449900, // ₹4,499 in paisa
      duration: '60 minutes',
      level: 'All Levels',
      category: '1-1-sessions',
      tags: ['1on1', 'debt', 'elimination', 'strategy']
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Investing in 3 Hours',
      description: 'Complete beginner guide to smart investing - learn fundamentals, risk management, and portfolio building',
      price: 299900, // ₹2,999 in paisa
      duration: '3 hours',
      level: 'Beginner',
      category: '1-1-sessions',
      tags: ['investing', 'beginner', 'portfolio']
    }
  ];

  // Get purchased programs for "My Learning" section - check both purchases and enrollments
  const myLearning = React.useMemo(() => {
    const purchasedPrograms = [];
    
    // Check database purchases
    const dbPurchases = purchases
      .filter(purchase => purchase.status === 'completed')
      .map(purchase => {
        let displayTitle = purchase.individual_programs?.title || 'Unknown Program';
        let displayCategory = purchase.individual_programs?.category || 'course';
        
        const staticProgram = staticIndividualPrograms.find(p => p.id === purchase.program_id);
        if (staticProgram) {
          displayTitle = staticProgram.title;
          displayCategory = staticProgram.category;
        }
        
        return {
          id: purchase.id,
          title: displayTitle,
          progress: purchase.progress || 0,
          lastWatched: purchase.last_accessed_at 
            ? `${Math.floor((Date.now() - new Date(purchase.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
            : 'Never',
          nextLesson: (purchase.progress || 0) === 100 ? 'Completed! ✅' : 'Continue learning',
          category: displayCategory,
          programId: purchase.program_id
        };
      });
    
    purchasedPrograms.push(...dbPurchases);
    
    // Check enrollments as well for purchased programs
    const enrollmentPrograms = enrollments
      .filter(enrollment => ['completed', 'active', 'enrolled', 'confirmed'].includes(enrollment.status))
      .map(enrollment => {
        const staticProgram = staticIndividualPrograms.find(p => p.id === enrollment.course_id);
        const displayTitle = staticProgram?.title || 'Unknown Program';
        
        return {
          id: enrollment.id,
          title: displayTitle,
          progress: enrollment.progress || 0,
          lastWatched: enrollment.last_accessed_at 
            ? `${Math.floor((Date.now() - new Date(enrollment.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
            : 'Never',
          nextLesson: (enrollment.progress || 0) === 100 ? 'Completed! ✅' : 'Continue learning',
          category: staticProgram?.category || 'course',
          programId: enrollment.course_id
        };
      });
    
    // Add enrollment programs that aren't already in purchases
    enrollmentPrograms.forEach(enrollmentProgram => {
      if (!purchasedPrograms.some(p => p.programId === enrollmentProgram.programId)) {
        purchasedPrograms.push(enrollmentProgram);
      }
    });
    
    // Check with isItemPurchased for additional purchased items
    staticIndividualPrograms.forEach(staticProgram => {
      if (isItemPurchased('program', staticProgram.id)) {
        const existing = purchasedPrograms.find(p => p.programId === staticProgram.id);
        if (!existing) {
          purchasedPrograms.push({
            id: `static-${staticProgram.id}`,
            title: staticProgram.title,
            progress: 0,
            lastWatched: 'Never',
            nextLesson: 'Start learning',
            category: staticProgram.category,
            programId: staticProgram.id
          });
        }
      }
    });
    
    return purchasedPrograms;
  }, [purchases, enrollments, isItemPurchased, staticIndividualPrograms]);

  const allContent = getFilteredPrograms(selectedCategory);

  // Combine database programs with static programs, prioritizing static ones
  const combinedPrograms = [...staticIndividualPrograms];
  
  const getFilteredCombinedPrograms = (category: 'all' | 'short-program' | '1-1-sessions') => {
    if (category === 'all') return combinedPrograms;
    return combinedPrograms.filter(program => program.category === category);
  };

  const allContentWithStatic = getFilteredCombinedPrograms(selectedCategory);

  // Fetch enrollments for bookings
  const fetchEnrollments = async () => {
    if (!userProfile) return;
    
    setLoadingEnrollments(true);
    try {
      const { data: enrolls, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch any coaching sessions for this user and merge meeting links
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('client_id', userProfile.id);

      const mapped = (enrolls || []).map((e) => {
        // Prefer most recent session with a link for the same coach; else any latest with a link
        const sameCoachLatest = (sessions || [])
          .filter((s) => (!e.coach_id || s.coach_id === e.coach_id) && s.meeting_link)
          .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0];
        const anyLatest = (sessions || [])
          .filter((s) => s.meeting_link)
          .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0];
        const match = sameCoachLatest || anyLatest || null;
        return { ...e, meeting_link: match?.meeting_link || null };
      });

      setEnrollments(mapped);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'programs':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* My Learning Progress */}
            {myLearning.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PlayCircle className="h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid gap-4">
                    {myLearning.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Last watched: {item.lastWatched}
                          </p>
                          <div className="mt-2">
                            <Progress value={item.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.progress}% complete
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="self-start sm:self-center shrink-0 w-full sm:w-auto">
                          {item.progress === 100 ? 'Review' : 'Continue'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Tools */}
            <ToolShortcuts />

            {/* Learning Catalog */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BookOpen className="h-5 w-5" />
                    Learning Catalog
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      refetch();
                      refetchPurchases();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs sm:text-sm h-9 px-3 sm:px-4"
                  >
                    All Programs
                  </Button>
                  <Button 
                    variant={selectedCategory === 'short-program' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('short-program')}
                    className="text-xs sm:text-sm h-9 px-3 sm:px-4"
                  >
                    Short Programs
                  </Button>
                  <Button 
                    variant={selectedCategory === '1-1-sessions' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('1-1-sessions')}
                    className="text-xs sm:text-sm h-9 px-3 sm:px-4"
                  >
                    1:1 Sessions
                  </Button>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  {allContentWithStatic.map((program) => (
                    <Card key={program.id} className="relative hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {program.category}
                          </Badge>
                          {isItemPurchased('program', program.id) && (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2 flex-shrink-0">
                          {program.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {program.description}
                        </p>
                        <div className="flex flex-col gap-2 mt-auto">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {formatPrice(program.price)}
                          </span>
                          <Button
                            onClick={() => {
                              if (isItemPurchased('program', program.id)) {
                                // Open the actual meeting link from your booking if available
                                const enrollment = enrollments.find((e) => e.course_id === program.id);
                                const meetingLink = enrollment?.meeting_link;
                                if (meetingLink) {
                                  window.open(meetingLink, '_blank', 'noopener,noreferrer');
                                } else {
                                  toast.error('Meeting link not available yet. Please check your Bookings.');
                                }
                              } else {
                                setSelectedCourse({
                                  id: program.id,
                                  title: program.title,
                                  description: program.description,
                                  duration: program.duration,
                                  price: program.price,
                                  category: program.category,
                                  tags: program.tags || []
                                });
                                setShowEnrollment(true);
                              }
                            }}
                            className="w-full"
                            size="sm"
                            disabled={processingPurchases.has(program.id)}
                          >
                            {processingPurchases.has(program.id)
                              ? 'Processing...'
                              : isItemPurchased('program', program.id) 
                                ? 'Join Session' 
                                : program.category === '1-1-sessions' 
                                  ? 'Book Session' 
                                  : 'Buy Now'
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'bookings':
        return (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-5 w-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : enrollments.length === 0 ? (
                <p className="text-muted-foreground text-sm sm:text-base">No bookings found.</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => {
                    // Map course_id to program title
                    const program = staticIndividualPrograms.find(p => p.id === enrollment.course_id);
                    const programTitle = program?.title || 'Unknown Program';
                    
                    return (
                      <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{programTitle}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Scheduled: {enrollment.scheduled_at ? new Date(enrollment.scheduled_at).toLocaleString() : 'TBD'}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                            <span className="font-semibold text-sm sm:text-base">{formatPrice(enrollment.amount_paid || 0)}</span>
                            <Badge variant={enrollment.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs w-fit">
                              {enrollment.status}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (enrollment.meeting_link) {
                                  window.open(enrollment.meeting_link, '_blank', 'noopener,noreferrer');
                                } else {
                                  toast.error('Meeting link not available yet.');
                                }
                              }}
                            >
                              Join Session
                            </Button>
                          </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'mood':
        return <MoodCheckIn />;
      case 'questionnaire':
        return <SecureQuestionnaireForm />;
        case 'support':
          return <SupportQuery />;
        case 'chat':
          return <UserChat />;
        case 'assignments':
          return <UserAssignments />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Single Sidebar instance for proper state management */}
        <IndividualSidebar />


        {/* Main Content using SidebarInset for proper responsive layout */}
        <SidebarInset className="flex-1">
          {/* Mobile Header with Hamburger Menu */}
          <header className="sticky top-0 z-40 h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 bg-background border-b md:hidden">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0">
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </SidebarTrigger>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold truncate">
                  Welcome, {userProfile?.name?.split(' ')[0]}!
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs hidden sm:inline-flex shrink-0">
                  Individual Learner  
                </Badge>
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:sticky md:top-0 md:z-40 md:h-14 md:flex md:items-center md:justify-between md:px-4 lg:px-6 md:bg-background md:border-b">
            <div className="flex items-center gap-2 lg:gap-3">
              <SidebarTrigger className="h-8 w-8 p-0 lg:hidden">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <h1 className="text-lg lg:text-xl font-semibold">
                Welcome, {userProfile?.name?.split(' ')[0]}!
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs lg:text-sm">
                Individual Learner  
              </Badge>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {showEnrollment ? (
                <EnrollmentWorkflow
                  initialCourse={selectedCourse}
                  userType="individual"
                  onBack={() => {
                    setShowEnrollment(false);
                    setSelectedCourse(null);
                  }}
                  onComplete={() => {
                    setShowEnrollment(false);
                    setSelectedCourse(null);
                    
                    // Mark this program as processing
                    if (selectedCourse) {
                      setProcessingPurchases(prev => new Set([...prev, selectedCourse.id]));
                    }
                    
                    // Add a longer delay to ensure webhook processing completes
                    setTimeout(() => {
                      refetch();
                      refetchPurchases();
                      // Clear processing state after refresh
                      if (selectedCourse) {
                        setProcessingPurchases(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(selectedCourse.id);
                          return newSet;
                        });
                      }
                    }, 3000); // Increased to 3 seconds for webhook processing
                  }}
                />
              ) : (
                renderContent()
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};