import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Lock,
  GraduationCap,
  TrendingUp,
  Target,
  ChevronRight,
  DollarSign,
  Heart,
  Shield,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [programs, setPrograms] = useState<Program[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all active programs
      const { data: programsData, error: programsError } = await supabase
        .from('individual_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      setPrograms(programsData || []);

      // Fetch user purchases to check access
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: purchasesData } = await supabase
          .from('individual_purchases')
          .select('program_id, status, progress')
          .eq('user_id', user.id);
        
        setPurchases(purchasesData || []);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Programs</h2>
          <p className="text-muted-foreground">
            Explore our comprehensive financial education programs
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {programs.length} Programs Available
        </Badge>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Programs
        </Button>
        {Object.entries(categoryDetails).map(([key, details]) => {
          const CategoryIcon = details.icon;
          const count = groupedPrograms[key]?.length || 0;
          if (count === 0) return null;
          
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="gap-2"
            >
              <CategoryIcon className="h-4 w-4" />
              {details.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Programs by Category */}
      {Object.entries(groupedPrograms).map(([category, categoryPrograms]) => {
        if (selectedCategory !== 'all' && selectedCategory !== category) return null;
        
        const details = categoryDetails[category as keyof typeof categoryDetails] || 
                       categoryDetails.course;
        const CategoryIcon = details.icon;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${details.bgColor}`}>
                <CategoryIcon className={`h-5 w-5 ${details.color}`} />
              </div>
              <h3 className="text-lg font-semibold">
                {details.label}
              </h3>
              <Badge variant="outline" className="ml-auto">
                {categoryPrograms.length} programs
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryPrograms.map((program) => {
                const purchased = isPurchased(program.id);
                const progress = getProgress(program.id);

                return (
                  <Card 
                    key={program.id} 
                    className="group hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleProgramClick(program)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">
                          {program.title}
                        </CardTitle>
                        {purchased ? (
                          <Badge className="bg-green-100 text-green-800">
                            Enrolled
                          </Badge>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {program.description}
                      </p>

                      {/* Progress Bar for Purchased Programs */}
                      {purchased && progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {program.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {program.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {program.students}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs">
                          {program.level}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant={purchased ? "default" : "outline"}
                          className="gap-1"
                        >
                          {purchased ? 'Continue' : 'View'}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {programs.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No Programs Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Programs will be available soon. Check back later for new learning opportunities.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};