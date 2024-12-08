import { Bot, Key, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Custom GPTs Management",
    description: "Access all your custom GPTs in one unified dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Chat History",
    description: "Keep track of all your conversations with each GPT.",
  },
  {
    icon: Key,
    title: "Secure API Keys",
    description: "Safely store and manage your API keys.",
  },
];

export function Features() {
  return (
    <section className="container py-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="flex flex-col items-center text-center animate-fade-up p-6 rounded-lg border bg-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <feature.icon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}