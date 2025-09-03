import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useIndividualPrograms } from '@/hooks/useIndividualPrograms';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { PaymentButton } from '@/components/individual/PaymentButton';
import { ToolShortcuts } from '@/components/individual/ToolShortcuts';
import { SecureQuestionnaireForm } from '@/components/security/SecureQuestionnaireForm';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="mood">Wellness Check</TabsTrigger>
          <TabsTrigger value="questionnaire">Assessment</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          {/* My Learning Progress */}
          {myLearning.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              {/* ... keep existing card content */}
            </Card>
          )}

          {/* Financial Tools */}
          <ToolShortcuts />

          {/* Learning Catalog */}
          {/* ... keep existing catalog content */}
        </TabsContent>

        <TabsContent value="mood">
          <MoodCheckIn />
        </TabsContent>

        <TabsContent value="questionnaire">
          <SecureQuestionnaireForm />
        </TabsContent>

        <TabsContent value="privacy">
          <ConsentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};