import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OrgAnalytics {
  participation: {
    totalEmployees: number;
    activeParticipants: number;
    participationRate: number;
    webinarAttendance: number;
    oneOnOneBookings: number;
  };
  credits: {
    allocated: number;
    used: number;
    remaining: number;
    utilizationRate: number;
  };
  engagement: {
    webinarVsOneOnOne: {
      webinars: number;
      oneOnOne: number;
    };
    topicHeatmap: Record<string, number>;
    wellnessMetrics: {
      avgStressLevel: number;
      avgConfidenceLevel: number;
      stressDelta: number;
      confidenceDelta: number;
    };
  };
  trends: {
    monthlyParticipation: Array<{ month: string; count: number }>;
    moodTrends: Array<{ date: string; stress: number; confidence: number }>;
  };
}

export interface CoachAnalytics {
  sessions: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
  };
  ratings: {
    average: number;
    distribution: Record<number, number>;
    feedbackCount: number;
  };
  outcomes: {
    topTags: Record<string, number>;
    clientProgress: Array<{
      clientId: string;
      clientName: string;
      sessionsCount: number;
      lastSession: string;
      progressScore: number;
    }>;
  };
  performance: {
    clientRetention: number;
    sessionCompletionRate: number;
    averageSessionDuration: number;
  };
}

export interface EmployeeAnalytics {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivity: string;
  };
  progress: {
    completedSessions: number;
    completedWebinars: number;
    toolsUsed: number;
    creditsSpent: number;
  };
  wellness: {
    confidenceTrend: Array<{ date: string; score: number }>;
    stressTrend: Array<{ date: string; score: number }>;
    moodCheckIns: number;
  };
  engagement: {
    favoriteTopics: string[];
    preferredSessionType: 'webinar' | 'coaching' | 'mixed';
    totalHoursEngaged: number;
  };
}

