import { supabase } from '@/lib/supabase';

export const debugDatabase = async () => {
  console.log('=== DATABASE DEBUG ===');

  // Check if users table exists and has data
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      console.log('Users in database:', users);
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }

  // Check specific user
  const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c";
  try {
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', CURRENT_USER_ID)
      .single();

    if (currentUserError) {
      console.error('Error fetching current user:', currentUserError);
    } else {
      console.log('Current user found:', currentUser);
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error);
  }

  // Check conversations
  try {
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*');

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
    } else {
      console.log('Conversations in database:', conversations);
    }
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
  }

  // Check messages
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*');

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    } else {
      console.log('Messages in database:', messages);
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }

  console.log('=== END DATABASE DEBUG ===');
};

export const ensureCurrentUserExists = async () => {
  const CURRENT_USER_ID = "9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c";

  console.log('Checking if current user exists...');

  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', CURRENT_USER_ID)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create it
      console.log('Current user does not exist, creating...');

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: CURRENT_USER_ID,
          name: 'Periskope',
          avatar: 'https://ui-avatars.com/api/?background=4CAF50&color=fff&name=P',
          status: 'Online'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        return false;
      } else {
        console.log('User created successfully:', newUser);
        return true;
      }
    } else if (checkError) {
      console.error('Error checking user:', checkError);
      return false;
    } else {
      console.log('Current user already exists:', existingUser);
      return true;
    }
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    return false;
  }
};
