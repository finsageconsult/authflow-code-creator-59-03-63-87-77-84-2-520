import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  CreditCard,
  Menu
} from 'lucide-react';

export const IndividualDashboard = () => {
  const { userProfile } = useAuth();
  const { programs, purchases, loading, formatPrice, isPurchased, getPurchaseByProgram, getFilteredPrograms, refetch } = useIndividualPrograms();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'course' | 'coaching'>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-5 w-5" />
                  Learning Catalog
                </CardTitle>
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
                    variant={selectedCategory === 'course' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('course')}
                    className="text-xs sm:text-sm h-9 px-3 sm:px-4"
                  >
                    Courses
                  </Button>
                  <Button 
                    variant={selectedCategory === 'coaching' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('coaching')}
                    className="text-xs sm:text-sm h-9 px-3 sm:px-4"
                  >
                    Coaching
                  </Button>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {allContent.map((program) => (
                    <Card key={program.id} className="relative hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4 h-full flex flex-col">
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
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {program.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {formatPrice(program.price)}
                          </span>
                          {isPurchased(program.id) ? (
                            <Button size="sm" variant="outline" className="shrink-0 text-xs sm:text-sm h-8 px-3 w-full sm:w-auto">
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-5 w-5" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-muted-foreground text-sm sm:text-base">No bookings found.</p>
            </CardContent>
          </Card>
        );
      case 'payments':
        return (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{purchase.individual_programs.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                      <span className="font-semibold text-sm sm:text-base">{formatPrice(purchase.amount_paid)}</span>
                      <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'} className="text-xs w-fit">
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
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full min-h-screen">
        {/* Mobile Header with Hamburger Menu */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-background border-b lg:hidden">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold truncate">
                Welcome, {userProfile?.name?.split(' ')[0]}!
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs hidden sm:inline-flex">
                Individual Learner  
              </Badge>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <IndividualSidebar />

        {/* Main Content */}
        <main className="flex-1 pt-14 lg:pt-0 p-4 lg:p-6 min-w-0 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};