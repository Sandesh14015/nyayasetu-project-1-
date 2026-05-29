import { useState, useRef, useEffect } from "react";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiConversationsQueryKey,
  getListOpenaiMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, User, Send, Plus, Trash2, Scale, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ECOURTS_LINKS = [
  { label: "Check Case Status", href: "https://services.ecourts.gov.in/ecourtindia_v6/" },
  { label: "eFiling Portal", href: "https://efiling.ecourts.gov.in/" },
  { label: "Pay Court Fees", href: "https://pay.ecourts.gov.in/" },
  { label: "Free Legal Aid (NALSA)", href: "https://nalsa.gov.in/" },
];

export default function Chatbot() {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
      <ChatSidebar activeId={activeId} onSelect={setActiveId} />
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10 border-l border-border/40">
        {activeId ? (
          <ChatArea conversationId={activeId} />
        ) : (
          <EmptyChat onSelect={setActiveId} />
        )}
      </div>
    </div>
  );
}

function ChatSidebar({ activeId, onSelect }: { activeId: number | null; onSelect: (id: number | null) => void }) {
  const queryClient = useQueryClient();
  const { data: conversations, isLoading } = useListOpenaiConversations();
  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  const handleNewChat = () => {
    createConv.mutate(
      { data: { title: "Legal Query — " + new Date().toLocaleString() } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          onSelect(data.id);
        },
      }
    );
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConv.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          if (activeId === id) onSelect(null);
        },
      }
    );
  };

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          disabled={createConv.isPending}
          data-testid="button-new-chat"
        >
          {createConv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New Legal Query
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading history...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No previous queries</div>
          ) : (
            conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                data-testid={`conv-item-${conv.id}`}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors text-left group",
                  activeId === conv.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                )}
              >
                <div className="truncate flex-1 pr-2">{conv.title}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 -mr-1"
                  onClick={(e) => handleDelete(conv.id, e)}
                  data-testid={`button-delete-conv-${conv.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* eCourts quick links */}
      <div className="p-3 border-t border-border space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-2">eCourts Services</p>
        {ECOURTS_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            data-testid={`ecourts-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}

function EmptyChat({ onSelect }: { onSelect: (id: number) => void }) {
  const queryClient = useQueryClient();
  const createConv = useCreateOpenaiConversation();

  const startQuery = (prompt: string) => {
    createConv.mutate(
      { data: { title: prompt.substring(0, 40) + (prompt.length > 40 ? "..." : "") } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
          onSelect(data.id);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto w-full">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Scale className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">NyayaSetu AI Legal Assistant</h2>
      <p className="text-muted-foreground mb-2 text-sm">
        Ask questions about Indian court procedures, eFiling, legal aid, case tracking, and more.
      </p>
      <p className="text-xs text-muted-foreground mb-8">
        To check a specific case, visit the{" "}
        <a href="https://services.ecourts.gov.in/ecourtindia_v6/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          eCourts Services Portal
        </a>{" "}
        directly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <QuickPrompt text="How do I check my case status on eCourts?" onClick={startQuery} />
        <QuickPrompt text="How do I file a case online via eFiling?" onClick={startQuery} />
        <QuickPrompt text="Am I eligible for free legal aid?" onClick={startQuery} />
        <QuickPrompt text="How do I pay court fees using ePay?" onClick={startQuery} />
        <QuickPrompt text="What is Tele-Law and how can I use it?" onClick={startQuery} />
        <QuickPrompt text="Explain Lok Adalat and how to settle a case there." onClick={startQuery} />
      </div>

      <div className="mt-8 w-full">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-widest">Go directly to eCourts</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {ECOURTS_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors text-muted-foreground"
              data-testid={`ecourts-pill-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickPrompt({ text, onClick }: { text: string; onClick: (t: string) => void }) {
  return (
    <button
      onClick={() => onClick(text)}
      data-testid={`quick-prompt-${text.substring(0, 20).toLowerCase().replace(/\s+/g, "-")}`}
      className="p-4 text-left rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all shadow-sm"
    >
      <p className="text-sm font-medium text-foreground">{text}</p>
    </button>
  );
}

function ChatArea({ conversationId }: { conversationId: number }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: messages, isLoading } = useListOpenaiMessages(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");

    try {
      setIsStreaming(true);
      setStreamedContent("");

      queryClient.setQueryData(
        getListOpenaiMessagesQueryKey(conversationId),
        (old: { id: number; role: string; content: string; createdAt: string }[] | undefined) => [
          ...(old || []),
          { id: Date.now(), role: "user", content: userMessage, conversationId, createdAt: new Date().toISOString() },
        ]
      );

      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send message (${res.status}): ${errorText}`);
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.replace("data: ", "").trim();
          if (!dataStr || dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.content) setStreamedContent((prev) => prev + data.content);
            if (data.done) queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
          } catch {
            // ignore parse errors on incomplete chunks
          }
        }
      }

      if (buffer.trim().startsWith("data: ")) {
        const dataStr = buffer.trim().replace("data: ", "").trim();
        if (dataStr && dataStr !== "[DONE]") {
          try {
            const data = JSON.parse(dataStr);
            if (data.content) setStreamedContent((prev) => prev + data.content);
            if (data.done) queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
          } catch {
            // ignore any remaining incomplete chunk
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-border/40 bg-white/50 backdrop-blur shrink-0 flex items-center justify-between">
        <h3 className="font-semibold">Legal Assistant</h3>
        <div className="flex items-center gap-3">
          <a
            href="https://services.ecourts.gov.in/ecourtindia_v6/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-ecourts-portal"
          >
            <ExternalLink className="h-3 w-3" />
            eCourts Portal
          </a>
          <div className="text-xs text-muted-foreground bg-primary/5 text-primary px-2 py-1 rounded-full border border-primary/20">
            Powered by NyayaSetu AI
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : errorMessage ? (
          <div className="text-center py-12 text-destructive text-sm px-4">{errorMessage}</div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Start typing below to ask a legal question.
          </div>
        ) : (
          messages?.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))
        )}

        {isStreaming && <MessageBubble role="assistant" content={streamedContent} isStreaming />}
      </div>

      <div className="p-4 bg-background border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about court procedures, eFiling, legal aid, case status..."
            className="pr-12 py-6 rounded-xl shadow-sm focus-visible:ring-primary"
            disabled={isStreaming}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 h-8 w-8 rounded-lg"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-center mt-2 text-[10px] text-muted-foreground">
          AI may make mistakes. For official case information, visit{" "}
          <a href="https://services.ecourts.gov.in/ecourtindia_v6/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            services.ecourts.gov.in
          </a>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content, isStreaming }: { role: string; content: string; isStreaming?: boolean }) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-4 max-w-3xl mx-auto", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[85%] shadow-sm whitespace-pre-wrap text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border/60 rounded-tl-sm text-foreground"
        )}
      >
        {content}
        {isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle animate-pulse" />}
      </div>
    </div>
  );
}
