import { supabase } from './supabase';
import { LabelType } from './labelConstants';

// Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  participants?: User[];
  lastMessage?: Message;
  is_group?: boolean;
  label?: LabelType;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  sender?: User;
  attachment_type?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
}

// User services
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
};

// Conversation services
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false }); // Sort by creation date, newest first

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Get participants for each conversation
  const conversationsWithParticipants = await Promise.all(
    (data || []).map(async (conversation) => {
      const participants = await getConversationParticipants(conversation.id);
      const lastMessage = await getLastMessageForConversation(conversation.id);

      // Determine if this is a group chat based on the number of participants
      // If there are more than 2 participants, it's a group chat
      const is_group = participants.length > 2;

      return {
        ...conversation,
        participants,
        lastMessage: lastMessage.length > 0 ? lastMessage[0] : null,
        is_group // Add the is_group property
      };
    })
  );

  // Sort conversations by last message timestamp (newest first)
  // If a conversation has no messages, it will be placed at the end
  return conversationsWithParticipants.sort((a, b) => {
    // If both have last messages, compare their timestamps
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    }

    // If only a has a last message, a comes first
    if (a.lastMessage) return -1;

    // If only b has a last message, b comes first
    if (b.lastMessage) return 1;

    // If neither has a last message, sort by creation date
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });
};

export const getConversationParticipants = async (conversationId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId);

  if (error || !data) {
    console.error('Error fetching conversation participants:', error);
    return [];
  }

  // Get user details for each participant
  const userIds = data.map(participant => participant.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds);

  if (usersError) {
    console.error('Error fetching users for conversation:', usersError);
    return [];
  }

  return users || [];
};

// Message services
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  console.log(`getMessages: Fetching messages for conversation ${conversationId}`);

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });  // Changed to ascending order (oldest first)

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  console.log(`getMessages: Found ${data?.length || 0} messages in database`);

  // Get sender details for each message
  const messagesWithSenders = await Promise.all(
    (data || []).map(async (message) => {
      if (!message.sender_id) return message;

      const { data: sender } = await supabase
        .from('users')
        .select('*')
        .eq('id', message.sender_id)
        .single();

      return {
        ...message,
        sender: sender || undefined
      };
    })
  );

  console.log(`getMessages: Returning ${messagesWithSenders.length} messages with sender details`);
  return messagesWithSenders;
};

export const getLastMessageForConversation = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last message:', error);
    return [];
  }

  return data || [];
};

export const sendMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'is_read' | 'sender'>): Promise<Message | null> => {
  console.log('sendMessage: Sending message to database:', message);

  // Create message object with all possible fields
  const messageData: any = {
    conversation_id: message.conversation_id,
    sender_id: message.sender_id,
    content: message.content || '',
    is_read: false
  };

  // Add attachment fields if they exist
  if (message.attachment_type) {
    messageData.attachment_type = message.attachment_type;
  }

  if (message.attachment_url) {
    messageData.attachment_url = message.attachment_url;
  }

  if (message.attachment_name) {
    messageData.attachment_name = message.attachment_name;
  }

  if (message.attachment_size !== undefined) {
    messageData.attachment_size = message.attachment_size;
  }

  console.log('sendMessage: Message data to insert:', messageData);

  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single();

  if (error) {
    console.error('sendMessage: Error sending message:', error);
    return null;
  }

  console.log('sendMessage: Message sent successfully:', data);
  return data;
};

