import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ReportSchedulerProps {
  reportType: 'org' | 'coach' | 'employee';
  title: string;
}

export const ReportScheduler = ({ reportType, title }: ReportSchedulerProps) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [isScheduling, setIsScheduling] = useState(false);
  const { scheduleReport } = useAnalytics();
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address for the reports',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);
    
    try {
      const result = await scheduleReport(reportType, frequency, email);
      
      if (result.success) {
        toast({
          title: 'Report Scheduled',
          description: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} ${reportType} reports will be sent to ${email}`,
        });
        setEmail('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Scheduling Failed',
        description: error instanceof Error ? error.message : 'Failed to schedule report',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Schedule {title} Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email for reports"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Report Frequency</Label>
          <Select value={frequency} onValueChange={(value: 'weekly' | 'monthly') => setFrequency(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly
                </div>
              </SelectItem>
              <SelectItem value="monthly">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Monthly
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border">
          <h4 className="font-medium text-sm mb-2">What you'll receive:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {reportType === 'org' && (
              <>
                <li>• Employee participation metrics</li>
                <li>• Credit utilization reports</li>
                <li>• Wellness trend analysis</li>
              </>
            )}
            {reportType === 'coach' && (
              <>
                <li>• Session completion statistics</li>
                <li>• Client rating summaries</li>
                <li>• Performance insights</li>
              </>
            )}
            {reportType === 'employee' && (
              <>
                <li>• Personal progress tracking</li>
                <li>• Wellness trend reports</li>
                <li>• Achievement summaries</li>
              </>
            )}
          </ul>
        </div>

        <Button 
          onClick={handleSchedule} 
          disabled={isScheduling || !email}
          className="w-full"
        >
          {isScheduling ? 'Scheduling...' : `Schedule ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Reports`}
        </Button>
      </CardContent>
    </Card>
  );
};