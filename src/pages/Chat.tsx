import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHistory } from "@/components/chat/ChatHistory";

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
  const isTemporary = gptId === "temp";

  useEffect(() => {
    if (!isTemporary) {
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
    }
  }, [gptId, navigate, isTemporary]);

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
    if (isTemporary) return;
    
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
    if (!input.trim()) return;
    if (!isTemporary && !userId) {
      toast.error("Please log in to send messages");
      return;
    }

    setLoading(true);
    const userMessage = {
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    try {
      if (!isTemporary) {
        await supabase.from("chat_history").insert({
          gpt_id: gptId,
          message: input,
          is_user_message: true,
          user_id: userId
        });
      }

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Get API configuration
      const apiConfig = isTemporary 
        ? JSON.parse(sessionStorage.getItem("tempGPTConfig") || "{}") 
        : { chatflowId: gptId, apiUrl: import.meta.env.VITE_FLOWISE_API_HOST };

      // Send message to API
      const response = await fetch(`${apiConfig.apiUrl}/api/v1/prediction/${apiConfig.chatflowId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
        }),
      });

      const data = await response.json();
      
      if (!isTemporary) {
        await supabase.from("chat_history").insert({
          gpt_id: gptId,
          message: data.text || "Sorry, I couldn't process that.",
          is_user_message: false,
          user_id: userId
        });
      }

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
      {!isTemporary && <ChatHistory messages={messages} />}
      
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} content={msg.content} isUser={msg.isUser} />
            ))}
          </div>
        </ScrollArea>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Chat;