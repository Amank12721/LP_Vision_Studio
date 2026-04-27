import { useEffect, useState } from "react";
import { Project, Scene, loadProjects, saveProjects, createProject, getActiveProjectId, setActiveProjectId } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Logo } from "./Logo";
import { SceneCard } from "./SceneCard";
import { ArrowLeft, Sparkles, Loader2, Plus, FolderOpen, Trash2, Wand2, Zap, FileJson, FileText, Settings } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
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
  const [plainText, setPlainText] = useState(""); // New: Plain text input
  const [convertingToJSON, setConvertingToJSON] = useState(false); // New: Loading state
  const [showPromptEditor, setShowPromptEditor] = useState(false); // Toggle prompt editor
  const [customPrompt, setCustomPrompt] = useState(""); // Custom prompt template
  
  // Default prompt template
  const defaultPromptTemplate = `You are a Senior 3D Technical Director creating educational content for school students.
CRITICAL REQUIREMENT: You MUST create EXACTLY {sceneCount} scenes - no more, no less.
If you create {sceneCount - 1} or {sceneCount + 1} scenes, you have FAILED the task.
Count your scenes carefully before responding.

IMPORTANT GUIDELINES:
1. NARRATION: Write detailed, educational narration (3-5 sentences per scene) that explains concepts clearly for students
2. VISUAL DESCRIPTION (Context): Explain the SCIENTIFIC CONCEPT or PRINCIPLE being demonstrated - NOT the scene visuals
   - Example: 'Taste receptors on tongue detect sweet molecules' NOT 'Person eating sugar'
   - Focus on: Why it happens, what principle is shown, the science behind it
3. FOCUS: Emphasize scientific concepts, processes, and phenomena - NOT characters or people
4. VISUAL: Focus on objects, equipment, experiments, and visual demonstrations of concepts
5. 3D ASSETS: Prioritize educational props, lab equipment, diagrams, models - minimize human characters
6. LANGUAGE: Use simple, clear language suitable for school students

Step 1: Output a Markdown table with columns: Scene # | Required 3D Assets | Labels (UI Text) | Animation Logic (GLB Safe) | Visual Description | Narration.
Step 2: Provide the same data in a valid JSON block at the end, wrapped in \`\`\`json tags.`;

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
      // Migrate old projects without sceneCount
      const migratedPs = ps.map(p => ({
        ...p,
        sceneCount: p.sceneCount || 6,
        generatedScenes: p.generatedScenes || ""
      }));
      setProjects(migratedPs);
      saveProjects(migratedPs);
      const aid = getActiveProjectId();
      setActiveId(aid && migratedPs.find(p => p.id === aid) ? aid : migratedPs[0].id);
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

  const parseJSONScript = (script: string): Scene[] | null => {
    try {
      const json = JSON.parse(script);
      
      // Check if it's the custom format with scenes array
      if (json.scenes && Array.isArray(json.scenes)) {
        return json.scenes.map((s: any, i: number) => ({
          id: crypto.randomUUID(),
          title: `Scene ${s.scene_number || i + 1}`,
          description: s.visual_description || '',
          imagePrompt: s.visual_description || '',
          narration: s.narration || '',
          context: s.visual_description || `Scene ${s.scene_number || i + 1}`,
          models3d: (s.assets || []).join(', ') || 'No assets specified',
          mood: '',
        }));
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  const extractModelsFromText = (text: string): string => {
    // Common 3D models based on keywords in text
    const models: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Characters
    if (lowerText.includes('teacher') || lowerText.includes('instructor')) models.push('teacher character');
    if (lowerText.includes('student') || lowerText.includes('class')) models.push('student characters');
    if (lowerText.includes('person') || lowerText.includes('people')) models.push('character models');
    
    // Furniture
    if (lowerText.includes('desk') || lowerText.includes('table')) models.push('desk');
    if (lowerText.includes('chair') || lowerText.includes('seat')) models.push('chairs');
    if (lowerText.includes('board') || lowerText.includes('whiteboard')) models.push('whiteboard');
    
    // Educational items
    if (lowerText.includes('book')) models.push('textbooks');
    if (lowerText.includes('pen') || lowerText.includes('pencil')) models.push('writing tools');
    if (lowerText.includes('microscope')) models.push('microscope');
    if (lowerText.includes('diagram') || lowerText.includes('chart')) models.push('educational diagrams');
    if (lowerText.includes('cell') || lowerText.includes('biology')) models.push('cell model');
    
    // Room elements
    if (lowerText.includes('classroom') || lowerText.includes('room')) {
      models.push('classroom walls', 'floor', 'ceiling', 'door', 'windows');
    }
    if (lowerText.includes('lab') || lowerText.includes('laboratory')) {
      models.push('lab equipment', 'lab table', 'safety equipment');
    }
    
    // Kitchen/Home items
    if (lowerText.includes('kitchen')) models.push('kitchen counter', 'cabinets', 'appliances');
    if (lowerText.includes('mug') || lowerText.includes('cup')) models.push('mug', 'cup');
    if (lowerText.includes('drill')) models.push('drill tool');
    if (lowerText.includes('hole')) models.push('drilling equipment');
    
    // Nature/Outdoor
    if (lowerText.includes('plant') || lowerText.includes('tree')) models.push('plant models');
    if (lowerText.includes('water') || lowerText.includes('ocean')) models.push('water effects');
    if (lowerText.includes('sun') || lowerText.includes('light')) models.push('lighting');
    
    return models.length > 0 ? models.join(', ') : 'basic scene objects';
  };

  // New: Convert plain text to JSON script using Flask API
  const convertPlainTextToJSON = async () => {
    if (!active || !plainText.trim()) {
      toast.error("Please enter plain text first");
      return;
    }
    
    setConvertingToJSON(true);
    try {
      const sceneCount = active.sceneCount || 6;
      
      // Use custom prompt if provided, otherwise use default
      const promptToUse = customPrompt.trim() || defaultPromptTemplate;
      
      // Call Flask API (use environment variable for production)
      // In production (Vercel), VITE_FLASK_API_URL should be '/api'
      // In development, it should be 'http://localhost:5000'
      const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';
      console.log('Using API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/generate-scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          script: plainText,
          sceneCount: sceneCount,
          customPrompt: promptToUse // Send custom prompt to API
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Response includes: scenes[], tableText, fullResponse, scenesText
      if (data.fullResponse) {
        // Show full response (table + JSON) in script box
        updateActive(p => ({ 
          ...p, 
          script: data.fullResponse,
          generatedScenes: data.scenesText || ''  // Also set the scenes text
        }));
        toast.success(`Generated ${data.scenes?.length || 0} scenes with table`);
      } else {
        // Fallback
        const jsonOutput = JSON.stringify(data, null, 2);
        updateActive(p => ({ ...p, script: jsonOutput }));
        toast.success("Converted to JSON format");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to convert to JSON");
    } finally {
      setConvertingToJSON(false);
    }
  };

  const generateScenes = async () => {
    if (!active || !active.script.trim()) {
      toast.error("Please paste a script first");
      return;
    }
    
    // Check if script is JSON format
    const jsonScenes = parseJSONScript(active.script);
    if (jsonScenes) {
      // Direct JSON conversion
      const humanText = jsonScenes.map((s, i) => 
        `Scene ${i + 1}: ${s.title}\nNarration: ${s.narration}\nContext: ${s.context}\n3D Models: ${s.models3d}\n`
      ).join('\n');
      
      updateActive(p => ({ ...p, generatedScenes: humanText }));
      toast.success(`Converted ${jsonScenes.length} scenes from JSON`);
      return;
    }
    
    // Otherwise, use GROQ API
    setGeneratingScenes(true);
    try {
      const sceneCount = active.sceneCount || 6;
      console.log('Generating scenes with count:', sceneCount);
      
      const { data, error } = await supabase.functions.invoke("generate-scenes", {
        body: { script: active.script, mode: active.mode, style: active.style, sceneCount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const scenes: Scene[] = (data.scenes || []).map((s: any) => {
        console.log('Scene data from GROQ:', s);
        
        // Extract models from scene text if not provided by AI
        const autoModels = extractModelsFromText(`${s.title} ${s.description} ${s.narration || ''}`);
        
        return {
          id: crypto.randomUUID(),
          title: s.title || 'Untitled',
          description: s.description || '',
          imagePrompt: s.imagePrompt || s.title || '',
          narration: s.narration || s.description || '',
          context: s.title || '', // Use title as context
          models3d: s.models3d || autoModels, // Use AI models or auto-extracted
          mood: s.mood || '',
        };
      });

      console.log('Mapped scenes:', scenes);

      // Convert scenes to human-readable text
      const humanText = scenes.map((s, i) => 
        `Scene ${i + 1}: ${s.title}\nNarration: ${s.narration}\nContext: ${s.context}\n3D Models: ${s.models3d}\n`
      ).join('\n');

      // Only update the text, not the actual scene cards
      updateActive(p => ({ ...p, generatedScenes: humanText }));
      toast.success(`Generated ${scenes.length} scenes text`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate scenes");
    } finally {
      setGeneratingScenes(false);
    }
  };

  const generateStoryboard = () => {
    if (!active || !active.generatedScenes.trim()) {
      toast.error("Generate scenes first");
      return;
    }
    
    // Parse the scenes text into actual scene cards
    const lines = active.generatedScenes.split('\n');
    const newScenes: Scene[] = [];
    let currentScene: any = null;
    
    lines.forEach(line => {
      const sceneMatch = line.match(/^Scene (\d+): (.+)$/);
      const narrationMatch = line.match(/^Narration: (.+)$/);
      const contextMatch = line.match(/^Context: (.+)$/);
      const modelsMatch = line.match(/^3D Models: (.+)$/);
      
      if (sceneMatch) {
        if (currentScene) newScenes.push(currentScene);
        currentScene = {
          id: crypto.randomUUID(),
          title: sceneMatch[2],
          description: "",
          imagePrompt: sceneMatch[2],
          narration: "",
          context: "",
          models3d: "",
          mood: "",
        };
      } else if (currentScene) {
        if (narrationMatch) {
          currentScene.narration = narrationMatch[1];
          currentScene.description = narrationMatch[1];
        } else if (contextMatch) {
          const contextValue = contextMatch[1];
          currentScene.context = (contextValue && contextValue !== 'N/A' && !contextValue.includes('Add context')) ? contextValue : '';
          // Update imagePrompt with context if available
          if (currentScene.context) {
            currentScene.imagePrompt = `${currentScene.title}. ${currentScene.narration}. Context: ${currentScene.context}`;
          } else {
            currentScene.imagePrompt = `${currentScene.title}. ${currentScene.narration}`;
          }
        } else if (modelsMatch) {
          const modelsValue = modelsMatch[1];
          currentScene.models3d = (modelsValue && modelsValue !== 'N/A' && !modelsValue.includes('List 3D models')) ? modelsValue : '';
        }
      }
    });
    
    if (currentScene) newScenes.push(currentScene);
    
    updateActive(p => ({ ...p, scenes: newScenes }));
    toast.success(`Created ${newScenes.length} storyboard cards`);
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
  const updateScene = (scene: Scene) => {
    updateActive(p => ({ ...p, scenes: p.scenes.map(s => s.id === scene.id ? scene : s) }));
  };

  const exportJSON = () => {
    if (!active) return;
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.name.replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  };

  const loadImageAsDataUrl = (url: string): Promise<{ data: string; w: number; h: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0);
        try {
          resolve({ data: canvas.toDataURL("image/jpeg", 0.92), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = url;
    });

  const exportPDF = async () => {
    if (!active) return;
    const tId = toast.loading("Building PDF...");
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2;

      // Cover
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text(active.name, margin, 30);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(`${active.scenes.length} scenes · ${active.style} · ${active.mode}`, margin, 40);

      for (let i = 0; i < active.scenes.length; i++) {
        const s = active.scenes[i];
        pdf.addPage();
        let y = margin;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`SCENE ${String(i + 1).padStart(2, "0")}`, margin, y);
        y += 6;
        pdf.setFontSize(16);
        const title = pdf.splitTextToSize(s.title, contentW);
        pdf.text(title, margin, y);
        y += title.length * 7 + 2;

        if (s.imageUrl) {
          try {
            const img = await loadImageAsDataUrl(s.imageUrl);
            const ratio = img.h / img.w;
            const imgW = contentW;
            const imgH = Math.min(imgW * ratio, 110);
            const finalW = imgH === 110 ? 110 / ratio : imgW;
            pdf.addImage(img.data, "JPEG", margin, y, finalW, imgH);
            y += imgH + 6;
          } catch {
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.text("[Image could not be embedded]", margin, y);
            y += 6;
          }
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const desc = pdf.splitTextToSize(s.description, contentW);
        pdf.text(desc, margin, y);
        y += desc.length * 5 + 4;

        if (s.narration) {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(10);
          pdf.text("Narration:", margin, y);
          y += 5;
          const nar = pdf.splitTextToSize(s.narration, contentW);
          pdf.text(nar, margin, y);
        }
      }

      pdf.save(`${active.name.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      toast.success("PDF exported", { id: tId });
    } catch (e: any) {
      toast.error(e.message || "PDF export failed", { id: tId });
    }
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
        {/* Input panel - 2 boxes */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Box 1: Plain Text Input */}
          <div className="scene-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl tracking-wide">Plain Text</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="text-muted-foreground hover:text-primary"
              >
                <Settings className="h-4 w-4 mr-1.5" />
                {showPromptEditor ? 'Hide' : 'Edit'} Prompt
              </Button>
            </div>
            
            {/* Scene count slider */}
            <div className="mb-4">
              <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">
                Number of Scenes: {active.sceneCount || 6}
              </Label>
              <Slider
                value={[active.sceneCount || 6]}
                onValueChange={(v) => updateActive(p => ({ ...p, sceneCount: v[0] }))}
                min={3}
                max={12}
                step={1}
                className="w-full"
              />
            </div>
            
            <Textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Paste your plain text here...\n\nExample:\nPut some sugar in your mouth. How does it taste?\nBlock your nose by pressing it between your thumb and index finger..."
              className="min-h-[220px] resize-none text-sm bg-background/50 border-border focus:border-primary"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {plainText.length} chars
              </div>
              <Button 
                size="sm" 
                variant="default"
                onClick={convertPlainTextToJSON}
                disabled={!plainText.trim() || convertingToJSON}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
              >
                {convertingToJSON ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Converting...</>
                ) : (
                  <><Wand2 className="h-3.5 w-3.5 mr-1.5" /> Generate Scenes</>
                )}
              </Button>
            </div>
          </div>

          {/* Box 2: Generated Scenes Text */}
          <div className="scene-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl tracking-wide">Scenes</h2>
            </div>
            <Textarea
              value={active.generatedScenes || ""}
              onChange={(e) => updateActive(p => ({ ...p, generatedScenes: e.target.value }))}
              placeholder="Generated scenes will appear here...\n\nFormat:\nScene 1: Title\nNarration: Your narration text\nContext: What's happening\n3D Models: list of models"
              className="min-h-[280px] resize-none text-sm bg-background/50 border-border focus:border-primary"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Edit scenes text above
              </div>
              <Button 
                size="sm" 
                variant="default"
                onClick={generateStoryboard}
                disabled={!active.generatedScenes.trim()}
                className="bg-gradient-amber text-primary-foreground hover:opacity-90"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" /> Create Scenes
              </Button>
            </div>
          </div>
        </div>

        {/* Prompt Template Editor - Collapsible */}
        {showPromptEditor && (
          <div className="scene-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl tracking-wide">AI Prompt Template</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize how AI generates scenes. Use {"{sceneCount}"} placeholder for scene count.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCustomPrompt(defaultPromptTemplate);
                  toast.success("Reset to default prompt");
                }}
              >
                Reset to Default
              </Button>
            </div>
            <Textarea
              value={customPrompt || defaultPromptTemplate}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom prompt template..."
              className="min-h-[300px] resize-none text-xs font-mono bg-background/50 border-border focus:border-primary"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {(customPrompt || defaultPromptTemplate).length} chars
              </div>
              <div className="text-xs text-muted-foreground">
                {customPrompt.trim() ? '✓ Using custom prompt' : 'Using default prompt'}
              </div>
            </div>
          </div>
        )}

        {/* Settings panel - simplified */}
        <div className="scene-card p-6">
          <div className="flex items-center justify-between gap-6">
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

                <div className="flex gap-2">
                  <Button onClick={exportPDF} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" /> PDF
                  </Button>
                  <Button onClick={exportJSON} variant="outline" size="sm">
                    <FileJson className="h-4 w-4 mr-2" /> JSON
                  </Button>
                </div>

                <div className="ml-auto mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {active.scenes.length} scenes · {active.scenes.filter(s => s.imageUrl).length} rendered
                </div>
              </>
            )}
          </div>
        </div>

        {/* Storyboard grid */}
        {active.scenes.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg py-24 text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-primary/40" />
            <h3 className="font-display text-2xl tracking-wide mb-2">Your storyboard begins here</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Drop your script above and let AI break it into scenes. Each scene becomes an editable card.
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
