import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { PaymentButton } from '@/components/individual/PaymentButton';
import { ToolShortcuts } from '@/components/individual/ToolShortcuts';
import { SecureQuestionnaireForm } from '@/components/security/SecureQuestionnaireForm';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { IndividualSidebar } from './IndividualSidebar';
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
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'programs';

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

  const renderContent = () => {
    switch (currentTab) {
      case 'programs':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* My Learning Progress */}
            {myLearning.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {myLearning.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm md:text-base">{item.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Last watched: {item.lastWatched}
                          </p>
                          <div className="mt-2">
                            <Progress value={item.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.progress}% complete
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="self-start sm:self-center">
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Catalog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Programs
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
                    Coaching
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allContent.map((program) => (
                    <Card key={program.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {program.category}
                          </Badge>
                          {isPurchased(program.id) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm md:text-base mb-2">{program.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm md:text-base">
                            {formatPrice(program.price)}
                          </span>
                          {isPurchased(program.id) ? (
                            <Button size="sm" variant="outline">
                              Access
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'bookings':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No bookings found.</p>
            </CardContent>
          </Card>
        );
      case 'payments':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm md:text-base">{purchase.individual_programs.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatPrice(purchase.amount_paid)}</span>
                      <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'mood':
        return <MoodCheckIn />;
      case 'questionnaire':
        return <SecureQuestionnaireForm />;
      case 'privacy':
        return <ConsentManager />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <IndividualSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Sidebar Trigger */}
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-lg md:text-2xl font-bold">
                Welcome to Finsage, {userProfile?.name?.split(' ')[0]}!
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                Individual Learner
              </Badge>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};