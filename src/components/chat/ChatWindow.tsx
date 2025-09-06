import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Chat, useChatMessages, usePresence } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Download,
  Image as ImageIcon,
  File,
  Circle,
  
  Video,
  MoreVertical,
  
} from 'lucide-react';

import { format, isToday, isYesterday } from 'date-fns';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { userProfile } = useAuth();
  const { messages, loading, sendMessage, uploadFile } = useChatMessages(chat.id);
  const { presenceData, updatePresence } = usePresence();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatDisplayName = () => {
    if (chat.name) return chat.name;
    
    if (chat.chat_type === 'direct') {
      const otherParticipant = chat.participants?.find(p => p.user_id !== userProfile?.id);
      return otherParticipant?.user?.name || 'Unknown User';
    }
    
    return `Group Chat`;
  };

  const getChatInitials = () => {
    const displayName = getChatDisplayName();
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOnlineStatus = () => {
    if (chat.chat_type === 'direct') {
      const otherParticipant = chat.participants?.find(p => p.user_id !== userProfile?.id);
      if (otherParticipant) {
        const presence = presenceData[otherParticipant.user_id];
        return presence?.status === 'online';
      }
    }
    return false;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
      updatePresence('online'); // Clear typing status
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      updatePresence('online', chat.id);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updatePresence('online'); // Clear typing status
    }, 2000);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message: any) => {
    const isOwn = message.sender_id === userProfile?.id;
    const sender = message.sender;
    
    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">
            {isOwn ? 'You' : (sender?.name?.[0] || 'U')}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
          <div
            className={`inline-block p-3 rounded-lg ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.message_type === 'text' && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.message_type === 'image' && (
              <div className="space-y-2">
                <img 
                  src={message.file_url} 
                  alt={message.file_name}
                  className="max-w-full max-h-64 rounded object-cover cursor-pointer"
                  onClick={() => window.open(message.file_url, '_blank')}
                />
                {message.file_name && (
                  <p className="text-xs opacity-80">{message.file_name}</p>
                )}
              </div>
            )}
            
            {message.message_type === 'file' && (
              <div className="flex items-center gap-2 min-w-0">
                <File className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{message.file_name}</p>
                  {message.file_size && (
                    <p className="text-xs opacity-80">{formatFileSize(message.file_size)}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(message.file_url, '_blank')}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            {formatMessageTime(message.created_at)}
            {!isOwn && chat.chat_type === 'group' && (
              <span className="ml-2">{sender?.name}</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getChatInitials()}</AvatarFallback>
              </Avatar>
              {getOnlineStatus() && (
                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{getChatDisplayName()}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {chat.chat_type === 'direct' ? (
                  getOnlineStatus() ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span>Offline</span>
                  )
                ) : (
                  <span>{chat.participants?.length || 0} members</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-4">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="resize-none min-h-[40px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="*/*"
        />
      </div>
    </div>
  );
};