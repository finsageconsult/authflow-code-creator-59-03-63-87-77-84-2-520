import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { EnrollmentWorkflow } from '@/components/enrollment/EnrollmentWorkflow';
import { BookOpen, Clock, Users, Star, Lock, GraduationCap, TrendingUp, Target, ChevronRight, DollarSign, Heart, Shield, Calculator, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  rating: number;
  students: number;
  thumbnail_url?: string;
  is_active: boolean;
  tags: string[];
}
interface UserPurchase {
  program_id: string;
  status: string;
  progress: number;
}
const categoryDetails = {
  'course': {
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Courses'
  },
  'webinar': {
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Webinars'
  },
  'coaching': {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Coaching'
  },
  'finance': {
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Finance Planning'
  },
  'tax': {
    icon: Calculator,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Tax Planning'
  },
  'investment': {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    label: 'Investments'
  },
  'insurance': {
    icon: Shield,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    label: 'Insurance'
  },
  'wellness': {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    label: 'Financial Wellness'
  }
};
export const EmployeePrograms = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState<Set<string>>(new Set());
  const [coachingSessions, setCoachingSessions] = useState<any[]>([]);
  useEffect(() => {
    if (userProfile) {
      fetchData();
    }
  }, [userProfile]);
  const fetchData = async () => {
    try {
      // Fetch all active programs
      const {
        data: programsData,
        error: programsError
      } = await supabase.from('individual_programs').select('*').eq('is_active', true).order('created_at', {
        ascending: false
      });
      if (programsError) throw programsError;
      setPrograms(programsData || []);

      // Fetch user purchases to check access
      if (userProfile) {
        const {
          data: purchasesData
        } = await supabase.from('individual_purchases').select('program_id, status, progress').eq('user_id', userProfile.id);
        setPurchases(purchasesData || []);

        // Fetch enrollments to track enrolled programs using the internal user ID
        const {
          data: enrollmentsData
        } = await supabase.from('enrollments').select('course_id').eq('user_id', userProfile.id);
        
        if (enrollmentsData) {
          const enrolled = new Set(enrollmentsData.map(e => e.course_id));
          setEnrolledPrograms(enrolled);
        }

        // Fetch coaching sessions for meeting links
        const { data: sessionsData } = await supabase
          .from('coaching_sessions')
          .select('*')
          .eq('client_id', userProfile.id)
          .order('updated_at', { ascending: false });
        
        setCoachingSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };
  const groupedPrograms = programs.reduce((acc, program) => {
    const category = program.category || 'course';
    if (!acc[category]) acc[category] = [];
    acc[category].push(program);
    return acc;
  }, {} as Record<string, Program[]>);
  const isPurchased = (programId: string) => {
    return purchases.some(p => p.program_id === programId && p.status === 'completed');
  };
  const getProgress = (programId: string) => {
    const purchase = purchases.find(p => p.program_id === programId);
    return purchase?.progress || 0;
  };

  const getMeetingLink = (programId: string) => {
    // Find coaching session specifically for this program by matching program title
    const currentProgram = programs.find(p => p.id === programId);
    if (!currentProgram) return null;
    
    const session = coachingSessions
      .filter(s => s.meeting_link && s.session_type === currentProgram.title)
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0];
    return session?.meeting_link || null;
  };

  const isLinkActive = (meetingLink: string) => {
    // For now, return true if there's a meeting link. You can add time-based logic later if needed
    return !!meetingLink;
  };
  const handleProgramClick = (program: Program) => {
    if (isPurchased(program.id)) {
      navigate(`/program/${program.id}`);
    } else {
      toast.info('Please purchase this program to access');
      navigate(`/programs/${program.id}`);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>;
  }

  // Filter programs for short programs category or show all active programs
  const availablePrograms = programs.filter(program => program.is_active);
  return <div className="space-y-6">
      {/* Free Courses & Tools Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-100">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Free Learning Resources</h2>
            <p className="text-muted-foreground">
              All courses and tools are FREE as part of your organization package
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 ml-auto">
            ✓ Included in Organization Plan
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/50">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">All Courses</h3>
              <p className="text-sm text-muted-foreground">Complete access to learning materials</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50">
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Financial Tools</h3>
              <p className="text-sm text-muted-foreground">Unlimited access to all tools</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold">Resources</h3>
              <p className="text-sm text-muted-foreground">Templates, guides & calculators</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium Short Programs Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Premium Short Programs</h2>
            <p className="text-muted-foreground">
              Intensive programs with personalized coaching and certification
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            Free Programs - One-time Enrollment
          </Badge>
        </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap pb-4 px-0 my-[29px]">
        <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')}>
          All Programs
        </Button>
        {Object.entries(categoryDetails).map(([key, details]) => {
          const CategoryIcon = details.icon;
          const count = groupedPrograms[key]?.length || 0;
          if (count === 0) return null;
          return <Button key={key} variant={selectedCategory === key ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(key)} className="gap-2">
              <CategoryIcon className="h-4 w-4" />
              {details.label} ({count})
            </Button>;
        })}
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePrograms.map(program => {
          // Check if user has already enrolled in this program
          const isEnrolled = enrolledPrograms.has(program.id);
          return <Card key={program.id} className="group hover:shadow-lg transition-all bg-white/70">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {program.title}
                    </CardTitle>
                    {isEnrolled ? <Badge className="bg-green-100 text-green-700">
                        ✓ Enrolled
                      </Badge> : <Badge className="bg-blue-100 text-blue-700">
                        FREE
                      </Badge>}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {program.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {program.duration}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {program.level}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold text-green-600">
                        ✓ FREE with Organization Plan
                      </div>
                      <div className="text-xs text-muted-foreground">
                        One-time enrollment per employee
                      </div>
                    </div>
                    
                    {isEnrolled ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="secondary"
                          onClick={() => {
                            toast.success(`Opening ${program.title}...`);
                            // Navigate to program content
                          }}
                        >
                          ✓ Enrolled - Continue Learning
                        </Button>
                        
                        {(() => {
                          const meetingLink = getMeetingLink(program.id);
                          if (meetingLink && isLinkActive(meetingLink)) {
                            return (
                              <Button 
                                className="w-full" 
                                variant="default"
                                onClick={() => window.open(meetingLink, '_blank')}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Session
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          console.log('Enroll button clicked for program:', program.id);
                          const courseData = {
                            id: program.id,
                            title: program.title,
                            description: program.description,
                            duration: program.duration,
                            price: 0, // Free for employees
                            category: program.category,
                            tags: program.tags || ['financial-planning', 'budgeting', 'investing'] // Use program tags or defaults
                          };
                          console.log('Setting course data:', courseData);
                          setSelectedCourse(courseData);
                          console.log('Setting showEnrollment to true');
                          setShowEnrollment(true);
                        }}
                      >
                        Enroll Now - FREE
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>

      {programs.length === 0 && <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No Programs Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Programs will be available soon. Check back later for new learning opportunities.
            </p>
          </div>
        </Card>}
      
      {/* Enrollment Workflow Modal */}
      {showEnrollment && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full min-h-[80vh] max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Course Enrollment</h2>
                <button 
                  onClick={() => {
                    setShowEnrollment(false);
                    setSelectedCourse(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <EnrollmentWorkflow
                initialCourse={selectedCourse}
                userType="employee"
                onBack={() => {
                  console.log('Enrollment workflow - Back clicked');
                  setShowEnrollment(false);
                  setSelectedCourse(null);
                }}
                onComplete={() => {
                  console.log('Enrollment workflow - Complete clicked');
                  setShowEnrollment(false);
                  setSelectedCourse(null);
                  fetchData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>;
};