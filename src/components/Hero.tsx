import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-studio.jpg";

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-cinema" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(180deg, black 30%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(180deg, black 30%, transparent 95%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-spotlight" />

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 mono text-xs uppercase tracking-widest text-muted-foreground">
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#styles" className="hover:text-primary transition-colors">Styles</a>
        </nav>
        <Button variant="outline" size="sm" onClick={onStart} className="border-primary/40 hover:border-primary hover:bg-primary/10">
          Open Studio
        </Button>
      </header>

      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="flex items-center gap-2 mb-8 animate-fade-up">
          <div className="h-px w-12 bg-primary" />
          <span className="mono text-xs uppercase tracking-[0.3em] text-primary">
            <Sparkles className="inline h-3 w-3 mr-1" />
            AI Storyboard Production Suite
          </span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl lg:text-[8.5rem] leading-[0.9] mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Scripts Become
          <br />
          <span className="text-gradient-amber">Visual Worlds.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Transform raw scripts, lessons, or story ideas into fully-illustrated storyboards.
          AI directs the scenes — you control every frame. Built for educators, animators, and creators
          who think in pictures.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" onClick={onStart} className="bg-gradient-amber text-primary-foreground hover:opacity-90 glow-amber font-semibold text-base px-8 h-14">
            Start Creating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })} className="text-base h-14 px-8 hover:bg-secondary">
            See the Workflow
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-8 mt-24 max-w-3xl animate-fade-up" style={{ animationDelay: "0.4s" }}>
          {[
            { num: "4-8", label: "Scenes per Script" },
            { num: "~15s", label: "Per Frame" },
            { num: "∞", label: "Iterations" },
          ].map((s) => (
            <div key={s.label} className="border-l-2 border-primary/40 pl-4">
              <div className="font-display text-4xl md:text-5xl text-gradient-amber">{s.num}</div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
