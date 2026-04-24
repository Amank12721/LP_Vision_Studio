export interface Scene {
  id: string;
  title: string;
  description: string;
  imagePrompt: string;
  context: string;
  models3d: string;
  mood: string;
  narration?: string;
  audioUrl?: string;
  imageUrl?: string;
  isGenerating?: boolean;
  isNarrating?: boolean;
}

export interface Project {
  id: string;
  name: string;
  script: string;
  generatedScenes: string; // Raw text from GROQ
  mode: "script" | "story" | "lesson";
  style: string;
  sceneCount: number;
  scenes: Scene[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "lpvision_projects";
const ACTIVE_KEY = "lpvision_active";

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveProjectId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    script: "",
    generatedScenes: "",
    mode: "script",
    style: "animated cartoon",
    sceneCount: 6,
    scenes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
