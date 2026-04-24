import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { script, mode = "script", style = "animated cartoon" } = await req.json();

    if (!script || typeof script !== "string" || script.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a script of at least 10 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a master storyboard director. Break the user's ${mode} into 4-8 distinct visual scenes for a ${style} storyboard. For each scene, write a vivid, specific image-generation prompt (camera angle, lighting, characters, setting, action, mood). Be concrete and visual. Keep scenes sequential.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: script },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_storyboard",
              description: "Return the storyboard scenes",
              parameters: {
                type: "object",
                properties: {
                  scenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short scene title" },
                        description: { type: "string", description: "1-2 sentence narrative description" },
                        imagePrompt: { type: "string", description: "Detailed visual prompt for image generation" },
                        characters: { type: "string", description: "Characters in the scene" },
                        setting: { type: "string", description: "Location / environment" },
                        mood: { type: "string", description: "Emotional tone" },
                      },
                      required: ["title", "description", "imagePrompt", "characters", "setting", "mood"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scenes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_storyboard" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { scenes: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
