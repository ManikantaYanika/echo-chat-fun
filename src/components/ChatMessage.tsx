import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "bg-muted/30" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-primary to-secondary text-white"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm font-medium text-foreground">
          {isUser ? "You" : "AI Assistant"}
        </p>
        <div className="prose prose-sm max-w-none text-foreground/90">
          {content}
        </div>
      </div>
    </div>
  );
};
