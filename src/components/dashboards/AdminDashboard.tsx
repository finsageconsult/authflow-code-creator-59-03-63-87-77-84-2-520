import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Users,
  Shield,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminCreditIssuance } from '@/components/credits/AdminCreditIssuance';
import { ContentCatalog } from '@/components/cms/ContentCatalog';
import { OrgAnalyticsDashboard } from '@/components/analytics/OrgAnalyticsDashboard';
import { SecurityAuditDashboard } from '@/components/security/SecurityAuditDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalCredits: number;
  monthlyRevenue: number;
}

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalCredits: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        // Fetch organizations count
        const { count: orgCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });

        // Fetch users count
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch total credits from org_plans
        const { data: orgPlans } = await supabase
          .from('org_plans')
          .select('credit_allotment_1on1, credit_allotment_webinar');

        const totalCredits = orgPlans?.reduce((sum, plan) => 
          sum + plan.credit_allotment_1on1 + plan.credit_allotment_webinar, 0) || 0;

        setStats({
          totalOrganizations: orgCount || 0,
          totalUsers: userCount || 0,
          totalCredits,
          monthlyRevenue: 45000 // Placeholder
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  const platformStats = [
    {
      title: 'Total Organizations',
      value: stats.totalOrganizations.toString(),
      change: '+12%',
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Platform Users',
      value: stats.totalUsers.toString(),
      change: '+23%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Credits Allocated',
      value: stats.totalCredits.toLocaleString(),
      change: '+18%',
      icon: CreditCard,
      color: 'text-purple-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: '+15%',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Organizations',
      description: 'View and manage all organizations',
      icon: Building2,
      action: () => navigate('/admin/organizations'),
      color: 'text-blue-600'
    },
    {
      title: 'Platform Analytics',
      description: 'View detailed platform insights',
      icon: TrendingUp,
      action: () => console.log('Analytics coming soon'),
      color: 'text-green-600'
    },
    {
      title: 'Feature Flags',
      description: 'Manage platform features',
      icon: Shield,
      action: () => console.log('Feature flags coming soon'),
      color: 'text-purple-600'
    },
    {
      title: 'Audit Logs',
      description: 'Review system activity',
      icon: Activity,
      action: () => console.log('Audit logs coming soon'),
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Platform-wide management and analytics
          </p>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Super Admin
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="credits">Credits Engine</TabsTrigger>
          <TabsTrigger value="content">Content CMS</TabsTrigger>
          <TabsTrigger value="security">Security Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => (
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start"
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-blue-100">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">New organization registered</h4>
              <p className="text-sm text-muted-foreground">TechCorp signed up for Premium plan</p>
            </div>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-green-100">
              <CreditCard className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Credits purchased</h4>
              <p className="text-sm text-muted-foreground">StartupXYZ bought 500 webinar credits</p>
            </div>
            <span className="text-xs text-muted-foreground">4 hours ago</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="p-2 rounded-full bg-purple-100">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Bulk user invitation</h4>
              <p className="text-sm text-muted-foreground">InnovateCorp invited 50 employees</p>
            </div>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <OrgAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <AdminCreditIssuance />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentCatalog />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityAuditDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};