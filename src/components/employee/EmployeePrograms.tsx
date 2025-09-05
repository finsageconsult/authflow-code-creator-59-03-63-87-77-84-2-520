import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UnifiedPaymentButton } from '@/components/payments/UnifiedPaymentButton';
import { EnrollmentWorkflow } from '@/components/enrollment/EnrollmentWorkflow';
import { BookOpen, Clock, Users, Star, Lock, GraduationCap, TrendingUp, Target, ChevronRight, DollarSign, Heart, Shield, Calculator } from 'lucide-react';
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
  const [enrollmentWorkflowOpen, setEnrollmentWorkflowOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState<Set<string>>(new Set());
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

  // Static short programs for employees with proper UUID format
  const shortPrograms = [{
    id: '550e8400-e29b-41d4-a716-446655440000', // UUID for financial-fitness-bootcamp
    title: 'Financial Fitness Bootcamp (Flagship)',
    description: '7-day program covering budgeting, saving, investing, and debt control.',
    price: 700000,
    // ₹7,000 in paisa
    duration: '7 days',
    level: 'Beginner to Advanced',
    category: 'short-program'
  }, {
    id: '550e8400-e29b-41d4-a716-446655440001', // UUID for investment-mastery-series
    title: 'Investment Mastery Series',
    description: '14-day deep dive into equity, mutual funds, and alternative assets.',
    price: 1000000,
    // ₹10,000 in paisa
    duration: '14 days',
    level: 'Intermediate to Advanced',
    category: 'short-program'
  }, {
    id: '550e8400-e29b-41d4-a716-446655440002', // UUID for tax-compliance-essentials
    title: 'Tax & Compliance Essentials',
    description: '3-day crash course to optimize tax-saving while staying compliant.',
    price: 400000,
    // ₹4,000 in paisa
    duration: '3 days',
    level: 'Beginner to Intermediate',
    category: 'short-program'
  }];
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
          {shortPrograms.map(program => {
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
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedCourse({
                            id: program.id,
                            title: program.title,
                            description: program.description,
                            duration: program.duration,
                            price: 0, // Free for employees
                            category: program.category,
                            tags: ['financial-planning', 'budgeting', 'investing'] // Default tags for matching coaches
                          });
                          setEnrollmentWorkflowOpen(true);
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
      <EnrollmentWorkflow
        isOpen={enrollmentWorkflowOpen}
        onClose={() => {
          setEnrollmentWorkflowOpen(false);
          setSelectedCourse(null);
          // Refresh data after enrollment
          fetchData();
        }}
        initialCourse={selectedCourse}
        userType="employee"
      />
    </div>;
};