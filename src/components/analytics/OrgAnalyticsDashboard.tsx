import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { ReportScheduler } from './ReportScheduler';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  Download,
  Mail,
  BarChart3,
  PieChart,
  Heart,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OrgAnalyticsDashboard = () => {
  const { orgAnalytics, loading, exportData } = useAnalytics();
  const { toast } = useToast();

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  if (!orgAnalytics) {
    return <div className="text-center p-8">No analytics data available</div>;
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    const result = await exportData('org', format);
    if (result.success) {
      toast({
        title: 'Export Complete',
        description: `Analytics exported as ${format.toUpperCase()}`,
      });
    } else {
      toast({
        title: 'Export Failed',
        description: result.error || 'Failed to export analytics',
        variant: 'destructive',
      });
    }
  };

  // Prepare chart data
  const participationChartData = [
    { name: 'Active', value: orgAnalytics.participation.activeParticipants, color: 'hsl(var(--primary))' },
    { 
      name: 'Inactive', 
      value: orgAnalytics.participation.totalEmployees - orgAnalytics.participation.activeParticipants,
      color: 'hsl(var(--muted))'
    }
  ];

  const engagementChartData = [
    { name: 'Webinars', value: orgAnalytics.engagement.webinarVsOneOnOne.webinars },
    { name: '1:1 Sessions', value: orgAnalytics.engagement.webinarVsOneOnOne.oneOnOne }
  ];

  const topicHeatmapData = Object.entries(orgAnalytics.engagement.topicHeatmap)
    .map(([topic, count]) => ({ name: topic, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const wellnessTrendData = orgAnalytics.trends.moodTrends.slice(0, 30).map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    stress: trend.stress,
    confidence: trend.confidence
  }));

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organization Analytics</h2>
          <p className="text-muted-foreground">Adoption and impact insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgAnalytics.participation.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {orgAnalytics.participation.participationRate.toFixed(1)}% active participation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Utilization</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgAnalytics.credits.utilizationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {orgAnalytics.credits.remaining} credits remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgAnalytics.engagement.wellnessMetrics.avgConfidenceLevel.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {orgAnalytics.engagement.wellnessMetrics.confidenceDelta > 0 ? '+' : ''}
              {orgAnalytics.engagement.wellnessMetrics.confidenceDelta.toFixed(1)} confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgAnalytics.engagement.wellnessMetrics.avgStressLevel.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {orgAnalytics.engagement.wellnessMetrics.stressDelta > 0 ? '+' : ''}
              {orgAnalytics.engagement.wellnessMetrics.stressDelta.toFixed(1)} stress change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Employee Participation"
          description="Active vs inactive employees"
          type="pie"
          data={participationChartData}
          dataKey="value"
          xAxisKey="name"
          showLegend
          colors={['hsl(var(--primary))', 'hsl(var(--muted))']}
        />

        <AnalyticsChart
          title="Engagement Mix"
          description="Webinars vs 1:1 sessions"
          type="bar"
          data={engagementChartData}
          dataKey="value"
          xAxisKey="name"
          color="hsl(var(--primary))"
        />

        <AnalyticsChart
          title="Top Financial Concerns"
          description="Most common employee concerns"
          type="bar"
          data={topicHeatmapData}
          dataKey="value"
          xAxisKey="name"
          color="hsl(var(--accent))"
        />

        <AnalyticsChart
          title="Wellness Trends"
          description="Confidence and stress over time"
          type="line"
          data={wellnessTrendData}
          dataKey="confidence"
          xAxisKey="date"
          color="hsl(var(--primary))"
        />
      </div>

      {/* Key Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-green-700">High Engagement</h4>
              <p className="text-sm text-muted-foreground">
                {orgAnalytics.participation.participationRate.toFixed(1)}% of employees actively using the platform
              </p>
            </div>
            
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-blue-700">Popular Topics</h4>
              <p className="text-sm text-muted-foreground">
                Top concern: {topicHeatmapData[0]?.name || 'No data'} 
                ({topicHeatmapData[0]?.value || 0} mentions)
              </p>
            </div>

            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-purple-700">Wellness Impact</h4>
              <p className="text-sm text-muted-foreground">
                {orgAnalytics.engagement.wellnessMetrics.confidenceDelta > 0 ? 'Improving' : 'Declining'} 
                confidence levels across the organization
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Report Scheduling */}
        <ReportScheduler 
          reportType="org" 
          title="Organization Analytics"
        />
      </div>

      {/* Engagement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Engagement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-blue-700">Participation</h4>
            <p className="text-sm text-muted-foreground">
              {orgAnalytics.participation.participationRate < 50 ? 
                'Consider running awareness campaigns to boost program adoption' :
                'Great participation rate! Consider expanding program offerings'
              }
            </p>
          </div>
          
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-green-700">Credit Utilization</h4>
            <p className="text-sm text-muted-foreground">
              {orgAnalytics.credits.utilizationRate < 30 ? 
                'Low credit usage - employees may need more guidance on available resources' :
                'Good credit utilization indicates active engagement'
              }
            </p>
          </div>

          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-purple-700">Wellness Trends</h4>
            <p className="text-sm text-muted-foreground">
              {orgAnalytics.engagement.wellnessMetrics.confidenceDelta > 0 ?
                'Confidence levels are improving - program is having positive impact' :
                'Focus on confidence-building sessions and resources'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};