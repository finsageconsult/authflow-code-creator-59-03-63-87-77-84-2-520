import React, { useState } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/hooks/useAuth';
import { Chat } from '@/hooks/useChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Loader2, ClipboardList } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ChatAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat;
}

const ChatAssignmentDialog: React.FC<ChatAssignmentDialogProps> = ({
  open,
  onOpenChange,
  chat,
}) => {
  const { createAssignment } = useAssignments();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      assigned_to: '',
      due_date: '',
      priority: 'medium',
      assignment_type: 'general',
    },
  });

  // Get chat participants (exclude current user)
  const availableParticipants = chat.participants?.filter(
    p => p.user_id !== userProfile?.id && p.is_active
  ) || [];

  const onSubmit = async (data: any) => {
    if (!data.assigned_to) {
      toast({
        title: "Error",
        description: "Please select a participant to assign the task to",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createAssignment({
        ...data,
        due_date: data.due_date || undefined,
      });
      
      if (result) {
        form.reset();
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-select participant if only one available
  React.useEffect(() => {
    if (availableParticipants.length === 1) {
      form.setValue('assigned_to', availableParticipants[0].user_id);
    }
  }, [availableParticipants, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Create Assignment for Chat
          </DialogTitle>
        </DialogHeader>

        {availableParticipants.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No participants available to assign tasks to in this chat.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Assignment description"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                rules={{ required: "Please select a participant" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a participant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableParticipants.map((participant) => (
                          <SelectItem key={participant.user_id} value={participant.user_id}>
                            {participant.user?.name || participant.user?.email || 'Unknown User'}
                            {participant.user?.role && (
                              <span className="text-muted-foreground ml-1">
                                ({participant.user.role})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="coaching">Coaching</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Assignment
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatAssignmentDialog;