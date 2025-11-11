import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookOpen, Code, FileText, Lightbulb, Search, TrendingUp, Briefcase, MessageSquare } from "lucide-react";

type PromptTemplate = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  icon: typeof Code;
};

const templates: PromptTemplate[] = [
  // Writing Templates
  {
    id: "blog-post",
    title: "Blog Post Outline",
    category: "writing",
    prompt: "Create a detailed blog post outline about [topic]. Include an engaging introduction, 3-5 main sections with key points, and a compelling conclusion with call-to-action.",
    icon: FileText,
  },
  {
    id: "email-pro",
    title: "Professional Email",
    category: "writing",
    prompt: "Write a professional email to [recipient] about [topic]. Keep it concise, polite, and action-oriented. Include a clear subject line.",
    icon: MessageSquare,
  },
  {
    id: "social-media",
    title: "Social Media Post",
    category: "writing",
    prompt: "Create an engaging social media post about [topic] for [platform]. Include relevant hashtags and a call-to-action. Maximum [character limit].",
    icon: TrendingUp,
  },
  {
    id: "product-desc",
    title: "Product Description",
    category: "writing",
    prompt: "Write a compelling product description for [product name]. Highlight key features, benefits, and what makes it unique. Target audience: [audience].",
    icon: Briefcase,
  },

  // Coding Templates
  {
    id: "code-review",
    title: "Code Review",
    category: "coding",
    prompt: "Review this code and provide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Security considerations\n\n[paste code here]",
    icon: Code,
  },
  {
    id: "debug-help",
    title: "Debug Assistance",
    category: "coding",
    prompt: "I'm getting this error: [error message]\n\nIn this code:\n[paste code]\n\nHelp me understand what's wrong and how to fix it.",
    icon: Code,
  },
  {
    id: "api-design",
    title: "API Design",
    category: "coding",
    prompt: "Design a RESTful API for [feature/system]. Include:\n1. Endpoint structure\n2. HTTP methods\n3. Request/response formats\n4. Error handling\n5. Authentication approach",
    icon: Code,
  },
  {
    id: "refactor",
    title: "Code Refactoring",
    category: "coding",
    prompt: "Refactor this code to improve:\n1. Readability\n2. Maintainability\n3. Performance\n4. Follow [language] best practices\n\n[paste code here]",
    icon: Code,
  },

  // Analysis Templates
  {
    id: "data-analysis",
    title: "Data Analysis",
    category: "analysis",
    prompt: "Analyze this data and provide insights:\n[paste data or describe dataset]\n\nFocus on:\n1. Key trends and patterns\n2. Anomalies or outliers\n3. Actionable recommendations",
    icon: TrendingUp,
  },
  {
    id: "competitor",
    title: "Competitor Analysis",
    category: "analysis",
    prompt: "Analyze [competitor name] in the [industry] sector:\n1. Strengths and weaknesses\n2. Market positioning\n3. Unique value propositions\n4. Potential opportunities for differentiation",
    icon: Lightbulb,
  },
  {
    id: "pros-cons",
    title: "Pros & Cons Analysis",
    category: "analysis",
    prompt: "Provide a detailed pros and cons analysis of [topic/decision/option]. Consider:\n1. Short-term vs long-term impacts\n2. Cost-benefit analysis\n3. Risk assessment\n4. Final recommendation",
    icon: Lightbulb,
  },
  {
    id: "market-research",
    title: "Market Research",
    category: "analysis",
    prompt: "Research the [industry/market] and provide:\n1. Market size and growth trends\n2. Key players and their market share\n3. Customer demographics and behavior\n4. Emerging trends and opportunities\n5. Potential challenges",
    icon: TrendingUp,
  },
];

type PromptLibraryProps = {
  onSelectPrompt: (prompt: string) => void;
};

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const categories = [
    { id: "writing", label: "Writing", icon: FileText },
    { id: "coding", label: "Coding", icon: Code },
    { id: "analysis", label: "Analysis", icon: Lightbulb },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Prompts</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Prompt Library
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 pb-6">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectPrompt(template.prompt)}
                  className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all hover:shadow-md group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.prompt}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
