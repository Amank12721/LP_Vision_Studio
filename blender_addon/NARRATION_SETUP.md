# ElevenLabs Narration Setup Guide

## Overview
The addon can automatically generate narration audio for all scenes using ElevenLabs API and add them to Blender's timeline sequencer.

## Setup Steps

### 1. Get ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up / Log in
3. Go to Profile → API Keys
4. Copy your API key

### 2. Set Environment Variable

#### Windows (PowerShell):
```powershell
$env:ELEVENLABS_API_KEY = "your_api_key_here"
```

#### Windows (Command Prompt):
```cmd
set ELEVENLABS_API_KEY=your_api_key_here
```

#### Windows (Permanent - System):
1. Search "Environment Variables" in Start Menu
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", click "New"
5. Variable name: `ELEVENLABS_API_KEY`
6. Variable value: Your API key
7. Click OK
8. Restart Blender

#### macOS/Linux:
```bash
export ELEVENLABS_API_KEY="your_api_key_here"
```

Add to `~/.bashrc` or `~/.zshrc` for permanent:
```bash
echo 'export ELEVENLABS_API_KEY="your_api_key_here"' >> ~/.bashrc
```

### 3. Launch Blender from Terminal (Alternative)

#### Windows:
```cmd
set ELEVENLABS_API_KEY=your_key_here
"C:\Program Files\Blender Foundation\Blender 4.4\blender.exe"
```

#### macOS:
```bash
export ELEVENLABS_API_KEY="your_key_here"
/Applications/Blender.app/Contents/MacOS/Blender
```

#### Linux:
```bash
export ELEVENLABS_API_KEY="your_key_here"
blender
```

## Usage

### Generate All Narrations

1. **Import your storyboard JSON**
2. **Check API key status** in the main panel:
   - ✓ Green checkmark = API key detected
   - ⚠ Red warning = API key not set
3. **Click "Generate All Narrations"** button
4. **Wait** - The addon will:
   - Generate audio for each scene's narration text
   - Download MP3 files from ElevenLabs
   - Add them to timeline sequencer (Channel 1)
   - Space them with 0.5 second gaps

### What Happens

```
Scene 1 narration → ElevenLabs API → MP3 → Timeline Frame 1-150
Scene 2 narration → ElevenLabs API → MP3 → Timeline Frame 163-280
Scene 3 narration → ElevenLabs API → MP3 → Timeline Frame 293-450
...
```

### View Timeline

1. Switch to **Video Editing** workspace
2. Or open **Sequencer** editor
3. You'll see all narration audio strips on Channel 1
4. Press **Space** to play

## Voice Settings

Default voice: **George** (warm narrator)
- Voice ID: `JBFqnCBsd6RMkjVDRZzb`
- Model: `eleven_multilingual_v2`
- Stability: 0.55
- Similarity: 0.75
- Style: 0.4
- Speed: 1.0

To change voice, edit the `voice_id` in the code (line ~380).

## Troubleshooting

**"Set ELEVENLABS_API_KEY" error:**
- Environment variable not set
- Restart Blender after setting it
- Launch Blender from terminal with variable set

**"Failed to generate narration" error:**
- Check internet connection
- Verify API key is valid
- Check ElevenLabs account has credits
- Look at Blender console for detailed error

**No audio in timeline:**
- Check if narration text exists in scenes
- Verify audio files were generated (check temp folder)
- Open Sequencer editor to see strips

**Audio not playing:**
- Check speaker icon in timeline (not muted)
- Verify frame range includes audio strips
- Check system audio output

## API Costs

ElevenLabs pricing (as of 2024):
- Free tier: 10,000 characters/month
- Paid plans: Starting at $5/month

Each scene narration typically uses 50-200 characters.

## Tips

- Keep narrations concise (under 40 words per scene)
- Generate narrations after finalizing scene text
- Audio files are temporary - save your .blend file to keep them
- Use "Pack Resources" to embed audio in .blend file

## Advanced: Custom Voice

To use a different voice:

1. Get voice ID from ElevenLabs dashboard
2. Edit `storyboard_importer.py`
3. Find line: `voice_id = "JBFqnCBsd6RMkjVDRZzb"`
4. Replace with your voice ID
5. Reload addon

Enjoy automated narration! 🎙️
