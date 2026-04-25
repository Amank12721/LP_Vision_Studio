# Storyboard Studio - Complete Setup Guide

## Overview
AI-powered educational storyboard generator that creates 3D scene descriptions from plain text using GROQ API.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Flask API (Python)
- **AI**: GROQ API (Llama 3.1)
- **UI**: Shadcn/ui + Tailwind CSS

---

## Prerequisites

Before starting, make sure you have:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **GROQ API Key** (get from https://console.groq.com)

---

## Installation Steps

### 1. Clone/Download the Project
```bash
cd storyboard-studio
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd api
pip install -r requirements.txt
cd ..
```

### 4. Configure Environment Variables

Create/Update `.env` file in root directory:
```env
VITE_SUPABASE_PROJECT_ID="cmzyukutpcghbuqsdnjc"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtenl1a3V0cGNnaGJ1cXNkbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzc5NjMsImV4cCI6MjA5MjYxMzk2M30.VAM2Hwn3lGfTW5NDMU3kUuves-BRmwpDpQeipilrmKo"
VITE_SUPABASE_URL="https://cmzyukutpcghbuqsdnjc.supabase.co"
VITE_FLASK_API_URL="http://localhost:5000"
```

Create/Update `.env.local` file in root directory:
```env
# GROQ API for scene generation
GROQ_API_KEY=your-groq-api-key-here
```

**Important:** Replace `your-groq-api-key-here` with your actual GROQ API key!

---

## Running the Application

### Step 1: Start Flask API (Backend)

Open Terminal 1:
```bash
cd api
```

**For Windows PowerShell:**
```powershell
$env:GROQ_API_KEY='your-groq-api-key-here'
python flask_api.py
```

**For Mac/Linux:**
```bash
export GROQ_API_KEY='your-groq-api-key-here'
python flask_api.py
```

You should see:
```
Starting Flask API on port 5000
Endpoint: POST /generate-scenes
 * Running on http://127.0.0.1:5000
```

### Step 2: Start Frontend (React App)

Open Terminal 2 (keep Terminal 1 running):
```bash
npm run dev
```

You should see:
```
VITE v5.4.19  ready in 493 ms
➜  Local:   http://localhost:8080/
```

---

## Using the Application

1. **Open Browser**: Go to `http://localhost:8080/`

2. **Enter Plain Text**: In the "Plain Text" box, paste your educational script (minimum 10 characters)
   
   Example:
   ```
   Put some sugar in your mouth. How does it taste? Block your nose by pressing it between your thumb and index finger. Now put some more sugar in your mouth. Can you taste it? Our tongue has taste buds that detect different flavors. When we block our nose, we cannot smell the food, which affects how we taste it. This shows that taste and smell work together.
   ```

3. **Set Scene Count**: Use the slider to choose number of scenes (3-12)

4. **Generate Scenes**: Click "Generate Scenes" button
   - Wait for AI to process (takes 5-10 seconds)
   - Generated scenes will appear in the "Scenes" box

5. **Create Storyboard**: Click "Create Scenes" button
   - Scene cards will be created below

6. **Export**: Use PDF or JSON export buttons to save your storyboard

---

## API Endpoints

### Flask API (http://localhost:5000)

#### Health Check
```bash
GET /health
```
Response: `{"status": "ok"}`

#### Generate Scenes
```bash
POST /generate-scenes
Content-Type: application/json

{
  "script": "Your educational text here...",
  "sceneCount": 6
}
```

Response:
```json
{
  "scenes": [...],
  "tableText": "...",
  "fullResponse": "...",
  "scenesText": "..."
}
```

---

## Testing the API

### Using PowerShell:
```powershell
$body = @{
  script='Put some sugar in your mouth. How does it taste?'
  sceneCount=4
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/generate-scenes' -Method Post -Body $body -ContentType 'application/json'
```

### Using curl (Mac/Linux):
```bash
curl -X POST http://localhost:5000/generate-scenes \
  -H "Content-Type: application/json" \
  -d '{"script": "Put some sugar in your mouth. How does it taste?", "sceneCount": 4}'
```

---

## Troubleshooting

### Error: "400 Bad Request"
- **Cause**: Script is too short (less than 10 characters)
- **Solution**: Enter at least 10 characters in Plain Text box

### Error: "GROQ_API_KEY environment variable is required"
- **Cause**: API key not set
- **Solution**: Set GROQ_API_KEY in terminal before running Flask

### Frontend can't connect to API
- **Cause**: Flask API not running or wrong URL
- **Solution**: 
  1. Make sure Flask is running on port 5000
  2. Check `.env` file has `VITE_FLASK_API_URL="http://localhost:5000"`
  3. Restart frontend after changing .env

### Port already in use
- **Flask (5000)**: Change port in `flask_api.py` line: `port = int(os.environ.get('PORT', 5000))`
- **Vite (8080)**: Change port in `vite.config.ts`

---

## Project Structure

```
storyboard-studio/
├── api/
│   ├── flask_api.py          # Flask backend
│   ├── requirements.txt      # Python dependencies
│   └── README.md
├── src/
│   ├── components/
│   │   ├── Studio.tsx        # Main storyboard interface
│   │   ├── SceneCard.tsx     # Individual scene card
│   │   └── ...
│   ├── lib/
│   │   └── storage.ts        # Local storage utilities
│   └── main.tsx
├── .env                      # Frontend environment variables
├── .env.local               # API keys (DO NOT COMMIT)
├── package.json
└── vite.config.ts
```

---

## Features

✅ AI-powered scene generation using GROQ API
✅ Adjustable scene count (3-12 scenes)
✅ Educational focus with scientific concepts
✅ 3D asset recommendations for each scene
✅ Narration and context for each scene
✅ Export to PDF and JSON
✅ Local storage for projects
✅ Multiple project management

---

## Important Notes

1. **API Key Security**: Never commit `.env.local` to Git
2. **Minimum Text**: Enter at least 10 characters for scene generation
3. **Scene Count**: Choose 3-12 scenes (default: 6)
4. **Response Time**: AI generation takes 5-15 seconds depending on scene count
5. **Educational Focus**: Best results with educational/scientific content

---

## Getting GROQ API Key

1. Go to https://console.groq.com
2. Sign up / Log in
3. Navigate to API Keys section
4. Create new API key
5. Copy and paste into `.env.local`

---

## Support

For issues or questions:
- Check Flask terminal for error logs
- Check browser console for frontend errors
- Verify API key is correct
- Ensure both servers are running

---

## License

This project is for educational purposes.
