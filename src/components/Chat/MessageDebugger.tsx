'use client';

import React from "react";
import { MessageType } from "./ChatMessages";

interface MessageDebuggerProps {
  messages: MessageType[];
}

const MessageDebugger: React.FC<MessageDebuggerProps> = ({ messages }) => {
  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold text-sm mb-2">Message Debug Info</h3>
      <div className="text-xs">
        <p><strong>Total Messages:</strong> {messages.length}</p>
        <div className="mt-2">
          <strong>Messages:</strong>
          <ul className="mt-1 space-y-1">
            {messages.map((msg, index) => (
              <li key={msg.id} className="border-b border-gray-100 pb-1">
                <div><strong>#{index + 1}</strong> ID: {msg.id}</div>
                <div>Content: {msg.content.substring(0, 30)}...</div>
                <div>Time: {msg.timestamp}</div>
                <div>Outgoing: {msg.isOutgoing ? 'Yes' : 'No'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MessageDebugger;
