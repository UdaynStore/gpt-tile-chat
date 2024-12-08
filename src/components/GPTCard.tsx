import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Key } from "lucide-react";
import { Link } from "react-router-dom";

interface GPTCardProps {
  id: string;
  name: string;
  description: string | null;
  messageCount: number;
}

export function GPTCard({ id, name, description, messageCount }: GPTCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{messageCount} messages</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/api-keys/${id}`}>
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={`/chat/${id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}