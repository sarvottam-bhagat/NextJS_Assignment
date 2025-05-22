
'use client';

import React, { useState, useMemo } from "react";
import ConversationItem from "./ConversationItem";
import { isWithinInterval, parseISO } from "date-fns";
import { FilterOptions } from "./FilterModal";
import FloatingChatButton from "../DirectMessage/FloatingChatButton";



interface Conversation {
  id: string;
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  tags?: string[];
  is_group?: boolean;
  status?: string;
  label?: any; // Using any to accommodate LabelType
}

interface ConversationsListProps {
  activeConversation?: string;
  onSelectConversation: (id: string) => void;
  searchTerm?: string;
  selectionMode?: boolean;
  selectedConversations?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  filters?: FilterOptions;
  onDirectMessageCreated?: (conversationId: string) => void;
  conversations?: Record<string, any>;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  activeConversation,
  onSelectConversation,
  searchTerm = '',
  selectionMode = false,
  selectedConversations = [],
  onSelectionChange = () => {},
  filters = {
    conversationType: 'all',
    labels: [],
    unreadOnly: false,
    dateRange: { from: undefined, to: undefined },
  },
  onDirectMessageCreated,
  conversations: conversationsRecord = {}
}) => {
  const [loading, setLoading] = useState<boolean>(false);



  // Convert conversations record to array format
  const conversations = useMemo(() => {
    return Object.values(conversationsRecord).map(conv => ({
      id: conv.id,
      avatar: conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}`,
      name: conv.name,
      lastMessage: conv.lastMessage || "No messages yet",
      time: conv.time || "",
      unread: conv.unread || 0,
      is_group: conv.is_group || false,
      status: conv.status,
      label: conv.label,
      tags: ["Demo"] // Placeholder tags
    }));
  }, [conversationsRecord]);



  // Apply all filters to conversations
  const filteredConversations = conversations.filter(conversation => {
    // Search filter
    const matchesSearch = conversation.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Conversation type filter
    if (filters.conversationType !== 'all') {
      const isGroup = conversation.is_group || false;
      if (filters.conversationType === 'group' && !isGroup) return false;
      if (filters.conversationType === 'direct' && isGroup) return false;
    }

    // Labels filter
    if (filters.labels.length > 0) {
      if (!conversation.label) return false;
      if (!filters.labels.includes(conversation.label)) return false;
    }

    // Unread messages filter
    if (filters.unreadOnly && conversation.unread === 0) return false;

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      // If there's no last message, we can't filter by date
      if (!conversation.time) return false;

      try {
        const messageDate = parseISO(conversation.time);

        if (filters.dateRange.from && filters.dateRange.to) {
          // Both from and to dates are specified
          if (!isWithinInterval(messageDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          })) return false;
        } else if (filters.dateRange.from) {
          // Only from date is specified
          if (messageDate < filters.dateRange.from) return false;
        } else if (filters.dateRange.to) {
          // Only to date is specified
          if (messageDate > filters.dateRange.to) return false;
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        // If we can't parse the date, include the conversation anyway
      }
    }

    // Participant filter
    if (filters.participantId) {
      // This would require additional data fetching to implement properly
      // For now, we'll skip this filter
    }

    // If all filters pass, include the conversation
    return true;
  });

  if (loading) {
    return (
      <section className="flex justify-center items-center h-full" aria-live="polite" aria-busy="true">
        <p className="text-gray-500">Loading conversations...</p>
      </section>
    );
  }

  if (filteredConversations.length === 0 && searchTerm) {
    return (
      <section className="flex flex-col justify-center items-center h-full p-4" aria-live="polite">
        <p className="text-gray-500 text-center">No conversations found matching "{searchTerm}"</p>
      </section>
    );
  }

  // Handle conversation selection
  const handleConversationSelect = (id: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedConversations, id]);
    } else {
      onSelectionChange(selectedConversations.filter(convId => convId !== id));
    }
  };

  return (
    <div className="relative h-full">
      <ul className="h-full overflow-y-auto scrollbar-hide list-none p-0 m-0 pb-16" role="list" aria-label="Conversations list">
        {filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            id={conversation.id}
            avatar={conversation.avatar}
            name={conversation.name}
            lastMessage={conversation.lastMessage}
            time={conversation.time}
            unread={conversation.unread}
            tags={conversation.tags}
            isActive={activeConversation === conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            searchTerm={searchTerm}
            isGroup={conversation.is_group}
            status={conversation.status}
            label={conversation.label}
            selectable={selectionMode}
            isSelected={selectedConversations.includes(conversation.id)}
            onSelect={handleConversationSelect}
          />
        ))}
      </ul>

      {/* Floating Direct Message Button */}
      <div className="absolute bottom-4 right-4">
        {onDirectMessageCreated && (
          <FloatingChatButton onConversationCreated={onDirectMessageCreated} />
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
