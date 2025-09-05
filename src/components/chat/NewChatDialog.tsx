import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChats } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onOpenChange }) => {
  const { createDirectChat } = useChats();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('id, name, email, role, organization_id')
        .neq('id', userProfile.id) // Exclude current user
        .eq('status', 'ACTIVE');

      // If user is in an organization, show org members first
      if (userProfile.organization_id) {
        query = query.eq('organization_id', userProfile.organization_id);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchQuery('');
    }
  }, [open, userProfile]);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const handleCreateDirectChat = async (userId: string) => {
    setCreating(true);
    try {
      const chat = await createDirectChat(userId);
      if (chat) {
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Chat started successfully",
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COACH':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EMPLOYEE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User List */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No users found' : 'No users available'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                    onClick={() => handleCreateDirectChat(user.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{user.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={creating}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Future: Add group chat option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              <Users className="h-4 w-4 mr-2" />
              Create Group Chat
              <Badge variant="secondary" className="ml-2">Soon</Badge>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};