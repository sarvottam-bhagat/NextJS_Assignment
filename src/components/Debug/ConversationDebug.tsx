'use client';

import React, { useEffect, useState } from 'react';
import { getConversations, getConversationParticipants } from '@/lib/supabaseService';

const ConversationDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const conversations = await getConversations();
        
        const debugData = await Promise.all(
          conversations.map(async (conv) => {
            const participants = await getConversationParticipants(conv.id);
            return {
              id: conv.id,
              name: conv.name,
              participantCount: participants.length,
              participants: participants.map(p => p.name),
              is_group: conv.is_group,
              calculated_is_group: participants.length > 2
            };
          })
        );
        
        setDebugInfo(debugData);
        console.log('Conversation Debug Info:', debugData);
      } catch (error) {
        console.error('Debug fetch error:', error);
      }
    };

    fetchDebugInfo();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h3>Conversation Debug</h3>
      {debugInfo.map((conv) => (
        <div key={conv.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          <strong>{conv.name}</strong><br />
          Participants: {conv.participantCount} ({conv.participants.join(', ')})<br />
          is_group: {String(conv.is_group)}<br />
          calculated_is_group: {String(conv.calculated_is_group)}
        </div>
      ))}
    </div>
  );
};

export default ConversationDebug;
