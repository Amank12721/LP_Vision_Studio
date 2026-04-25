# 🎬 Storyboard Studio

AI-powered educational storyboard generator that transforms plain text into detailed 3D scene descriptions using GROQ AI.

![Tech Stack](https://img.shields.io/badge/React-18.3-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![Python](https://img.shields.io/badge/Python-3.12-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## ✨ Features

- 🤖 AI-powered scene generation using GROQ API (Llama 3.1)
- 📊 Adjustable scene count (3-12 scenes)
- 🎓 Educational focus with scientific concepts
- 🎨 3D asset recommendations for each scene
- 📝 Detailed narration and context for each scene
- 📄 Export to PDF and JSON formats
- 💾 Local storage for multiple projects
- 🎯 Blender addon integration ready

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- GROQ API Key ([Get it here](https://console.groq.com))

### Installation

1. **Install dependencies:**
```bash
# Frontend
npm install

# Backend
cd api
pip install -r requirements.txt
cd ..
```

2. **Configure environment:**

Create `.env` file:
```env
VITE_FLASK_API_URL="http://localhost:5000"
```

Create `.env.local` file:
```env
GROQ_API_KEY=your-groq-api-key-here
```

3. **Run the application:**

Terminal 1 (Backend):
```bash
cd api
# Windows PowerShell:
$env:GROQ_API_KEY='your-key-here'; python flask_api.py

# Mac/Linux:
export GROQ_API_KEY='your-key-here' && python flask_api.py
```

Terminal 2 (Frontend):
```bash
npm run dev
```

4. **Open browser:** `http://localhost:8080`

## 📖 Usage

1. Enter educational text in "Plain Text" box (min 10 characters)
2. Adjust scene count slider (3-12 scenes)
3. Click "Generate Scenes" button
4. Wait for AI processing (5-10 seconds)
5. Click "Create Scenes" to generate storyboard cards
6. Export as PDF or JSON

### Example Input:
```
Put some sugar in your mouth. How does it taste? Block your nose by pressing 
it between your thumb and index finger. Now put some more sugar in your mouth. 
Can you taste it? Our tongue has taste buds that detect different flavors. 
When we block our nose, we cannot smell the food, which affects how we taste it.
```

## 🏗️ Project Structure

```
storyboard-studio/
├── api/
│   ├── flask_api.py          # Flask backend API
│   └── requirements.txt      # Python dependencies
├── src/
│   ├── components/
│   │   ├── Studio.tsx        # Main storyboard interface
│   │   └── SceneCard.tsx     # Scene card component
│   └── lib/
│       └── storage.ts        # Local storage utilities
├── blender_addon/            # Blender integration
├── .env                      # Frontend config
├── .env.local               # API keys (gitignored)
└── SETUP_GUIDE.md           # Detailed setup instructions
```

## 🔧 API Endpoints

### POST `/generate-scenes`
Generate educational scenes from text

**Request:**
```json
{
  "script": "Your educational text...",
  "sceneCount": 6
}
```

**Response:**
```json
{
  "scenes": [...],
  "scenesText": "...",
  "tableText": "...",
  "fullResponse": "..."
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Enter at least 10 characters |
| API Key Error | Set GROQ_API_KEY in terminal |
| Connection Failed | Ensure Flask is running on port 5000 |
| Port in Use | Change port in flask_api.py or vite.config.ts |

## 📚 Documentation

- [Complete Setup Guide](./SETUP_GUIDE.md)
- [API Documentation](./api/README.md)
- [Blender Addon Guide](./blender_addon/README.md)

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend:** Flask, Python
- **AI:** GROQ API (Llama 3.1-8b-instant)
- **Storage:** LocalStorage
- **Export:** jsPDF

## 📝 License

Educational purposes only.

## 🤝 Contributing

Feel free to fork and improve!

---

**Need help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.
