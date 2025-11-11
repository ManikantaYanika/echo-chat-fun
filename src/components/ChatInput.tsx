import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PromptLibrary } from "@/components/PromptLibrary";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <PromptLibrary onSelectPrompt={handlePromptSelect} />
      </div>
      
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-3"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message or choose a prompt template... (Shift+Enter for new line)"
          className="min-h-[60px] max-h-[200px] resize-none bg-background border-input focus-visible:ring-2 focus-visible:ring-primary transition-all"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-[60px] px-6 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all hover:scale-105"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
