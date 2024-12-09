import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function TemporaryGPT() {
  const [chatflowId, setChatflowId] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const handleStartChat = () => {
    // Store in sessionStorage to be used in the chat
    sessionStorage.setItem("tempGPTConfig", JSON.stringify({ chatflowId, apiUrl }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temporary GPT</CardTitle>
        <CardDescription>Chat with a custom GPT without saving to database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter Chatflow ID"
            value={chatflowId}
            onChange={(e) => setChatflowId(e.target.value)}
          />
          <Input
            placeholder="Enter API URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Temporary chat</span>
          </div>
          <Button size="sm" asChild disabled={!chatflowId || !apiUrl}>
            <Link to="/chat/temp" onClick={handleStartChat}>
              <Plus className="h-4 w-4 mr-2" />
              Start Chat
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}