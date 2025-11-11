import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}

export const useChat = (initialConversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  // Load user and conversation on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversation when user or conversationId changes
  useEffect(() => {
    if (!user) return;

    const loadConversation = async () => {
      let convId = initialConversationId || conversationId;

      if (!convId) {
        convId = crypto.randomUUID();
        setConversationId(convId);

        // Create new conversation
        await supabase
          .from('conversations')
          .insert({ id: convId, title: 'New Chat', user_id: user.id });
      } else {
        setConversationId(convId);

        // Load messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (messagesData) {
          setMessages(messagesData.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      }
    };

    loadConversation();
  }, [user, initialConversationId]);

  // Save message to database
  const saveMessage = async (message: Message) => {
    if (!conversationId) return;
    
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content
      });
  };

  const sendMessage = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    await saveMessage(userMsg);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: async () => {
          setIsLoading(false);
          // Save complete assistant message
          await saveMessage({ role: "assistant", content: assistantSoFar });
        },
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2) return;
    
    // Remove last assistant message
    const messagesWithoutLast = messages.slice(0, -1);
    setMessages(messagesWithoutLast);
    
    // Delete last message from database
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Get the last user message
    const lastUserMessage = messagesWithoutLast[messagesWithoutLast.length - 1];
    if (lastUserMessage?.role === 'user') {
      setIsLoading(true);
      let assistantSoFar = "";
      
      const upsertAssistant = (nextChunk: string) => {
        assistantSoFar += nextChunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        await streamChat({
          messages: messagesWithoutLast,
          onDelta: (chunk) => upsertAssistant(chunk),
          onDone: async () => {
            setIsLoading(false);
            await saveMessage({ role: "assistant", content: assistantSoFar });
          },
        });
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    }
  };

  const clearConversation = () => {
    setMessages([]);
    const newConvId = crypto.randomUUID();
    setConversationId(newConvId);
    if (user) {
      supabase
        .from('conversations')
        .insert({ id: newConvId, title: 'New Chat', user_id: user.id });
    }
  };

  return { 
    messages, 
    sendMessage, 
    isLoading, 
    regenerateLastResponse, 
    conversationId,
    clearConversation,
    user
  };
};
