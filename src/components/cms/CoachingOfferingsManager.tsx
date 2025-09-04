import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Edit, 
  Clock, 
  CreditCard,
  Users,
  Archive,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CoachingOffering {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  credits_needed: number;
  price: number;
  coach_id: string;
  category: string;
  max_participants: number;
  is_active: boolean;
  tags: string[];
  coach?: {
    name: string;
  };
}

interface CoachingOfferingsManagerProps {
  searchTerm: string;
  category: string;
}

export const CoachingOfferingsManager = ({ searchTerm, category }: CoachingOfferingsManagerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [offerings, setOfferings] = useState<CoachingOffering[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<CoachingOffering | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    credits_needed: 1,
    price: 0,
    coach_id: '',
    category: 'general',
    max_participants: 1,
    tags: '',
    is_active: true
  });

  useEffect(() => {
    fetchOfferings();
    fetchCoaches();
  }, []);

  const fetchOfferings = async () => {
    try {
      let query = supabase
        .from('coaching_offerings')
        .select(`
          *,
          coach:users(name)
        `)
        .order('created_at', { ascending: false });

      if (userProfile?.role === 'COACH') {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', userProfile.auth_id)
          .single();
        
        if (userData) {
          query = query.eq('coach_id', userData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setOfferings(data || []);
    } catch (error) {
      console.error('Error fetching coaching offerings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch coaching offerings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'COACH')
        .eq('status', 'ACTIVE');

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const offeringData = {
        ...formData,
        price: formData.price * 100, // Convert to paise
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // If coach role, set their own ID
      if (userProfile?.role === 'COACH' && !offeringData.coach_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', userProfile.auth_id)
          .single();
        
        if (userData) {
          offeringData.coach_id = userData.id;
        }
      }

      if (editingOffering) {
        const { error } = await supabase
          .from('coaching_offerings')
          .update(offeringData)
          .eq('id', editingOffering.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Coaching offering updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('coaching_offerings')
          .insert([offeringData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Coaching offering created successfully'
        });
      }

      setFormData({
        title: '',
        description: '',
        duration_minutes: 60,
        credits_needed: 1,
        price: 0,
        coach_id: '',
        category: 'general',
        max_participants: 1,
        tags: '',
        is_active: true
      });
      setEditingOffering(null);
      setIsCreateDialogOpen(false);
      fetchOfferings();
    } catch (error) {
      console.error('Error saving coaching offering:', error);
      toast({
        title: 'Error',
        description: 'Failed to save coaching offering',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (offering: CoachingOffering) => {
    setEditingOffering(offering);
    setFormData({
      title: offering.title,
      description: offering.description || '',
      duration_minutes: offering.duration_minutes,
      credits_needed: offering.credits_needed,
      price: offering.price ? offering.price / 100 : 0,
      coach_id: offering.coach_id,
      category: offering.category,
      max_participants: offering.max_participants,
      tags: offering.tags.join(', '),
      is_active: offering.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const toggleActive = async (offering: CoachingOffering) => {
    try {
      const { error } = await supabase
        .from('coaching_offerings')
        .update({ is_active: !offering.is_active })
        .eq('id', offering.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Offering ${!offering.is_active ? 'activated' : 'deactivated'}`
      });

      fetchOfferings();
    } catch (error) {
      console.error('Error toggling offering status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update offering status',
        variant: 'destructive'
      });
    }
  };

  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = category === 'all' || offering.category === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading coaching offerings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Coaching Offerings</h2>
          <p className="text-sm text-muted-foreground">
            Manage 1-on-1 and group coaching sessions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Offering
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffering ? 'Edit Coaching Offering' : 'Create New Coaching Offering'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="credits_needed">Credits Needed</Label>
                  <Input
                    id="credits_needed"
                    type="number"
                    value={formData.credits_needed}
                    onChange={(e) => setFormData({...formData, credits_needed: Number(e.target.value)})}
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    min="0"
                    step="0.01"
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

                {userProfile?.role === 'ADMIN' && (
                  <div>
                    <Label htmlFor="coach_id">Coach</Label>
                    <Select value={formData.coach_id} onValueChange={(value) => setFormData({...formData, coach_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="investing">Investing</SelectItem>
                      <SelectItem value="debt">Debt Management</SelectItem>
                      <SelectItem value="tax">Tax Planning</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="assessment, personalized, comprehensive"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingOffering(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOffering ? 'Update' : 'Create'} Offering
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Offerings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOfferings.map((offering) => (
          <Card key={offering.id} className={`${!offering.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{offering.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{offering.category}</Badge>
                    {!offering.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {offering.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{offering.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{offering.credits_needed} credits</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>₹{(offering.price / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max {offering.max_participants}</span>
                </div>
              </div>

              {offering.coach && (
                <div className="flex items-center gap-1 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>{offering.coach.name}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {offering.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {offering.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{offering.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(offering)}
                  className="flex-1 gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={offering.is_active ? "destructive" : "default"}
                  onClick={() => toggleActive(offering)}
                  className="flex-1 gap-1"
                >
                  <Archive className="h-3 w-3" />
                  {offering.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOfferings.length === 0 && (
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No coaching offerings found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || category !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first coaching offering to get started'
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Offering
          </Button>
        </div>
      )}
    </div>
  );
};