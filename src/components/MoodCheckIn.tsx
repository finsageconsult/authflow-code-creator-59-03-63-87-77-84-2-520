import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, TrendingUp, AlertCircle, DollarSign, Home, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const financialConcerns = [
  { id: 'debt', label: 'Debt Management', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'savings', label: 'Emergency Savings', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'retirement', label: 'Retirement Planning', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'housing', label: 'Housing Costs', icon: <Home className="h-4 w-4" /> },
  { id: 'job', label: 'Job Security', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'healthcare', label: 'Healthcare Expenses', icon: <Heart className="h-4 w-4" /> },
];

interface MoodCheckInProps {
  onComplete?: () => void;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({ onComplete }) => {
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    confidenceLevel: [5],
    stressLevel: [5],
    selectedConcerns: [] as string[],
    notes: '',
  });

  const handleConcernToggle = (concernId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedConcerns: prev.selectedConcerns.includes(concernId)
        ? prev.selectedConcerns.filter(id => id !== concernId)
        : [...prev.selectedConcerns, concernId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('mood_check_ins')
        .insert({
          user_id: userProfile.id,
          confidence_level: formData.confidenceLevel[0],
          stress_level: formData.stressLevel[0],
          financial_concerns: formData.selectedConcerns,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast.success('Thank you for checking in! Your response has been recorded.');
      
      // Reset form
      setFormData({
        confidenceLevel: [5],
        stressLevel: [5],
        selectedConcerns: [],
        notes: '',
      });

      onComplete?.();
    } catch (error) {
      console.error('Error submitting mood check-in:', error);
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Money Mood Check
        </CardTitle>
        <p className="text-muted-foreground">
          How are you feeling about your finances today? Your responses help us provide better support.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Financial Confidence Level */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              How confident do you feel about your financial situation?
            </Label>
            <div className="space-y-3">
              <Slider
                value={formData.confidenceLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, confidenceLevel: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not confident (1)</span>
                <span className="font-medium text-primary">
                  {formData.confidenceLevel[0]}
                </span>
                <span>Very confident (10)</span>
              </div>
            </div>
          </div>

          {/* Financial Stress Level */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              How stressed do you feel about money?
            </Label>
            <div className="space-y-3">
              <Slider
                value={formData.stressLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stressLevel: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not stressed (1)</span>
                <span className="font-medium text-primary">
                  {formData.stressLevel[0]}
                </span>
                <span>Very stressed (10)</span>
              </div>
            </div>
          </div>

          {/* Financial Concerns */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              What financial areas concern you most? (Select all that apply)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {financialConcerns.map((concern) => (
                <div key={concern.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={concern.id}
                    checked={formData.selectedConcerns.includes(concern.id)}
                    onCheckedChange={() => handleConcernToggle(concern.id)}
                  />
                  <Label
                    htmlFor={concern.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    {concern.icon}
                    {concern.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <Label htmlFor="notes" className="text-base font-semibold">
              Any additional thoughts or concerns? (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Share anything else that's on your mind about your financial situation..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Submit Check-In
                </>
              )}
            </Button>
          </div>

          {/* Privacy Note */}
          <div className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
            <p>
              🔒 Your responses are confidential and used only to improve our services and provide you with personalized support.
              Individual responses are not shared with your employer - only aggregated, anonymized insights.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};