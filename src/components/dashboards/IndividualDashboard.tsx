import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { PaymentButton } from '@/components/individual/PaymentButton';
import { ToolShortcuts } from '@/components/individual/ToolShortcuts';
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
  CreditCard
} from 'lucide-react';

export const IndividualDashboard = () => {
  const { userProfile } = useAuth();
  const { programs, purchases, loading, formatPrice, isPurchased, getPurchaseByProgram, getFilteredPrograms, refetch } = useIndividualPrograms();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'course' | 'coaching'>('all');

  // Get purchased programs for "My Learning" section
  const myLearning = purchases
    .filter(purchase => purchase.status === 'completed')
    .map(purchase => ({
      id: purchase.id,
      title: purchase.individual_programs.title,
      progress: purchase.progress,
      lastWatched: purchase.last_accessed_at 
        ? `${Math.floor((Date.now() - new Date(purchase.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
        : 'Never',
      nextLesson: purchase.progress === 100 ? 'Completed! ✅' : 'Continue learning',
      category: purchase.individual_programs.category,
      programId: purchase.program_id
    }));

  const allContent = getFilteredPrograms(selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Welcome to Finsage, {userProfile?.name?.split(' ')[0]}!
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Your personal financial learning journey
          </p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Individual Learner
          </Badge>
        </div>
      </div>

      {/* My Learning Progress */}
      {myLearning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myLearning.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className={`p-3 rounded-full ${item.category === 'course' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {item.category === 'course' ? (
                    <BookOpen className={`h-5 w-5 ${item.category === 'course' ? 'text-blue-600' : 'text-green-600'}`} />
                  ) : (
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <Progress value={item.progress} className="flex-1 max-w-[200px]" />
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last accessed: {item.lastWatched}
                  </p>
                </div>
                <div className="text-right">
                  <Button size="sm">
                    {item.progress === 100 ? (
                      <>
                        <Award className="h-4 w-4 mr-1" />
                        Review
                      </>
                    ) : 'Continue'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.nextLesson}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Financial Tools */}
      <ToolShortcuts />

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Catalog</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Content
            </Button>
            <Button 
              variant={selectedCategory === 'course' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('course')}
            >
              Courses
            </Button>
            <Button 
              variant={selectedCategory === 'coaching' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('coaching')}
            >
              1:1 Coaching
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allContent.map((program) => {
              const purchased = isPurchased(program.id);
              const purchase = getPurchaseByProgram(program.id);
              
              return (
                <Card key={program.id} className={`h-full flex flex-col ${purchased ? 'border-green-200 bg-green-50/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {program.category === 'course' ? (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-green-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {program.level}
                        </Badge>
                        {purchased && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Owned
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {program.category === 'course' ? 'Course' : '1:1 Session'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {program.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {program.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {program.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {program.students.toLocaleString()}
                        </div>
                      </div>
                      {purchased && purchase && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{purchase.progress}%</span>
                          </div>
                          <Progress value={purchase.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(program.price)}
                      </div>
                      {purchased ? (
                        <Button variant="outline" className="pointer-events-none">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Purchased
                        </Button>
                      ) : (
                        <PaymentButton
                          programId={program.id}
                          title={program.title}
                          price={program.price}
                          category={program.category}
                          onSuccess={refetch}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Course completed</h4>
              <p className="text-sm text-muted-foreground">
                "Tax Panic to Peace" - Certificate earned
              </p>
            </div>
            <span className="text-xs text-muted-foreground">3 days ago</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-blue-100">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Purchase successful</h4>
              <p className="text-sm text-muted-foreground">
                "Investing in 3 Hours" course - ₹2,999
              </p>
            </div>
            <span className="text-xs text-muted-foreground">1 week ago</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-purple-100">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Session booked</h4>
              <p className="text-sm text-muted-foreground">
                "Financial Blueprint Session" scheduled for next week
              </p>
            </div>
            <span className="text-xs text-muted-foreground">2 weeks ago</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};