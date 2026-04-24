import { GraduationCap, Palette, Box, BookOpen, Clapperboard, Zap } from "lucide-react";

const features = [
  { icon: GraduationCap, title: "For Educators", desc: "Turn lesson plans into illustrated learning sequences students remember." },
  { icon: Clapperboard, title: "For Animators", desc: "Pre-vis your concepts before a single keyframe. Iterate at the speed of thought." },
  { icon: Box, title: "For 3D Artists", desc: "Generate reference frames, mood boards, and concept art in seconds." },
  { icon: BookOpen, title: "For Storytellers", desc: "Visualize chapters, see characters come alive, refine your narrative arc." },
  { icon: Palette, title: "Editable Scenes", desc: "Tweak prompts, characters, settings — regenerate any frame independently." },
  { icon: Zap, title: "Local Persistence", desc: "Your storyboards save automatically in your browser. Pick up where you left off." },
];

export const Features = () => {
  return (
    <section id="features" className="relative py-32 px-6 bg-gradient-cinema">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-xl">
            <span className="mono text-xs uppercase tracking-[0.3em] text-primary">Built For Creators</span>
            <h2 className="font-display text-5xl md:text-7xl mt-4 leading-[0.95]">
              Every story.
              <br />
              <span className="text-gradient-amber">Every craft.</span>
            </h2>
          </div>
          <p className="mono text-xs text-muted-foreground max-w-xs uppercase tracking-wider">
            // A complete production pipeline disguised as a single tool
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
          {features.map((f) => (
            <div key={f.title} className="bg-card p-8 hover:bg-secondary transition-colors group">
              <f.icon className="h-7 w-7 mb-6 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-2xl mb-3 tracking-wide">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
