import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { ReportScheduler } from './ReportScheduler';
import { 
  Calendar, 
  Star, 
  TrendingUp, 
  Users,
  CheckCircle,
  Target,
  Download,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CoachAnalyticsDashboard = () => {
  const { coachAnalytics, loading, exportData } = useAnalytics();
  const { toast } = useToast();

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  if (!coachAnalytics) {
    return <div className="text-center p-8">No analytics data available</div>;
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    const result = await exportData('coach', format);
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
  const sessionStatusData = [
    { name: 'Completed', value: coachAnalytics.sessions.completed, color: 'hsl(var(--primary))' },
    { name: 'Upcoming', value: coachAnalytics.sessions.upcoming, color: 'hsl(var(--secondary))' },
    { name: 'Cancelled', value: coachAnalytics.sessions.cancelled, color: 'hsl(var(--muted))' }
  ];

  const ratingsData = Object.entries(coachAnalytics.ratings.distribution).map(([rating, count]) => ({
    name: `${rating} Stars`,
    value: count
  }));

  const outcomesData = Object.entries(coachAnalytics.outcomes.topTags)
    .map(([tag, count]) => ({ name: tag, value: count }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Coach Performance Analytics</h2>
          <p className="text-muted-foreground">Your sessions, ratings, and client outcomes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachAnalytics.sessions.total}</div>
            <p className="text-xs text-muted-foreground">
              {coachAnalytics.sessions.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachAnalytics.ratings.average}/5</div>
            <p className="text-xs text-muted-foreground">
              {coachAnalytics.ratings.feedbackCount} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachAnalytics.performance.sessionCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Session completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachAnalytics.performance.clientRetention}%</div>
            <p className="text-xs text-muted-foreground">
              Return client rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Session Status Distribution"
          description="Breakdown of session statuses"
          type="pie"
          data={sessionStatusData}
          dataKey="value"
          xAxisKey="name"
          showLegend
          colors={['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))']}
        />

        <AnalyticsChart
          title="Rating Distribution"
          description="Client rating breakdown"
          type="bar"
          data={ratingsData}
          dataKey="value"
          xAxisKey="name"
          color="hsl(var(--primary))"
        />

        <AnalyticsChart
          title="Client Outcomes"
          description="Most common achievement tags"
          type="bar"
          data={outcomesData}
          dataKey="value"
          xAxisKey="name"
          color="hsl(var(--accent))"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-green-700">Session Quality</h4>
              <p className="text-sm text-muted-foreground">
                {coachAnalytics.performance.averageSessionDuration} min average duration
              </p>
            </div>
            
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-blue-700">Client Success</h4>
              <p className="text-sm text-muted-foreground">
                Top outcome: {outcomesData[0]?.name || 'No data'} 
                ({outcomesData[0]?.value || 0} clients)
              </p>
            </div>

            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-purple-700">Client Satisfaction</h4>
              <p className="text-sm text-muted-foreground">
                {((coachAnalytics.ratings.distribution[5] || 0) + (coachAnalytics.ratings.distribution[4] || 0))}% 
                of clients rate you 4+ stars
              </p>
            </div>
          </CardContent>
        </Card>

        <ReportScheduler 
          reportType="coach" 
          title="Coach Performance"
        />
      </div>

      {/* Detailed Outcomes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Outcome Tags Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Achievements you've helped clients accomplish
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {outcomesData.map((outcome, index) => (
              <div key={index} className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary mb-1">
                  {outcome.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {outcome.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">
              {coachAnalytics.sessions.upcoming} sessions scheduled
            </h3>
            <p className="text-sm text-muted-foreground">
              View your full schedule in the Sessions tab
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};