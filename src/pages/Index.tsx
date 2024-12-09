import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GPTCard } from "@/components/GPTCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CustomGPT {
  id: string;
  name: string;
  description: string | null;
  message_count?: number;
}

const DEFAULT_GPT: CustomGPT = {
  id: "711a5e7c-88f3-420c-84b3-c12ea0981241",
  name: "Default Assistant",
  description: "A helpful AI assistant ready to chat with you",
  message_count: 0
};

const Index = () => {
  const navigate = useNavigate();
  const [gpts, setGpts] = useState<CustomGPT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchGPTs();
    };

    checkAuth();
  }, [navigate]);

  const fetchGPTs = async () => {
    try {
      const { data: gptsData, error: gptsError } = await supabase
        .from("custom_gpts")
        .select(`
          id,
          name,
          description,
          chat_history:chat_history(count)
        `);

      if (gptsError) throw gptsError;

      const formattedGPTs = gptsData.map(gpt => ({
        ...gpt,
        message_count: (gpt.chat_history as any)?.[0]?.count || 0
      }));

      // Add default GPT if no custom GPTs exist
      setGpts(formattedGPTs.length === 0 ? [DEFAULT_GPT] : formattedGPTs);
    } catch (error) {
      console.error("Error fetching GPTs:", error);
      // Show default GPT if there's an error
      setGpts([DEFAULT_GPT]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Your Custom GPTs</h1>
          <Button onClick={() => navigate("/create")} size="lg">
            <Plus className="mr-2" />
            Create New GPT
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gpts.map((gpt) => (
              <GPTCard
                key={gpt.id}
                id={gpt.id}
                name={gpt.name}
                description={gpt.description}
                messageCount={gpt.message_count || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;