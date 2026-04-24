import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { script, mode = "script", style = "animated cartoon", sceneCount = 6 } = await req.json();

    if (!script || typeof script !== "string" || script.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a script of at least 10 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const systemPrompt = `You are a master storyboard director AND narrator creating educational content for Class 10 students. 

CRITICAL REQUIREMENT: You MUST generate EXACTLY ${sceneCount} scenes. No more, no less. This is mandatory.

Break the user's ${mode} into exactly ${sceneCount} distinct visual scenes for a ${style} storyboard suitable for 3D animation. 

IMPORTANT: Create a smooth, flowing narrative where each scene connects naturally to the next. The narration should tell a cohesive story that flows seamlessly from one frame to the next.

For each scene, you MUST provide ALL these fields:

1. TITLE: Short scene title (this will be used as context)
2. DESCRIPTION: Brief description of what's happening
3. IMAGE PROMPT: Detailed visual description for image generation (camera angle, lighting, action, mood)
4. NARRATION: Clear voiceover script (1-2 sentences, max 40 words) that flows naturally with other scenes
5. MODELS3D: CRITICAL - Carefully scan and analyze the scene. List ALL 3D models/objects/characters needed to build this scene in 3D software. Be extremely specific and comprehensive.

CRITICAL FOR MODELS3D FIELD - THIS IS THE MOST IMPORTANT FIELD:
- Read the scene description and narration carefully
- Identify EVERY physical object, character, prop, furniture, tool mentioned or implied
- Be specific: "wooden classroom desk, metal rolling chair, whiteboard with black frame"
- Include characters: "teacher character model, 5 student character models"
- Include background: "classroom walls, tiled floor, ceiling with lights, windows, door"
- Include props: "textbooks, pens, notebooks, backpacks, water bottle"
- Include educational items: "plant cell 3D diagram, microscope, periodic table poster"
- Separate all items with commas
- Think like a 3D artist - what would you need to model this scene?
- NEVER leave this field empty - if unsure, list basic items like "character, floor, walls"

Return ONLY a JSON object with this exact shape — no prose, no markdown:
{
  "scenes": [
    {
      "title": "string (this describes what's happening - will be used as context)",
      "description": "string",
      "imagePrompt": "string",
      "narration": "string",
      "models3d": "string (REQUIRED - comprehensive comma-separated list of ALL 3D models needed)",
      "mood": "string"
    }
  ]
}

EXAMPLE of excellent models3d field:
"teacher character model, 5 student character models, wooden classroom desk, 4 metal chairs, whiteboard with black frame and markers, plant cell 3D diagram model, microscope, 3 textbooks, pen, notebook, classroom walls with paint, tiled floor, ceiling with fluorescent lights, 2 windows with glass, wooden door, wall clock, educational posters"

REMEMBER: 
1. Generate EXACTLY ${sceneCount} scenes
2. NEVER leave models3d field empty
3. Scan each scene thoroughly and list EVERY object needed for 3D modeling`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: script },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Groq error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Groq rate limit hit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Invalid Groq API key." }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Groq error (${response.status}): ${t.slice(0, 300)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    console.log("=== GROQ RAW RESPONSE ===");
    console.log(content);
    console.log("=== END RESPONSE ===");

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
      console.log("=== PARSED JSON ===");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("=== END PARSED ===");
    } catch (e) {
      console.error("Failed to parse Groq response:", content);
      throw new Error("Model did not return valid JSON");
    }

    let scenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    
    console.log(`Generated ${scenes.length} scenes, requested ${sceneCount}`);
    
    // Ensure we have exactly the requested number of scenes
    if (scenes.length > sceneCount) {
      scenes = scenes.slice(0, sceneCount);
      console.log(`Trimmed scenes from ${scenes.length} to ${sceneCount}`);
    } else if (scenes.length < sceneCount) {
      console.warn(`Generated only ${scenes.length} scenes, requested ${sceneCount}`);
    }

    return new Response(JSON.stringify({ scenes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
