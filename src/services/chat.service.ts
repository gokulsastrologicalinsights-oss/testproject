import { supabase } from '@/lib/supabase';

export const chatService = {
  async getConversations() {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*');
      return { data: data || [], error };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async getMessages(channelId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', channelId);
      return { data: data || [], error };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async sendMessage(channelId: string, message: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: channelId,
          message_text: message,
        });
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
