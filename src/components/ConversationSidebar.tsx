import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, Search, Trash2, Edit2, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ConversationSidebarProps = {
  currentConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
};

export function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load conversations");
      return;
    }

    setConversations(data || []);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete conversation");
      return;
    }

    toast.success("Conversation deleted");
    loadConversations();

    if (id === currentConversationId) {
      onNewConversation();
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;

    const { error } = await supabase
      .from("conversations")
      .update({ title: editTitle })
      .eq("id", id);

    if (error) {
      toast.error("Failed to rename conversation");
      return;
    }

    toast.success("Conversation renamed");
    setEditingId(null);
    loadConversations();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-lg hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      
      <aside className="fixed lg:sticky top-0 left-0 z-50 h-screen w-80 bg-card border-r border-border flex flex-col shadow-elegant animate-slide-in-right">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Button
            onClick={onNewConversation}
            className="w-full justify-start gap-2 h-10"
          >
            <PlusCircle className="w-4 h-4" />
            New Chat
          </Button>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-lg transition-all ${
                  conv.id === currentConversationId
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                {editingId === conv.id ? (
                  <div className="p-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="h-8"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => onConversationSelect(conv.id)}
                    className="w-full text-left p-3 pr-20 truncate"
                  >
                    <div className="font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                )}

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(conv.id);
                      setEditTitle(conv.title);
                    }}
                    className="p-1.5 hover:bg-background rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-2 h-10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
