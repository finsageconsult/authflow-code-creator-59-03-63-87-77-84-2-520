import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
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
  avatar_url?: string;
  specialties?: string[];
}

export default function CoachProfile() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coachId && userProfile?.role === 'ADMIN') {
      fetchCoach();
    }
  }, [coachId, userProfile]);

  const fetchCoach = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', coachId)
        .eq('role', 'COACH')
        .single();

      if (error) throw error;
      
      if (data) {
        setCoach(data);
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error('Error fetching coach:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch coach details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const saveSpecialties = async () => {
    if (!coach) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ specialties })
        .eq('id', coach.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Specialties updated successfully'
      });
    } catch (error) {
      console.error('Error updating specialties:', error);
      toast({
        title: 'Error',
        description: 'Failed to update specialties',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

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

  if (!coach) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/admin-dashboard?tab=coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coaches
        </Button>
        <h1 className="text-3xl font-bold">Coach Profile</h1>
      </div>

      {/* Coach Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coach.avatar_url} alt={coach.name} />
              <AvatarFallback className="text-lg">
                {coach.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{coach.name}</h2>
              <p className="text-muted-foreground">{coach.email}</p>
              <Badge className={coach.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {coach.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Joined: {new Date(coach.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Specialties Management */}
      <Card>
        <CardHeader>
          <CardTitle>Specialties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Specialties */}
          <div className="space-y-2">
            <Label>Current Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge 
                  key={specialty} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {specialty}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSpecialty(specialty)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {specialties.length === 0 && (
                <p className="text-muted-foreground text-sm">No specialties added yet</p>
              )}
            </div>
          </div>

          {/* Add New Specialty */}
          <div className="space-y-2">
            <Label>Add New Specialty</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Enter specialty (e.g., Financial Planning, Investment Strategy)"
                onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
              />
              <Button onClick={addSpecialty} disabled={!newSpecialty.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={saveSpecialties} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Specialties'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}