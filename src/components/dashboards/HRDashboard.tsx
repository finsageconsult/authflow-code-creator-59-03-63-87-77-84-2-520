import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  UserPlus,
  BarChart3,
  Mail,
  FileText
} from 'lucide-react';

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  creditsAllocated: number;
  upcomingWebinars: number;
}

export const HRDashboard = () => {
  const { userProfile, organization, profileReady } = useAuth();
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    creditsAllocated: 0,
    upcomingWebinars: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRStats = async () => {
      try {
        if (!userProfile?.organization_id) {
          // No organization assigned - show default state
          setStats({
            totalEmployees: 0,
            activeEmployees: 0,
            creditsAllocated: 0,
            upcomingWebinars: 0
          });
          setLoading(false);
          return;
        }

        // Fetch employees in organization
        const { count: employeeCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', userProfile.organization_id)
          .eq('role', 'EMPLOYEE');

        // Fetch active employees (those with ACTIVE status)
        const { count: activeCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', userProfile.organization_id)
          .eq('role', 'EMPLOYEE')
          .eq('status', 'ACTIVE');

        // Fetch organization credits
        const { data: orgPlan } = await supabase
          .from('org_plans')
          .select('credit_allotment_1on1, credit_allotment_webinar')
          .eq('organization_id', userProfile.organization_id)
          .maybeSingle();

        const totalCredits = orgPlan ? 
          orgPlan.credit_allotment_1on1 + orgPlan.credit_allotment_webinar : 0;

        setStats({
          totalEmployees: employeeCount || 0,
          activeEmployees: activeCount || 0,
          creditsAllocated: totalCredits,
          upcomingWebinars: 3 // Placeholder
        });
      } catch (error) {
        console.error('Error fetching HR stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only run when profile is ready
    if (profileReady) {
      fetchHRStats();
    }
  }, [profileReady, userProfile?.organization_id]);

  // Show loading while auth is not ready or data is loading
  if (!profileReady || loading) {
    return <div>Loading HR dashboard...</div>;
  }

  const hrStats = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      change: '+5 this month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Participants',
      value: stats.activeEmployees.toString(),
      change: '89% engagement',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Credits Available',
      value: stats.creditsAllocated.toString(),
      change: '76% utilized',
      icon: CreditCard,
      color: 'text-purple-600'
    },
    {
      title: 'Scheduled Webinars',
      value: stats.upcomingWebinars.toString(),
      change: '2 this week',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Invite Employees',
      description: 'Generate access codes for new employees',
      icon: UserPlus,
      action: () => console.log('Invite employees'),
      color: 'text-blue-600'
    },
    {
      title: 'Schedule Webinar',
      description: 'Plan upcoming learning sessions',
      icon: Calendar,
      action: () => console.log('Schedule webinar'),
      color: 'text-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Anonymous participation insights',
      icon: BarChart3,
      action: () => console.log('View analytics'),
      color: 'text-purple-600'
    },
    {
      title: 'Send Nudges',
      description: 'Engage employees via email',
      icon: Mail,
      action: () => console.log('Send nudges'),
      color: 'text-orange-600'
    }
  ];

  const participationTrends = [
    {
      topic: 'Retirement Planning',
      participation: 85,
      avgConfidence: 7.2,
      stressLevel: 'Medium'
    },
    {
      topic: 'Investment Basics',
      participation: 92,
      avgConfidence: 8.1,
      stressLevel: 'Low'
    },
    {
      topic: 'Tax Planning',
      participation: 78,
      avgConfidence: 6.8,
      stressLevel: 'High'
    }
  ];

  if (loading) {
    return <div>Loading HR dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          HR Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {organization?.name || 'No Organization Assigned'} - Program Management
          </p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            HR Manager
          </Badge>
          {!userProfile?.organization_id && (
            <Badge variant="destructive" className="ml-2">
              Organization Assignment Required
            </Badge>
          )}
        </div>
      </div>

      {!userProfile?.organization_id && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">Organization Assignment Required</h3>
                <p className="text-orange-700 mt-1">
                  You need to be assigned to an organization to access HR management features. 
                  Please contact an administrator to assign you to an organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hrStats.map((stat, index) => (
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

      {/* Quick Actions and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              HR Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto p-4 justify-start"
                onClick={action.action}
              >
                <div className="flex items-center gap-3 w-full">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <div className="text-left">
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Anonymized Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Participation Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {participationTrends.map((trend, index) => (
              <div key={index} className="p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{trend.topic}</h4>
                  <Badge variant="outline" className={
                    trend.stressLevel === 'Low' ? 'bg-green-100 text-green-800' :
                    trend.stressLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {trend.stressLevel} Stress
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Participation: </span>
                    <span className="font-medium">{trend.participation}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    <span className="font-medium">{trend.avgConfidence}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Program Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Program Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-green-100">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Webinar completed</h4>
              <p className="text-sm text-muted-foreground">"Tax Planning for 2024" - 45 attendees</p>
            </div>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-blue-100">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">New employees onboarded</h4>
              <p className="text-sm text-muted-foreground">12 employees joined via access codes</p>
            </div>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-purple-100">
              <Mail className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Engagement nudge sent</h4>
              <p className="text-sm text-muted-foreground">Reminder about retirement planning workshop</p>
            </div>
            <span className="text-xs text-muted-foreground">2 days ago</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};