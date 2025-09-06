import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Chat {
  id: string;
  name?: string;
  chat_type: string;
  created_by: string;
  organization_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  last_message?: ChatMessage;
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string;
  is_active: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message_type: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: string;
  last_seen: string;
  typing_in_chat?: string;
  updated_at: string;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchChats = async () => {
    if (!userProfile) return;

    try {
      let query = supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants!chat_participants_chat_id_fkey(
            *,
            user:users!chat_participants_user_id_fkey(id, name, email, role)
          )
        `);

      // For coaches, prioritize coaching chats
      if (userProfile.role === 'COACH') {
        query = query.or('chat_type.eq.coaching,chat_type.eq.direct');
      }

      const { data, error } = await query.order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Filter chats where user is a participant
      const userChats = (data as any)?.filter((chat: any) => 
        chat.participants?.some((p: any) => p.user_id === userProfile.id)
      ) || [];
      
      setChats(userChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (participantId: string) => {
    if (!userProfile) return null;

    try {
      // Check if chat already exists between these users
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants!chat_participants_chat_id_fkey(user_id)
        `)
        .eq('chat_type', 'direct');

      if (checkError) throw checkError;

      // Find existing direct chat between these two users
      const directChat = existingChat?.find(chat => {
        const participants = (chat as any).participants || [];
        const userIds = participants.map((p: any) => p.user_id) || [];
        return userIds.length === 2 && 
               userIds.includes(userProfile.id) && 
               userIds.includes(participantId);
      });

      if (directChat) {
        return directChat;
      }

      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          chat_type: 'direct',
          created_by: userProfile.id,
          organization_id: userProfile.organization_id,
        })
        .select('*')
        .single();

      if (chatError) throw chatError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          {
            chat_id: newChat.id,
            user_id: userProfile.id,
            role: 'admin',
          },
          {
            chat_id: newChat.id,
            user_id: participantId,
            role: 'member',
          },
        ]);

      if (participantsError) throw participantsError;

      toast({
        title: "Success",
        description: "Chat created successfully",
      });

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const createCoachingChat = async (participantId: string, programTitle: string, enrollmentId: string) => {
    if (!userProfile) {
      console.error('No user profile available for chat creation');
      return null;
    }

    try {
      console.log('Creating coaching chat:', { participantId, programTitle, userProfile: userProfile.id, role: userProfile.role });

      // Check if coaching chat already exists for this enrollment
      const { data: existingChat, error: checkError } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants!chat_participants_chat_id_fkey(user_id)
        `)
        .eq('chat_type', 'coaching')
        .ilike('name', `%${programTitle}%`);

      if (checkError) {
        console.error('Error checking existing chats:', checkError);
        throw checkError;
      }

      // Find existing coaching chat between this user and participant for this program
      const coachingChat = existingChat?.find(chat => {
        const participants = (chat as any).participants || [];
        const userIds = participants.map((p: any) => p.user_id) || [];
        return userIds.includes(userProfile.id) && userIds.includes(participantId);
      });

      if (coachingChat) {
        console.log('Found existing coaching chat:', coachingChat.id);
        return coachingChat;
      }

      console.log('Creating new coaching chat with user:', userProfile.id);
      
      // Create new coaching chat directly with proper authentication check
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          chat_type: 'coaching',
          name: `${programTitle} - Coaching Session`,
          created_by: userProfile.id,
          organization_id: userProfile.organization_id,
        })
        .select('*')
        .maybeSingle();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        throw chatError;
      }

      console.log('Chat created successfully:', newChat.id);

      // Add participants (determine roles based on current user)
      const isCoach = userProfile.role === 'COACH';
      const participantsToAdd = [
        {
          chat_id: newChat.id,
          user_id: userProfile.id,
          role: isCoach ? 'coach' : 'student',
        },
        {
          chat_id: newChat.id,
          user_id: participantId,
          role: isCoach ? 'student' : 'coach',
        },
      ];

      console.log('Adding participants:', participantsToAdd);

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participantsToAdd);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }

      console.log('Participants added successfully');

      toast({
        title: "Success",
        description: "Chat created successfully",
      });

      return newChat;
    } catch (error) {
      console.error('Error creating coaching chat:', error);
      toast({
        title: "Error",
        description: "Failed to create coaching chat. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLastRead = async (chatId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userProfile.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  };

  useEffect(() => {
    fetchChats();

    // Set up real-time subscription
    const channel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          fetchChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  return {
    chats,
    loading,
    createDirectChat,
    createCoachingChat,
    updateLastRead,
    refetch: fetchChats,
  };
};

export const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, name, email)
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!userProfile || !chatId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: userProfile.id,
          content,
          message_type: messageType,
        })
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, name, email)
        `)
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

  // Function to sanitize filenames for Supabase storage
  const sanitizeFileName = (fileName: string): string => {
    // Remove invalid characters and replace with safe alternatives
    return fileName
      .replace(/[{}]/g, '') // Remove curly braces
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove any other special characters except dots, underscores, and hyphens
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  const uploadFile = async (file: File) => {
    if (!userProfile || !chatId) return null;

    try {
      // Sanitize the filename to ensure it's valid for Supabase storage
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileName = `${userProfile.id}/${chatId}/${Date.now()}-${sanitizedFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Send file message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: userProfile.id,
          message_type: file.type.startsWith('image/') ? 'image' : 'file',
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, name, email)
        `)
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
    fetchMessages();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return {
    messages,
    loading,
    sendMessage,
    uploadFile,
    refetch: fetchMessages,
  };
};

export const usePresence = () => {
  const [presenceData, setPresenceData] = useState<Record<string, UserPresence>>({});
  const { userProfile } = useAuth();
  const lastUpdateRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const updatePresence = async (status: string, typingInChat?: string) => {
    if (!userProfile) return;

    // Throttle updates to prevent rapid successive calls
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) { // 1 second throttle
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        updatePresence(status, typingInChat);
      }, 1000);
      return;
    }

    lastUpdateRef.current = now;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: userProfile.id,
          status,
          typing_in_chat: typingInChat,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const fetchPresence = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*');

      if (error) throw error;

      const presenceMap = (data || []).reduce((acc, presence) => {
        acc[presence.user_id] = presence;
        return acc;
      }, {} as Record<string, UserPresence>);

      setPresenceData(presenceMap);
    } catch (error) {
      console.error('Error fetching presence:', error);
    }
  };

  useEffect(() => {
    if (!userProfile) return;

    fetchPresence();

    // Set up real-time subscription for presence
    const channel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence change:', payload);
          fetchPresence();
        }
      )
      .subscribe();

    // Update presence to online on mount
    setTimeout(() => updatePresence('online'), 100);

    // Set up interval to keep presence updated (less frequent)
    const interval = setInterval(() => {
      updatePresence('online');
    }, 60000); // Update every 60 seconds instead of 30

    // Update presence to offline on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updatePresence('offline');
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userProfile?.id]); // Only depend on user ID to prevent re-subscriptions

  return {
    presenceData,
    updatePresence,
  };
};
