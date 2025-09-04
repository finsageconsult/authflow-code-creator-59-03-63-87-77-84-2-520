import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsChart } from './AnalyticsChart';
import { 
  Users, 
  Building2, 
  GraduationCap,
  MessageSquare,
  Trash2,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlatformMetrics {
  totalCoaches: number;
  totalEmployees: number;
  totalOrganizations: number;
  supportQueries: {
    pending: number;
    solved: number;
    total: number;
  };
  recentDeletions: any[];
  loginActivity: any[];
}

export const AdminAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatformMetrics();
    
    // Set up real-time updates
    const channel = supabase
      .channel('admin-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchPlatformMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
        fetchPlatformMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_queries' }, () => {
        fetchPlatformMetrics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchPlatformMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlatformMetrics = async () => {
    try {
      setLoading(true);

      // Fetch coaches count
      const { count: coachCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'COACH');

      // Fetch employees count
      const { count: employeeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'EMPLOYEE');

      // Fetch organizations count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Fetch support queries
      const { data: supportData } = await supabase
        .from('support_queries')
        .select('status, created_at');

      const supportQueries = {
        pending: supportData?.filter(q => q.status === 'pending').length || 0,
        solved: supportData?.filter(q => q.status === 'resolved').length || 0,
        total: supportData?.length || 0
      };

      // Fetch recent deletions from audit logs
      const { data: deletionData } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'DELETE')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch recent login activity (using audit logs or support queries as proxy)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activityData } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      setMetrics({
        totalCoaches: coachCount || 0,
        totalEmployees: employeeCount || 0,
        totalOrganizations: orgCount || 0,
        supportQueries,
        recentDeletions: deletionData || [],
        loginActivity: activityData || []
      });
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8 space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
        <p className="text-muted-foreground">
          No analytics data recorded yet. Start by adding Employees, Coaches, or Organizations.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const supportQueriesChartData = [
    { name: 'Pending', value: metrics.supportQueries.pending, color: 'hsl(var(--destructive))' },
    { name: 'Solved', value: metrics.supportQueries.solved, color: 'hsl(var(--primary))' }
  ];

  const deletionsByTypeData = metrics.recentDeletions.reduce((acc, deletion) => {
    const type = deletion.entity || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deletionsChartData = Object.entries(deletionsByTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const activityTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayActivity = metrics.loginActivity.filter(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate.toDateString() === date.toDateString();
    }).length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: dayActivity
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Analytics</h2>
        <p className="text-muted-foreground">System-wide metrics and activity overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCoaches}</div>
            <p className="text-xs text-muted-foreground">
              Active coaching professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Registered employee accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.supportQueries.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.supportQueries.pending} pending, {metrics.supportQueries.solved} resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {supportQueriesChartData.some(item => item.value > 0) ? (
          <AnalyticsChart
            title="Support Queries Status"
            description="Pending vs resolved support tickets"
            type="pie"
            data={supportQueriesChartData}
            dataKey="value"
            xAxisKey="name"
            showLegend
            colors={['hsl(var(--destructive))', 'hsl(var(--primary))']}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Support Queries Status</CardTitle>
              <p className="text-sm text-muted-foreground">Pending vs resolved support tickets</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">No support queries found</p>
            </CardContent>
          </Card>
        )}

        {deletionsChartData.length > 0 ? (
          <AnalyticsChart
            title="Deletions by Entity Type"
            description="Recent deletions breakdown"
            type="bar"
            data={deletionsChartData}
            dataKey="value"
            xAxisKey="name"
            color="hsl(var(--destructive))"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Deletions by Entity Type</CardTitle>
              <p className="text-sm text-muted-foreground">Recent deletions breakdown</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">No recent deletions found</p>
            </CardContent>
          </Card>
        )}

        <AnalyticsChart
          title="Activity Trend (Last 7 Days)"
          description="Daily platform activity"
          type="line"
          data={activityTrendData}
          dataKey="activities"
          xAxisKey="date"
          color="hsl(var(--primary))"
        />
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentDeletions.length > 0 || metrics.loginActivity.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Entity Name</th>
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">Performed By</th>
                      <th className="text-left p-2">Date-Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentDeletions.slice(0, 10).map((activity, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            {activity.entity_id || 'Unknown Entity'}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="destructive">Deleted</Badge>
                        </td>
                        <td className="p-2">{activity.actor_id || 'System'}</td>
                        <td className="p-2">
                          {new Date(activity.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {metrics.loginActivity.slice(0, 5).map((activity, index) => (
                      <tr key={`login-${index}`} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            {activity.entity || 'System Activity'}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{activity.action}</Badge>
                        </td>
                        <td className="p-2">{activity.actor_id || 'System'}</td>
                        <td className="p-2">
                          {new Date(activity.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No recent activity recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-blue-700">User Growth</h4>
            <p className="text-sm text-muted-foreground">
              {metrics.totalEmployees + metrics.totalCoaches} total users across {metrics.totalOrganizations} organizations
            </p>
          </div>
          
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-green-700">Support Health</h4>
            <p className="text-sm text-muted-foreground">
              {metrics.supportQueries.total === 0 
                ? 'No support queries yet'
                : `${(metrics.supportQueries.solved / metrics.supportQueries.total * 100).toFixed(1)}% resolution rate`
              }
            </p>
          </div>

          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-purple-700">Platform Activity</h4>
            <p className="text-sm text-muted-foreground">
              {metrics.loginActivity.length} activities logged in the past 7 days
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};