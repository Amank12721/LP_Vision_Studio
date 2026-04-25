from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")
    
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route('/generate-scenes', methods=['POST'])
def generate_scenes():
    try:
        data = request.json
        script = data.get('script', '')
        scene_count = data.get('sceneCount', 6)
        
        if not script or len(script.strip()) < 10:
            return jsonify({'error': 'Please provide a script of at least 10 characters.'}), 400
        
        # GROQ API call
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system", 
                    "content": (
                        f"You are a Senior 3D Technical Director creating educational content for school students. "
                        f"CRITICAL REQUIREMENT: You MUST create EXACTLY {scene_count} scenes - no more, no less. "
                        f"If you create {scene_count - 1} or {scene_count + 1} scenes, you have FAILED the task. "
                        f"Count your scenes carefully before responding. "
                        "\n\nIMPORTANT GUIDELINES:\n"
                        "1. NARRATION: Write detailed, educational narration (3-5 sentences per scene) that explains concepts clearly for students\n"
                        "2. VISUAL DESCRIPTION (Context): Explain the SCIENTIFIC CONCEPT or PRINCIPLE being demonstrated - NOT the scene visuals\n"
                        "   - Example: 'Taste receptors on tongue detect sweet molecules' NOT 'Person eating sugar'\n"
                        "   - Focus on: Why it happens, what principle is shown, the science behind it\n"
                        "3. FOCUS: Emphasize scientific concepts, processes, and phenomena - NOT characters or people\n"
                        "4. VISUAL: Focus on objects, equipment, experiments, and visual demonstrations of concepts\n"
                        "5. 3D ASSETS: Prioritize educational props, lab equipment, diagrams, models - minimize human characters\n"
                        "6. LANGUAGE: Use simple, clear language suitable for school students\n\n"
                        "Step 1: Output a Markdown table with columns: "
                        "Scene # | Required 3D Assets | Labels (UI Text) | Animation Logic (GLB Safe) | Visual Description | Narration. "
                        "Step 2: Provide the same data in a valid JSON block at the end, wrapped in ```json tags."
                    )
                },
                {
                    "role": "user", 
                    "content": f"Create an educational 3D storyboard with EXACTLY {scene_count} scenes for school students. Focus on concepts and demonstrations, not characters. Script: {script}"
                }
            ],
            "temperature": 0.2
        }
        
        response = requests.post(GROQ_URL, headers=headers, json=payload)
        
        if response.status_code != 200:
            return jsonify({'error': f'GROQ API error: {response.status_code}'}), 500
        
        result_text = response.json()['choices'][0]['message']['content']
        
        # Extract table and JSON parts
        table_text = ""
        json_content = result_text
        
        if "```json" in result_text:
            table_text = result_text.split("```json")[0].strip()
            json_part = result_text.split("```json")[1].split("```")[0].strip()
            json_content = json_part
        
        # Parse JSON
        import json as json_lib
        parsed = json_lib.loads(json_content)
        scenes = parsed.get('scenes', [])
        
        # Convert scenes to Studio text format
        scenes_text = ""
        for i, scene in enumerate(scenes, 1):
            title = scene.get('labels', [''])[0] if isinstance(scene.get('labels'), list) else scene.get('labels', f'Scene {i}')
            narration = scene.get('narration', '')
            description = scene.get('description', '')
            assets = scene.get('assets', [])
            assets_str = ', '.join(assets) if isinstance(assets, list) else str(assets)
            
            scenes_text += f"Scene {i}: {title}\n"
            scenes_text += f"Narration: {narration}\n"
            scenes_text += f"Context: {description}\n"
            scenes_text += f"3D Models: {assets_str}\n"
            if i < len(scenes):
                scenes_text += "\n"
        
        return jsonify({
            'scenes': scenes,
            'tableText': table_text,
            'fullResponse': result_text,
            'scenesText': scenes_text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask API on port {port}")
    print("Endpoint: POST /generate-scenes")
    app.run(host='0.0.0.0', port=port, debug=False)
