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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MoodCheckIn {
  mood: 'happy' | 'neutral' | 'sad' | null;
  stressLevel: number;
  confidenceLevel: number;
  topics: string[];
}

export const EmployeeDashboard = () => {
  const { userProfile, organization } = useAuth();
  const [checkIn, setCheckIn] = useState<MoodCheckIn>({
    mood: null,
    stressLevel: 5,
    confidenceLevel: 5,
    topics: []
  });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const moodOptions = [
    { id: 'happy', icon: Smile, label: 'Great!', color: 'text-green-600' },
    { id: 'neutral', icon: Meh, label: 'Okay', color: 'text-yellow-600' },
    { id: 'sad', icon: Frown, label: 'Stressed', color: 'text-red-600' }
  ];

  const topicOptions = [
    'Budgeting & Saving',
    'Investment Planning',
    'Retirement Planning',
    'Tax Planning',
    'Debt Management',
    'Emergency Fund',
    'Insurance Planning',
    'Career Growth'
  ];

  const recommendations = [
    {
      type: 'webinar',
      title: 'Smart Budgeting Workshop',
      description: 'Learn practical budgeting techniques',
      credits: 2,
      rating: 4.8,
      participants: 234,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      type: 'coaching',
      title: '1:1 Financial Health Check',
      description: 'Personal session with certified coach',
      credits: 5,
      rating: 4.9,
      participants: 89,
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      type: 'tool',
      title: 'Investment Calculator',
      description: 'Plan your investment strategy',
      credits: 1,
      rating: 4.7,
      participants: 456,
      icon: Wrench,
      color: 'text-purple-600'
    }
  ];

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

  const toggleTopic = (topic: string) => {
    setCheckIn(prev => ({
      ...prev,
      topics: prev.topics.includes(topic) 
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  if (!hasCheckedIn) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">How are you feeling today?</h1>
          <p className="text-muted-foreground">
            Let's check in with your financial mood and get personalized recommendations
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

            {/* Topics of Interest */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                What topics are you interested in? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {topicOptions.map((topic) => (
                  <Button
                    key={topic}
                    variant={checkIn.topics.includes(topic) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCheckIn} 
              className="w-full"
              disabled={!checkIn.mood}
            >
              Get My Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {userProfile?.name?.split(' ')[0]}!
        </h1>
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
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="credits">My Credits</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended For You
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on your mood check-in and interests
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
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>⭐ {rec.rating}</span>
                  <span>{rec.participants} participants</span>
                </div>
              </div>
              <Button>
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
              <p className="text-center text-muted-foreground py-4">
                No upcoming sessions
              </p>
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