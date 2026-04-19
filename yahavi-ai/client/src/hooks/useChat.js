import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const API_URL = '/api/chat';

export default function useChat() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeMessages = chats.find(c => c.id === activeChatId)?.messages ?? [];

  const newChat = useCallback(() => {
    const id = uuidv4();
    setChats(prev => [{ id, title: 'New Content', messages: [], createdAt: new Date() }, ...prev]);
    setActiveChatId(id);
    return id;
  }, []);

  const selectChat = useCallback((id) => setActiveChatId(id), []);

  const clearChat = useCallback(() => {
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [] } : c));
  }, [activeChatId]);

  const deleteChat = useCallback((id) => {
    setChats(prev => prev.filter(c => c.id !== id));
    setActiveChatId(prev => (prev === id ? null : prev));
  }, []);

  // Core function: appends a new assistant message to a given chat
  const appendAssistantMessage = useCallback(async (chatId, topic, platform, tone, provider, apiKey) => {
    const assistantMsgId = uuidv4();

    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      return {
        ...c,
        messages: [
          ...c.messages,
          { id: assistantMsgId, role: 'assistant', content: null, timestamp: new Date(), isStreaming: true },
        ],
      };
    }));

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: topic, platform, tone, provider, apiKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate content');

      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantMsgId ? { ...m, content: data.data, isStreaming: false } : m
          ),
        };
      }));
    } catch (err) {
      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantMsgId ? { ...m, content: { error: err.message }, isStreaming: false } : m
          ),
        };
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (topic, platform, tone, provider, apiKey) => {
    if (isLoading) return;

    // Ensure we have an active chat
    let chatId = activeChatId;
    if (!chatId) {
      chatId = uuidv4();
      const newChatObj = {
        id: chatId,
        title: topic.slice(0, 45),
        messages: [],
        createdAt: new Date(),
      };
      setChats(prev => [newChatObj, ...prev]);
      setActiveChatId(chatId);
    }

    const userMsgId = uuidv4();
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const isFirst = c.messages.length === 0;
      return {
        ...c,
        title: isFirst ? topic.slice(0, 45) : c.title,
        messages: [
          ...c.messages,
          { id: userMsgId, role: 'user', content: topic, platform, tone, timestamp: new Date() },
        ],
      };
    }));

    await appendAssistantMessage(chatId, topic, platform, tone, provider, apiKey);
  }, [activeChatId, isLoading, appendAssistantMessage]);

  const regenerateLast = useCallback(async (platform, tone, provider, apiKey) => {
    if (isLoading || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    // Find last user message
    const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove last assistant message
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const msgs = [...c.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') { msgs.splice(i, 1); break; }
      }
      return { ...c, messages: msgs };
    }));

    await appendAssistantMessage(
      activeChatId,
      lastUserMsg.content,
      platform || lastUserMsg.platform || 'Instagram',
      tone   || lastUserMsg.tone     || 'Professional',
      provider,
      apiKey
    );
  }, [activeChatId, chats, isLoading, appendAssistantMessage]);

  return {
    chats,
    activeChatId,
    messages: activeMessages,
    isLoading,
    sendMessage,
    newChat,
    selectChat,
    clearChat,
    deleteChat,
    regenerateLast,
  };
}
