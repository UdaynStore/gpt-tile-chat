import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Loader2, Plus, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface APIKey {
  id: string;
  api_key: string;
  created_at: string;
}

const APIKeys = () => {
  const { gptId } = useParams();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
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
      fetchAPIKeys();
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

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("gpt_id", gptId);

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys");
    }
  };

  const generateAPIKey = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newApiKey = crypto.randomUUID();
      const { error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          gpt_id: gptId,
          api_key: newApiKey
        });

      if (error) throw error;
      toast.success("API key generated successfully");
      fetchAPIKeys();
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error("Failed to generate API key");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;
      toast.success("API key deleted successfully");
      fetchAPIKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const copyToClipboard = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API key copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy API key");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>API Keys for {gptName}</CardTitle>
            <CardDescription>
              Generate and manage API keys for your custom GPT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={generateAPIKey}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate New API Key
              </Button>

              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <Input
                      value={key.api_key}
                      readOnly
                      className="mr-2 bg-transparent border-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(key.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default APIKeys;