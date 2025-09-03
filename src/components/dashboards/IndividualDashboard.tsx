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
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* My Learning Progress */}
            {myLearning.length > 0 && (
              <Card>
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <div className="grid gap-3 sm:gap-4">
                    {myLearning.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm md:text-base truncate">{item.title}</h3>
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
                        <Button size="sm" className="self-start sm:self-center shrink-0">
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
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Learning Catalog
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                  >
                    All Programs
                  </Button>
                  <Button 
                    variant={selectedCategory === 'course' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('course')}
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                  >
                    Courses
                  </Button>
                  <Button 
                    variant={selectedCategory === 'coaching' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('coaching')}
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                  >
                    Coaching
                  </Button>
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {allContent.map((program) => (
                    <Card key={program.id} className="relative hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-3 sm:p-4 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {program.category}
                          </Badge>
                          {isPurchased(program.id) && (
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2 flex-shrink-0">
                          {program.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {program.description}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-auto">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {formatPrice(program.price)}
                          </span>
                          {isPurchased(program.id) ? (
                            <Button size="sm" variant="outline" className="shrink-0 text-xs sm:text-sm">
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
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <p className="text-muted-foreground text-sm sm:text-base">No bookings found.</p>
            </CardContent>
          </Card>
        );
      case 'payments':
        return (
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm md:text-base truncate">{purchase.individual_programs.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-sm sm:text-base">{formatPrice(purchase.amount_paid)}</span>
                      <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
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
      <div className="min-h-screen w-full relative">
        {/* Sidebar */}
        <IndividualSidebar />

        {/* Main Content */}
        <main className="transition-all duration-200 ease-in-out lg:pl-64 min-h-screen">
          {/* Header with Sidebar Trigger */}
          <header className="sticky top-0 z-40 h-14 lg:h-16 flex items-center justify-between border-b px-4 lg:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3 min-w-0 w-full">
              <SidebarTrigger className="lg:hidden shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                <h1 className="text-base lg:text-xl xl:text-2xl font-bold truncate">
                  Welcome, {userProfile?.name?.split(' ')[0]}!
                </h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs shrink-0 w-fit">
                  Individual Learner
                </Badge>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="max-w-6xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};