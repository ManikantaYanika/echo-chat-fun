import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { Bot, Menu } from "lucide-react";

const Index = () => {
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false);
  const { messages, sendMessage, isLoading, regenerateLastResponse, conversationId, clearConversation, user } = useChat(currentConvId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (conversationId && !currentConvId) {
      setCurrentConvId(conversationId);
    }
  }, [conversationId, currentConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConversationSelect = (id: string) => {
    setCurrentConvId(id);
    setShowSidebar(false);
    window.location.reload();
  };

  const handleNewConversation = () => {
    clearConversation();
    setCurrentConvId('');
    setShowSidebar(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {showSidebar && (
        <ConversationSidebar
          currentConversationId={currentConvId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border bg-card">
          <div className="flex h-14 items-center px-4 gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:block p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-base font-semibold">AI Chat</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-12">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-elegant">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Welcome to AI Chat</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Start a conversation with your AI assistant. Ask questions, get help, or just chat!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <ChatMessage 
                    key={idx} 
                    role={msg.role} 
                    content={msg.content}
                    onRegenerate={msg.role === 'assistant' && idx === messages.length - 1 ? regenerateLastResponse : undefined}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-4 p-6 animate-fade-in">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">AI Assistant</p>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </main>

        <div className="border-t border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
