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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 flex-shrink-0" />
          Availability Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Set your weekly schedule and buffer times between sessions
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        {availability.map((slot) => (
          <div key={slot.id} className="p-3 md:p-4 border rounded-lg bg-card">
            {/* Day Header - Always visible */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={slot.isAvailable}
                  onCheckedChange={() => toggleDayAvailability(slot.id)}
                />
                <span className="font-medium text-sm md:text-base">{days[slot.dayOfWeek]}</span>
              </div>
              
              {!slot.isAvailable && (
                <Badge variant="secondary" className="text-xs">Not Available</Badge>
              )}
            </div>
            
            {/* Time Settings - Responsive layout */}
            {slot.isAvailable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">From:</Label>
                  <Input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">To:</Label>
                  <Input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
                
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs font-medium text-muted-foreground">Buffer (minutes):</Label>
                  <Input
                    type="number"
                    value={slot.bufferMinutes}
                    onChange={(e) => updateTimeSlot(slot.id, 'bufferMinutes', parseInt(e.target.value) || 0)}
                    className="w-full text-sm"
                    min="0"
                    max="60"
                    placeholder="15"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Action Buttons - Responsive layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Block
          </Button>
          
          <Button onClick={handleSaveAvailability} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};