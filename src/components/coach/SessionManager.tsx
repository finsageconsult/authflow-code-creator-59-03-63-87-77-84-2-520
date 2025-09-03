import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, FileText, Tags, Video, Send, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  clientName: string;
  scheduledAt: string;
  duration: number;
  sessionType: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  outcomeTags: string[];
  resources: string[];
  meetingLink?: string;
}

const OUTCOME_TAGS = [
  'TAX_CLARITY',
  'DEBT_PLAN', 
  'SALARY_STRUCT',
  'EMERGENCY_FUND',
  'INVESTMENT_START',
  'BUDGET_CREATE',
  'CREDIT_IMPROVE',
  'RETIREMENT_PLAN',
  'INSURANCE_REVIEW',
  'EXPENSE_REDUCE',
  'INCOME_INCREASE',
  'FINANCIAL_GOAL_SET',
  'RISK_ASSESSMENT',
  'PORTFOLIO_REVIEW'
];

export const SessionManager = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      clientName: 'Sarah M.',
      scheduledAt: '2024-01-15T14:00:00Z',
      duration: 60,
      sessionType: 'Investment Planning',
      status: 'scheduled',
      notes: '',
      outcomeTags: [],
      resources: [],
      meetingLink: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      clientName: 'John D.',
      scheduledAt: '2024-01-15T16:00:00Z',
      duration: 45,
      sessionType: 'Debt Management',
      status: 'completed',
      notes: 'Client showed great progress in debt reduction strategy. Needs follow-up on consolidation loan application.',
      outcomeTags: ['DEBT_PLAN', 'FINANCIAL_GOAL_SET'],
      resources: ['debt-consolidation-guide.pdf'],
      meetingLink: 'https://meet.google.com/xyz-uvw-rst'
    }
  ]);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleSaveSession = () => {
    if (!selectedSession) return;
    
    setSessions(prev => prev.map(session => 
      session.id === selectedSession.id 
        ? { 
            ...session, 
            notes: noteText, 
            outcomeTags: selectedTags,
            status: session.status === 'scheduled' ? 'completed' : session.status
          }
        : session
    ));

    toast({
      title: "Session Updated",
      description: "Session notes and outcome tags have been saved successfully.",
    });
  };

  const sendReminder = (session: Session) => {
    // TODO: Call Supabase edge function for session reminders
    toast({
      title: "Reminder Sent",
      description: `Session reminder sent to ${session.clientName}`,
    });
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const { date, time } = formatDateTime(session.scheduledAt);
            
            return (
              <div key={session.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{session.clientName}</h4>
                    <Badge variant="outline" className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.sessionType}</p>
                  <p className="text-sm text-muted-foreground">{date} • {time} • {session.duration}min</p>
                  
                  {session.outcomeTags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {session.outcomeTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {session.meetingLink && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </a>
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => sendReminder(session)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Remind
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(session);
                          setNoteText(session.notes || '');
                          setSelectedTags(session.outcomeTags);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Notes
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Session Notes - {session.clientName}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Session Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add your session notes here..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={6}
                          />
                        </div>
                        
                        <div>
                          <Label>Outcome Tags</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {OUTCOME_TAGS.map(tag => (
                              <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedTags.includes(tag)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTags(prev => [...prev, tag]);
                                    } else {
                                      setSelectedTags(prev => prev.filter(t => t !== tag));
                                    }
                                  }}
                                />
                                <span className="text-sm">{tag.replace(/_/g, ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="resources">Resources</Label>
                          <div className="flex gap-2 mt-2">
                            <Input placeholder="Add resource URL or file..." />
                            <Button size="sm" variant="outline">
                              <Paperclip className="w-4 h-4 mr-1" />
                              Attach
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 justify-end pt-4">
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleSaveSession}>
                            <Tags className="w-4 h-4 mr-1" />
                            Save Session
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};