import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { getVertexAccessToken, getVertexConfig } from "../_shared/vertex.ts";

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

    const { projectId, location } = getVertexConfig();
    const token = await getVertexAccessToken();

    const systemPrompt = `You are a master storyboard director. Break the user's ${mode} into 4-8 distinct visual scenes for a ${style} storyboard. For each scene, write a vivid, specific image-generation prompt (camera angle, lighting, characters, setting, action, mood). Be concrete and visual. Keep scenes sequential.`;

    const model = "gemini-2.5-flash";
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: script }] }],
      tools: [
        {
          functionDeclarations: [
            {
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
                        title: { type: "string" },
                        description: { type: "string" },
                        imagePrompt: { type: "string" },
                        characters: { type: "string" },
                        setting: { type: "string" },
                        mood: { type: "string" },
                      },
                      required: ["title", "description", "imagePrompt", "characters", "setting", "mood"],
                    },
                  },
                },
                required: ["scenes"],
              },
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: ["create_storyboard"],
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Vertex generateContent error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Vertex AI rate limit hit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Vertex AI error (${response.status}): ${t.slice(0, 300)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const fnCall = parts.find((p: any) => p.functionCall)?.functionCall;
    const args = fnCall?.args || { scenes: [] };

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
