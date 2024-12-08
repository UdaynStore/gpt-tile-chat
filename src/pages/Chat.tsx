import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface Message {
  id: string;
  message: string;
  is_user_message: boolean;
  created_at: string;
}

const Chat = () => {
  const { gptId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gptName, setGptName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchGPTDetails();
      fetchMessages();
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
      if (data) setGptName(data.name);
    } catch (error) {
      console.error("Error fetching GPT details:", error);
      toast.error("Failed to load GPT details");
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("gpt_id", gptId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load chat history");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save user message
      const { error: messageError } = await supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          gpt_id: gptId,
          message: newMessage,
          is_user_message: true
        });

      if (messageError) throw messageError;

      // Simulate GPT response (replace with actual API call)
      const { error: responseError } = await supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          gpt_id: gptId,
          message: "This is a simulated response. Replace with actual GPT integration.",
          is_user_message: false
        });

      if (responseError) throw responseError;

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">{gptName}</h1>
        
        <div className="bg-card rounded-lg p-4 h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_user_message ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.is_user_message
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted mr-4'
                  }`}
                >
                  {message.message}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;