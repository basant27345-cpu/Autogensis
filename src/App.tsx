/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { streamWithAutogenesis } from "./services/geminiService";
import { PromptLibrary } from "./components/PromptLibrary";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Code2, 
  Rocket, 
  Sparkles,
  ChevronRight,
  Loader2,
  Github,
  ExternalLink,
  Paperclip,
  FileText,
  Mic,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

interface AttachedFile {
  name: string;
  mimeType: string;
  data: string;
}

interface Message {
  role: "user" | "model";
  content: string;
  file?: AttachedFile;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      setAttachedFile({
        name: file.name,
        mimeType: file.type,
        data: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      content: text,
      file: attachedFile || undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);
    setActiveTab("chat");

    try {
      const history = messages.map((m) => {
        const parts: any[] = [{ text: m.content }];
        if (m.file) {
          parts.push({
            inlineData: {
              mimeType: m.file.mimeType,
              data: m.file.data
            }
          });
        }
        return {
          role: m.role,
          parts
        };
      });

      const currentParts: any[] = [{ text: text }];
      if (userMessage.file) {
        currentParts.push({
          inlineData: {
            mimeType: userMessage.file.mimeType,
            data: userMessage.file.data
          }
        });
      }
      history.push({ role: "user", parts: currentParts });

      let assistantContent = "";
      const stream = streamWithAutogenesis(history);

      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      for await (const chunk of stream) {
        if (chunk) {
          assistantContent += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role === "model") {
              return [...prev.slice(0, -1), { ...last, content: assistantContent }];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden dark">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic font-bold text-xl tracking-tight text-primary">Autogenesis_</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Agent Engine</p>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Quick Actions</h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2" onClick={() => setActiveTab("prompts")}>
                  <Terminal className="w-4 h-4 mr-2 text-primary" />
                  Prompt Library
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2">
                  <Code2 className="w-4 h-4 mr-2 text-primary" />
                  Code Sandbox
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-normal h-9 px-2">
                  <Rocket className="w-4 h-4 mr-2 text-primary" />
                  Deployment Guide
                </Button>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div>
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[2px] mb-4 px-2">Agent Intelligence</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-xs font-medium">Active Synthesis</span>
                </div>
                
                <Card className="bg-secondary border-border">
                  <div className="p-4 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence Score</span>
                      <div className="text-2xl font-serif text-primary">98.4%</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Analysis Cycles</span>
                      <div className="text-2xl font-serif text-primary">1,242</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="default" className="w-full text-xs h-10 font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90">
            Push to AI Studio
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 text-[11px] text-muted-foreground uppercase tracking-[1px] font-medium hidden lg:flex">
              <span className="hover:text-primary cursor-pointer transition-colors">Project</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Agent Engine</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Cloud Sync</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Settings</span>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
              <TabsList className="bg-secondary/50 h-8 p-0.5">
                <TabsTrigger value="chat" className="text-[10px] uppercase tracking-wider">Chat</TabsTrigger>
                <TabsTrigger value="prompts" className="text-[10px] uppercase tracking-wider">Prompts</TabsTrigger>
                <TabsTrigger value="docs" className="text-[10px] uppercase tracking-wider">Docs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="max-w-3xl mx-auto space-y-8 pb-10">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-2 border border-border shadow-2xl">
                        <Sparkles className="w-10 h-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-serif italic tracking-tight text-primary">Welcome to Autogenesis</h3>
                        <p className="text-muted-foreground max-w-md text-sm font-light leading-relaxed">
                          Your sophisticated AI coding companion. Select a synthesis mode to begin.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                        <Card 
                          className="bg-secondary border-border hover:border-primary/50 transition-all cursor-pointer group p-6 text-center space-y-4"
                          onClick={() => handleSend("Initiate standard chat synthesis for web development.")}
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                            <Bot className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif italic text-lg text-primary">Chat</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Standard Synthesis</p>
                          </div>
                        </Card>

                        <Card 
                          className="bg-secondary border-border hover:border-primary/50 transition-all cursor-pointer group p-6 text-center space-y-4"
                          onClick={() => handleSend("Explain how to implement voice and audio features in my application.")}
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                            <Rocket className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif italic text-lg text-primary">Voice</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Audio Intelligence</p>
                          </div>
                        </Card>

                        <Card 
                          className="bg-secondary border-border hover:border-primary/50 transition-all cursor-pointer group p-6 text-center space-y-4"
                          onClick={() => handleSend("Generate comprehensive documentation for my project architecture.")}
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                            <Code2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif italic text-lg text-primary">Doc</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Knowledge Base</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
                          <div className={`p-4 rounded-2xl ${
                            msg.role === "user" 
                              ? "bg-primary text-primary-foreground rounded-tr-none" 
                              : "bg-muted/50 border border-border rounded-tl-none"
                          }`}>
                            {msg.file && (
                              <div className="mb-3 p-2 bg-black/10 rounded-lg flex items-center gap-2 border border-white/10">
                                {msg.file.mimeType.startsWith('audio/') ? (
                                  <Mic className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                                <span className="text-[10px] font-mono truncate max-w-[150px]">{msg.file.name}</span>
                              </div>
                            )}
                            <div className="markdown-body prose prose-invert max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {msg.role === "user" ? "You" : "Autogenesis"} • Just now
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                      <div className="bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-border">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-border bg-background">
                <div className="max-w-3xl mx-auto space-y-4">
                  <AnimatePresence>
                    {attachedFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 p-2 bg-secondary border border-border rounded-lg w-fit"
                      >
                        {attachedFile.mimeType.startsWith('audio/') ? (
                          <Mic className="w-4 h-4 text-primary" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-xs font-medium truncate max-w-[200px]">{attachedFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setAttachedFile(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="audio/*,application/pdf,text/*"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-lg border-border bg-secondary hover:bg-secondary/80 shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter synthesis parameters..."
                        className="pr-12 h-12 rounded-lg bg-secondary border-border focus-visible:ring-primary font-mono text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                      />
                      <Button 
                        size="icon" 
                        className="absolute right-1.5 top-1.5 h-9 w-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleSend()}
                        disabled={isLoading || (!input.trim() && !attachedFile)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-widest opacity-50">
                  Synthesis Engine v4.2.0 • Production Environment
                </p>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto py-10 px-6">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Prompt Library</h2>
                    <p className="text-muted-foreground mt-1">Select a pre-built prompt to get started quickly with common tasks.</p>
                  </div>
                  <PromptLibrary onSelectPrompt={handleSend} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="docs" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto py-10 px-6 prose prose-invert">
                  <h1 className="font-serif italic text-primary">Deployment & Architecture Guide</h1>
                  <p className="text-muted-foreground">Master the art of deploying sophisticated web applications on the Synthesis Cloud.</p>
                  
                  <Separator className="my-8 bg-border" />

                  <h3>1. Core Technologies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-8">
                    <Card className="bg-secondary border-border p-4">
                      <div className="text-primary font-serif italic mb-1">Python / Node</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Backend Logic</div>
                    </Card>
                    <Card className="bg-secondary border-border p-4">
                      <div className="text-primary font-serif italic mb-1">HTML5</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Structure</div>
                    </Card>
                    <Card className="bg-secondary border-border p-4">
                      <div className="text-primary font-serif italic mb-1">Tailwind CSS</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Styling</div>
                    </Card>
                  </div>

                  <h3>2. Python Full-Stack Deployment</h3>
                  <p>While the Synthesis Cloud defaults to Node.js, you can deploy Python applications (like Flask or FastAPI) by ensuring your environment is correctly configured.</p>
                  <ul>
                    <li><strong>Entry Point:</strong> Your app must listen on <code>0.0.0.0:3000</code>.</li>
                    <li><strong>Dependencies:</strong> Include a <code>requirements.txt</code> file for your Python packages.</li>
                    <li><strong>Execution:</strong> Use a startup script that triggers your Python server.</li>
                  </ul>

                  <div className="bg-secondary p-4 rounded-lg border border-border font-mono text-xs mb-6">
                    <div className="text-accent mb-2"># Flask Example (app.py)</div>
                    <div className="text-foreground">
                      from flask import Flask<br/>
                      app = Flask(__name__)<br/><br/>
                      @app.route('/')<br/>
                      def home():<br/>
                      &nbsp;&nbsp;return "Synthesis Complete"<br/><br/>
                      if __name__ == '__main__':<br/>
                      &nbsp;&nbsp;app.run(host='0.0.0.0', port=3000)
                    </div>
                  </div>

                  <h3>3. Port Configuration</h3>
                  <p>Ensure your application is configured to run on <strong>port 3000</strong>. This is the only externally accessible port in the Synthesis environment.</p>
                  
                  <h3>4. Environment Variables</h3>
                  <p>Add API keys to the <strong>Secrets</strong> panel. Access them via <code>os.environ</code> in Python or <code>process.env</code> in Node.js.</p>
                  
                  <h3>5. The Share Workflow</h3>
                  <p>Click <strong>Share</strong> in the top right. This triggers the Cloud Synthesis process, making your app accessible via a public URL.</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="h-8 bg-primary text-primary-foreground flex items-center justify-between px-6 text-[10px] font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span>Branch: auto-main</span>
            <Separator orientation="vertical" className="h-3 bg-primary-foreground/20" />
            <span>Latency: 14ms</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Tokens/sec: 142</span>
            <Separator orientation="vertical" className="h-3 bg-primary-foreground/20" />
            <span>Environment: Production</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
