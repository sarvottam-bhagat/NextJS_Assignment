'use client';

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import { MessageType } from "./Chat/ChatMessages";
import {
  getConversations,
  getMessages,
  sendMessage,
  getConversationParticipants,
  getLastMessageForConversation,
  updateConversationLabel,
  Conversation as SupabaseConversation,
  Message as SupabaseMessage
} from "@/lib/supabaseService";
import { LabelType } from "@/lib/labelConstants";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Rightbar from "./Rightbar";
import { initializeDatabase } from "@/utils/initializeDatabase";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  is_group?: boolean;
  label?: LabelType;
}

// Current user ID (would normally come from authentication)
const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c"; // Periskope user

// Default conversation ID to select if none is active
const DEFAULT_CONVERSATION_ID = "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b"; // Test El Centro

const MessagingApp = () => {
  const [activeConversation, setActiveConversation] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [conversationOrder, setConversationOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingConversationToSelect, setPendingConversationToSelect] = useState<string | null>(null);

  // Convert Supabase conversation to UI format
  const formatConversation = (conv: SupabaseConversation): Conversation => {
    // Create a status string from participants
    let status = "";
    if (conv.participants && conv.participants.length > 0) {
      if (conv.is_group) {
        // For group chats, show all participant names
        status = conv.participants
          .map(participant => participant.name)
          .join(", ");
      } else {
        // For individual chats, randomly set online/offline status
        // In a real app, this would come from the user's actual online status
        const isOnline = Math.random() > 0.5; // Randomly determine if user is online
        status = isOnline ? "Online" : "Offline";
      }
    }

    const formattedConv = {
      id: conv.id,
      name: conv.name,
      avatar: conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}`,
      status,
      is_group: conv.is_group || false,
      label: conv.label
    };

    return formattedConv;
  };

  // Fetch conversations from Supabase
  useEffect(() => {
    // Initialize database on mount
    const initializeApp = async () => {
      await initializeDatabase();
    };
    initializeApp();

    const fetchConversations = async () => {
      try {
        const supabaseConversations = await getConversations();

        // Convert to the format expected by the UI
        const conversationsMap: Record<string, Conversation> = {};
        const orderArray: string[] = [];

        // Sort conversations by last message timestamp (most recent first)
        const sortedConversations = supabaseConversations.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
          const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
          return timeB - timeA; // Most recent first
        });

        sortedConversations.forEach((conv: SupabaseConversation) => {
          conversationsMap[conv.id] = formatConversation(conv);
          orderArray.push(conv.id);
        });

        setConversations(conversationsMap);
        setConversationOrder(orderArray);

        // Set the default conversation as active if none is selected
        if (!activeConversation) {
          // Try to find the default conversation
          const defaultConv = supabaseConversations.find(conv => conv.id === DEFAULT_CONVERSATION_ID);

          // If default conversation exists, select it, otherwise select the first one
          if (defaultConv) {
            setActiveConversation(DEFAULT_CONVERSATION_ID);
          } else if (supabaseConversations.length > 0) {
            setActiveConversation(supabaseConversations[0].id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new conversations
    const conversationSubscription = supabase
      .channel('public:conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, async (payload) => {
        if (payload.new) {
          try {
            // Check if the current user is a participant in this conversation
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', payload.new.id)
              .eq('user_id', CURRENT_USER_ID);

            // Only add the conversation if the current user is a participant
            if (participants && participants.length > 0) {
              // Get the full conversation with participants
              const { data: newConversation } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', payload.new.id)
                .single();

              if (newConversation) {
                // Get participants for the conversation
                const participantsList = await getConversationParticipants(newConversation.id);
                const lastMessage = await getLastMessageForConversation(newConversation.id);

                const fullConversation: SupabaseConversation = {
                  ...newConversation,
                  participants: participantsList,
                  lastMessage: lastMessage.length > 0 ? lastMessage[0] : null
                };

                // Add the new conversation to the state and move it to the top
                setConversations(prev => ({
                  ...prev,
                  [fullConversation.id]: formatConversation(fullConversation)
                }));

                setConversationOrder(prev => [fullConversation.id, ...prev.filter(id => id !== fullConversation.id)]);

                // Automatically select the new conversation
                console.log(`MessagingApp: Auto-selecting new conversation: ${fullConversation.id}`);
                setActiveConversation(fullConversation.id);

                // Notify the user
                const chatType = fullConversation.is_group ? 'group chat' : 'conversation';
                toast.success(`New ${chatType} started with ${fullConversation.name}`);
              }
            }
          } catch (error) {
            console.error('Error processing new conversation:', error);
          }
        }
      })
      .subscribe();

    // Set up real-time subscription for all new messages to update conversation order
    const allMessagesSubscription = supabase
      .channel('public:all-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        if (payload.new) {
          try {
            const conversationId = payload.new.conversation_id;

            // Check if this conversation belongs to the current user
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversationId)
              .eq('user_id', CURRENT_USER_ID);

            if (participants && participants.length > 0) {
              // Move this conversation to the top of the order
              setConversationOrder(prev => [conversationId, ...prev.filter(id => id !== conversationId)]);

              console.log(`MessagingApp: Moved conversation ${conversationId} to top due to new message`);
            }
          } catch (error) {
            console.error('Error processing new message for conversation order:', error);
          }
        }
      })
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      conversationSubscription.unsubscribe();
      allMessagesSubscription.unsubscribe();
    };
  }, []);

  // Handle pending conversation selection
  useEffect(() => {
    if (pendingConversationToSelect && conversations[pendingConversationToSelect]) {
      console.log(`MessagingApp: Selecting pending conversation: ${pendingConversationToSelect}`);
      setActiveConversation(pendingConversationToSelect);
      setPendingConversationToSelect(null);
    }
  }, [conversations, pendingConversationToSelect]);

  // Format a Supabase message to UI message format
  const formatMessage = (msg: SupabaseMessage): MessageType => {
    const isOutgoing = msg.sender_id === CURRENT_USER_ID;

    // Format timestamp
    const timestamp = new Date(msg.timestamp);
    const formattedTime = format(timestamp, "HH:mm");

    // Format full date for grouping (Today, Yesterday, or date)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Set timestamp to beginning of day for comparison
    const timestampDate = new Date(timestamp);
    timestampDate.setHours(0, 0, 0, 0);

    // Determine recipient online status for outgoing messages
    let recipientOnline = false;
    if (isOutgoing && activeConversation && conversations[activeConversation]) {
      const conversation = conversations[activeConversation];
      // For individual chats, check if the other participant is online
      if (!conversation.is_group && conversation.status) {
        recipientOnline = conversation.status.includes("Online");
      }
    }

    let fullDate;
    if (timestampDate.getTime() === today.getTime()) {
      fullDate = "Today";
    } else if (timestampDate.getTime() === yesterday.getTime()) {
      fullDate = "Yesterday";
    } else {
      fullDate = format(timestamp, "dd-MM-yyyy");
    }

    // Debug: Log message formatting
    console.log('Formatting message:', {
      id: msg.id,
      content: msg.content,
      originalTimestamp: msg.timestamp,
      formattedTime,
      fullDate,
      isOutgoing,
      today: today.toISOString(),
      yesterday: yesterday.toISOString(),
      timestampDate: timestampDate.toISOString()
    });

    return {
      id: msg.id,
      content: msg.content,
      timestamp: formattedTime,
      originalTimestamp: msg.timestamp, // Keep original timestamp for accurate sorting
      fullDate,
      isOutgoing,
      senderName: msg.sender ? msg.sender.name : (isOutgoing ? "You" : "Unknown"),
      senderAvatar: msg.sender ? msg.sender.avatar : undefined,
      attachmentType: msg.attachment_type,
      attachmentUrl: msg.attachment_url,
      attachmentName: msg.attachment_name,
      attachmentSize: msg.attachment_size,
      isRead: msg.is_read || false,
      isDelivered: true, // Assume delivered if we have the message
      recipientOnline
    };
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) {
        setMessages([]);
        return;
      }

      console.log(`Fetching messages for conversation: ${activeConversation}`);

      try {
        const supabaseMessages = await getMessages(activeConversation);
        console.log(`Fetched ${supabaseMessages.length} messages from database`);

        // Convert to the format expected by the UI
        const formattedMessages: MessageType[] = supabaseMessages.map(formatMessage);

        setMessages(formattedMessages);
        console.log(`Set ${formattedMessages.length} formatted messages in state`);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]); // Clear messages on error
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`messages-${activeConversation}`) // Use unique channel name per conversation
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConversation}`
      }, async (payload) => {
        console.log('Real-time message received:', payload);

        // Only process messages for the active conversation
        if (payload.new && payload.new.conversation_id === activeConversation) {
          // Get the complete message with sender information
          try {
            const { data: sender } = await supabase
              .from('users')
              .select('*')
              .eq('id', payload.new.sender_id)
              .single();

            const newMessage: SupabaseMessage = {
              ...payload.new as any,
              sender
            };

            console.log('Processing real-time message:', newMessage);

            // Don't add messages from the current user that were already added optimistically
            if (newMessage.sender_id !== CURRENT_USER_ID) {
              const formattedMessage = formatMessage(newMessage);
              console.log('Adding real-time message from other user:', formattedMessage);

              setMessages(prev => {
                // Check if this message already exists (to avoid duplicates)
                const existingIndex = prev.findIndex(msg => msg.id === formattedMessage.id);
                if (existingIndex !== -1) {
                  console.log('Message already exists, skipping duplicate');
                  return prev; // Message already exists, don't add duplicate
                }
                // Add new message to the end
                const newMessages = [...prev, formattedMessage];
                console.log(`Added message, total messages: ${newMessages.length}`);
                return newMessages;
              });
            } else {
              console.log('Skipping real-time message from current user (already added optimistically)');
            }
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      })
      .subscribe();

    // Clean up subscription when component unmounts or conversation changes
    return () => {
      console.log(`Cleaning up subscription for conversation: ${activeConversation}`);
      subscription.unsubscribe();
    };
  }, [activeConversation]);

  const handleSelectConversation = async (id: string) => {
    console.log(`MessagingApp: Attempting to select conversation: ${id}`);

    // Check if the conversation exists in our state
    if (conversations[id]) {
      console.log(`MessagingApp: Conversation found, setting as active: ${id}`);
      setActiveConversation(id);
    } else {
      console.log(`MessagingApp: Conversation not found in state, fetching from database: ${id}`);

      try {
        // Fetch the conversation from the database
        const { data: conversationData } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .single();

        if (conversationData) {
          // Get participants for the conversation
          const participantsList = await getConversationParticipants(conversationData.id);
          const lastMessage = await getLastMessageForConversation(conversationData.id);

          const fullConversation: SupabaseConversation = {
            ...conversationData,
            participants: participantsList,
            lastMessage: lastMessage.length > 0 ? lastMessage[0] : null
          };

          // Add the conversation to state
          const formattedConversation = formatConversation(fullConversation);
          setConversations(prev => ({
            ...prev,
            [fullConversation.id]: formattedConversation
          }));

          // Now select it
          console.log(`MessagingApp: Fetched and added conversation, setting as active: ${id}`);
          setActiveConversation(id);
        } else {
          console.error(`MessagingApp: Conversation ${id} not found in database`);
          setPendingConversationToSelect(id);
        }
      } catch (error) {
        console.error(`MessagingApp: Error fetching conversation ${id}:`, error);
        setPendingConversationToSelect(id);
      }
    }
  };

  const handleLabelChange = async (conversationId: string, label: LabelType) => {
    try {
      // Update the label in the database
      const success = await updateConversationLabel(conversationId, label);

      if (success) {
        // Update the conversation in the local state
        setConversations(prev => ({
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            label
          }
        }));
      }
    } catch (error) {
      console.error("Error updating label:", error);
      toast.error("Failed to update label");
    }
  };

  const handleSendMessage = async (message: string, attachment?: File) => {
    if (!activeConversation || (!message.trim() && !attachment)) return;

    let attachmentData = null;

    // If there's an attachment, upload it first
    if (attachment) {
      try {
        // Import the upload function dynamically to avoid circular dependencies
        const { uploadFile } = await import('@/lib/fileUploadService');
        attachmentData = await uploadFile(attachment);

        if (!attachmentData) {
          toast.error("Failed to upload attachment");
          return;
        }
      } catch (error) {
        console.error("Error uploading attachment:", error);
        toast.error("Failed to upload attachment");
        return;
      }
    }

    // Optimistically add the message to the UI
    const now = new Date();

    // Format the timestamp for display
    const formattedTime = format(now, "HH:mm");

    // Determine recipient online status for the new message
    let recipientOnline = false;
    if (activeConversation && conversations[activeConversation]) {
      const conversation = conversations[activeConversation];
      // For individual chats, check if the other participant is online
      if (!conversation.is_group && conversation.status) {
        recipientOnline = conversation.status.includes("Online");
      }
    }

    const newMessage: MessageType = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
      timestamp: formattedTime,
      originalTimestamp: now.toISOString(), // Include original timestamp for proper sorting
      fullDate: "Today", // New messages are always from today
      isOutgoing: true,
      senderName: "You",
      isRead: false, // New messages start as unread
      isDelivered: false, // Will be true once sent to server
      recipientOnline,
      ...(attachmentData && {
        attachmentType: attachmentData.type,
        attachmentUrl: attachmentData.url,
        attachmentName: attachmentData.name,
        attachmentSize: attachmentData.size
      })
    };

    console.log('Adding optimistic message:', newMessage);
    setMessages((prev) => {
      const newMessages = [...prev, newMessage];
      console.log(`Added optimistic message, total messages: ${newMessages.length}`);
      return newMessages;
    });

    try {
      // Send the message to Supabase
      console.log('Sending message to server...');
      const sentMessage = await sendMessage({
        conversation_id: activeConversation,
        sender_id: CURRENT_USER_ID,
        content: message.trim(),
        ...(attachmentData && {
          attachment_type: attachmentData.type,
          attachment_url: attachmentData.url,
          attachment_name: attachmentData.name,
          attachment_size: attachmentData.size
        })
      });

      if (sentMessage) {
        console.log('Message sent successfully, replacing optimistic message:', sentMessage);
        // Replace the temporary message with the real one from the server
        setMessages((prev) => {
          const updatedMessages = prev.map(msg =>
            msg.id === newMessage.id
              ? formatMessage(sentMessage)
              : msg
          );
          console.log(`Replaced optimistic message, total messages: ${updatedMessages.length}`);
          return updatedMessages;
        });

        // Move the current conversation to the top of the order
        setConversationOrder(prev => [activeConversation, ...prev.filter(id => id !== activeConversation)]);
        console.log(`MessagingApp: Moved conversation ${activeConversation} to top after sending message`);
      } else {
        console.error('Failed to send message: no response from server');
        toast.error("Failed to send message");
        // Remove the optimistic message on error
        setMessages((prev) => {
          const filteredMessages = prev.filter(msg => msg.id !== newMessage.id);
          console.log(`Removed failed message, total messages: ${filteredMessages.length}`);
          return filteredMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");

      // Remove the optimistic message on error
      setMessages((prev) => {
        const filteredMessages = prev.filter(msg => msg.id !== newMessage.id);
        console.log(`Removed failed message due to error, total messages: ${filteredMessages.length}`);
        return filteredMessages;
      });
    }
  };

  // Handle direct message creation from floating button
  const handleDirectMessageCreated = (conversationId: string) => {
    console.log(`MessagingApp: Direct message created, selecting conversation: ${conversationId}`);
    // The conversation should already be in state from real-time subscription
    // Just select it
    setActiveConversation(conversationId);
  };

  // Create ordered conversations object for the sidebar
  const orderedConversations = useMemo(() => {
    const ordered: Record<string, Conversation> = {};
    conversationOrder.forEach(id => {
      if (conversations[id]) {
        ordered[id] = conversations[id];
      }
    });
    return ordered;
  }, [conversations, conversationOrder]);

  return (
    <main className="flex h-full overflow-hidden">
      <Sidebar
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onLabelChange={handleLabelChange}
        conversations={orderedConversations}
        onDirectMessageCreated={handleDirectMessageCreated}
      />
      <section className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {activeConversation && conversations[activeConversation] ? (
          <Chat
            conversation={conversations[activeConversation]}
            messages={messages}
            onSendMessage={handleSendMessage}
            onLabelChange={handleLabelChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </div>
        )}
      </section>
      <Rightbar />
    </main>
  );
};

export default MessagingApp;
