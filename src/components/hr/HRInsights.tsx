import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3,
  TrendingUp,
  PieChart,
  Target,
  Users,
  Activity
} from 'lucide-react';

interface AnonymizedInsights {
  totalEmployees: number;
  activeParticipants: number;
  avgStressLevel: number;
  avgConfidenceLevel: number;
  moodDistribution: Record<string, number>;
  topConcerns: Record<string, number>;
  webinarAttendanceRate: number;
  oneOnOneBookingRate: number;
  toolUsageRate: number;
}

export const HRInsights = () => {
  const { userProfile } = useAuth();
  const [insights, setInsights] = useState<AnonymizedInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!userProfile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data: insightsData } = await supabase
          .from('anonymized_insights')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('insight_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (insightsData) {
          setInsights({
            totalEmployees: insightsData.total_employees,
            activeParticipants: insightsData.active_participants,
            avgStressLevel: insightsData.avg_stress_level,
            avgConfidenceLevel: insightsData.avg_confidence_level,
            moodDistribution: (insightsData.mood_distribution && typeof insightsData.mood_distribution === 'object') 
              ? insightsData.mood_distribution as Record<string, number> 
              : {},
            topConcerns: (insightsData.top_concerns && typeof insightsData.top_concerns === 'object') 
              ? insightsData.top_concerns as Record<string, number> 
              : {},
            webinarAttendanceRate: insightsData.webinar_attendance_rate,
            oneOnOneBookingRate: insightsData.one_on_one_booking_rate,
            toolUsageRate: insightsData.tool_usage_rate
          });
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userProfile?.organization_id]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading insights...</div>;
  }

  if (!insights) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No analytics data available yet. Insights will appear as employees engage with the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Insights</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.totalEmployees > 0 
                ? Math.round((insights.activeParticipants / insights.totalEmployees) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.activeParticipants} of {insights.totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.avgStressLevel.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              {insights.avgStressLevel > 6 ? 'Above average' : 'Within normal range'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.avgConfidenceLevel.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              {insights.avgConfidenceLevel > 7 ? 'High confidence' : 'Moderate confidence'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Usage</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(insights.toolUsageRate * 100)}%</div>
            <p className="text-xs text-muted-foreground">Active tool engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Program Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Webinar Attendance</span>
                <span>{Math.round(insights.webinarAttendanceRate * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${insights.webinarAttendanceRate * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>1-on-1 Coaching</span>
                <span>{Math.round(insights.oneOnOneBookingRate * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${insights.oneOnOneBookingRate * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tool Utilization</span>
                <span>{Math.round(insights.toolUsageRate * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${insights.toolUsageRate * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(insights.moodDistribution).map(([mood, count]) => (
                <div key={mood} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{mood}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${insights.totalEmployees > 0 ? (count / insights.totalEmployees) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(insights.moodDistribution).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No mood data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Concerns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Concerns & Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(insights.topConcerns).map(([concern, count]) => (
              <div key={concern} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium capitalize">{concern}</span>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    {count} mentions
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(insights.topConcerns).length === 0 && (
              <p className="text-center text-muted-foreground py-8 col-span-2">
                No specific concerns identified
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Privacy Protected:</strong> All insights are anonymized and aggregated to protect individual privacy. 
            No personal data or individual responses are visible in these analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};