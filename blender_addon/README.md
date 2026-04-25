# Storyboard Studio - Blender Addon

Single-file Blender addon to import storyboard JSON files and manage 3D scene production.

## Features

- ✅ Import JSON from Storyboard Studio
- ✅ View scene images directly in Blender panel
- ✅ Navigate through scenes with prev/next buttons
- ✅ Display scene details (title, description, narration)
- ✅ Parse and display 3D models needed per scene
- ✅ One-click buttons to add model placeholders
- ✅ Auto-create scene collections with camera & lighting
- ✅ Export scene data as text files
- ✅ Handles base64 image data URLs
- ✅ Create reference planes with scene images as textures
- ✅ **Generate all narrations using ElevenLabs API**
- ✅ **Automatically add narrations to timeline sequencer**

## Installation

### Method 1: Install as Addon (Recommended)

1. Open Blender
2. Go to `Edit > Preferences > Add-ons`
3. Click `Install...`
4. Navigate to and select `storyboard_importer.py`
5. Enable the addon by checking the checkbox
6. **Configure ElevenLabs API Key:**
   - Expand the addon in preferences
   - Paste your ElevenLabs API key
   - Select your preferred voice (12 voices available)
   - Adjust voice settings (stability, speed, style)
7. The panel will appear in the 3D Viewport sidebar under "Storyboard" tab

### Method 2: Manual Installation

1. Copy `storyboard_importer.py` to your Blender scripts folder:
   - Windows: `%APPDATA%\Blender Foundation\Blender\{version}\scripts\addons\`
   - macOS: `~/Library/Application Support/Blender/{version}/scripts/addons/`
   - Linux: `~/.config/blender/{version}/scripts/addons/`

2. Restart Blender or click `Refresh` in Add-ons preferences
3. Enable "Storyboard Studio Importer" in Add-ons

## Usage

### 1. Export JSON from Storyboard Studio

In your web app:
- Create your storyboard
- Generate scenes and images
- Click "JSON" export button
- Save the `.json` file

### 2. Import into Blender

1. Open Blender and switch to the `Storyboard` tab in the 3D Viewport sidebar (press `N` if hidden)
2. Click `Import Storyboard JSON`
3. Select your exported JSON file
4. The addon will load all scenes

### 3. Navigate Scenes

- Use the arrow buttons (◀ ▶) to navigate between scenes
- Current scene number is displayed at the top

### 4. View Scene Details

Each scene shows:
- **Title** - Scene name
- **Description** - What's happening
- **Narration** - Voice-over text
- **Scene Image** - Click "Load Image" to preview the AI-generated frame

### 5. Setup Scene

Click **Setup Scene** to automatically create:
- A collection named after the scene
- Camera positioned and angled for the shot
- Key light (sun) for main illumination
- Fill light (area) for softer shadows

### 6. Add 3D Models

The **3D Models Needed** section shows all models required for the scene:
- Each model gets its own button
- Click any button to add a placeholder cube
- The cube is named: `Scene{N}_{ModelName}`
- Custom properties track which scene it belongs to

Example models you might see:
- `teacher character`
- `student characters`
- `classroom desk`
- `whiteboard`
- `textbooks`
- `microscope`

### 7. Export Scene Data

Click **Export Scene Data** to create a text file in Blender with:
- Full scene description
- Narration script
- Context and mood
- Complete list of 3D models
- Image generation prompt

Access via `Text Editor` workspace.

## Workflow Example

```
1. Import JSON → Loads 6 scenes
2. Navigate to Scene 1
3. Load Image → Preview storyboard frame
4. Setup Scene → Creates collection with camera/lights
5. Click "teacher character" → Adds placeholder cube
6. Click "classroom desk" → Adds another placeholder
7. Click "whiteboard" → Adds third placeholder
8. Model/texture the placeholders to match the reference image
9. Navigate to Scene 2 → Repeat process
```

## JSON Format Expected

The addon expects JSON exported from Storyboard Studio:

```json
{
  "id": "project-id",
  "name": "My Storyboard",
  "script": "Original script text...",
  "mode": "script",
  "style": "animated cartoon",
  "sceneCount": 6,
  "scenes": [
    {
      "id": "scene-id",
      "title": "Scene Title",
      "description": "What happens in this scene",
      "imagePrompt": "Detailed visual description",
      "narration": "Voice-over text",
      "context": "Additional context",
      "models3d": "teacher, desk, whiteboard, students",
      "mood": "educational, bright",
      "imageUrl": "data:image/png;base64,..." or "https://..."
    }
  ]
}
```

## Tips

- **Image Loading**: Works with both base64 data URLs and regular URLs
- **Model Names**: Long model names are truncated to 30 chars in buttons
- **Collections**: Each scene gets its own collection for organization
- **Placeholders**: Replace cube placeholders with actual models from your library
- **Camera**: Adjust the auto-created camera to match your storyboard frame
- **Lighting**: Tweak the key/fill lights to match the mood

## Troubleshooting

**Panel not visible?**
- Press `N` in 3D Viewport to show sidebar
- Look for "Storyboard" tab

**Import fails?**
- Check JSON is valid (use a JSON validator)
- Ensure file has `.json` extension

**Image won't load?**
- Check internet connection (for URL images)
- Verify base64 data is complete
- Try re-exporting from Storyboard Studio

**No models showing?**
- Check if `models3d` field has content in JSON
- Models should be comma-separated

## Requirements

- Blender 3.0 or higher
- Internet connection (for loading images from URLs)

## License

Part of LP Vision Studio - Storyboard Studio project
