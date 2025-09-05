import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { Chat } from '@/hooks/useChat';

export const ChatInterface: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="h-[calc(100vh-200px)] flex bg-background rounded-lg border overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r">
        <ChatList 
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};