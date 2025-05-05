
import React, { useRef, useState, useEffect } from "react";
import { useMeeting, Message } from "@/contexts/MeetingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { format } from "date-fns";

export default function MeetingPage() {
  const { messages, addMessage } = useMeeting();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    addMessage({
      type: "user",
      content: inputValue.trim(),
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    setInputValue("");
  };

  const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    if (message.type === "ai") {
      return (
        <div className="message-ai animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="min-w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-medium">CollabCopilot</span>
                <span className="text-xs text-muted-foreground">
                  {format(message.timestamp, "HH:mm")}
                </span>
              </div>
              <div className="text-sm whitespace-pre-line">{message.content}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="message-user animate-fade-in">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar} />
            <AvatarFallback>
              {message.sender?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{message.sender?.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(message.timestamp, "HH:mm")}
              </span>
            </div>
            <div className="text-sm">{message.content}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full pb-4">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Reunión: Sprint Planning #12</h2>
        <p className="text-sm text-muted-foreground">
          En curso • Iniciada hace 1 hora
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
