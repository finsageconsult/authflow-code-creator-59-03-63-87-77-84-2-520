import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, User, Calendar, Filter, Search, Paperclip, Download, ExternalLink } from 'lucide-react';

interface SupportQuery {
  id: string;
  user_id: string;
  role: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  attachment_url?: string;
  users?: {
    name: string;
    email: string;
  };
}

export const AdminSupportManager = () => {
  const { toast } = useToast();
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQueries();
    setupRealtimeSubscription();
  }, []);

  const fetchQueries = async () => {
    try {
      // First try to fetch queries, then join with user data
      const { data: queriesData, error } = await supabase
        .from('support_queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user data separately to avoid join issues
      if (queriesData?.length) {
        const userIds = queriesData.map(q => q.user_id);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds);

        // Combine the data
        const queriesWithUsers = queriesData.map(query => ({
          ...query,
          users: usersData?.find(user => user.id === query.user_id) || null
        }));

        setQueries(queriesWithUsers);
      } else {
        setQueries([]);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: "Error",
        description: "Failed to load support queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-support-queries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_queries'
        },
        () => {
          fetchQueries(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleViewAttachment = async (attachmentUrl: string) => {
    try {
      const { data } = await supabase.storage
        .from('support-attachments')
        .createSignedUrl(attachmentUrl, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Failed to generate download link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "Error", 
        description: "Failed to access attachment",
        variant: "destructive",
      });
    }
  };

  const updateQueryStatus = async (queryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_queries')
        .update({ status: newStatus })
        .eq('id', queryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Query marked as ${newStatus}`,
      });

      fetchQueries();
    } catch (error) {
      console.error('Error updating query status:', error);
      toast({
        title: "Error",
        description: "Failed to update query status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: User },
      declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: User },
      solved: { label: 'Solved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.users?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || query.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return <div>Loading support queries...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Support Management</h2>
        <p className="text-muted-foreground">Manage and respond to user support queries</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="COACH">Coach</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Queries ({filteredQueries.length})</CardTitle>
          <CardDescription>
            Manage user support requests and track their resolution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQueries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No support queries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{query.users?.name}</div>
                          <div className="text-sm text-muted-foreground">{query.users?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{query.role}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {query.title}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {query.description}
                      </TableCell>
                      <TableCell>
                        {query.attachment_url ? (
                          <button
                            onClick={() => handleViewAttachment(query.attachment_url!)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                          >
                            <Paperclip className="w-3 h-3" />
                            View Attachment
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No attachment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(query.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(query.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {query.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQueryStatus(query.id, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQueryStatus(query.id, 'declined')}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {(query.status === 'accepted' || query.status === 'declined') && (
                            <Button
                              size="sm"
                              onClick={() => updateQueryStatus(query.id, 'solved')}
                            >
                              Mark Solved
                            </Button>
                          )}
                          {query.status === 'solved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQueryStatus(query.id, 'pending')}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};