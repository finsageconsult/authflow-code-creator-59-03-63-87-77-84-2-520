import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  assigned_to: string;
  organization_id?: string;
  due_date?: string;
  status: string;
  priority: string;
  assignment_type: string;
  created_at: string;
  updated_at: string;
  creator?: {
    name: string;
    email: string;
  };
  assignee?: {
    name: string;
    email: string;
  };
}

export interface AssignmentMessage {
  id: string;
  assignment_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  created_at: string;
  sender?: {
    name: string;
    email: string;
  };
}

export interface AssignmentFile {
  id: string;
  assignment_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    name: string;
    email: string;
  };
}

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchAssignments = async () => {
    if (!userProfile) return;

    try {
      let query = supabase
        .from('assignments')
        .select('*');

      // Filter assignments based on user role
      if (userProfile.role === 'COACH' || userProfile.role === 'HR' || userProfile.role === 'ADMIN') {
        // Coaches, HR, and Admins can see assignments they created or are assigned to
        query = query.or(`created_by.eq.${userProfile.id},assigned_to.eq.${userProfile.id}`);
      } else {
        // Employees and Individuals can only see assignments assigned to them
        query = query.eq('assigned_to', userProfile.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: {
    title: string;
    description?: string;
    assigned_to: string;
    due_date?: string;
    priority?: string;
    assignment_type?: string;
  }) => {
    if (!userProfile) return null;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          created_by: userProfile.id,
          organization_id: userProfile.organization_id,
        })
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAssignmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment status updated",
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAssignments();

    // Set up real-time subscription
    const channel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  return {
    assignments,
    loading,
    createAssignment,  
    updateAssignmentStatus,
    refetch: fetchAssignments,
  };
};

export const useAssignmentMessages = (assignmentId: string) => {
  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!assignmentId) return;

    try {
      const { data, error } = await supabase
        .from('assignment_messages')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!userProfile || !assignmentId) return null;

    try {
      const { data, error } = await supabase
        .from('assignment_messages')
        .insert({
          assignment_id: assignmentId,
          sender_id: userProfile.id,
          message,
          message_type: 'text',
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`assignment-messages-${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_messages',
          filter: `assignment_id=eq.${assignmentId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};

export const useAssignmentFiles = (assignmentId: string) => {
  const [files, setFiles] = useState<AssignmentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!assignmentId) return;

    try {
      const { data, error } = await supabase
        .from('assignment_files')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!userProfile || !assignmentId) return null;

    try {
      // Get auth user data for RLS compatibility
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Upload file to storage using auth.uid() for RLS compatibility
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for private bucket access
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('assignments')
        .createSignedUrl(fileName, 60 * 60 * 24 * 30); // 30 days expiry

      if (urlError) throw urlError;

      // Save file record with signed URL
      const { data, error } = await supabase
        .from('assignment_files')
        .insert({
          assignment_id: assignmentId,
          file_name: file.name,
          file_url: signedUrlData.signedUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userProfile.id,
        })
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchFiles();

    // Set up real-time subscription for files
    const channel = supabase
      .channel(`assignment-files-${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_files',
          filter: `assignment_id=eq.${assignmentId}`
        },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId]);

  return {
    files,
    loading,
    uploadFile,
    refetch: fetchFiles,
  };
};