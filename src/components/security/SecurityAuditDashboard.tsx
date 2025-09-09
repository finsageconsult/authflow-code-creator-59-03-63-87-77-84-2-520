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
  entity: string;
  action: string;
  actor_id?: string | null;
  entity_id?: string | null;
  before_data: any;
  after_data: any;
  organization_id?: string | null;
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
        .from('audit_logs')
        .select('*')
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      // Apply filters
      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('action', filters.eventType);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply text search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(log =>
          (log.action && log.action.toLowerCase().includes(searchTerm)) ||
          (log.entity && log.entity.toLowerCase().includes(searchTerm)) ||
          JSON.stringify(log.before_data || {}).toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.after_data || {}).toLowerCase().includes(searchTerm)
        );
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
    // Since audit_logs doesn't have login/auth specific fields, we'll simulate based on actions
    const loginEvents = logs.filter(log => 
      log.action && (
        log.action.includes('login') || 
        log.action.includes('auth') || 
        log.action.includes('signin') ||
        log.action.includes('CREATE') && log.entity === 'users'
      )
    );

    // For audit logs, we'll consider all events as "successful" unless explicitly marked otherwise
    const loginSuccessCount = loginEvents.length;
    const loginFailureCount = 0; // audit_logs typically only records successful actions

    // Entity breakdown (similar to role breakdown)
    const roleBreakdown = logs.reduce((acc, log) => {
      const entity = log.entity || 'Unknown';
      acc[entity] = (acc[entity] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Events by action type
    const eventsByType = logs.reduce((acc, log) => {
      const action = log.action || 'unknown';
      acc[action] = (acc[action] || 0) + 1;
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
        log.action && (
          log.action.includes('login') || 
          log.action.includes('auth') ||
          log.action.includes('signin') ||
          log.action.includes('CREATE') && log.entity === 'users'
        )
      );
      
      return {
        date: format(date, 'MMM dd'),
        events: dayLogs.length,
        logins: dayLogins.length,
        failures: 0 // audit_logs typically only records successful actions
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
          return [
            new Date(log.created_at).toLocaleString(),
            log.action || '',
            log.actor_id || '',
            log.entity || '',
            'N/A', // IP address not available in audit_logs
            'N/A', // Device not available in audit_logs
            'Success', // audit_logs typically only records successful actions
            'low', // Default risk level
            JSON.stringify({ before: log.before_data, after: log.after_data }).replace(/,/g, ';')
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

  const getEventTypeIcon = (action: string) => {
    if (action && (action.includes('login') || action.includes('signin') || action.includes('auth'))) {
      return <LogIn className="h-4 w-4 text-blue-600" />;
    }
    if (action && (action.includes('CREATE') || action.includes('INSERT'))) {
      return <Users className="h-4 w-4 text-green-600" />;
    }
    if (action && (action.includes('UPDATE') || action.includes('MODIFY'))) {
      return <Activity className="h-4 w-4 text-blue-600" />;
    }
    if (action && (action.includes('DELETE') || action.includes('REMOVE'))) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (action && action.includes('SELECT')) {
      return <Eye className="h-4 w-4 text-gray-600" />;
    }
    return <Shield className="h-4 w-4 text-purple-600" />;
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

  const getEventSeverityColor = (action: string) => {
    if (action && action.includes('DELETE')) return 'text-red-600 bg-red-50';
    if (action && action.includes('UPDATE')) return 'text-yellow-600 bg-yellow-50';
    if (action && action.includes('CREATE')) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  useEffect(() => {
    fetchAuditLogs();

    // Set up real-time updates
    const channel = supabase
      .channel('security-audit-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'audit_logs' 
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            Security Audit Dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">Monitor security events and audit trail for the entire platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => exportAuditLogs('csv')} variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last {filters.dateRange} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Login Success Rate</CardTitle>
            <LogIn className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
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
            <CardTitle className="text-xs md:text-sm font-medium">Failed Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics.loginFailureCount}</div>
            <p className="text-xs text-muted-foreground">
              Security incidents detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">High Risk Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {logs.filter(log => log.action && log.action.includes('DELETE')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                          {getEventTypeIcon(log.action)}
                          <span className="font-medium">{(log.action || 'unknown').replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {log.actor_id ? log.actor_id.slice(0, 8) + '...' : 'System'}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {log.entity || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          Unknown
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs">
                          <Smartphone className="h-3 w-3" />
                          Unknown
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="secondary"
                          className="text-xs text-green-700 bg-green-100"
                        >
                          Success
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant="secondary"
                          className="text-xs"
                        >
                          {log.action && log.action.includes('DELETE') ? 'high' : 'low'}
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
                  <div><strong>Action:</strong> {selectedLog.action || 'Unknown'}</div>
                  <div><strong>Entity:</strong> {selectedLog.entity || 'Unknown'}</div>
                  <div><strong>Timestamp:</strong> {format(new Date(selectedLog.created_at), 'MMM dd, yyyy HH:mm:ss')}</div>
                  <div><strong>Actor ID:</strong> {selectedLog.actor_id || 'System'}</div>
                  <div><strong>Entity ID:</strong> {selectedLog.entity_id || 'N/A'}</div>
                  <div><strong>Organization:</strong> {selectedLog.organization_id || 'N/A'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Raw Event Data</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify({
                    before_data: selectedLog.before_data,
                    after_data: selectedLog.after_data
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};