import { useEffect, useState } from "react";
import { Project, Scene, loadProjects, saveProjects, createProject, getActiveProjectId, setActiveProjectId } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { SceneCard } from "./SceneCard";
import { ArrowLeft, Sparkles, Loader2, Plus, FolderOpen, Trash2, Wand2, Zap, Mic } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudioProps {
  onBack: () => void;
}

export const Studio = ({ onBack }: StudioProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [generatingScenes, setGeneratingScenes] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [narratingAll, setNarratingAll] = useState(false);

  // Load on mount
  useEffect(() => {
    const ps = loadProjects();
    if (ps.length === 0) {
      const p = createProject("Untitled Storyboard");
      setProjects([p]);
      setActiveId(p.id);
      saveProjects([p]);
      setActiveProjectId(p.id);
    } else {
      setProjects(ps);
      const aid = getActiveProjectId();
      setActiveId(aid && ps.find(p => p.id === aid) ? aid : ps[0].id);
    }
  }, []);

  const active = projects.find(p => p.id === activeId);

  const updateActive = (updater: (p: Project) => Project) => {
    if (!active) return;
    const updated = { ...updater(active), updatedAt: Date.now() };
    const next = projects.map(p => p.id === active.id ? updated : p);
    setProjects(next);
    saveProjects(next);
  };

  const newProject = () => {
    const p = createProject(`Storyboard ${projects.length + 1}`);
    const next = [...projects, p];
    setProjects(next);
    saveProjects(next);
    setActiveId(p.id);
    setActiveProjectId(p.id);
  };

  const switchProject = (id: string) => {
    setActiveId(id);
    setActiveProjectId(id);
  };

  const deleteProject = (id: string) => {
    if (projects.length === 1) {
      toast.error("Can't delete your only storyboard");
      return;
    }
    const next = projects.filter(p => p.id !== id);
    setProjects(next);
    saveProjects(next);
    if (activeId === id) {
      setActiveId(next[0].id);
      setActiveProjectId(next[0].id);
    }
  };

  const generateScenes = async () => {
    if (!active || !active.script.trim()) {
      toast.error("Please paste a script first");
      return;
    }
    setGeneratingScenes(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-scenes", {
        body: { script: active.script, mode: active.mode, style: active.style },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const scenes: Scene[] = (data.scenes || []).map((s: any) => ({
        id: crypto.randomUUID(),
        title: s.title,
        description: s.description,
        imagePrompt: s.imagePrompt,
        narration: s.narration || s.description || "",
        characters: s.characters,
        setting: s.setting,
        mood: s.mood,
      }));

      updateActive(p => ({ ...p, scenes }));
      toast.success(`Generated ${scenes.length} scenes`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate scenes");
    } finally {
      setGeneratingScenes(false);
    }
  };

  const generateImageForScene = async (scene: Scene) => {
    if (!active) return;
    updateActive(p => ({
      ...p,
      scenes: p.scenes.map(s => s.id === scene.id ? { ...s, isGenerating: true } : s),
    }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: scene.imagePrompt, style: `${active.style} storyboard frame, cinematic composition, vibrant expressive colors` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      updateActive(p => ({
        ...p,
        scenes: p.scenes.map(s => s.id === scene.id ? { ...s, imageUrl: data.imageUrl, isGenerating: false } : s),
      }));
    } catch (e: any) {
      toast.error(e.message || "Failed to generate frame");
      updateActive(p => ({
        ...p,
        scenes: p.scenes.map(s => s.id === scene.id ? { ...s, isGenerating: false } : s),
      }));
    }
  };

  const generateAllFrames = async () => {
    if (!active) return;
    setGeneratingAll(true);
    for (const scene of active.scenes) {
      if (!scene.imageUrl) {
        await generateImageForScene(scene);
      }
    }
    setGeneratingAll(false);
    toast.success("All frames rendered");
  };

  const generateNarration = async (scene: Scene) => {
    if (!active) return;
    const text = (scene.narration || scene.description || "").trim();
    if (!text) {
      toast.error("No narration text for this scene");
      return;
    }
    updateActive(p => ({
      ...p,
      scenes: p.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: true } : s),
    }));
    try {
      const { data, error } = await supabase.functions.invoke("narrate-scene", {
        body: { text },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      updateActive(p => ({
        ...p,
        scenes: p.scenes.map(s => s.id === scene.id ? { ...s, audioUrl: data.audioUrl, isNarrating: false } : s),
      }));
    } catch (e: any) {
      toast.error(e.message || "Failed to generate narration");
      updateActive(p => ({
        ...p,
        scenes: p.scenes.map(s => s.id === scene.id ? { ...s, isNarrating: false } : s),
      }));
    }
  };

  const updateScene = (scene: Scene) => {
    updateActive(p => ({ ...p, scenes: p.scenes.map(s => s.id === scene.id ? scene : s) }));
  };

  const deleteScene = (id: string) => {
    updateActive(p => ({ ...p, scenes: p.scenes.filter(s => s.id !== id) }));
  };

  if (!active) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Logo />
            <div className="hidden md:block h-6 w-px bg-border" />
            <Input
              value={active.name}
              onChange={(e) => updateActive(p => ({ ...p, name: e.target.value }))}
              className="hidden md:block h-8 w-64 bg-transparent border-transparent hover:border-border focus:border-primary font-display text-lg tracking-wide"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Projects
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {projects.map(p => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => switchProject(p.id)}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className={p.id === activeId ? "text-primary font-medium" : ""}>{p.name}</span>
                      <span className="mono text-[10px] text-muted-foreground">{p.scenes.length} scenes</span>
                    </div>
                    <Trash2
                      className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                    />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={newProject}>
                  <Plus className="h-4 w-4 mr-2" /> New Storyboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Input panel */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="scene-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl tracking-wide">Source Material</h2>
              <Tabs value={active.mode} onValueChange={(v) => updateActive(p => ({ ...p, mode: v as any }))}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="script" className="mono text-[10px] uppercase tracking-widest">Script</TabsTrigger>
                  <TabsTrigger value="story" className="mono text-[10px] uppercase tracking-widest">Story</TabsTrigger>
                  <TabsTrigger value="lesson" className="mono text-[10px] uppercase tracking-widest">Lesson</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Textarea
              value={active.script}
              onChange={(e) => updateActive(p => ({ ...p, script: e.target.value }))}
              placeholder={
                active.mode === "script"
                  ? "INT. KITCHEN - DAY\n\nSARA pours coffee. Her phone buzzes — it's a number she hasn't seen in years..."
                  : active.mode === "lesson"
                  ? "Today we're learning about the water cycle. Water evaporates from oceans, forms clouds..."
                  : "A young inventor discovers her grandmother's old workshop hidden behind the bookshelf..."
              }
              className="min-h-[280px] resize-none mono text-sm bg-background/50 border-border focus:border-primary"
            />
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
              {active.script.length} chars
            </div>
          </div>

          <div className="scene-card p-6 flex flex-col">
            <h3 className="font-display text-xl tracking-wide mb-4">Direction</h3>

            <Button
              onClick={generateScenes}
              disabled={generatingScenes || !active.script.trim()}
              className="bg-gradient-amber text-primary-foreground hover:opacity-90 glow-amber font-semibold mb-3"
            >
              {generatingScenes ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Directing scenes...</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" /> Break Into Scenes</>
              )}
            </Button>

            {active.scenes.length > 0 && (
              <>
                <Button
                  onClick={generateAllFrames}
                  disabled={generatingAll}
                  variant="outline"
                  className="border-primary/40 hover:border-primary hover:bg-primary/10"
                >
                  {generatingAll ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rendering...</>
                  ) : (
                    <><Zap className="h-4 w-4 mr-2" /> Render All Frames</>
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    setNarratingAll(true);
                    for (const scene of active.scenes) {
                      if (!scene.audioUrl && (scene.narration || scene.description)) {
                        await generateNarration(scene);
                      }
                    }
                    setNarratingAll(false);
                    toast.success("All narrations recorded");
                  }}
                  disabled={narratingAll}
                  variant="outline"
                  className="mt-3 border-primary/40 hover:border-primary hover:bg-primary/10"
                >
                  {narratingAll ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Voicing...</>
                  ) : (
                    <><Mic className="h-4 w-4 mr-2" /> Narrate All Scenes</>
                  )}
                </Button>
              </>
            )}

            <div className="mt-auto pt-6 mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {active.scenes.length} scenes · {active.scenes.filter(s => s.imageUrl).length} rendered
            </div>
          </div>
        </div>

        {/* Storyboard grid */}
        {active.scenes.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg py-24 text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary/40" />
            <h3 className="font-display text-2xl tracking-wide mb-2">Your storyboard begins here</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Drop your script above and let our director AI break it into scenes. Each scene becomes an editable frame.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <span className="mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Storyboard</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {active.scenes.map((s, i) => (
                <div key={s.id} className="group">
                  <SceneCard
                    scene={s}
                    index={i}
                    onUpdate={updateScene}
                    onGenerate={generateImageForScene}
                    onNarrate={generateNarration}
                    onDelete={deleteScene}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
