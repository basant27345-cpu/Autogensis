import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Rocket, Code2, Layout } from "lucide-react";

const PROMPTS = [
  {
    title: "Landing Page Structure",
    description: "Generate a modern landing page with hero, features, and pricing sections.",
    prompt: "Create a modern landing page using React and Tailwind CSS. Include a sticky header, a hero section with a call to action, a features grid with icons, a pricing table, and a footer. Use Framer Motion for entrance animations.",
    category: "Development",
    icon: Layout,
  },
  {
    title: "Deployment Guide",
    description: "Get instructions on how to deploy your app to the Synthesis Cloud.",
    prompt: "Provide a step-by-step guide on how to deploy a React/Vite application to the Synthesis Cloud. Include details about port configuration, environment variables, and the share workflow.",
    category: "Deployment",
    icon: Rocket,
  },
  {
    title: "Interactive Dashboard",
    description: "Build a data-driven dashboard with charts and tables.",
    prompt: "Design a technical dashboard using Recharts for data visualization. Include a sidebar for navigation, a top bar with user profile, and a main area with a grid of cards showing key metrics and a detailed data table.",
    category: "Development",
    icon: Terminal,
  },
  {
    title: "Component Library Setup",
    description: "Initialize and configure shadcn/ui in your project.",
    prompt: "Explain how to set up shadcn/ui in a Vite + React project. Provide the commands for initialization and adding common components like Button, Card, and Dialog. Show how to customize the theme in index.css.",
    category: "Setup",
    icon: Code2,
  },
];

interface PromptLibraryProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {PROMPTS.map((item, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => onSelectPrompt(item.prompt)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                {item.category}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-2 font-serif text-primary">{item.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-2 font-sans">
              {item.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground italic line-clamp-1 font-mono">
              "{item.prompt}"
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
