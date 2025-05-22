import { supabase } from '@/lib/supabase';

const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c";
const DEFAULT_CONVERSATION_ID = "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b";

export const initializeDatabase = async () => {
  console.log('=== INITIALIZING DATABASE ===');

  try {
    // 1. Ensure current user exists
    await ensureUserExists(CURRENT_USER_ID, {
      name: 'Periskope',
      avatar: 'https://ui-avatars.com/api/?background=4CAF50&color=fff&name=P',
      status: 'Online'
    });

    // 2. Ensure other users exist
    await ensureUserExists('8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', {
      name: 'Rochirag Airtel',
      avatar: 'https://ui-avatars.com/api/?name=Rochirag+Airtel',
      status: 'Last seen 5 min ago'
    });

    await ensureUserExists('7d6e5f4c-3b2a-1e0d-9c8b-7a6d5e4f3c2b', {
      name: 'Rochirag Jio',
      avatar: 'https://ui-avatars.com/api/?name=Rochirag+Jio',
      status: 'Online'
    });

    await ensureUserExists('6c5d4e3b-2a1f-0e9d-8c7b-6a5d4e3f2c1b', {
      name: 'Bharat Kumar Ramesh',
      avatar: 'https://ui-avatars.com/api/?name=Bharat+Kumar',
      status: 'Last seen yesterday'
    });

    await ensureUserExists('5b4c3d2e-1a0f-9e8d-7c6b-5a4c3d2e1f0b', {
      name: 'Support2',
      avatar: 'https://ui-avatars.com/api/?name=Support2',
      status: 'Online'
    });

    // 3. Ensure default conversation exists
    await ensureConversationExists(DEFAULT_CONVERSATION_ID, {
      name: 'Test El Centro',
      avatar: 'https://ui-avatars.com/api/?name=Test+El'
    });

    // 4. Ensure all users are participants in default conversation (Test El Centro)
    await ensureParticipantExists(CURRENT_USER_ID, DEFAULT_CONVERSATION_ID);
    await ensureParticipantExists('8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', DEFAULT_CONVERSATION_ID); // Rochirag Airtel
    await ensureParticipantExists('7d6e5f4c-3b2a-1e0d-9c8b-7a6d5e4f3c2b', DEFAULT_CONVERSATION_ID); // Rochirag Jio
    await ensureParticipantExists('6c5d4e3b-2a1f-0e9d-8c7b-6a5d4e3f2c1b', DEFAULT_CONVERSATION_ID); // Bharat Kumar Ramesh
    await ensureParticipantExists('5b4c3d2e-1a0f-9e8d-7c6b-5a4c3d2e1f0b', DEFAULT_CONVERSATION_ID); // Support2

    console.log('=== DATABASE INITIALIZATION COMPLETE ===');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

const ensureUserExists = async (userId: string, userData: any) => {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create it
      console.log(`Creating user: ${userData.name}`);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          ...userData
        }])
        .select()
        .single();

      if (insertError) {
        console.error(`Error creating user ${userData.name}:`, insertError);
        throw insertError;
      } else {
        console.log(`User created successfully: ${userData.name}`);
      }
    } else if (checkError) {
      console.error(`Error checking user ${userData.name}:`, checkError);
      throw checkError;
    } else {
      console.log(`User already exists: ${userData.name}`);
    }
  } catch (error) {
    console.error(`Failed to ensure user exists: ${userData.name}`, error);
    throw error;
  }
};

const ensureConversationExists = async (conversationId: string, conversationData: any) => {
  try {
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Conversation doesn't exist, create it
      console.log(`Creating conversation: ${conversationData.name}`);

      const { data: newConversation, error: insertError } = await supabase
        .from('conversations')
        .insert([{
          id: conversationId,
          ...conversationData
        }])
        .select()
        .single();

      if (insertError) {
        console.error(`Error creating conversation ${conversationData.name}:`, insertError);
        throw insertError;
      } else {
        console.log(`Conversation created successfully: ${conversationData.name}`);
      }
    } else if (checkError) {
      console.error(`Error checking conversation ${conversationData.name}:`, checkError);
      throw checkError;
    } else {
      console.log(`Conversation already exists: ${conversationData.name}`);
    }
  } catch (error) {
    console.error(`Failed to ensure conversation exists: ${conversationData.name}`, error);
    throw error;
  }
};

const ensureParticipantExists = async (userId: string, conversationId: string) => {
  try {
    const { data: existingParticipant, error: checkError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Participant doesn't exist, add them
      console.log(`Adding user ${userId} to conversation ${conversationId}`);

      const { data: newParticipant, error: insertError } = await supabase
        .from('conversation_participants')
        .insert([{
          user_id: userId,
          conversation_id: conversationId
        }])
        .select()
        .single();

      if (insertError) {
        console.error(`Error adding participant:`, insertError);
        throw insertError;
      } else {
        console.log(`Participant added successfully`);
      }
    } else if (checkError) {
      console.error(`Error checking participant:`, checkError);
      throw checkError;
    } else {
      console.log(`Participant already exists`);
    }
  } catch (error) {
    console.error(`Failed to ensure participant exists`, error);
    throw error;
  }
};
