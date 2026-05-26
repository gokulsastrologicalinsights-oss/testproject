'use client';

import { useState, useEffect } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { chatService } from '@/services/chat.service';
import { supabase } from '@/lib/supabase';

export default function DashboardChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConvos(true);
      try {
        const { data } = await chatService.getConversations();
        if (data) {
          setConversations(data);
          // Auto select first chat if available
          if (data.length > 0) {
            setActiveChatId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoadingConvos(false);
      }
    };
    loadConversations();
  }, []);

  // Load messages and subscribe to real-time channel
  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await chatService.getMessages(activeChatId);
        if (data) setMessages(data);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Real-time listener
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
    if (isMock) return;

    const channel = supabase
      .channel(`chat_messages_${activeChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${activeChatId}`
        },
        async (payload: any) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: userRow } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          const currentUserId = userRow?.id || user.id;
          const newMsg = payload.new;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                chat_id: newMsg.chat_id,
                sender_id: newMsg.sender_id === currentUserId ? 'self' : 'other',
                message: newMsg.message,
                created_at: newMsg.created_at
              }
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatId]);

  const handleSendMessage = async (text: string) => {
    if (!activeChatId) return;

    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      chat_id: activeChatId,
      sender_id: 'self',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Update conversation last message in side list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, last_message: text, updated_at: 'Just now' }
          : c
      )
    );

    // Call service to persist
    const { data, error } = await chatService.sendMessage(activeChatId, text);
    if (error) {
      // Revert optimism
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert('Failed to send message: ' + error.message);
    } else if (data) {
      // Replace optimistic message with actual DB record to ensure id and dates match
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data : m))
      );
    }
  };

  const activeChat = conversations.find((c) => c.id === activeChatId);

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Messages &amp; Conversations
        </h1>
        <p className="text-xs text-zinc-500 font-light mt-1 font-mono">
          Chat securely and privately with mutual partner connections
        </p>
      </div>

      <ChatLayout>
        <ConversationList
          conversations={conversations}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          loading={loadingConvos}
        />
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loadingMessages}
        />
      </ChatLayout>
    </div>
  );
}
