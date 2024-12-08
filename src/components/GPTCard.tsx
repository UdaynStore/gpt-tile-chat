import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface GPTCardProps {
  id: string;
  name: string;
  description: string | null;
  messageCount: number;
}

export function GPTCard({ id, name, description, messageCount }: GPTCardProps) {
  return (
    <Link to={`/chat/${id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="line-clamp-1">{name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4 mr-1" />
            {messageCount} messages
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}