
'use client';

import React from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages, { MessageType } from "./ChatMessages";
import ChatInput from "./ChatInput";
import { LabelType } from "@/lib/labelConstants";

interface ChatProps {
  conversation: {
    id: string;
    name: string;
    avatar: string;
    status?: string;
    is_group?: boolean;
    label?: LabelType;
  };
  messages: MessageType[];
  onSendMessage: (message: string) => void;
  onLabelChange?: (conversationId: string, label: LabelType) => void;
}

const Chat: React.FC<ChatProps> = ({
  conversation,
  messages,
  onSendMessage,
  onLabelChange = () => {}
}) => {
  // Handle label changes
  const handleLabelChange = (label: LabelType) => {
    onLabelChange(conversation.id, label);
  };

  return (
    <section className="flex flex-col h-full overflow-hidden">
      <ChatHeader
        id={conversation.id}
        name={conversation.name}
        avatar={conversation.avatar}
        status={conversation.status}
        isGroup={conversation.is_group}
        label={conversation.label}
        onLabelChange={handleLabelChange}
      />
      <ChatMessages messages={messages} />
      <ChatInput onSendMessage={onSendMessage} />
    </section>
  );
};

export default Chat;
