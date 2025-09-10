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
    // Show sample data when no real insights are available
    const sampleInsights: AnonymizedInsights = {
      totalEmployees: 45,
      activeParticipants: 32,
      avgStressLevel: 6.2,
      avgConfidenceLevel: 7.8,
      moodDistribution: {
        optimistic: 12,
        confident: 8,
        neutral: 7,
        concerned: 5,
        stressed: 3
      },
      topConcerns: {
        "debt management": 18,
        "emergency savings": 14,
        "retirement planning": 12,
        "budgeting skills": 10,
        "investment knowledge": 8
      },
      webinarAttendanceRate: 0.73,
      oneOnOneBookingRate: 0.45,
      toolUsageRate: 0.68
    };

    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Analytics & Insights</h1>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm">
            Sample Data - Live insights coming soon
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">71%</div>
              <p className="text-xs text-muted-foreground">32 of 45 employees active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Wellness</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">7.8/10</div>
              <p className="text-xs text-muted-foreground">Above average confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">6.2/10</div>
              <p className="text-xs text-muted-foreground">Moderate stress detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tool Usage</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">Active engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Program Participation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Users className="h-5 w-5" />
                Program Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Webinar Attendance</span>
                  <span className="font-semibold">73%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>1-on-1 Coaching Bookings</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Financial Tools Usage</span>
                  <span className="font-semibold">68%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <PieChart className="h-5 w-5" />
                Employee Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Optimistic
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">12</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Confident
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">8</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Neutral
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">7</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Concerned
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">5</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Stressed
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Financial Concerns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Target className="h-5 w-5" />
              Top Financial Concerns & Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                { concern: "Debt Management", mentions: 18, priority: "high" },
                { concern: "Emergency Savings", mentions: 14, priority: "high" },
                { concern: "Retirement Planning", mentions: 12, priority: "medium" },
                { concern: "Budgeting Skills", mentions: 10, priority: "medium" },
                { concern: "Investment Knowledge", mentions: 8, priority: "low" },
                { concern: "Credit Score Improvement", mentions: 6, priority: "low" }
              ].map(({ concern, mentions, priority }) => (
                <div key={concern} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-lg gap-2">
                  <span className="font-medium text-sm">{concern}</span>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs ${
                      priority === 'high' ? 'bg-red-100 text-red-800' :
                      priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {mentions} employees
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-green-800 text-sm">
                  <strong>Focus on Debt Management:</strong> 40% of employees mention debt concerns. Consider scheduling specialized webinars on debt consolidation and payment strategies.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-green-800 text-sm">
                  <strong>Boost Emergency Fund Education:</strong> Emergency savings is the second top concern. Promote the savings calculator tool and emergency fund webinars.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-green-800 text-sm">
                  <strong>Increase 1-on-1 Coaching:</strong> Only 45% booking rate suggests opportunity to promote personalized coaching benefits and success stories.
                </p>
              </div>
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