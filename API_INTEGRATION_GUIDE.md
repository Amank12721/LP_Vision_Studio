# 🔌 API Integration Guide - Narration API Example

## Overview
Agar tumhe narration generate karne ke liye API add karni hai, to ye guide follow karo.

---

## Step 1: Backend API Endpoint Banana (Flask)

### File: `api/index.py`

Existing code ke baad ye add karo:

```python
@app.route('/api/generate-narration', methods=['POST'])
def generate_narration():
    try:
        data = request.json
        scene_text = data.get('sceneText', '')
        scene_title = data.get('sceneTitle', '')
        voice_style = data.get('voiceStyle', 'professional')
        
        # Validation
        if not scene_text or len(scene_text.strip()) < 5:
            return jsonify({'error': 'Scene text required (min 5 chars)'}), 400
        
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
                    "content": "You are a narrator. Create 2-3 sentence narration for educational content."
                },
                {
                    "role": "user",
                    "content": f"Scene: {scene_title}\nDescription: {scene_text}\n\nCreate narration:"
                }
            ],
            "temperature": 0.7,
            "max_tokens": 150
        }
        
        response = requests.post(GROQ_URL, headers=headers, json=payload)
        
        if response.status_code != 200:
            return jsonify({'error': f'API error: {response.status_code}'}), 500
        
        narration = response.json()['choices'][0]['message']['content'].strip()
        
        return jsonify({
            'narration': narration,
            'voiceStyle': voice_style
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## Step 2: Frontend Integration (React/TypeScript)

### File: `src/components/SceneCard.tsx`

Narration generate karne ka function add karo:

```typescript
const generateNarration = async () => {
  try {
    const apiUrl = import.meta.env.VITE_FLASK_API_URL || 
                   (import.meta.env.PROD ? '/api' : 'http://localhost:5000');
    
    const response = await fetch(`${apiUrl}/generate-narration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sceneText: scene.description,
        sceneTitle: scene.title,
        voiceStyle: 'professional' // or 'casual', 'enthusiastic'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update scene with generated narration
    onUpdate({ ...scene, narration: data.narration });
    
    toast.success('Narration generated!');
  } catch (error) {
    toast.error('Failed to generate narration');
    console.error(error);
  }
};
```

### UI Button Add Karo:

```tsx
<Button 
  size="sm" 
  variant="outline"
  onClick={generateNarration}
>
  <Volume2 className="h-3.5 w-3.5 mr-1.5" /> 
  Generate Narration
</Button>
```

---

## Step 3: Test Karo

### Local Testing:

```bash
# Terminal 1 - Backend
cd api
python flask_api.py

# Terminal 2 - Frontend
npm run dev
```

### API Test (PowerShell):

```powershell
$body = @{
  sceneText = 'Sugar dissolves on tongue'
  sceneTitle = 'Taste Test'
  voiceStyle = 'professional'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/generate-narration' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

---

## Step 4: Vercel Deployment

### Changes Required:

1. **api/index.py** - Add new endpoint (Step 1 ka code)
2. **Commit & Push:**
   ```bash
   git add api/index.py
   git commit -m "Add narration generation API"
   git push origin vercel
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Test Production:**
   ```powershell
   $body = @{
     sceneText = 'Test'
     sceneTitle = 'Scene 1'
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri 'https://storyboard-studio-alpha.vercel.app/api/generate-narration' `
     -Method Post `
     -Body $body `
     -ContentType 'application/json'
   ```

---

## API Endpoint Structure

### Request Format:
```json
POST /api/generate-narration
Content-Type: application/json

{
  "sceneText": "Description of the scene",
  "sceneTitle": "Scene title",
  "voiceStyle": "professional"  // optional: professional, casual, enthusiastic
}
```

### Response Format:
```json
{
  "narration": "Generated narration text here...",
  "voiceStyle": "professional"
}
```

### Error Response:
```json
{
  "error": "Error message here"
}
```

---

## Voice Styles Available

1. **professional** - Clear, informative tone
2. **casual** - Friendly, conversational
3. **enthusiastic** - Energetic, engaging
4. **documentary** - Authoritative, serious

---

## Environment Variables Needed

Already configured:
- `GROQ_API_KEY` - For AI generation
- `VITE_FLASK_API_URL` - For API routing

No new environment variables needed!

---

## Complete Example Flow

1. User clicks "Generate Narration" button
2. Frontend sends scene details to `/api/generate-narration`
3. Backend calls GROQ API with scene context
4. GROQ generates narration text
5. Backend returns narration to frontend
6. Frontend updates scene card with narration
7. User can edit or regenerate

---

## Tips

- **Keep prompts short** - Better results
- **Add loading states** - Better UX
- **Handle errors gracefully** - Show user-friendly messages
- **Cache results** - Avoid duplicate API calls
- **Add retry logic** - For failed requests

---

## Similar APIs You Can Add

Using the same pattern, you can add:

1. **Image Generation** - `/api/generate-image`
2. **3D Model Suggestions** - `/api/suggest-models`
3. **Animation Ideas** - `/api/generate-animation`
4. **Script Enhancement** - `/api/enhance-script`
5. **Translation** - `/api/translate-narration`

---

## File Structure

```
api/
├── index.py              # Add new endpoint here
├── flask_api.py          # Local development (optional)
└── requirements.txt      # Dependencies (already has what you need)

src/
├── components/
│   └── SceneCard.tsx     # Add narration button here
└── lib/
    └── api.ts            # Optional: Create API helper functions
```

---

## Summary

**3 Simple Steps:**
1. Add endpoint in `api/index.py`
2. Add button & function in `SceneCard.tsx`
3. Deploy to Vercel

**That's it!** Same pattern for any new API. 🚀
