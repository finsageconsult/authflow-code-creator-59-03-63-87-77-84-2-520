import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, CheckCircle } from 'lucide-react';

interface SupportQuery {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  role: string;
}

export const SupportQuery = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [queries, setQueries] = useState<SupportQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      fetchQueries();
      setupRealtimeSubscription();
    }
  }, [userProfile]);

  const fetchQueries = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('support_queries')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: "Error",
        description: "Failed to load support queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('support-queries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_queries',
          filter: `user_id=eq.${userProfile?.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setQueries(prev => prev.map(query => 
              query.id === payload.new.id ? payload.new as SupportQuery : query
            ));
          } else if (payload.eventType === 'INSERT') {
            setQueries(prev => [payload.new as SupportQuery, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_queries')
        .insert({
          user_id: userProfile.id,
          role: userProfile.role,
          title: title.trim(),
          description: description.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support query submitted successfully",
      });

      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchQueries();
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Error",
        description: "Failed to submit support query",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = status === 'pending' ? 'Pending' : 
                         status === 'solved' ? 'Solved' : 'Pending';
    
    return (
      <Badge 
        variant={status === 'solved' ? 'default' : 'secondary'}
        className={status === 'solved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
      >
        {status === 'solved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
        {displayStatus}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading support queries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support</h2>
          <p className="text-muted-foreground">Submit and track your support queries</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Query
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Support Query</CardTitle>
            <CardDescription>
              Describe your issue or question and our team will help you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about your issue"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Query'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Support Queries</h3>
        
        {queries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No support queries yet</p>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(true)}
                className="mt-4"
              >
                Submit your first query
              </Button>
            </CardContent>
          </Card>
        ) : (
          queries.map((query) => (
            <Card key={query.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{query.title}</CardTitle>
                    <CardDescription>
                      Submitted on {new Date(query.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(query.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {query.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};