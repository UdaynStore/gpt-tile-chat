import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="w-64 border-r bg-muted/50">
      <div className="p-4 font-semibold">Chat History</div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-sm ${
                msg.isUser ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">
                  {msg.isUser ? "You" : "Assistant"}
                </span>
              </div>
              <p className="line-clamp-2">{msg.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}