import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import ChatAssignmentList from './ChatAssignmentList';
import AssignmentChat from '../assignments/AssignmentChat';
import { Chat } from '@/hooks/useChat';
import { Assignment } from '@/hooks/useAssignments';
import { MessageSquare, ClipboardList } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chats');

  if (selectedAssignment) {
    return (
      <AssignmentChat
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  if (selectedChat) {
    return (
      <div className="h-[calc(100vh-200px)] flex bg-background rounded-lg border overflow-hidden gap-4 p-4">
        <div className="flex-1">
          <ChatWindow 
            chat={selectedChat} 
            onBack={() => setSelectedChat(null)} 
          />
        </div>
        <div className="w-80">
          <ChatAssignmentList 
            chat={selectedChat}
            onAssignmentSelect={setSelectedAssignment}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-background rounded-lg border overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chats" className="flex-1 flex m-0">
          <div className="w-1/3 border-r">
            <ChatList 
              selectedChat={selectedChat}
              onChatSelect={setSelectedChat}
            />
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the sidebar to start chatting
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="flex-1 m-0">
          <div className="h-full p-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('chats')}
              className="mb-4"
            >
              ← Back to Chats
            </Button>
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Assignment Management</h3>
              <p className="text-muted-foreground">
                Create and manage assignments through chat conversations
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};