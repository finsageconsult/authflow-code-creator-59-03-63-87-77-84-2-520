import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bufferMinutes: number;
}

export const AvailabilitySettings = () => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, bufferMinutes: 15 },
    { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true, bufferMinutes: 15 },
    { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true, bufferMinutes: 15 },
    { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true, bufferMinutes: 15 },
    { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true, bufferMinutes: 15 },
  ]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSaveAvailability = () => {
    // TODO: Implement actual save to Supabase
    toast({
      title: "Availability Updated",
      description: "Your availability settings have been saved successfully.",
    });
  };

  const toggleDayAvailability = (id: string) => {
    setAvailability(prev => prev.map(slot => 
      slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string | number) => {
    setAvailability(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Availability Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your weekly schedule and buffer times between sessions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {availability.map((slot) => (
          <div key={slot.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Switch
                checked={slot.isAvailable}
                onCheckedChange={() => toggleDayAvailability(slot.id)}
              />
              <span className="font-medium">{days[slot.dayOfWeek]}</span>
            </div>
            
            {slot.isAvailable && (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">From:</Label>
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                    className="w-24"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs">To:</Label>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                    className="w-24"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Buffer (min):</Label>
                  <Input
                    type="number"
                    value={slot.bufferMinutes}
                    onChange={(e) => updateTimeSlot(slot.id, 'bufferMinutes', parseInt(e.target.value) || 0)}
                    className="w-16"
                    min="0"
                    max="60"
                  />
                </div>
              </>
            )}
            
            {!slot.isAvailable && (
              <Badge variant="secondary">Not Available</Badge>
            )}
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Block
          </Button>
          
          <Button onClick={handleSaveAvailability}>
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};