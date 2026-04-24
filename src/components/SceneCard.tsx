import { useState } from "react";
import { Scene } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ImageIcon, RefreshCw, Loader2, Pencil, Check, Download, Trash2, Volume2, ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SceneCardProps {
  scene: Scene;
  index: number;
  onUpdate: (scene: Scene) => void;
  onGenerate: (scene: Scene) => void;
  onDelete: (id: string) => void;
}

export const SceneCard = ({ scene, index, onUpdate, onGenerate, onDelete }: SceneCardProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(scene);

  const save = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const downloadImage = () => {
    if (!scene.imageUrl) return;
    const a = document.createElement("a");
    a.href = scene.imageUrl;
    a.download = `${scene.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const pasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target?.result as string;
              onUpdate({ ...scene, imageUrl });
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert('No image found in clipboard');
    } catch (err) {
      console.error('Failed to paste image:', err);
      alert('Failed to paste image. Please try copying an image first.');
    }
  };

  const openInGemini = async () => {
    const prompt = `Create image: ${scene.narration || scene.description}. 2D flat illustration`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    // Open Gemini
    window.open('https://gemini.google.com/', '_blank');
  };

  return (
    <div className="scene-card flex flex-col">
      {/* Image area */}
      <div className="relative aspect-video bg-secondary overflow-hidden border-b border-border">
        {scene.isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 to-accent/5">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="mono text-xs uppercase tracking-widest text-muted-foreground">Rendering frame</span>
          </div>
        ) : scene.imageUrl ? (
          <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <span className="mono text-xs uppercase tracking-widest">No frame yet</span>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border border-border rounded px-2 py-1">
          <span className="mono text-[10px] uppercase tracking-widest text-primary">
            Frame {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {scene.imageUrl && !scene.isGenerating && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={downloadImage}>
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {!scene.imageUrl && !scene.isGenerating && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={pasteImage} title="Paste image from clipboard">
              <ClipboardPaste className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {editing ? (
          <>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="font-display text-lg h-9" placeholder="Scene title" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Context</Label>
                <Input value={draft.context} onChange={(e) => setDraft({ ...draft, context: e.target.value })} className="h-8 text-xs mt-1" placeholder="What's happening" />
              </div>
              <div>
                <Label className="mono text-[9px] uppercase tracking-widest text-muted-foreground">3D Models</Label>
                <Input value={draft.models3d} onChange={(e) => setDraft({ ...draft, models3d: e.target.value })} className="h-8 text-xs mt-1" placeholder="desk, chair, etc" />
              </div>
            </div>
            <div>
              <Label className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Image Prompt</Label>
              <Textarea value={draft.imagePrompt} onChange={(e) => setDraft({ ...draft, imagePrompt: e.target.value })} className="text-xs mt-1 resize-none" rows={3} />
            </div>
            <div>
              <Label className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Narration</Label>
              <Textarea value={draft.narration || ""} onChange={(e) => setDraft({ ...draft, narration: e.target.value })} className="text-xs mt-1 resize-none italic" rows={3} placeholder="Voiceover text..." />
            </div>
            <div className="flex gap-2 mt-auto">
              <Button size="sm" onClick={save} className="flex-1 bg-gradient-amber text-primary-foreground hover:opacity-90">
                <Check className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setDraft(scene); setEditing(false); }}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-xl tracking-wide leading-tight">{scene.title}</h3>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(scene.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{scene.description}</p>

            {scene.narration && (
              <div className="border-l-2 border-primary/40 pl-3 py-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Volume2 className="h-3 w-3 text-primary" />
                  <span className="mono text-[9px] uppercase tracking-widest text-primary">Narration</span>
                </div>
                <p className="text-xs italic text-foreground/80 leading-relaxed">"{scene.narration}"</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-1">
              {scene.context && <span className="mono text-[9px] uppercase tracking-widest bg-secondary border border-border rounded px-2 py-0.5">{scene.context.slice(0, 40)}</span>}
              {scene.models3d && <span className="mono text-[9px] uppercase tracking-widest bg-secondary border border-border rounded px-2 py-0.5">{scene.models3d.slice(0, 40)}</span>}
              {scene.mood && <span className="mono text-[9px] uppercase tracking-widest bg-primary/10 border border-primary/30 text-primary rounded px-2 py-0.5">{scene.mood.slice(0, 20)}</span>}
            </div>

            <Button
              size="sm"
              variant={scene.imageUrl ? "outline" : "default"}
              onClick={() => onGenerate(scene)}
              onContextMenu={(e) => { e.preventDefault(); openInGemini(); }}
              disabled={scene.isGenerating}
              className={cn("mt-auto", !scene.imageUrl && "bg-gradient-amber text-primary-foreground hover:opacity-90")}
            >
              {scene.isGenerating ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Rendering...</>
              ) : scene.imageUrl ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Regenerate Frame</>
              ) : (
                <><ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Generate Frame</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
