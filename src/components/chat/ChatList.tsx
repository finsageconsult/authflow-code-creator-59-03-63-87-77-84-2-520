import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChats, Chat } from '@/hooks/useChat';
import { usePresence } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Plus, 
  MessageCircle,
  Clock,
  Circle
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { NewChatDialog } from './NewChatDialog';

interface ChatListProps {
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChat, onChatSelect }) => {
  const { chats, loading } = useChats();
  const { presenceData } = usePresence();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    // Search in chat name or participant names
    const chatName = chat.name?.toLowerCase() || '';
    const participantNames = chat.participants?.map(p => p.user?.name?.toLowerCase() || '').join(' ') || '';
    
    return chatName.includes(searchQuery.toLowerCase()) || 
           participantNames.includes(searchQuery.toLowerCase());
  });

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;
    
    // For direct chats, show the other participant's name
    if (chat.chat_type === 'direct') {
      const otherParticipant = chat.participants?.find(p => p.user_id !== userProfile?.id);
      return otherParticipant?.user?.name || 'Unknown User';
    }
    
    return `Group Chat (${chat.participants?.length || 0} members)`;
  };

  const getChatInitials = (chat: Chat) => {
    const displayName = getChatDisplayName(chat);
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getOnlineStatus = (chat: Chat) => {
    if (chat.chat_type === 'direct') {
      const otherParticipant = chat.participants?.find(p => p.user_id !== userProfile?.id);
      if (otherParticipant) {
        const presence = presenceData[otherParticipant.user_id];
        return presence?.status === 'online';
      }
    }
    return false;
  };

  const getUnreadCount = (chat: Chat) => {
    // This would need to be calculated based on last_read_at vs last_message_at
    // For now, return 0 as placeholder
    return 0;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chats</CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowNewChatDialog(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredChats.length === 0 ? (
              <div className="text-center p-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </p>
                {!searchQuery && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowNewChatDialog(true)}
                  >
                    Start a conversation
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map((chat) => {
                  const isSelected = selectedChat?.id === chat.id;
                  const isOnline = getOnlineStatus(chat);
                  const unreadCount = getUnreadCount(chat);
                  
                  return (
                    <div
                      key={chat.id}
                      className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                        isSelected ? 'bg-muted border-r-2 border-primary' : ''
                      }`}
                      onClick={() => onChatSelect(chat)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-sm">
                              {getChatInitials(chat)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 fill-green-500 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {getChatDisplayName(chat)}
                            </h4>
                            <div className="flex items-center gap-1">
                              {chat.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(chat.last_message_at)}
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <Badge variant="default" className="h-5 min-w-5 text-xs px-1">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {chat.last_message && (
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.last_message.message_type === 'file' ? (
                                <span className="flex items-center gap-1">
                                  📎 {chat.last_message.file_name}
                                </span>
                              ) : chat.last_message.message_type === 'image' ? (
                                <span className="flex items-center gap-1">
                                  🖼️ Photo
                                </span>
                              ) : (
                                chat.last_message.content
                              )}
                            </p>
                          )}
                          
                          {chat.chat_type === 'group' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {chat.participants?.length || 0} members
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
      />
    </>
  );
};