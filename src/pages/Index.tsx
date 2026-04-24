import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { Workflow } from "@/components/Workflow";
import { Features } from "@/components/Features";
import { Studio } from "@/components/Studio";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const Index = () => {
  const [view, setView] = useState<"landing" | "studio">("landing");

  // SEO
  useEffect(() => {
    document.title = "LP Vision Studio — Turn Scripts into Visual Storyboards";
    const desc = "AI-powered storyboard generator. Transform scripts, lessons, and story ideas into illustrated scenes. Built for educators, animators, and creators.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);

  if (view === "studio") {
    return <Studio onBack={() => setView("landing")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero onStart={() => setView("studio")} />
      <Workflow />
      <Features />

      {/* CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl mb-6 leading-tight">
            Your story is waiting
            <br />
            <span className="text-gradient-amber">to be seen.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            No accounts. No setup. Open the studio, paste a script, watch it come alive.
          </p>
          <Button
            size="lg"
            onClick={() => setView("studio")}
            className="bg-gradient-amber text-primary-foreground hover:opacity-90 glow-amber font-semibold text-base px-10 h-14"
          >
            Enter the Studio
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Logo />
          <p className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} LP Vision Studio · Crafted for visual thinkers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
