import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, Search, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

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

export const SecurityAuditDashboard = () => {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: 'all',
    riskLevel: 'all',
    success: 'all',
    search: ''
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
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

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

      setLogs(filteredData as SecurityAuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'User ID', 'IP Address', 'Success', 'Risk Level', 'Details'],
      ...logs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.event_type,
        log.user_id || '',
        log.ip_address || '',
        log.success ? 'Success' : 'Failed',
        log.risk_level,
        JSON.stringify(log.event_details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    if (eventType.includes('login') || eventType.includes('auth')) {
      return '🔐';
    }
    if (eventType.includes('role') || eventType.includes('permission')) {
      return '👤';
    }
    if (eventType.includes('data') || eventType.includes('access')) {
      return '📊';
    }
    if (eventType.includes('consent')) {
      return '✅';
    }
    return '🔍';
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Dashboard
          </CardTitle>
          <CardDescription>
            Monitor security events and audit trail for the entire platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.eventType} onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="login_attempt">Login Attempts</SelectItem>
                <SelectItem value="role_change">Role Changes</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="consent_recorded">Consent Events</SelectItem>
                <SelectItem value="questionnaire_submitted">Questionnaires</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.success} onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportAuditLogs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs found matching your criteria
                </div>
              ) : (
                logs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getEventTypeIcon(log.event_type)}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.event_type}</span>
                            <Badge 
                              variant={getRiskBadgeColor(log.risk_level)}
                              className="text-xs"
                            >
                              {log.risk_level}
                            </Badge>
                            {log.success ? (
                              <Badge variant="secondary" className="text-green-700 bg-green-100">
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                              {log.ip_address && ` • IP: ${log.ip_address}`}
                            </div>
                            {Object.keys(log.event_details).length > 0 && (
                              <div className="mt-2">
                                <details className="cursor-pointer">
                                  <summary className="text-xs font-medium text-primary hover:underline">
                                    View Details
                                  </summary>
                                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.event_details, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {log.risk_level === 'critical' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};