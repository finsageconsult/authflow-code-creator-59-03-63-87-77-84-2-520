import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Edit, 
  Calendar, 
  Clock, 
  Users,
  Video,
  CreditCard,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Webinar {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  credits_required: number;
  instructor_name: string;
  instructor_bio?: string;
  meeting_link?: string;
  recording_link?: string;
  status: string;
  tags: string[];
  organization_id: string;
  created_by: string;
}

interface WebinarManagerProps {
  searchTerm: string;
  category: string;
}

export const WebinarManager = ({ searchTerm, category }: WebinarManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    duration_minutes: 60,
    max_participants: 100,
    credits_required: 2,
    instructor_name: '',
    instructor_bio: '',
    meeting_link: '',
    tags: '',
    organization_id: ''
  });

  useEffect(() => {
    fetchWebinars();
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchWebinars = async () => {
    try {
      let query = supabase
        .from('webinars')
        .select('*')
        .order('scheduled_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setWebinars(data || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch webinars',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get current user's data and role
      const { data: userData } = await supabase
        .from('users')
        .select('id, organization_id, role')
        .eq('auth_id', userProfile?.auth_id)
        .single();

      if (!userData) {
        toast({
          title: 'Error',
          description: 'User data not found',
          variant: 'destructive'
        });
        return;
      }

      // For admin users, allow creating global content or assign to a default organization
      let organizationId = userData.organization_id;
      
      if (!organizationId && userData.role === 'ADMIN') {
        // For admin users without organization, try to get the first available organization
        const { data: defaultOrg } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .single();
        
        if (defaultOrg) {
          organizationId = defaultOrg.id;
          
          // Optionally update the admin user with this organization for future use
          await supabase
            .from('users')
            .update({ organization_id: defaultOrg.id })
            .eq('id', userData.id);
            
          toast({
            title: 'Info',
            description: 'Admin user assigned to default organization',
            variant: 'default'
          });
        }
      }

      if (!organizationId && userData.role !== 'ADMIN') {
        toast({
          title: 'Error',
          description: 'No organization found for current user',
          variant: 'destructive'
        });
        return;
      }

      // Use selected organization or fallback to user's organization
      const finalOrganizationId = formData.organization_id || organizationId;
      
      if (!finalOrganizationId) {
        toast({
          title: 'Error',
          description: 'Please select an organization for this webinar',
          variant: 'destructive'
        });
        return;
      }

      const webinarData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        organization_id: finalOrganizationId,
        created_by: userData.id,
        status: 'scheduled'
      };

      if (editingWebinar) {
        const { error } = await supabase
          .from('webinars')
          .update(webinarData)
          .eq('id', editingWebinar.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Webinar updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('webinars')
          .insert([webinarData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Webinar created successfully'
        });
      }

      setFormData({
        title: '',
        description: '',
        scheduled_date: '',
        duration_minutes: 60,
        max_participants: 100,
        credits_required: 2,
        instructor_name: '',
        instructor_bio: '',
        meeting_link: '',
        tags: '',
        organization_id: ''
      });
      setEditingWebinar(null);
      setIsCreateDialogOpen(false);
      fetchWebinars();
    } catch (error) {
      console.error('Error saving webinar:', error);
      toast({
        title: 'Error',
        description: 'Failed to save webinar',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (webinar: Webinar) => {
    setEditingWebinar(webinar);
    setFormData({
      title: webinar.title,
      description: webinar.description || '',
      scheduled_date: new Date(webinar.scheduled_date).toISOString().slice(0, 16),
      duration_minutes: webinar.duration_minutes || 60,
      max_participants: webinar.max_participants || 100,
      credits_required: webinar.credits_required || 2,
      instructor_name: webinar.instructor_name || '',
      instructor_bio: webinar.instructor_bio || '',
      meeting_link: webinar.meeting_link || '',
      tags: webinar.tags.join(', '),
      organization_id: webinar.organization_id
    });
    setIsCreateDialogOpen(true);
  };

  const updateStatus = async (webinar: Webinar, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('webinars')
        .update({ status: newStatus })
        .eq('id', webinar.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Webinar status updated to ${newStatus}`
      });

      fetchWebinars();
    } catch (error) {
      console.error('Error updating webinar status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update webinar status',
        variant: 'destructive'
      });
    }
  };

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading webinars...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Webinars</h2>
          <p className="text-sm text-muted-foreground">
            Manage live and recorded webinar sessions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Webinar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWebinar ? 'Edit Webinar' : 'Create New Webinar'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label htmlFor="organization" className="text-blue-900 font-semibold text-base">Target Organization *</Label>
                  <p className="text-sm text-blue-700 mb-3 mt-1">Select which organization's HR and employees will see this webinar in their menu</p>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => setFormData({...formData, organization_id: value})}
                  >
                    <SelectTrigger className="border-blue-300 focus:border-blue-500">
                      <SelectValue placeholder="Choose organization to receive this webinar" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{org.name}</span>
                            <span className="text-xs text-muted-foreground">ID: {org.id.slice(0, 8)}...</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date & Time *</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                    min="15"
                    step="15"
                  />
                </div>

                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: Number(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="credits_required">Credits Required</Label>
                  <Input
                    id="credits_required"
                    type="number"
                    value={formData.credits_required}
                    onChange={(e) => setFormData({...formData, credits_required: Number(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="instructor_name">Instructor Name *</Label>
                  <Input
                    id="instructor_name"
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({...formData, instructor_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                    placeholder="https://zoom.us/..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="instructor_bio">Instructor Bio</Label>
                  <Textarea
                    id="instructor_bio"
                    value={formData.instructor_bio}
                    onChange={(e) => setFormData({...formData, instructor_bio: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="investing, market analysis, beginner"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingWebinar(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingWebinar ? 'Update' : 'Create'} Webinar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webinars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWebinars.map((webinar) => (
          <Card key={webinar.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                   <CardTitle className="text-lg leading-tight">{webinar.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(webinar.status)}>
                      {webinar.status}
                    </Badge>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-medium text-blue-900">
                      Organization: {organizations.find(org => org.id === webinar.organization_id)?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Target audience for this webinar
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {webinar.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(webinar.scheduled_date).toLocaleDateString()} at {new Date(webinar.scheduled_date).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{webinar.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{webinar.current_participants}/{webinar.max_participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{webinar.credits_required} credits</span>
                </div>
              </div>

              {webinar.instructor_name && (
                <div className="text-sm">
                  <span className="font-medium">Instructor:</span> {webinar.instructor_name}
                </div>
              )}

              <div className="mt-3 p-3 bg-gray-50 rounded border">
                <div className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">
                  Organization Details
                </div>
                <div className="text-sm text-gray-900">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Target:</span>
                    <span>{organizations.find(org => org.id === webinar.organization_id)?.name || 'Unknown Organization'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium">Audience:</span>
                    <span className="text-xs text-gray-600">HR & Employees</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {webinar.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {webinar.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{webinar.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(webinar)}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                {webinar.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(webinar, 'cancelled')}
                    className="flex-1 gap-1"
                  >
                    <Archive className="h-3 w-3" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWebinars.length === 0 && (
        <div className="text-center py-8">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No webinars found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search term'
              : 'Create your first webinar to get started'
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Webinar
          </Button>
        </div>
      )}
    </div>
  );
};