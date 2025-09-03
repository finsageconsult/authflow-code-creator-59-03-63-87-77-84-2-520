import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  GraduationCap,
  Clock,
  CheckCircle,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const { userProfile, organization } = useAuth();

  const stats = [
    {
      title: 'Active Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Courses Completed',
      value: '456',
      change: '+18%',
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Upcoming Webinars',
      value: '8',
      change: '+2',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Learning Hours',
      value: '2,345',
      change: '+25%',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    {
      title: 'Financial Planning Basics',
      type: 'Course',
      status: 'completed',
      time: '2 hours ago',
      icon: BookOpen
    },
    {
      title: 'Investment Strategies Webinar',
      type: 'Webinar',
      status: 'scheduled',
      time: 'Tomorrow at 3 PM',
      icon: Calendar
    },
    {
      title: 'Personal Budget Tool',
      type: 'Tool',
      status: 'in-progress',
      time: '1 day ago',
      icon: Target
    },
    {
      title: 'Coaching Session with Sarah',
      type: 'Coaching',
      status: 'completed',
      time: '3 days ago',
      icon: GraduationCap
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Welcome back, {userProfile?.name?.split(' ')[0]}!
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {organization?.name || 'Personal Dashboard'}
          </p>
          {userProfile?.role && (
            <Badge variant="secondary" className="capitalize">
              {userProfile.role.toLowerCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="p-2 rounded-full bg-muted">
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(activity.status)}
                  >
                    {activity.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Browse Catalog</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore courses and learning materials
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Schedule Coaching</h4>
                  <p className="text-sm text-muted-foreground">
                    Book a session with a financial coach
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Join Webinar</h4>
                  <p className="text-sm text-muted-foreground">
                    Attend live learning sessions
                  </p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Use Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    Access financial planning tools
                  </p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}