import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Users, 
  Clock,
  MessageSquare,
  TrendingUp,
  FileText,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CoachStats {
  totalClients: number;
  upcomingSessions: number;
  completedSessions: number;
  avgRating: number;
}

export const CoachDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<CoachStats>({
    totalClients: 23,
    upcomingSessions: 8,
    completedSessions: 156,
    avgRating: 4.8
  });

  const upcomingSessions = [
    {
      id: 1,
      clientName: 'Sarah M.',
      time: 'Today, 2:00 PM',
      type: 'Investment Planning',
      duration: '60 min',
      status: 'confirmed'
    },
    {
      id: 2,
      clientName: 'John D.',
      time: 'Today, 4:00 PM', 
      type: 'Debt Management',
      duration: '45 min',
      status: 'confirmed'
    },
    {
      id: 3,
      clientName: 'Lisa K.',
      time: 'Tomorrow, 10:00 AM',
      type: 'Retirement Planning',
      duration: '60 min',
      status: 'pending'
    }
  ];

  const recentClients = [
    {
      id: 1,
      name: 'Emma Wilson',
      lastSession: '2 days ago',
      progress: 'Great progress on emergency fund',
      nextGoal: 'Start investment portfolio',
      riskProfile: 'Moderate'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      lastSession: '1 week ago',
      progress: 'Completed debt consolidation',
      nextGoal: 'Build credit score',
      riskProfile: 'Conservative'
    },
    {
      id: 3,
      name: 'Rachel Chen',
      lastSession: '3 days ago',
      progress: 'Opened retirement account',
      nextGoal: 'Increase contribution rate',
      riskProfile: 'Aggressive'
    }
  ];

  const coachStats = [
    {
      title: 'Active Clients',
      value: stats.totalClients.toString(),
      change: '+3 this month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions.toString(),
      change: '8 this week',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Sessions Completed',
      value: stats.completedSessions.toString(),
      change: '+12 this month',
      icon: CheckCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Average Rating',
      value: stats.avgRating.toString(),
      change: '94% satisfaction',
      icon: Star,
      color: 'text-orange-600'
    }
  ];

  const outcomes = [
    { tag: 'Emergency Fund Built', count: 23, color: 'bg-green-100 text-green-800' },
    { tag: 'Debt Reduced', count: 18, color: 'bg-blue-100 text-blue-800' },
    { tag: 'Investment Started', count: 15, color: 'bg-purple-100 text-purple-800' },
    { tag: 'Budget Created', count: 31, color: 'bg-yellow-100 text-yellow-800' },
    { tag: 'Credit Improved', count: 12, color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Coach Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Financial Coach - {userProfile?.name}
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Certified Coach
          </Badge>
        </div>
      </div>

      {/* Coach Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coachStats.map((stat, index) => (
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
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
            <Button size="sm" className="ml-auto">
              Manage Availability
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{session.clientName}</h4>
                    <Badge variant={session.status === 'confirmed' ? 'default' : 'outline'}>
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.type}</p>
                  <p className="text-sm text-muted-foreground">{session.time} • {session.duration}</p>
                </div>
                <Button size="sm" variant="outline">
                  Notes
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClients.map((client) => (
              <div key={client.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{client.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={
                      client.riskProfile === 'Conservative' ? 'bg-blue-100 text-blue-800' :
                      client.riskProfile === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {client.riskProfile}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Last session:</span> {client.lastSession}</p>
                  <p><span className="text-muted-foreground">Progress:</span> {client.progress}</p>
                  <p><span className="text-muted-foreground">Next goal:</span> {client.nextGoal}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    Session Notes
                  </Button>
                  <Button size="sm" variant="outline">
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Outcomes Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client Outcomes This Month
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Achievements that feed into the recommendation engine
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {outcomes.map((outcome, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold mb-1">{outcome.count}</div>
                <Badge variant="outline" className={outcome.color}>
                  {outcome.tag}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Notes Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Session Notes & Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Sarah M. - Follow-up Required</h4>
              <p className="text-sm text-muted-foreground">
                Send investment account setup instructions after today's session
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">John D. - Progress Update</h4>
              <p className="text-sm text-muted-foreground">
                Client successfully paid off credit card debt - celebrate achievement!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};