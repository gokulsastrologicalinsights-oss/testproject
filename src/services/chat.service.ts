import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const chatService = {
  async getConversations() {
    try {
      if (isMockMode()) {
        return { data: [
          { id: 'chat-1', contact_name: 'Meenakshi N.', age: 24, last_message: 'Hi, I reviewed your horoscope.', updated_at: '2 hours ago' },
          { id: 'chat-2', contact_name: 'Gayathri S.', age: 25, last_message: 'Hello, are you free for a call tomorrow?', updated_at: '1 day ago' }
        ], error: null };
      }

      // 1. Get logged-in user auth ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: new Error('User not authenticated') };

      // 2. Get user database row
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userRow) return { data: [], error: new Error('User row not found') };
      const currentUserId = userRow.id;

      // 3. Select all chats where current user is user_one or user_two
      const { data: chatList, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user_one.eq.${currentUserId},user_two.eq.${currentUserId}`);

      if (error || !chatList || chatList.length === 0) {
        return { data: [], error };
      }

      // 4. For each chat, retrieve opponent's profile and last message
      const conversations = await Promise.all(
        chatList.map(async (chat) => {
          const otherUserId = chat.user_one === currentUserId ? chat.user_two : chat.user_one;
          
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, age')
            .eq('user_id', otherUserId)
            .maybeSingle();

          // Get last message
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('message, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMsg = messages?.[0];

          return {
            id: chat.id,
            contact_name: profile ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Unknown Member',
            age: profile?.age || 25,
            last_message: lastMsg ? lastMsg.message : 'No messages yet',
            updated_at: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            other_user_id: otherUserId
          };
        })
      );

      return { data: conversations, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async getMessages(channelId: string) {
    try {
      if (isMockMode()) {
        if (channelId === 'chat-1') {
          return { data: [
            { id: 'msg-1', chat_id: 'chat-1', sender_id: 'other', message: 'Hello, interest request approved. Nice to connect with you.', created_at: '2026-05-26T11:55:00Z' },
            { id: 'msg-2', chat_id: 'chat-1', sender_id: 'self', message: 'Hi Meenakshi, glad to connect too. Hope you had a chance to view my profile.', created_at: '2026-05-26T11:58:00Z' },
            { id: 'msg-3', chat_id: 'chat-1', sender_id: 'other', message: 'Hi, I reviewed your horoscope. It matches well with my rasi!', created_at: '2026-05-26T12:00:00Z' }
          ], error: null };
        } else {
          return { data: [
            { id: 'msg-4', chat_id: 'chat-2', sender_id: 'other', message: 'Hello, are you free for a call tomorrow?', created_at: '2026-05-25T15:30:00Z' }
          ], error: null };
        }
      }

      // 1. Get logged-in user auth ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: new Error('User not authenticated') };

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const currentUserId = userRow?.id || user.id;

      // 2. Fetch message rows ordered by created_at ascending
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', channelId)
        .order('created_at', { ascending: true });

      if (error || !messages) return { data: [], error };

      const formatted = messages.map(m => ({
        id: m.id,
        chat_id: m.chat_id,
        sender_id: m.sender_id === currentUserId ? 'self' : 'other',
        message: m.message,
        created_at: m.created_at
      }));

      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async sendMessage(channelId: string, message: string) {
    try {
      if (isMockMode()) {
        return { data: { id: `msg-${Date.now()}`, chat_id: channelId, sender_id: 'self', message, created_at: new Date().toISOString() }, error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const currentUserId = userRow?.id || user.id;

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: channelId,
          sender_id: currentUserId,
          message: message,
        })
        .select();
      
      const formatted = data?.[0] ? {
        id: data[0].id,
        chat_id: data[0].chat_id,
        sender_id: 'self',
        message: data[0].message,
        created_at: data[0].created_at
      } : null;

      return { data: formatted, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
