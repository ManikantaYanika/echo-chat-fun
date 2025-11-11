import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, RotateCcw } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "./ui/button";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onRegenerate?: () => void;
}

export const ChatMessage = ({ role, content, onRegenerate }: ChatMessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group flex gap-4 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all hover:bg-muted/20",
        isUser ? "bg-muted/30" : "bg-background"
      )}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-primary to-secondary text-white"
        )}
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {isUser ? "You" : "AI Assistant"}
          </p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
              title="Copy message"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {!isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRegenerate}
                className="h-8 w-8"
                title="Regenerate response"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-hidden">
          {isUser ? (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );
};
