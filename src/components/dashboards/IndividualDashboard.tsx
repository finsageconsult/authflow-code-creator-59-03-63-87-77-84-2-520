import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  GraduationCap,
  CreditCard,
  Star,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  Calendar,
  FileText
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  rating: number;
  students: number;
  category: 'course' | 'coaching';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const IndividualDashboard = () => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'courses' | 'coaching'>('all');

  const featuredCourses: Course[] = [
    {
      id: '1',
      title: 'Investing in 3 Hours',
      description: 'Complete beginner guide to smart investing',
      duration: '3 hours',
      price: 2999,
      rating: 4.8,
      students: 1234,
      category: 'course',
      level: 'Beginner'
    },
    {
      id: '2', 
      title: 'Salary → SIP Masterclass',
      description: 'Transform your salary into systematic investments',
      duration: '4 hours',
      price: 3999,
      rating: 4.9,
      students: 892,
      category: 'course',
      level: 'Intermediate'
    },
    {
      id: '3',
      title: 'Tax Panic to Peace',
      description: 'Master tax planning and reduce anxiety',
      duration: '2.5 hours',
      price: 2499,
      rating: 4.7,
      students: 567,
      category: 'course',
      level: 'Beginner'
    }
  ];

  const coachingServices: Course[] = [
    {
      id: '4',
      title: 'Financial Blueprint Session',
      description: 'Personalized financial roadmap with expert',
      duration: '90 min',
      price: 4999,
      rating: 4.9,
      students: 234,
      category: 'coaching',
      level: 'Beginner'
    },
    {
      id: '5',
      title: 'Smart Tax Planning',
      description: '1:1 session for tax optimization strategies',
      duration: '60 min',
      price: 3999,
      rating: 4.8,
      students: 156,
      category: 'coaching',
      level: 'Intermediate'
    },
    {
      id: '6',
      title: 'Debt-Free Journey',
      description: 'Personal debt elimination strategy session',
      duration: '75 min',
      price: 4499,
      rating: 4.9,
      students: 89,
      category: 'coaching',
      level: 'Beginner'
    }
  ];

  const myLearning = [
    {
      title: 'Investing in 3 Hours',
      progress: 75,
      lastWatched: '2 days ago',
      nextLesson: 'Portfolio Diversification'
    },
    {
      title: 'Tax Panic to Peace',
      progress: 100,
      lastWatched: '1 week ago',
      nextLesson: 'Completed! ✅'
    }
  ];

  const allContent = selectedCategory === 'all' ? 
    [...featuredCourses, ...coachingServices] :
    selectedCategory === 'courses' ? featuredCourses : coachingServices;

  const handlePurchase = (item: Course) => {
    // Integrate Razorpay here
    console.log('Purchasing:', item.title);
    // Would implement Razorpay checkout
  };

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
            {myLearning.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <div className="flex items-center gap-4 mb-2">
                    <Progress value={item.progress} className="flex-1 max-w-[200px]" />
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last watched: {item.lastWatched}
                  </p>
                </div>
                <div className="text-right">
                  <Button size="sm">
                    {item.progress === 100 ? 'Review' : 'Continue'}
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
              variant={selectedCategory === 'courses' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('courses')}
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
            {allContent.map((item) => (
              <Card key={item.id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.category === 'course' ? (
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      ) : (
                        <GraduationCap className="h-5 w-5 text-green-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.level}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.category === 'course' ? 'Course' : '1:1 Session'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {item.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {item.students.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{item.price.toLocaleString()}
                    </div>
                    <Button onClick={() => handlePurchase(item)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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