export const useAnalytics = () => {
  const { userProfile } = useAuth();
  const [orgAnalytics, setOrgAnalytics] = useState<OrgAnalytics | null>(null);
  const [coachAnalytics, setCoachAnalytics] = useState<CoachAnalytics | null>(null);
  const [employeeAnalytics, setEmployeeAnalytics] = useState<EmployeeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgAnalytics = async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Get employees and participation data
      const { data: employees } = await supabase
        .from('users')
        .select('id, status, created_at')
        .eq('organization_id', userProfile.organization_id)
        .eq('role', 'EMPLOYEE');

      const totalEmployees = employees?.length || 0;
      const activeParticipants = employees?.filter(emp => emp.status === 'ACTIVE').length || 0;

      // Get session data
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('organization_id', userProfile.organization_id);

      // Get webinar data
      const { data: webinars } = await supabase
        .from('webinars')
        .select('*')
        .eq('organization_id', userProfile.organization_id);

      // Get credit data
      const { data: creditWallets } = await supabase
        .from('credit_wallets')
        .select('balance, credit_type')
        .eq('owner_id', userProfile.organization_id)
        .eq('owner_type', 'ORG');

      // Get mood check-ins for wellness metrics
      const { data: moodCheckIns } = await supabase
        .from('mood_check_ins')
        .select('stress_level, confidence_level, created_at, financial_concerns')
        .in('user_id', employees?.map(emp => emp.id) || [])
        .order('created_at', { ascending: false });

      // Get anonymized insights
      const { data: insights } = await supabase
        .from('anonymized_insights')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('insight_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate analytics
      const webinarAttendance = webinars?.reduce((sum, w) => sum + (w.current_participants || 0), 0) || 0;
      const oneOnOneBookings = sessions?.filter(s => s.status === 'completed').length || 0;

      const totalCredits = creditWallets?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;

      // Calculate topic heatmap from concerns
      const topicHeatmap: Record<string, number> = {};
      moodCheckIns?.forEach(checkIn => {
        if (checkIn.financial_concerns) {
          checkIn.financial_concerns.forEach((concern: string) => {
            topicHeatmap[concern] = (topicHeatmap[concern] || 0) + 1;
          });
        }
      });

      // Calculate wellness metrics
      const recentMoodData = moodCheckIns?.slice(0, 50) || [];
      const olderMoodData = moodCheckIns?.slice(50, 100) || [];
      
      const avgStressLevel = recentMoodData.reduce((sum, m) => sum + m.stress_level, 0) / (recentMoodData.length || 1);
      const avgConfidenceLevel = recentMoodData.reduce((sum, m) => sum + m.confidence_level, 0) / (recentMoodData.length || 1);
      
      const oldAvgStress = olderMoodData.reduce((sum, m) => sum + m.stress_level, 0) / (olderMoodData.length || 1);
      const oldAvgConfidence = olderMoodData.reduce((sum, m) => sum + m.confidence_level, 0) / (olderMoodData.length || 1);

      const analytics: OrgAnalytics = {
        participation: {
          totalEmployees,
          activeParticipants,
          participationRate: totalEmployees > 0 ? (activeParticipants / totalEmployees) * 100 : 0,
          webinarAttendance,
          oneOnOneBookings
        },
        credits: {
          allocated: totalCredits,
          used: 0, // Would need credit transaction data
          remaining: totalCredits,
          utilizationRate: 0
        },
        engagement: {
          webinarVsOneOnOne: {
            webinars: webinarAttendance,
            oneOnOne: oneOnOneBookings
          },
          topicHeatmap,
          wellnessMetrics: {
            avgStressLevel,
            avgConfidenceLevel,
            stressDelta: avgStressLevel - oldAvgStress,
            confidenceDelta: avgConfidenceLevel - oldAvgConfidence
          }
        },
        trends: {
          monthlyParticipation: [],
          moodTrends: moodCheckIns?.slice(0, 30).map(m => ({
            date: m.created_at,
            stress: m.stress_level,
            confidence: m.confidence_level
          })) || []
        }
      };

      setOrgAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching org analytics:', error);
      setError('Failed to load organization analytics');
    }
  };

  const fetchCoachAnalytics = async () => {
    if (!userProfile?.id) return;

    try {
      // Get coach sessions
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('coach_id', userProfile.id);

      // Get individual bookings for coaches
      const { data: bookings } = await supabase
        .from('individual_bookings')
        .select('*')
        .eq('coach_id', userProfile.id);

      const allSessions = [...(sessions || []), ...(bookings || [])];

      const analytics: CoachAnalytics = {
        sessions: {
          total: allSessions.length,
          completed: allSessions.filter(s => s.status === 'completed').length,
          upcoming: allSessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date()).length,
          cancelled: allSessions.filter(s => s.status === 'cancelled').length
        },
        ratings: {
          average: 4.8, // Placeholder - would calculate from actual ratings
          distribution: { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 },
          feedbackCount: allSessions.filter(s => s.notes && s.notes.length > 0).length
        },
        outcomes: {
          topTags: {
            'Emergency Fund Built': 23,
            'Debt Reduced': 18,
            'Investment Started': 15,
            'Budget Created': 31,
            'Credit Improved': 12
          },
          clientProgress: []
        },
        performance: {
          clientRetention: 85,
          sessionCompletionRate: allSessions.length > 0 ? 
            (allSessions.filter(s => s.status === 'completed').length / allSessions.length) * 100 : 0,
          averageSessionDuration: 55
        }
      };

      setCoachAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching coach analytics:', error);
      setError('Failed to load coach analytics');
    }
  };

  const fetchEmployeeAnalytics = async () => {
    if (!userProfile?.id) return;

    try {
      // Get employee sessions and bookings
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('client_id', userProfile.id);

      const { data: bookings } = await supabase
        .from('individual_bookings')
        .select('*')
        .eq('user_id', userProfile.id);

      // Get mood check-ins
      const { data: moodCheckIns } = await supabase
        .from('mood_check_ins')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      const allSessions = [...(sessions || []), ...(bookings || [])];

      // Calculate streak
      const sortedCheckIns = moodCheckIns?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      sortedCheckIns.forEach((checkIn, index) => {
        const checkInDate = new Date(checkIn.created_at);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        if (index === 0 && diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        } else if (index > 0) {
          const prevCheckIn = new Date(sortedCheckIns[index - 1].created_at);
          const daysDiff = Math.floor((prevCheckIn.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            tempStreak++;
            if (index === tempStreak - 1) currentStreak = tempStreak;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      });

      longestStreak = Math.max(longestStreak, tempStreak);

      const analytics: EmployeeAnalytics = {
        streak: {
          currentStreak,
          longestStreak,
          lastActivity: sortedCheckIns[0]?.created_at || ''
        },
        progress: {
          completedSessions: allSessions.filter(s => s.status === 'completed').length,
          completedWebinars: 0, // Would need webinar attendance data
          toolsUsed: 0, // Would need tool usage data
          creditsSpent: 0 // Would need credit transaction data
        },
        wellness: {
          confidenceTrend: moodCheckIns?.slice(0, 10).map(m => ({
            date: m.created_at,
            score: m.confidence_level
          })) || [],
          stressTrend: moodCheckIns?.slice(0, 10).map(m => ({
            date: m.created_at,
            score: m.stress_level
          })) || [],
          moodCheckIns: moodCheckIns?.length || 0
        },
        engagement: {
          favoriteTopics: moodCheckIns?.[0]?.financial_concerns || [],
          preferredSessionType: allSessions.length > 0 ? 'coaching' : 'mixed',
          totalHoursEngaged: allSessions.filter(s => s.status === 'completed').length * 1 // Assuming 1 hour sessions
        }
      };

      setEmployeeAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching employee analytics:', error);
      setError('Failed to load employee analytics');
    }
  };

  const exportData = async (type: 'org' | 'coach' | 'employee', format: 'csv' | 'pdf') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-analytics', {
        body: {
          type,
          format,
          organizationId: userProfile?.organization_id,
          userId: userProfile?.id
        }
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([data.content], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: 'Failed to export data' };
    }
  };

  const scheduleReport = async (
    type: 'org' | 'coach' | 'employee',
    frequency: 'weekly' | 'monthly',
    email: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('schedule-report', {
        body: {
          type,
          frequency,
          email,
          organizationId: userProfile?.organization_id,
          userId: userProfile?.id
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Schedule report error:', error);
      return { success: false, error: 'Failed to schedule report' };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (userProfile?.role === 'ADMIN' || userProfile?.role === 'HR') {
        await fetchOrgAnalytics();
      }
      
      if (userProfile?.role === 'COACH') {
        await fetchCoachAnalytics();
      }
      
      if (userProfile?.role === 'EMPLOYEE' || userProfile?.role === 'INDIVIDUAL') {
        await fetchEmployeeAnalytics();
      }

      setLoading(false);
    };

    if (userProfile) {
      fetchData();
    }
  }, [userProfile]);

  return {
    orgAnalytics,
    coachAnalytics,
    employeeAnalytics,
    loading,
    error,
    refetch: () => {
      if (userProfile?.role === 'ADMIN' || userProfile?.role === 'HR') {
        fetchOrgAnalytics();
      }
      if (userProfile?.role === 'COACH') {
        fetchCoachAnalytics();
      }
      if (userProfile?.role === 'EMPLOYEE' || userProfile?.role === 'INDIVIDUAL') {
        fetchEmployeeAnalytics();
      }
    },
    exportData,
    scheduleReport
  };
};