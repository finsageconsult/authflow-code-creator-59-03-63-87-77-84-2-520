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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { usePayouts } from '@/hooks/usePayouts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PayoutGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Coach {
  id: string;
  name: string;
  email: string;
}

export const PayoutGenerationDialog: React.FC<PayoutGenerationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { calculateCoachPayout, generatePayout, formatCurrency } = usePayouts();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCoaches();
      // Set default period to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setPeriodStart(startOfMonth.toISOString().split('T')[0]);
      setPeriodEnd(endOfMonth.toISOString().split('T')[0]);
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

  const handlePreview = async () => {
    if (!selectedCoach || !periodStart || !periodEnd) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await calculateCoachPayout(selectedCoach, periodStart, periodEnd);
      setPreview(result);
    } catch (error) {
      console.error('Error calculating preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCoach || !periodStart || !periodEnd) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await generatePayout(selectedCoach, periodStart, periodEnd, taxAmount, notes);
      onOpenChange(false);
      // Reset form
      setSelectedCoach('');
      setPeriodStart('');
      setPeriodEnd('');
      setTaxAmount(0);
      setNotes('');
      setPreview(null);
    } catch (error) {
      console.error('Error generating payout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generate Coach Payout</DialogTitle>
          <DialogDescription>
            Calculate and generate a payout for a coach based on student enrollments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
          {/* Coach Selection */}
          <div className="space-y-2">
            <Label htmlFor="coach">Coach *</Label>
            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger>
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name} ({coach.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period-start">Period Start *</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-end">Period End *</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Preview Button */}
          <Button 
            onClick={handlePreview} 
            disabled={loading || !selectedCoach || !periodStart || !periodEnd}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Preview Payout'}
          </Button>

          {/* Preview Results */}
          {preview && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Payout Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                    <div className="text-2xl font-bold">{preview.total_students}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Gross Amount</div>
                    <div className="text-2xl font-bold">{formatCurrency(preview.gross_amount)}</div>
                  </div>
                </div>
                
                {preview.enrollment_details && preview.enrollment_details.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Student Details:</div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {preview.enrollment_details.map((detail: any, index: number) => (
                        <div key={index} className="text-sm border rounded p-2">
                          <div className="font-medium">{detail.student_name}</div>
                          <div className="text-muted-foreground">
                            {detail.course_title} - {formatCurrency(detail.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Fields */}
          {preview && (
            <>
              <div className="space-y-2">
                <Label htmlFor="tax-amount">Tax Amount (Optional)</Label>
                <Input
                  id="tax-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes for this payout"
                  rows={3}
                />
              </div>

              {/* Final Amount Display */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Net Amount:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(preview.gross_amount - taxAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!preview || loading}
          >
            {loading ? 'Generating...' : 'Generate Payout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};