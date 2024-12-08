import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center gradient-bg py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Your Custom GPTs,{" "}
            <span className="text-primary">All in One Place</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Access and manage all your custom GPTs in a single dashboard. Streamline your AI interactions with our intuitive interface.
          </p>
          <div className="space-x-4">
            <Link to="/signup">
              <Button size="lg" className="animate-fade-up" style={{ animationDelay: "200ms" }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}