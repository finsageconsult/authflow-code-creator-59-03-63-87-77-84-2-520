import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, Mail, Calendar, Building, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
  updated_at: string;
}

type SortField = 'name' | 'email' | 'company' | 'created_at';
type SortDirection = 'asc' | 'desc';

export const DemoRequestsManager = () => {
  const { toast } = useToast();
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchDemoRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        throw error;
      }

      setDemoRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching demo requests:', error);
      toast({
        title: 'Error loading demo requests',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoRequests();
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRequests = demoRequests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.name.toLowerCase().includes(searchLower) ||
      request.email.toLowerCase().includes(searchLower) ||
      (request.company && request.company.toLowerCase().includes(searchLower)) ||
      request.message.toLowerCase().includes(searchLower)
    );
  });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Demo Requests</h2>
            <p className="text-muted-foreground">Manage and review demo requests from potential customers</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading demo requests...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Demo Requests</h2>
          <p className="text-muted-foreground">
            Manage and review demo requests from potential customers
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredRequests.length} total requests
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Demo Requests
          </CardTitle>
          <CardDescription>
            All demo requests submitted through the website form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={fetchDemoRequests}>
                Refresh
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-semibold"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Name
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('email')}
                        className="h-auto p-0 font-semibold"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                        {getSortIcon('email')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('company')}
                        className="h-auto p-0 font-semibold"
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Company
                        {getSortIcon('company')}
                      </Button>
                    </TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-semibold"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Date
                        {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No demo requests match your search.' : 'No demo requests found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${request.email}`}
                            className="text-primary hover:underline"
                          >
                            {request.email}
                          </a>
                        </TableCell>
                        <TableCell>{request.company || '-'}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={request.message}>
                            {request.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(request.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(request.created_at), 'h:mm a')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};