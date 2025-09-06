import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  Users, 
  Settings,
  TrendingUp,
  FileText,
  Star,
  CheckCircle,
  Coins,
  Menu
} from 'lucide-react';
import { AvailabilitySettings } from '@/components/coach/AvailabilitySettings';
import { SessionManager } from '@/components/coach/SessionManager';
import { PayoutView } from '@/components/coach/PayoutView';
import { ContentCatalog } from '@/components/cms/ContentCatalog';
import { CoachAnalyticsDashboard } from '@/components/analytics/CoachAnalyticsDashboard';
import { SupportQuery } from '@/components/support/SupportQuery';
import AssignmentsList from '@/components/assignments/AssignmentsList';
import { CoachChatInterface } from '@/components/coach/CoachChatInterface';
import { CoachSidebar } from './CoachSidebar';

interface CoachStats {
  totalClients: number;
  upcomingSessions: number;
  completedSessions: number;
  avgRating: number;
}

export const CoachDashboard = () => {
  const isMobile = useIsMobile();
  const { userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  console.log('CoachDashboard loaded with activeTab:', activeTab);
  
  const [stats] = useState<CoachStats>({
    totalClients: 23,
    upcomingSessions: 8,
    completedSessions: 156,
    avgRating: 4.8
  });

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

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <CoachAnalyticsDashboard />;
      case 'sessions':
        return <SessionManager />;
      case 'clients':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Client List */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  My Clients
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The individuals you're supporting on their financial wellness journey
                </p>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                {recentClients.map((client) => (
                  <div key={client.id} className="p-3 md:p-4 border rounded-lg bg-card">
                    {/* Client Header - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                      <h4 className="font-medium text-base truncate pr-2">{client.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`flex-shrink-0 w-fit ${
                          client.riskProfile === 'Conservative' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          client.riskProfile === 'Moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {client.riskProfile}
                      </Badge>
                    </div>
                    
                    {/* Client Details - Responsive grid */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                        <p className="flex flex-col md:flex-row md:items-center">
                          <span className="text-muted-foreground font-medium">Last session:</span> 
                          <span className="md:ml-1">{client.lastSession}</span>
                        </p>
                        <p className="flex flex-col md:flex-row md:items-center md:col-span-2">
                          <span className="text-muted-foreground font-medium">Progress:</span> 
                          <span className="md:ml-1 break-words">{client.progress}</span>
                        </p>
                      </div>
                      <p className="flex flex-col md:flex-row md:items-center">
                        <span className="text-muted-foreground font-medium">Next goal:</span> 
                        <span className="md:ml-1 break-words">{client.nextGoal}</span>
                      </p>
                    </div>
                    
                    {/* Action Buttons - Responsive layout */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                        Session History
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                        Progress Notes
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case 'content':
        return <ContentCatalog />;
      case 'availability':
        return <AvailabilitySettings />;
      case 'payouts':
        return <PayoutView />;
      case 'assignments':
        return <AssignmentsList />;
      case 'chat':
        return <CoachChatInterface />;
      case 'support':
        return <SupportQuery />;
      default:
        return (
          <div className="space-y-6">
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2">
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Session</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Settings className="w-6 h-6" />
                    <span>Set Availability</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="w-6 h-6" />
                    <span>Session Notes</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Coins className="w-6 h-6" />
                    <span>View Payouts</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Outcomes Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Client Outcomes This Month
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Celebrating the positive impact you're making in your clients' financial lives
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
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Single Sidebar instance for proper state management */}
        <CoachSidebar />

        {/* Main Content using SidebarInset for proper responsive layout */}
        <SidebarInset className="flex-1">
          {/* Mobile Header with Hamburger Menu */}
          <header className="sticky top-0 z-40 h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 bg-background border-b md:hidden">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0">
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </SidebarTrigger>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold truncate">
                  Welcome, Coach {userProfile?.name?.split(' ')[0]}!
                </h1>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[10px] sm:text-xs hidden sm:inline-flex shrink-0">
                  Coach  
                </Badge>
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:sticky md:top-0 md:z-40 md:h-14 md:flex md:items-center md:justify-between md:px-4 lg:px-6 md:bg-background md:border-b">
            <div className="flex items-center gap-2 lg:gap-3">
              <SidebarTrigger className="h-8 w-8 p-0 lg:hidden">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <h1 className="text-lg lg:text-xl font-semibold">
                Welcome, Coach {userProfile?.name?.split(' ')[0]}!
              </h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs lg:text-sm">
                Coach  
              </Badge>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};