import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Download, 
  Filter,
  Activity,
  Users,
  LogIn,
  AlertCircle,
  Eye,
  Calendar,
  Globe,
  Smartphone
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SecurityAuditLog {
  id: string;
  event_type: string;
  user_id?: string | null;
  target_user_id?: string | null;
  event_details: any;
  ip_address?: string | null;
  user_agent?: string | null;
  success: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

interface SecurityMetrics {
  totalEvents: number;
  loginSuccessCount: number;
  loginFailureCount: number;
  roleBreakdown: { [key: string]: number };
  eventsByType: { [key: string]: number };
  dailyTrend: Array<{ date: string; events: number; logins: number; failures: number }>;
}

export const SecurityAuditDashboard = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);
  const [filters, setFilters] = useState({
    eventType: 'all',
    userRole: 'all',
    riskLevel: 'all',
    success: 'all',
    search: '',
    dateRange: '7d',
    ipAddress: ''
  });

  // Only admins can access security audit logs
  if (userProfile?.role !== 'ADMIN') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      // Calculate date filter
      let dateFilter = new Date();
      switch (filters.dateRange) {
        case '1d': dateFilter = subDays(new Date(), 1); break;
        case '7d': dateFilter = subDays(new Date(), 7); break;
        case '30d': dateFilter = subDays(new Date(), 30); break;
        case '90d': dateFilter = subDays(new Date(), 90); break;
        default: dateFilter = subDays(new Date(), 7);
      }

      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      // Apply filters
      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        query = query.eq('risk_level', filters.riskLevel);
      }
      if (filters.success !== 'all') {
        query = query.eq('success', filters.success === 'true');
      }
      if (filters.ipAddress) {
        query = query.eq('ip_address', filters.ipAddress);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply text search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(log =>
          log.event_type.toLowerCase().includes(searchTerm) ||
          (log.ip_address && log.ip_address.toString().toLowerCase().includes(searchTerm)) ||
          JSON.stringify(log.event_details).toLowerCase().includes(searchTerm)
        );
      }

      // Apply user role filter if needed
      if (filters.userRole !== 'all') {
        filteredData = filteredData.filter(log => {
          const details = log.event_details as any;
          return details?.user_role === filters.userRole ||
                 details?.role === filters.userRole;
        });
      }

      setLogs(filteredData as SecurityAuditLog[]);

      // Calculate metrics
      calculateMetrics(filteredData as SecurityAuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch security audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (logs: SecurityAuditLog[]) => {
    const loginEvents = logs.filter(log => 
      log.event_type.includes('login') || 
      log.event_type.includes('auth') || 
      log.event_type.includes('signin')
    );

    const loginSuccessCount = loginEvents.filter(log => log.success).length;
    const loginFailureCount = loginEvents.filter(log => !log.success).length;

    // Role breakdown from event details
    const roleBreakdown = logs.reduce((acc, log) => {
      const details = log.event_details as any;
      const role = details?.user_role || details?.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Events by type
    const eventsByType = logs.reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Daily trend for the last 7 days
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate.toDateString() === date.toDateString();
      });
      
      const dayLogins = dayLogs.filter(log => 
        log.event_type.includes('login') || 
        log.event_type.includes('auth') ||
        log.event_type.includes('signin')
      );
      
      return {
        date: format(date, 'MMM dd'),
        events: dayLogs.length,
        logins: dayLogins.filter(log => log.success).length,
        failures: dayLogins.filter(log => !log.success).length
      };
    });

    setMetrics({
      totalEvents: logs.length,
      loginSuccessCount,
      loginFailureCount,
      roleBreakdown,
      eventsByType,
      dailyTrend
    });
  };

  const exportAuditLogs = (format: 'csv' | 'pdf' = 'csv') => {
    if (format === 'csv') {
      const csvContent = [
        ['Timestamp', 'Event Type', 'User ID', 'User Role', 'IP Address', 'Device', 'Success', 'Risk Level', 'Details'],
        ...logs.map(log => {
          const details = log.event_details as any;
          return [
            new Date(log.created_at).toLocaleString(),
            log.event_type,
            log.user_id || '',
            details?.user_role || details?.role || '',
            log.ip_address || '',
            getDeviceInfo(log.user_agent),
            log.success ? 'Success' : 'Failed',
            log.risk_level,
            JSON.stringify(log.event_details).replace(/,/g, ';')
          ];
        })
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const currentDate = new Date();
      a.download = `security-audit-${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Security audit logs exported successfully'
      });
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('signin') || eventType.includes('auth')) {
      return <LogIn className="h-4 w-4 text-blue-600" />;
    }
    if (eventType.includes('role') || eventType.includes('permission')) {
      return <Users className="h-4 w-4 text-purple-600" />;
    }
    if (eventType.includes('data') || eventType.includes('access') || eventType.includes('delete')) {
      return <Activity className="h-4 w-4 text-orange-600" />;
    }
    if (eventType.includes('consent') || eventType.includes('questionnaire')) {
      return <Shield className="h-4 w-4 text-green-600" />;
    }
    if (eventType.includes('password') || eventType.includes('reset')) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Eye className="h-4 w-4 text-gray-600" />;
  };

  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile';
    }
    if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      return 'Tablet';  
    }
    return 'Desktop';
  };

  const getEventSeverityColor = (eventType: string, success: boolean, riskLevel: string) => {
    if (riskLevel === 'critical') return 'text-red-600 bg-red-50';
    if (riskLevel === 'high') return 'text-red-500 bg-red-50';
    if (!success) return 'text-orange-600 bg-orange-50';
    if (riskLevel === 'medium') return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  useEffect(() => {
    fetchAuditLogs();

    // Set up real-time updates
    const channel = supabase
      .channel('security-audit-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'security_audit_logs' 
      }, () => {
        fetchAuditLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading security audit data...</p>
        </div>
      </div>
    );
  }

  const loginChartData = [
    { name: 'Success', value: metrics.loginSuccessCount, color: 'hsl(var(--primary))' },
    { name: 'Failed', value: metrics.loginFailureCount, color: 'hsl(var(--destructive))' }
  ];

  const roleChartData = Object.entries(metrics.roleBreakdown).map(([role, count]) => ({
    name: role || 'Unknown',
    value: count
  }));

  const eventTypeChartData = Object.entries(metrics.eventsByType)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      value: count
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Audit Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor security events and audit trail for the entire platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => exportAuditLogs('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last {filters.dateRange} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Success Rate</CardTitle>
            <LogIn className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.loginSuccessCount + metrics.loginFailureCount > 0 
                ? ((metrics.loginSuccessCount / (metrics.loginSuccessCount + metrics.loginFailureCount)) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.loginSuccessCount} successful logins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loginFailureCount}</div>
            <p className="text-xs text-muted-foreground">
              Security incidents detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(log => log.risk_level === 'high' || log.risk_level === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loginChartData.some(item => item.value > 0) ? (
          <AnalyticsChart
            title="Login Success vs Failed"
            description="Authentication attempts breakdown"
            type="pie"
            data={loginChartData}
            dataKey="value"
            xAxisKey="name"
            showLegend
            colors={['hsl(var(--primary))', 'hsl(var(--destructive))']}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Login Success vs Failed</CardTitle>
              <CardDescription>Authentication attempts breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">No login events found</p>
            </CardContent>
          </Card>
        )}

        <AnalyticsChart
          title="Security Events Trend"
          description="Daily security activity"
          type="line"
          data={metrics.dailyTrend}
          dataKey="events"
          xAxisKey="date"
          color="hsl(var(--primary))"
        />

        {roleChartData.length > 0 ? (
          <AnalyticsChart
            title="Activity by User Role"
            description="Security events by user type"
            type="bar"
            data={roleChartData}
            dataKey="value"
            xAxisKey="name"
            color="hsl(var(--accent))"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Activity by User Role</CardTitle>
              <CardDescription>Security events by user type</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">No role data available</p>
            </CardContent>
          </Card>
        )}

        {eventTypeChartData.length > 0 ? (
          <AnalyticsChart
            title="Top Security Events"
            description="Most frequent event types"
            type="bar"
            data={eventTypeChartData}
            dataKey="value"
            xAxisKey="name"
            color="hsl(var(--secondary))"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Security Events</CardTitle>
              <CardDescription>Most frequent event types</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground">No events data available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.eventType} onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="login_attempt">Login Attempts</SelectItem>
                <SelectItem value="signin_success">Sign In Success</SelectItem>
                <SelectItem value="signin_failed">Sign In Failed</SelectItem>
                <SelectItem value="role_change">Role Changes</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
                <SelectItem value="data_deletion">Data Deletion</SelectItem>
                <SelectItem value="account_lock">Account Lock</SelectItem>
                <SelectItem value="consent_recorded">Consent Events</SelectItem>
                <SelectItem value="questionnaire_submitted">Questionnaires</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.userRole} onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="COACH">Coach</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="IP Address"
              value={filters.ipAddress}
              onChange={(e) => setFilters(prev => ({ ...prev, ipAddress: e.target.value }))}
            />

            <Select value={filters.success} onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Security Audit Trail
          </CardTitle>
          <CardDescription>
            Detailed log of all security events and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Security Events Found</h3>
              <p className="text-muted-foreground">
                No security events recorded yet. Events will appear here as users interact with the system.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Event</th>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">IP Address</th>
                    <th className="text-left p-3 font-medium">Device</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Severity</th>
                    <th className="text-left p-3 font-medium">Timestamp</th>
                    <th className="text-left p-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(log.event_type)}
                          <span className="font-medium">{log.event_type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const details = log.event_details as any;
                            return details?.user_role || details?.role || 'Unknown';
                          })()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          {log.ip_address || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Smartphone className="h-3 w-3" />
                          {getDeviceInfo(log.user_agent)}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={log.success ? "secondary" : "destructive"}
                          className={`text-xs ${log.success ? 'text-green-700 bg-green-100' : ''}`}
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={getRiskBadgeColor(log.risk_level)}
                          className="text-xs"
                        >
                          {log.risk_level}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Event Information</h4>
                <div className="bg-muted p-3 rounded text-sm">
                  <div><strong>Type:</strong> {selectedLog.event_type}</div>
                  <div><strong>Timestamp:</strong> {format(new Date(selectedLog.created_at), 'MMM dd, yyyy HH:mm:ss')}</div>
                  <div><strong>Success:</strong> {selectedLog.success ? 'Yes' : 'No'}</div>
                  <div><strong>Risk Level:</strong> {selectedLog.risk_level}</div>
                  <div><strong>IP Address:</strong> {selectedLog.ip_address || 'Unknown'}</div>
                  <div><strong>User Agent:</strong> {selectedLog.user_agent || 'Unknown'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Raw Event Data</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.event_details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};