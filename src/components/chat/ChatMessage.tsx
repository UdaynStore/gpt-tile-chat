interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {content}
      </div>
    </div>
  );
}