'use client';

import React from 'react';
import { MessageType } from './ChatMessages';

// Test component to verify message ordering logic
const MessageOrderingTest: React.FC = () => {
  // Create test messages with different timestamps
  const testMessages: MessageType[] = [
    {
      id: '1',
      content: 'Message from yesterday morning',
      timestamp: '09:00',
      originalTimestamp: '2024-12-18T09:00:00Z',
      fullDate: 'Yesterday',
      isOutgoing: false,
      senderName: 'Alice'
    },
    {
      id: '2',
      content: 'Message from yesterday afternoon',
      timestamp: '15:30',
      originalTimestamp: '2024-12-18T15:30:00Z',
      fullDate: 'Yesterday',
      isOutgoing: true,
      senderName: 'You'
    },
    {
      id: '3',
      content: 'Message from today morning',
      timestamp: '08:00',
      originalTimestamp: '2024-12-19T08:00:00Z',
      fullDate: 'Today',
      isOutgoing: false,
      senderName: 'Bob'
    },
    {
      id: '4',
      content: 'Message from today afternoon',
      timestamp: '14:00',
      originalTimestamp: '2024-12-19T14:00:00Z',
      fullDate: 'Today',
      isOutgoing: true,
      senderName: 'You'
    },
    {
      id: '5',
      content: 'Very recent message',
      timestamp: '16:30',
      originalTimestamp: new Date().toISOString(),
      fullDate: 'Today',
      isOutgoing: true,
      senderName: 'You'
    }
  ];

  // Apply the same sorting logic as ChatMessages
  const sortedMessages = [...testMessages].sort((a, b) => {
    const timestampA = a.originalTimestamp || a.timestamp;
    const timestampB = b.originalTimestamp || b.timestamp;

    if (a.originalTimestamp && b.originalTimestamp) {
      const timeA = new Date(timestampA).getTime();
      const timeB = new Date(timestampB).getTime();
      
      if (timeA === timeB) {
        if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
        if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
        return a.id.localeCompare(b.id);
      }
      
      return timeA - timeB;
    }

    if (a.timestamp === b.timestamp) {
      if (a.id.startsWith('temp-') && !b.id.startsWith('temp-')) return 1;
      if (!a.id.startsWith('temp-') && b.id.startsWith('temp-')) return -1;
      return a.id.localeCompare(b.id);
    }

    const timeA = new Date(`1970-01-01T${a.timestamp}:00`).getTime();
    const timeB = new Date(`1970-01-01T${b.timestamp}:00`).getTime();
    return timeA - timeB;
  });

  // Group by date
  const messagesByDate: { [key: string]: MessageType[] } = {};
  sortedMessages.forEach((message) => {
    const date = message.fullDate || 'Unknown';
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  // Sort dates
  const sortedDates = Object.keys(messagesByDate).sort((a, b) => {
    if (a === 'Today' && b === 'Yesterday') return 1;
    if (a === 'Yesterday' && b === 'Today') return -1;
    if (a === 'Today' && b !== 'Yesterday') return 1;
    if (b === 'Today' && a !== 'Yesterday') return -1;
    if (a === 'Yesterday' && b !== 'Today') return 1;
    if (b === 'Yesterday' && a !== 'Today') return -1;

    if (a !== 'Today' && a !== 'Yesterday' && b !== 'Today' && b !== 'Yesterday') {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    }

    return a.localeCompare(b);
  });

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Message Ordering Test</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Original Messages:</h4>
        <ul className="list-disc list-inside">
          {testMessages.map(msg => (
            <li key={msg.id} className="text-sm">
              {msg.content} - {msg.fullDate} {msg.timestamp} ({msg.originalTimestamp})
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Sorted Messages:</h4>
        <ul className="list-disc list-inside">
          {sortedMessages.map(msg => (
            <li key={msg.id} className="text-sm">
              {msg.content} - {msg.fullDate} {msg.timestamp}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Grouped by Date (Display Order):</h4>
        {sortedDates.map(date => (
          <div key={date} className="mb-2">
            <h5 className="font-medium text-blue-600">{date}</h5>
            <ul className="list-disc list-inside ml-4">
              {messagesByDate[date].map(msg => (
                <li key={msg.id} className="text-sm">
                  {msg.timestamp} - {msg.content}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageOrderingTest;
