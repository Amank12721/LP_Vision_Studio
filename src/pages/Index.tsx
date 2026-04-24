import { useEffect } from "react";
import { Studio } from "@/components/Studio";

const Index = () => {
  // SEO
  useEffect(() => {
    document.title = "LP Vision Studio — Turn Scripts into Visual Storyboards";
    const desc = "AI-powered storyboard generator. Transform scripts, lessons, and story ideas into illustrated scenes. Built for educators, animators, and creators.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);

  return <Studio onBack={() => {}} />;
};

export default Index;
