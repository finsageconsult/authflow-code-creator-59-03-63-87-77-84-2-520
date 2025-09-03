import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { ReportScheduler } from './ReportScheduler';
import { 
  Flame, 
  TrendingUp, 
  Heart, 
  Target,
  Calendar,
  BookOpen,
  CreditCard,
  Download,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmployeeAnalyticsDashboard = () => {
  const { employeeAnalytics, loading, exportData } = useAnalytics();
  const { toast } = useToast();

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  if (!employeeAnalytics) {
    return <div className="text-center p-8">No analytics data available</div>;
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    const result = await exportData('employee', format);
    if (result.success) {
      toast({
        title: 'Export Complete',
        description: `Your progress exported as ${format.toUpperCase()}`,
      });
    } else {
      toast({
        title: 'Export Failed',
        description: result.error || 'Failed to export progress',
        variant: 'destructive',
      });
    }
  };

  // Calculate progress score
  const progressScore = Math.min(100, Math.round(
    (employeeAnalytics.progress.completedSessions * 20) +
    (employeeAnalytics.progress.completedWebinars * 10) +
    (employeeAnalytics.wellness.moodCheckIns * 5) +
    (employeeAnalytics.streak.currentStreak * 2)
  ));

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Financial Journey</h2>
          <p className="text-muted-foreground">Your personal progress and achievements</p>
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

      {/* Progress Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Financial Wellness Score</h3>
              <p className="text-muted-foreground">Based on your engagement and progress</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{progressScore}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-secondary/20 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500" 
              style={{ width: `${progressScore}%` }}
            />
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{employeeAnalytics.streak.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{employeeAnalytics.progress.completedSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{employeeAnalytics.wellness.moodCheckIns}</div>
              <div className="text-xs text-muted-foreground">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{employeeAnalytics.engagement.totalHoursEngaged}h</div>
              <div className="text-xs text-muted-foreground">Time Engaged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeAnalytics.streak.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {employeeAnalytics.streak.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeAnalytics.progress.completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              1:1 coaching sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webinars Attended</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeAnalytics.progress.completedWebinars}</div>
            <p className="text-xs text-muted-foreground">
              Learning sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Invested</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeAnalytics.progress.creditsSpent}</div>
            <p className="text-xs text-muted-foreground">
              In your financial growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Confidence Trend"
          description="Your financial confidence over time"
          type="line"
          data={employeeAnalytics.wellness.confidenceTrend.map(trend => ({
            date: new Date(trend.date).toLocaleDateString(),
            confidence: trend.score
          }))}
          dataKey="confidence"
          xAxisKey="date"
          color="hsl(var(--primary))"
        />

        <AnalyticsChart
          title="Stress Level Trend"
          description="Your financial stress over time"
          type="area"
          data={employeeAnalytics.wellness.stressTrend.map(trend => ({
            date: new Date(trend.date).toLocaleDateString(),
            stress: trend.score
          }))}
          dataKey="stress"
          xAxisKey="date"
          color="hsl(var(--destructive))"
        />
      </div>

      {/* Achievements and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employeeAnalytics.streak.currentStreak >= 7 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <Flame className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Streak Master</h4>
                  <p className="text-sm text-orange-700">{employeeAnalytics.streak.currentStreak} day streak!</p>
                </div>
              </div>
            )}

            {employeeAnalytics.progress.completedSessions >= 5 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-800">Session Specialist</h4>
                  <p className="text-sm text-blue-700">Completed {employeeAnalytics.progress.completedSessions} coaching sessions</p>
                </div>
              </div>
            )}

            {employeeAnalytics.wellness.moodCheckIns >= 10 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <Heart className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Wellness Champion</h4>
                  <p className="text-sm text-green-700">{employeeAnalytics.wellness.moodCheckIns} mood check-ins completed</p>
                </div>
              </div>
            )}

            {employeeAnalytics.streak.currentStreak < 7 && 
             employeeAnalytics.progress.completedSessions < 5 && 
             employeeAnalytics.wellness.moodCheckIns < 10 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Achievements Coming Soon!</h3>
                <p className="text-sm text-muted-foreground">
                  Keep engaging to unlock your first achievement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Personal Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-purple-700">Learning Style</h4>
              <p className="text-sm text-muted-foreground">
                You prefer {employeeAnalytics.engagement.preferredSessionType === 'coaching' ? '1:1 coaching' : 
                employeeAnalytics.engagement.preferredSessionType === 'webinar' ? 'group webinars' : 'mixed learning'}
              </p>
            </div>
            
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-blue-700">Top Interests</h4>
              <div className="flex flex-wrap gap-1 mt-2">
                {employeeAnalytics.engagement.favoriteTopics.slice(0, 3).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-green-700">Engagement Level</h4>
              <p className="text-sm text-muted-foreground">
                {employeeAnalytics.engagement.totalHoursEngaged} hours invested in your financial wellness
              </p>
            </div>

            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-orange-700">Next Milestone</h4>
              <p className="text-sm text-muted-foreground">
                {employeeAnalytics.streak.currentStreak < 7 ? 
                  `${7 - employeeAnalytics.streak.currentStreak} more days for 7-day streak` :
                  employeeAnalytics.progress.completedSessions < 10 ?
                  `${10 - employeeAnalytics.progress.completedSessions} more sessions for Expert level` :
                  'Keep up the great work!'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <ReportScheduler 
          reportType="employee" 
          title="Personal Progress"
        />
      </div>
    </div>
  );
};