import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function ChatInput({ input, setInput, onSend, loading }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className="flex gap-2 p-4 border-t"
    >
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}