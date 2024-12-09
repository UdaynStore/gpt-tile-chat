import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const { gptId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
      fetchGPTDetails();
      fetchChatHistory();
    };

    checkAuth();
  }, [gptId, navigate]);

  const fetchGPTDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_gpts")
        .select("name")
        .eq("id", gptId)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error("GPT not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching GPT details:", error);
      toast.error("Failed to load GPT details");
      navigate("/");
    }
  };

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("gpt_id", gptId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map((msg) => ({
        content: msg.message,
        isUser: msg.is_user_message,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    setLoading(true);
    const userMessage = {
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    try {
      // Save user message to chat history
      await supabase.from("chat_history").insert({
        gpt_id: gptId,
        message: input,
        is_user_message: true,
        user_id: userId
      });

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Send message to API
      const response = await fetch(`${import.meta.env.VITE_FLOWISE_API_HOST}/api/v1/prediction/${gptId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
        }),
      });

      const data = await response.json();
      
      // Save bot response to chat history
      await supabase.from("chat_history").insert({
        gpt_id: gptId,
        message: data.text || "Sorry, I couldn't process that.",
        is_user_message: false,
        user_id: userId
      });

      const botMessage = {
        content: data.text || "Sorry, I couldn't process that.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Sidebar */}
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

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
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
        </div>
      </div>
    </div>
  );
};

export default Chat;