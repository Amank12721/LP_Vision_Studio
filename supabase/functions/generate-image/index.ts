import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { getVertexAccessToken, getVertexConfig } from "../_shared/vertex.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, style = "animated cartoon storyboard frame, cinematic composition, vibrant colors, expressive characters" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { projectId, location } = getVertexConfig();
    const token = await getVertexAccessToken();

    const fullPrompt = `${prompt}. Style: ${style}.`;

    // Vertex AI Imagen — uses :predict endpoint
    const model = "imagen-4.0-generate-001";
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;

    const body = {
      instances: [{ prompt: fullPrompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        safetySetting: "block_only_high",
        personGeneration: "allow_adult",
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
      console.error("Vertex Imagen error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Vertex AI rate limit hit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `Vertex Imagen error (${response.status}): ${t.slice(0, 300)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const prediction = data.predictions?.[0];
    const b64 = prediction?.bytesBase64Encoded;
    const mime = prediction?.mimeType || "image/png";

    if (!b64) throw new Error("No image returned by Imagen");

    const imageUrl = `data:${mime};base64,${b64}`;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
