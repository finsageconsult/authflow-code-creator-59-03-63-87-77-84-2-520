import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Mail, Search, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Coach {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  auth_id?: string;
}

export default function Coaches() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [newCode, setNewCode] = useState({
    email: '',
    expiresIn: '7'
  });

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      fetchCoaches();
    }
  }, [userProfile]);

  const fetchCoaches = async () => {
    try {
      const { data: coachesData, error: coachesError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'COACH')
        .order('created_at', { ascending: false });

      if (coachesError) throw coachesError;
      setCoaches(coachesData || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch coaches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCoachAccessCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(newCode.expiresIn));

      // Use edge function to create access code
      const { data: codeData, error: codeError } = await supabase.functions.invoke('create-access-code', {
        body: {
          code,
          organization_id: null, // Coaches are not tied to organizations
          role: 'COACH',
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          email: newCode.email
        }
      });

      if (codeError) throw codeError;

      // Send email via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-access-code', {
        body: {
          email: newCode.email,
          code,
          role: 'COACH',
          organizationName: null,
          expiresAt: expiresAt.toISOString()
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast({
          title: 'Warning',
          description: 'Access code created but email failed to send.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Coach access code created and email sent successfully'
        });
      }

      setShowCreateCodeDialog(false);
      setNewCode({ email: '', expiresIn: '7' });
    } catch (error) {
      console.error('Error creating coach access code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coach access code',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCoaches = coaches.filter(coach =>
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userProfile?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Management</h1>
          <p className="text-muted-foreground">Manage coaches and create access codes</p>
        </div>
        <Button onClick={() => setShowCreateCodeDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Coach Code
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coaches.length}</div>
        </CardContent>
      </Card>

      {/* Search and Coaches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coaches</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell>{coach.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(coach.status)}>
                      {coach.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(coach.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Access Code Dialog */}
      <Dialog open={showCreateCodeDialog} onOpenChange={setShowCreateCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Coach Access Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create an access code for a coach to join the platform. The code will be valid for the selected duration.
            </p>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newCode.email}
                onChange={(e) => setNewCode({ ...newCode, email: e.target.value })}
                placeholder="Enter coach's email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={generateCoachAccessCode} disabled={!newCode.email}>
                <Mail className="h-4 w-4 mr-2" />
                Generate & Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}