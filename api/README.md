# Flask API for Scene Generation

Backend API for generating educational storyboard scenes using GROQ AI.

## Setup

1. Install dependencies:
```bash
cd api
pip install -r requirements.txt
```

2. Run the server:
```bash
# Set GROQ API key
$env:GROQ_API_KEY='your-key-here'

# Start Flask
python flask_api.py
```

Server runs on `http://localhost:5000`

## Endpoints

- `GET /health` - Health check
- `POST /generate-scenes` - Generate storyboard scenes

## Note

Original backup available in `../ai-storyboarder/` folder.