// Create a new conversation (group or individual)
export const createConversation = async (conversation: Pick<Conversation, 'name' | 'avatar'> & { is_group?: boolean }): Promise<Conversation | null> => {
  // Remove is_group from the insert data since it doesn't exist in the database schema
  const { data, error } = await supabase
    .from('conversations')
    .insert([
      {
        name: conversation.name,
        avatar: conversation.avatar
        // is_group field is removed as it doesn't exist in the database
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  // Add the is_group property to the returned data
  return {
    ...data,
    is_group: conversation.is_group || false
  };
};

// Add participants to a conversation
export const addParticipantsToConversation = async (conversationId: string, userIds: string[]): Promise<boolean> => {
  // Create an array of participant objects
  const participants = userIds.map(userId => ({
    conversation_id: conversationId,
    user_id: userId
  }));

  const { error } = await supabase
    .from('conversation_participants')
    .insert(participants);

  if (error) {
    console.error('Error adding participants to conversation:', error);
    return false;
  }

  return true;
};

// Create a group chat with participants
export const createGroupChat = async (
  name: string,
  creatorId: string,
  participantIds: string[]
): Promise<Conversation | null> => {
  try {
    // Create the conversation
    const conversation = await createConversation({
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
      is_group: true
    });

    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    // Add all participants including the creator
    const allParticipantIds = [...new Set([creatorId, ...participantIds])];
    const success = await addParticipantsToConversation(conversation.id, allParticipantIds);

    if (!success) {
      throw new Error('Failed to add participants');
    }

    return conversation;
  } catch (error) {
    console.error('Error creating group chat:', error);
    return null;
  }
};

// Create a direct message conversation between two users
export const createDirectMessageConversation = async (
  currentUserId: string,
  otherUserId: string,
  otherUserName: string,
  otherUserAvatar?: string
): Promise<Conversation | null> => {
  try {
    // First check if a direct message conversation already exists
    const existingDirectMessage = await findDirectMessageConversation(currentUserId, otherUserId);

    if (existingDirectMessage) {
      console.log('createDirectMessageConversation: Found existing direct message conversation');
      return existingDirectMessage;
    }

    // Create a new conversation
    const conversationName = otherUserName;
    const newConversation = await createConversation({
      name: conversationName,
      avatar: otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}`,
      is_group: false // Explicitly mark as not a group chat
    });

    if (!newConversation) {
      throw new Error('Failed to create conversation');
    }

    // Add both users to the conversation
    const participants = [currentUserId, otherUserId];
    const success = await addParticipantsToConversation(newConversation.id, participants);

    if (!success) {
      throw new Error('Failed to add participants');
    }
    return newConversation;
  } catch (error) {
    console.error('Error creating direct message conversation:', error);
    return null;
  }
};

// Check if a direct message conversation already exists between two users
export const findDirectMessageConversation = async (
  userId1: string,
  userId2: string
): Promise<Conversation | null> => {
  try {
    console.log(`findDirectMessageConversation: Looking for conversation between ${userId1} and ${userId2}`);

    // Get all conversations where user1 is a participant
    const { data: user1Conversations, error: user1Error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId1);

    console.log(`findDirectMessageConversation: User1 conversations:`, user1Conversations);

    if (user1Error || !user1Conversations || user1Conversations.length === 0) {
      console.log('findDirectMessageConversation: No conversations found for user1');
      return null;
    }

    // Get all conversations where user2 is a participant
    const { data: user2Conversations, error: user2Error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId2)
      .in('conversation_id', user1Conversations.map(c => c.conversation_id));

    console.log(`findDirectMessageConversation: Common conversations:`, user2Conversations);

    if (user2Error || !user2Conversations || user2Conversations.length === 0) {
      console.log('findDirectMessageConversation: No common conversations found');
      return null;
    }

    // For each common conversation, check if it has exactly 2 participants
    for (const { conversation_id } of user2Conversations) {
      console.log(`findDirectMessageConversation: Checking conversation ${conversation_id}`);

      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation_id);

      console.log(`findDirectMessageConversation: Participants in ${conversation_id}:`, participants);

      if (participantsError || !participants) continue;

      // If this conversation has exactly 2 participants, it's a direct message conversation
      if (participants.length === 2) {
        console.log(`findDirectMessageConversation: Found direct message conversation ${conversation_id}`);

        // Get the conversation details
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversation_id)
          .single();

        if (conversationError || !conversation) continue;

        console.log(`findDirectMessageConversation: Returning existing conversation:`, conversation);

        // Add the is_group property (direct messages are not group chats)
        return {
          ...conversation,
          is_group: false
        };
      }
    }

    console.log('findDirectMessageConversation: No direct message conversation found');
    return null;
  } catch (error) {
    console.error('Error finding direct message conversation:', error);
    return null;
  }
};

// Find any conversations (group or direct) between two users
export const findAnyConversationsBetweenUsers = async (
  userId1: string,
  userId2: string
): Promise<Conversation[]> => {
  try {
    console.log(`findAnyConversationsBetweenUsers: Looking for any conversations between ${userId1} and ${userId2}`);

    // Get all conversations where user1 is a participant
    const { data: user1Conversations, error: user1Error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId1);

    if (user1Error || !user1Conversations || user1Conversations.length === 0) {
      console.log('findAnyConversationsBetweenUsers: No conversations found for user1');
      return [];
    }

    // Get all conversations where user2 is a participant
    const { data: user2Conversations, error: user2Error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId2)
      .in('conversation_id', user1Conversations.map(c => c.conversation_id));

    if (user2Error || !user2Conversations || user2Conversations.length === 0) {
      console.log('findAnyConversationsBetweenUsers: No common conversations found');
      return [];
    }

    console.log(`findAnyConversationsBetweenUsers: Found ${user2Conversations.length} common conversations`);

    // Get details for all common conversations
    const conversations: Conversation[] = [];

    for (const { conversation_id } of user2Conversations) {
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversation_id)
        .single();

      if (conversationError || !conversation) continue;

      // Get participant count to determine if it's a group or direct message
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation_id);

      if (participantsError || !participants) continue;

      conversations.push({
        ...conversation,
        is_group: participants.length > 2
      });
    }

    console.log(`findAnyConversationsBetweenUsers: Returning ${conversations.length} conversations`);
    return conversations;
  } catch (error) {
    console.error('Error finding conversations between users:', error);
    return [];
  }
};

// Remove a participant from a conversation
export const removeParticipantFromConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing participant from conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing participant from conversation:', error);
    return false;
  }
};

// Get users not in a conversation (for adding new participants)
export const getUsersNotInConversation = async (
  conversationId: string
): Promise<User[]> => {
  try {
    // Get all users in the conversation
    const participants = await getConversationParticipants(conversationId);
    const participantIds = participants.map(user => user.id);

    // Get all users
    const allUsers = await getUsers();

    // Filter out users already in the conversation
    return allUsers.filter(user => !participantIds.includes(user.id));
  } catch (error) {
    console.error('Error getting users not in conversation:', error);
    return [];
  }
};

// Update the label for a conversation
export const updateConversationLabel = async (
  conversationId: string,
  label: LabelType
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ label })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation label:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating conversation label:', error);
    return false;
  }
};

// Get the label for a conversation
export const getConversationLabel = async (
  conversationId: string
): Promise<LabelType> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('label')
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      console.error('Error getting conversation label:', error);
      return null;
    }

    return data.label;
  } catch (error) {
    console.error('Error getting conversation label:', error);
    return null;
  }
};
