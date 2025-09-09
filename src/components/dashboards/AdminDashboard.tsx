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
  IndianRupee,
  Calendar
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminCreditIssuance } from '@/components/credits/AdminCreditIssuance';
import { ContentCatalog } from '@/components/cms/ContentCatalog';
import { AdminAnalyticsDashboard } from '@/components/analytics/AdminAnalyticsDashboard';
import { SecurityAuditDashboard } from '@/components/security/SecurityAuditDashboard';
import { AdminSupportManager } from '@/components/support/AdminSupportManager';
import { DemoRequestsManager } from '@/components/admin/DemoRequestsManager';

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalCredits: number;
  monthlyRevenue: number;
}

interface RecentActivityItem {
  id: string;
  type: 'organization' | 'user' | 'credit' | 'payment';
  title: string;
  description: string;
  created_at: string;
  organization_name?: string;
  user_name?: string;
  amount?: number;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch recent organizations
        const { data: recentOrgs } = await supabase
          .from('organizations')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('users')
          .select('id, name, created_at, organization_id')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent payments
        const { data: recentPayments } = await supabase
          .from('payments')
          .select('id, amount, created_at, status')
          .eq('status', 'captured')
          .order('created_at', { ascending: false })
          .limit(3);

        const activityItems: RecentActivityItem[] = [];

        // Add organization activities
        recentOrgs?.forEach(org => {
          activityItems.push({
            id: `org-${org.id}`,
            type: 'organization',
            title: 'New organization registered',
            description: `${org.name} joined the platform`,
            created_at: org.created_at,
            organization_name: org.name
          });
        });

        // Add user activities
        recentUsers?.forEach(user => {
          activityItems.push({
            id: `user-${user.id}`,
            type: 'user',
            title: 'New user joined',
            description: `${user.name || 'New user'} created an account`,
            created_at: user.created_at,
            user_name: user.name
          });
        });

        // Add payment activities
        recentPayments?.forEach(payment => {
          activityItems.push({
            id: `payment-${payment.id}`,
            type: 'payment',
            title: 'Payment completed',
            description: `₹${payment.amount} payment processed`,
            created_at: payment.created_at || new Date().toISOString(),
            amount: payment.amount
          });
        });

        // Sort by date and take most recent 5
        const sortedActivities = activityItems
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'organization': return Building2;
      case 'user': return Users;
      case 'payment': return CreditCard;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'organization': return 'text-blue-600';
      case 'user': return 'text-purple-600';
      case 'payment': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'organization': return 'bg-blue-100';
      case 'user': return 'bg-purple-100';
      case 'payment': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading recent activity...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Platform Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No recent activity found
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                  <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.created_at)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
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

        // Fetch actual monthly revenue from payments
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const { data: monthlyPayments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('status', 'captured')
          .gte('created_at', firstDayOfMonth.toISOString());

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
        }

        const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Also check for any payments at all to show in debug
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        console.log('Payment status breakdown:', {
          monthlyPayments: monthlyPayments?.length || 0,
          allPayments: allPayments?.length || 0,
          statusBreakdown: allPayments?.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });

        setStats({
          totalOrganizations: orgCount || 0,
          totalUsers: userCount || 0,
          totalCredits,
          monthlyRevenue
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
      value: stats.monthlyRevenue > 0 ? `₹${stats.monthlyRevenue.toLocaleString('en-IN')}` : 'No payments yet',
      change: stats.monthlyRevenue > 0 ? '+15%' : 'Waiting for first payment',
      icon: IndianRupee,
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

  // Render different views based on active tab
  if (activeTab === 'analytics') {
    return <AdminAnalyticsDashboard />;
  }

  if (activeTab === 'credits') {
    return <AdminCreditIssuance />;
  }

  if (activeTab === 'content') {
    return <ContentCatalog />;
  }

  if (activeTab === 'security') {
    return <SecurityAuditDashboard />;
  }

  if (activeTab === 'support') {
    return <AdminSupportManager />;
  }

  if (activeTab === 'demo-requests') {
    return <DemoRequestsManager />;
  }

  // Default overview content
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
      <RecentActivity />
    </div>
  );
};