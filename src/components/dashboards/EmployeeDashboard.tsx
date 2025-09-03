import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { 
  Smile, 
  Frown, 
  Meh,
  TrendingUp,
  Calendar,
  BookOpen,
  GraduationCap,
  Wrench,
  CreditCard,
  Heart,
  Target
} from 'lucide-react';
import { CreditWallet } from '@/components/credits/CreditWallet';
import { EmployeeAnalyticsDashboard } from '@/components/analytics/EmployeeAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MoodCheckIn {
  mood: 'excited' | 'optimistic' | 'neutral' | 'worried' | 'stressed' | null;
  stressLevel: number;
  confidenceLevel: number;
  concerns: string[];
  urgencyLevel: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const EmployeeDashboard = () => {
  const { userProfile, organization } = useAuth();
  const [checkIn, setCheckIn] = useState<MoodCheckIn>({
    mood: null,
    stressLevel: 5,
    confidenceLevel: 5,
    concerns: [],
    urgencyLevel: 3,
    experienceLevel: 'beginner'
  });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const moodOptions = [
    { id: 'excited', icon: Smile, label: '😄 Excited!', color: 'text-green-600' },
    { id: 'optimistic', icon: Smile, label: '😊 Optimistic', color: 'text-green-500' },
    { id: 'neutral', icon: Meh, label: '😐 Neutral', color: 'text-yellow-600' },
    { id: 'worried', icon: Frown, label: '😟 Worried', color: 'text-orange-600' },
    { id: 'stressed', icon: Frown, label: '😰 Stressed', color: 'text-red-600' }
  ];

  const concernOptions = [
    'Salary Structure & Negotiation',
    'Tax Planning & Savings',
    'Investment & Wealth Building',
    'Debt Management',
    'Family Financial Planning',
    'Emergency Fund Planning',
    'Insurance Planning',
    'Retirement Planning'
  ];

  // Intelligent recommendation logic based on check-in data
  const getPersonalizedRecommendations = () => {
    const recs = [];
    
    // High stress + low confidence → Financial Fitness Bootcamp + Personal Financial Blueprint
    if (checkIn.stressLevel >= 7 && checkIn.confidenceLevel <= 4) {
      recs.push({
        type: 'webinar',
        title: 'Financial Fitness Bootcamp',
        description: 'Complete financial wellness program for stressed beginners',
        credits: 3,
        rating: 4.9,
        participants: 156,
        icon: GraduationCap,
        color: 'text-green-600',
        reason: 'Because you\'re feeling stressed and want to build confidence'
      });
      recs.push({
        type: 'coaching',
        title: 'Personal Financial Blueprint (1:1)',
        description: 'One-on-one session to create your personalized plan',
        credits: 5,
        rating: 4.8,
        participants: 89,
        icon: Target,
        color: 'text-blue-600',
        reason: 'Because you need personalized guidance to reduce stress'
      });
    }

    // Tax concerns → Tax webinar + tools
    if (checkIn.concerns.includes('Tax Planning & Savings')) {
      recs.push({
        type: 'webinar',
        title: 'How to Save Tax Webinar',
        description: 'Learn smart tax planning strategies',
        credits: 2,
        rating: 4.7,
        participants: 234,
        icon: Calendar,
        color: 'text-purple-600',
        reason: 'Because you selected tax planning as a concern'
      });
      recs.push({
        type: 'tool',
        title: 'Tax Optimizer Tool',
        description: 'Calculate your tax savings potential',
        credits: 1,
        rating: 4.6,
        participants: 456,
        icon: Wrench,
        color: 'text-green-600',
        reason: 'Because you want to optimize your tax strategy'
      });
    }

    // Salary concerns → Salary webinar + Blueprint
    if (checkIn.concerns.includes('Salary Structure & Negotiation')) {
      recs.push({
        type: 'webinar',
        title: 'Smart Salary Structuring',
        description: 'Maximize your take-home through smart structuring',
        credits: 2,
        rating: 4.8,
        participants: 178,
        icon: TrendingUp,
        color: 'text-blue-600',
        reason: 'Because you want to optimize your salary structure'
      });
      recs.push({
        type: 'coaching',
        title: 'Blueprint Session: Salary Negotiation',
        description: 'Personalized salary negotiation strategy',
        credits: 4,
        rating: 4.9,
        participants: 67,
        icon: GraduationCap,
        color: 'text-green-600',
        reason: 'Because you need personalized negotiation strategies'
      });
    }

    // High debt → Debt management programs
    if (checkIn.concerns.includes('Debt Management')) {
      recs.push({
        type: 'webinar',
        title: 'Debt-Free Fast Track',
        description: 'Proven strategies to eliminate debt quickly',
        credits: 3,
        rating: 4.8,
        participants: 203,
        icon: TrendingUp,
        color: 'text-red-600',
        reason: 'Because you want to tackle your debt effectively'
      });
      recs.push({
        type: 'coaching',
        title: 'Financial Fitness Bootcamp',
        description: 'Complete debt management and budgeting program',
        credits: 6,
        rating: 4.9,
        participants: 134,
        icon: Heart,
        color: 'text-green-600',
        reason: 'Because you need comprehensive debt solutions'
      });
    }

    // Investment concerns → Investment planning
    if (checkIn.concerns.includes('Investment & Wealth Building')) {
      recs.push({
        type: 'webinar',
        title: 'Investment Planning Masterclass',
        description: 'Build wealth through smart investing',
        credits: 3,
        rating: 4.7,
        participants: 289,
        icon: TrendingUp,
        color: 'text-green-600',
        reason: 'Because you want to grow your wealth through investments'
      });
      recs.push({
        type: 'tool',
        title: 'Investment Calculator Pro',
        description: 'Plan and track your investment portfolio',
        credits: 1,
        rating: 4.5,
        participants: 567,
        icon: Wrench,
        color: 'text-purple-600',
        reason: 'Because you need tools to plan your investments'
      });
    }

    // Default recommendations for general financial wellness
    if (recs.length === 0) {
      recs.push({
        type: 'webinar',
        title: 'Financial Wellness 101',
        description: 'Start your financial journey with confidence',
        credits: 2,
        rating: 4.6,
        participants: 345,
        icon: Heart,
        color: 'text-blue-600',
        reason: 'Because everyone needs a strong financial foundation'
      });
    }

    return recs.slice(0, 3); // Return top 3 recommendations
  };

  const recommendations = hasCheckedIn ? getPersonalizedRecommendations() : [];

  const upcomingBookings = [
    {
      title: 'Retirement Planning 101',
      type: 'Webinar',
      date: 'Today, 3:00 PM',
      status: 'confirmed'
    },
    {
      title: 'Portfolio Review Session',
      type: '1:1 Coaching',
      date: 'Tomorrow, 10:00 AM',
      status: 'confirmed'
    }
  ];

  const handleCheckIn = () => {
    // Save check-in data (would normally go to database)
    setHasCheckedIn(true);
  };

  const toggleConcern = (concern: string) => {
    setCheckIn(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern) 
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  if (!hasCheckedIn) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold" role="heading" aria-level={1}>How are you feeling today?</h1>
          <p className="text-muted-foreground">
            Take a moment to check in with yourself - we're here to support your financial journey, wherever you are
          </p>
          <p className="text-sm text-primary/80 font-medium italic">
            Financial wellness is workplace wellness.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Money Mood Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                How do you feel about your finances today?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {moodOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={checkIn.mood === option.id ? "default" : "outline"}
                    className="h-24 flex-col gap-2"
                    onClick={() => setCheckIn(prev => ({ ...prev, mood: option.id as any }))}
                  >
                    <option.icon className={`h-8 w-8 ${option.color}`} />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Stress Level: {checkIn.stressLevel}/10
              </label>
              <Slider
                value={[checkIn.stressLevel]}
                onValueChange={(value) => setCheckIn(prev => ({ ...prev, stressLevel: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Very Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>

            {/* Confidence Level */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Financial Confidence: {checkIn.confidenceLevel}/10
              </label>
              <Slider
                value={[checkIn.confidenceLevel]}
                onValueChange={(value) => setCheckIn(prev => ({ ...prev, confidenceLevel: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not Confident</span>
                <span>Very Confident</span>
              </div>
            </div>

            {/* Top Concerns */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                What are your main financial concerns? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {concernOptions.map((concern) => (
                  <Button
                    key={concern}
                    variant={checkIn.concerns.includes(concern) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleConcern(concern)}
                  >
                    {concern}
                  </Button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                How urgent are your financial needs? {checkIn.urgencyLevel}/5
              </label>
              <Slider
                value={[checkIn.urgencyLevel]}
                onValueChange={(value) => setCheckIn(prev => ({ ...prev, urgencyLevel: value[0] }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Can Wait</span>
                <span>Very Urgent</span>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                How would you describe your financial knowledge?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <Button
                    key={level}
                    variant={checkIn.experienceLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCheckIn(prev => ({ ...prev, experienceLevel: level as any }))}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCheckIn} 
              className="w-full"
              disabled={!checkIn.mood}
              aria-label="Complete check-in to receive personalized recommendations"
            >
              Get My Personalized Recommendations
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              We're here to support you - there are no wrong answers ❤️
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
            Welcome back, {userProfile?.name?.split(' ')[0]}! 🌟
          </h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHasCheckedIn(false)}
            className="text-xs"
            aria-label="Retake mood check-in to update recommendations"
          >
            Retake Check-in
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {organization?.name} Employee
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Employee Dashboard
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList role="tablist" aria-label="Employee dashboard navigation">
          <TabsTrigger value="dashboard" role="tab" aria-controls="dashboard-panel">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics" role="tab" aria-controls="analytics-panel">My Progress</TabsTrigger>
          <TabsTrigger value="credits" role="tab" aria-controls="credits-panel">My Credits</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6" role="tabpanel" id="dashboard-panel" aria-labelledby="dashboard-tab">

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Thoughtfully Recommended For You
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your check-in, here are some gentle next steps to support your financial journey
            </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className={`p-3 rounded-full bg-muted`}>
                <rec.icon className={`h-5 w-5 ${rec.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {rec.credits} credits
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                <p className="text-xs text-blue-600 font-medium mb-2" role="note" aria-label="Personalized recommendation reason">
                  {rec.reason}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>⭐ {rec.rating}</span>
                  <span>{rec.participants} participants</span>
                </div>
              </div>
              <Button 
                aria-label={`${rec.type === 'tool' ? 'Use' : 'Book'} ${rec.title} - ${rec.description}`}
              >
                {rec.type === 'tool' ? 'Use Tool' : 'Book Now'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Bookings and Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{booking.title}</h4>
                  <p className="text-sm text-muted-foreground">{booking.type}</p>
                  <p className="text-sm text-muted-foreground">{booking.date}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Confirmed
                </Badge>
              </div>
            ))}
            {upcomingBookings.length === 0 && (
              <div className="text-center py-6 space-y-2">
                <p className="text-muted-foreground">No upcoming sessions yet</p>
                <p className="text-xs text-primary/70 italic">
                  Ready to take the next step? Book a session when you feel comfortable.
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Browse Available Sessions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Financial Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <h4 className="font-medium">Budget Tracker</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your monthly spending
                  </p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <h4 className="font-medium">Investment Simulator</h4>
                  <p className="text-sm text-muted-foreground">
                    See how your investments grow
                  </p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <h4 className="font-medium">Debt Calculator</h4>
                  <p className="text-sm text-muted-foreground">
                    Plan your debt payoff strategy
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="credits" className="space-y-6">
        <CreditWallet />
      </TabsContent>
      </Tabs>
    </div>
  );
};