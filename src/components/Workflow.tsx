import { FileText, Wand2, Image as ImageIcon, LayoutGrid } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: FileText,
    title: "Drop Your Script",
    desc: "Paste a screenplay, lesson plan, or story idea. Any length, any genre.",
  },
  {
    n: "02",
    icon: Wand2,
    title: "AI Directs Scenes",
    desc: "Our director AI breaks the narrative into 4–8 visual beats with characters, settings, and mood.",
  },
  {
    n: "03",
    icon: ImageIcon,
    title: "Generate Frames",
    desc: "Each scene becomes an animated cartoon storyboard frame. Edit prompts, regenerate freely.",
  },
  {
    n: "04",
    icon: LayoutGrid,
    title: "Export the Board",
    desc: "Review the complete storyboard. Saved locally so you can return anytime.",
  },
];

export const Workflow = () => {
  return (
    <section id="workflow" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 max-w-2xl">
          <span className="mono text-xs uppercase tracking-[0.3em] text-primary">The Pipeline</span>
          <h2 className="font-display text-5xl md:text-7xl mt-4 leading-[0.95]">
            From <span className="text-gradient-amber">words</span> to
            <br />production-ready frames.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative scene-card p-6 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="h-12 w-12 rounded-md bg-secondary border border-border flex items-center justify-center group-hover:bg-gradient-amber group-hover:border-primary transition-all">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="mono text-3xl text-primary/30 font-bold">{s.n}</span>
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-wide">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
