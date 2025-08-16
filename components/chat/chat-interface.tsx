"use client";

import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DefaultChatTransport } from "ai";

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export function ChatInterface({
  conversationId: initialConversationId,
  className,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId] = useState(initialConversationId);
  const [input, setInput] = useState("");

  const { messages, status, error, sendMessage, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        conversationId,
      },
    }),
    onFinish: () => {
      // Message handling can be done here if needed
      console.log("Message finished");
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;

    await sendMessage({ 
      text: input
    });
    setInput("");
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      {/* Header */}
      <div className="border-b p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold">Hermes Trismegistus</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ancient wisdom for modern seekers
        </p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Begin your journey with a question...</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" && (
                  <div className="font-semibold text-sm mb-1 opacity-70">
                    Hermes
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  {(message as { content?: string; text?: string }).content || 
                   (message as { content?: string; text?: string }).text || 
                   JSON.stringify(message)}
                </div>
              </div>
            </div>
          ))}

          {status === "streaming" && (
            <div className="flex gap-3 justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-sm text-destructive">
                {error.message || "Something went wrong"}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => regenerate()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your question..."
            disabled={status === "streaming" || !session}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={status === "streaming" || !input.trim() || !session}
            size="icon"
          >
            {status === "streaming" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!session && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please sign in to start chatting
          </p>
        )}
      </form>
    </Card>
  );
}
