
'use client';

import React, { useEffect, useRef } from "react";
import Message from "./Message";
import DateSeparator from "./DateSeparator";

export interface MessageType {
  id: string;
  content: string;
  timestamp: string; // Formatted time for display (HH:mm)
  originalTimestamp?: string; // Original ISO timestamp for sorting
  fullDate?: string; // Full date for grouping messages
  isOutgoing: boolean;
  senderName?: string;
  senderAvatar?: string;
  attachmentType?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  isRead?: boolean; // Whether the message has been read
  isDelivered?: boolean; // Whether the message has been delivered
  recipientOnline?: boolean; // Whether the recipient is currently online
}

interface ChatMessagesProps {
  messages: MessageType[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log(`ChatMessages: Received ${messages.length} messages to render`);
    if (messagesContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM has been updated and rendered
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages]);

  // Sort messages by timestamp to ensure they're in chronological order (oldest first, newest last)
  const sortedMessages = [...messages].sort((a, b) => {
    // Use original timestamp if available, otherwise fall back to formatted timestamp
    const timestampA = a.originalTimestamp || a.timestamp;
    const timestampB = b.originalTimestamp || b.timestamp;

    // If we have original timestamps (ISO format), use them for accurate sorting
    if (a.originalTimestamp && b.originalTimestamp) {
      const timeA = new Date(timestampA).getTime();
      const timeB = new Date(timestampB).getTime();

      // If timestamps are exactly the same, use ID for stable sorting
      if (timeA === timeB) {
        // For temporary IDs (which start with 'temp-'), always place them at the end
        if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
        if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
        return a.id.localeCompare(b.id);
      }

      return timeA - timeB;
    }

    // Fallback to formatted timestamp comparison (for backward compatibility)
    // For messages with the same formatted timestamp, use the ID to determine order
    if (a.timestamp === b.timestamp) {
      // For temporary IDs (which start with 'temp-'), always place them at the end
      if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
      if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
      return a.id.localeCompare(b.id);
    }

    // Convert HH:mm format to comparable timestamps (fallback method)
    const timeA = new Date(`1970-01-01T${a.timestamp}:00`).getTime();
    const timeB = new Date(`1970-01-01T${b.timestamp}:00`).getTime();
    return timeA - timeB;
  });

  console.log(`ChatMessages: Sorted ${sortedMessages.length} messages`);

  // Group messages by date
  const messagesByDate: { [key: string]: MessageType[] } = {};

  sortedMessages.forEach((message) => {
    // Make sure we have a fullDate for every message
    const date = message.fullDate || 'Unknown';

    // Create a new array for this date if it doesn't exist
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }

    // Add the message to the appropriate date group
    messagesByDate[date].push(message);
  });

  // Get sorted dates (oldest to newest, with past dates first, then Yesterday, then Today)
  const sortedDates = Object.keys(messagesByDate).sort((a, b) => {
    // Special handling for Today and Yesterday
    if (a === 'Today' && b === 'Yesterday') return 1;
    if (a === 'Yesterday' && b === 'Today') return -1;
    if (a === 'Today' && b !== 'Yesterday') return 1;
    if (b === 'Today' && a !== 'Yesterday') return -1;
    if (a === 'Yesterday' && b !== 'Today') return 1;
    if (b === 'Yesterday' && a !== 'Today') return -1;

    // For actual dates (dd-MM-yyyy format), parse and compare chronologically
    if (a !== 'Today' && a !== 'Yesterday' && b !== 'Today' && b !== 'Yesterday') {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    }

    return a.localeCompare(b); // Fallback
  });



  return (
    <main className="flex-1 relative bg-gray-50">
      {/* This div is the scrollable container with hidden scrollbar */}
      <div
        ref={messagesContainerRef}
        className="absolute inset-0 overflow-y-auto scrollbar-hide flex flex-col"
      >
        {/* Spacer div to push content to bottom */}
        <div className="flex-1"></div>
        {/* Messages container */}
        <div className="p-4">
          <ul className="space-y-6 list-none p-0">
            {sortedDates.map((date) => (
              <li key={date} className="mb-6">
                <DateSeparator date={date} />
                <div className="space-y-3 mt-3">
                  {messagesByDate[date].map((message) => (
                    <Message
                      key={message.id}
                      content={message.content}
                      timestamp={message.timestamp}
                      isOutgoing={message.isOutgoing}
                      senderName={message.senderName}
                      senderAvatar={message.senderAvatar}
                      isRead={message.isRead}
                      isDelivered={message.isDelivered}
                      recipientOnline={message.recipientOnline}
                      attachmentType={message.attachmentType}
                      attachmentUrl={message.attachmentUrl}
                      attachmentName={message.attachmentName}
                      attachmentSize={message.attachmentSize}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default ChatMessages;
