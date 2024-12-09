import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FullPageChat } from "flowise-embed-react";
import { toast } from "sonner";

const Chat = () => {
  const { gptId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchGPTDetails();
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

  return (
    <div className="h-screen w-screen">
      <FullPageChat
        chatflowid={gptId || ""}
        apiHost={import.meta.env.VITE_FLOWISE_API_HOST || "http://localhost:3000"}
        theme={{
          button: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))"
          },
          chatWindow: {
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))"
          }
        }}
      />
    </div>
  );
};

export default Chat;