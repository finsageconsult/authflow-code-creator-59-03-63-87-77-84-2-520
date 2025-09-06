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
  linkGeneratedAt?: string;
  linkExpiresAt?: string;
  isLinkActive?: boolean;
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
      scheduledAt: '2024-01-15T19:30:00Z',
      duration: 60,
      sessionType: 'Investment Planning',
      status: 'scheduled',
      notes: '',
      outcomeTags: [],
      resources: [],
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      linkGeneratedAt: '2024-01-15T14:00:00Z',
      linkExpiresAt: '2024-01-15T19:00:00Z',
      isLinkActive: false
    },
    {
      id: '2',
      clientName: 'John D.',
      scheduledAt: '2024-01-15T21:30:00Z',
      duration: 45,
      sessionType: 'Debt Management',
      status: 'completed',
      notes: 'Client showed great progress in debt reduction strategy. Needs follow-up on consolidation loan application.',
      outcomeTags: ['DEBT_PLAN', 'FINANCIAL_GOAL_SET'],
      resources: ['debt-consolidation-guide.pdf'],
      meetingLink: 'https://meet.google.com/xyz-uvw-rst',
      linkGeneratedAt: '2024-01-15T16:00:00Z',
      linkExpiresAt: '2024-01-15T21:00:00Z',
      isLinkActive: false
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

  const generateJoinLink = (session: Session) => {
    const now = new Date();
    const sessionTime = new Date(session.scheduledAt);
    const linkActiveTime = new Date(sessionTime.getTime() - 30 * 60 * 1000); // 30 minutes before session
    
    setSessions(prev => prev.map(s => 
      s.id === session.id 
        ? { 
            ...s, 
            linkGeneratedAt: now.toISOString(),
            linkExpiresAt: linkActiveTime.toISOString(),
            isLinkActive: false,
            meetingLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 12)}`
          }
        : s
    ));

    toast({
      title: "Join Link Generated",
      description: `Join link will be active 30 minutes before the session`,
    });
  };

  const activateJoinLink = (session: Session) => {
    setSessions(prev => prev.map(s => 
      s.id === session.id 
        ? { ...s, isLinkActive: true }
        : s
    ));

    toast({
      title: "Join Link Activated",
      description: `Join link is now active for ${session.clientName}`,
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
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h4 className="font-medium">{session.clientName}</h4>
                      <Badge variant="outline" className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.sessionType}</p>
                    <p className="text-sm text-muted-foreground">{date} • {time} • {session.duration}min</p>
                    
                    {session.linkExpiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Join link active: {new Date(session.linkExpiresAt).toLocaleString()} 
                        {session.isLinkActive ? " (Active)" : " (Pending)"}
                      </p>
                    )}
                    
                    {session.outcomeTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.outcomeTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                  {session.meetingLink && session.isLinkActive && (
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none" asChild>
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">Join</span>
                      </a>
                    </Button>
                  )}
                  
                  {session.meetingLink && !session.isLinkActive && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => activateJoinLink(session)}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      <span className="hidden xs:inline">Activate Link</span>
                    </Button>
                  )}
                  
                  {!session.meetingLink && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => generateJoinLink(session)}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      <span className="hidden xs:inline">Generate Link</span>
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => sendReminder(session)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Remind</span>
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setSelectedSession(session);
                          setNoteText(session.notes || '');
                          setSelectedTags(session.outcomeTags);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="hidden xs:inline">Notes</span>
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
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
                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <Input placeholder="Add resource URL or file..." className="flex-1" />
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <Paperclip className="w-4 h-4 mr-1" />
                              Attach
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4">
                          <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                          <Button onClick={handleSaveSession} className="w-full sm:w-auto">
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