import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Bot, Sparkles } from "lucide-react";

const Index = () => {
  const { messages, sendMessage, isLoading, regenerateLastResponse } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Chat Assistant</h1>
              <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-12">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Welcome to AI Chat</h2>
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
                <div className="flex gap-4 p-6 bg-background">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">AI Assistant</p>
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

      {/* Input */}
      <div className="mx-auto w-full max-w-4xl">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
