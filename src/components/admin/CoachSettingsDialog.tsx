import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePayouts } from '@/hooks/usePayouts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Plus, DollarSign } from 'lucide-react';

interface CoachSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Coach {
  id: string;
  name: string;
  email: string;
}

export const CoachSettingsDialog: React.FC<CoachSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { coachSettings, createOrUpdateCoachSettings, formatCurrency } = usePayouts();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [editingCoach, setEditingCoach] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paymentRate: 0,
    currency: 'INR',
    bankDetails: '',
    taxDetails: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCoaches();
    }
  }, [open]);

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'COACH')
        .eq('status', 'ACTIVE')
        .order('name');

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      toast.error('Failed to fetch coaches');
    }
  };

  const getCoachSettings = (coachId: string) => {
    return coachSettings.find(s => s.coach_id === coachId);
  };

  const handleEditCoach = (coachId: string) => {
    const settings = getCoachSettings(coachId);
    if (settings) {
      setFormData({
        paymentRate: settings.payment_rate_per_student,
        currency: settings.payment_currency,
        bankDetails: typeof settings.bank_details === 'object' 
          ? JSON.stringify(settings.bank_details, null, 2) 
          : settings.bank_details || '',
        taxDetails: typeof settings.tax_details === 'object' 
          ? JSON.stringify(settings.tax_details, null, 2) 
          : settings.tax_details || '',
        isActive: settings.is_active
      });
    } else {
      setFormData({
        paymentRate: 0,
        currency: 'INR',
        bankDetails: '',
        taxDetails: '',
        isActive: true
      });
    }
    setEditingCoach(coachId);
  };

  const handleSave = async () => {
    if (!editingCoach) return;

    try {
      setLoading(true);
      
      let bankDetails = {};
      let taxDetails = {};

      // Parse JSON strings
      try {
        if (formData.bankDetails) {
          bankDetails = JSON.parse(formData.bankDetails);
        }
      } catch (e) {
        // If not valid JSON, treat as plain text
        bankDetails = { details: formData.bankDetails };
      }

      try {
        if (formData.taxDetails) {
          taxDetails = JSON.parse(formData.taxDetails);
        }
      } catch (e) {
        // If not valid JSON, treat as plain text
        taxDetails = { details: formData.taxDetails };
      }

      await createOrUpdateCoachSettings(editingCoach, {
        payment_rate_per_student: formData.paymentRate,
        payment_currency: formData.currency,
        bank_details: bankDetails,
        tax_details: taxDetails,
        is_active: formData.isActive
      });

      setEditingCoach(null);
    } catch (error) {
      console.error('Error saving coach settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingCoach(null);
    setFormData({
      paymentRate: 0,
      currency: 'INR',
      bankDetails: '',
      taxDetails: '',
      isActive: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Coach Payout Settings</DialogTitle>
          <DialogDescription>
            Configure payment rates and settings for coaches
          </DialogDescription>
        </DialogHeader>

        {editingCoach ? (
          // Edit Form
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Editing: {coaches.find(c => c.id === editingCoach)?.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-rate">Payment Rate per Student *</Label>
                <Input
                  id="payment-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paymentRate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    paymentRate: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-details">Bank Details (JSON format)</Label>
              <Textarea
                id="bank-details"
                value={formData.bankDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, bankDetails: e.target.value }))}
                placeholder='{"account_number": "123456789", "bank_name": "Example Bank", "ifsc": "EXAM0001234"}'
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-details">Tax Details (JSON format)</Label>
              <Textarea
                id="tax-details"
                value={formData.taxDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, taxDetails: e.target.value }))}
                placeholder='{"pan": "ABCDE1234F", "gst": "29ABCDE1234F1Z5"}'
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        ) : (
          // Coaches List
          <div className="space-y-4">
            <div className="grid gap-4">
              {coaches.map((coach) => {
                const settings = getCoachSettings(coach.id);
                return (
                  <Card key={coach.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{coach.name}</h3>
                            {settings ? (
                              <Badge variant={settings.is_active ? "default" : "secondary"}>
                                {settings.is_active ? "Active" : "Inactive"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Configured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{coach.email}</p>
                          
                          {settings && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(settings.payment_rate_per_student)} per student</span>
                              </div>
                              <span className="text-muted-foreground">
                                Currency: {settings.payment_currency}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCoach(coach.id)}
                          className="gap-2"
                        >
                          {settings ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {settings ? 'Edit' : 'Configure'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {coaches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No coaches found. Make sure coaches are added to the system first.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};