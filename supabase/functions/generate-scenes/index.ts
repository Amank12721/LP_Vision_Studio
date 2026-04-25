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

    const systemPrompt = `You are a Senior 3D Technical Director. Task: Convert input into EXACTLY ${sceneCount} scenes. Step 1: Output a Markdown table with columns: Scene # | Required 3D Assets | Labels (UI Text) | Animation Logic (GLB Safe) | Visual Description | Narration. Step 2: Provide the same data in a valid JSON block at the end, wrapped in \`\`\`json tags.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a detailed 3D storyboard for: ${script}` },
        ],
        temperature: 0.2,
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

    // Extract table and JSON parts
    let tableText = "";
    let jsonContent = content;
    
    if (content.includes("```json")) {
      // Split table and JSON
      tableText = content.split("```json")[0].trim();
      const jsonMatch = content.split("```json")[1]?.split("```")[0];
      if (jsonMatch) {
        jsonContent = jsonMatch.trim();
      }
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonContent);
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

    return new Response(JSON.stringify({ 
      scenes,
      tableText,  // Include markdown table
      fullResponse: content  // Include full response with table + JSON
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
