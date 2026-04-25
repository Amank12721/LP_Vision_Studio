# Quick Start Guide - Storyboard Studio Blender Addon

## Installation (2 minutes)

### Step 1: Install Addon
1. Open Blender
2. `Edit` → `Preferences` → `Add-ons`
3. Click `Install...` button
4. Select `storyboard_importer.py`
5. ✅ Enable the checkbox

### Step 2: Set API Key (for narration)
1. Still in Preferences → Add-ons
2. Find "Import-Export: Storyboard Studio Importer"
3. Expand the addon (click arrow)
4. Paste your ElevenLabs API key
5. Click outside to save

```
┌─────────────────────────────────────────┐
│ Import-Export: Storyboard Studio       │
│ ▼ Preferences                           │
│                                         │
│ ElevenLabs Narration Settings           │
│ ┌─────────────────────────────────────┐ │
│ │ ElevenLabs API Key: ••••••••••••••  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ How to get API Key:                     │
│ 1. Go to elevenlabs.io                  │
│ 2. Sign up / Log in                     │
│ 3. Profile → API Keys                   │
│ 4. Copy and paste here                  │
│                                         │
│ ✓ API Key is set                        │
└─────────────────────────────────────────┘
```

## Usage (5 minutes)

### Step 1: Open Storyboard Panel
1. In 3D Viewport, press `N` (show sidebar)
2. Click `Storyboard` tab

### Step 2: Import Your Storyboard
1. Click `Import Storyboard JSON`
2. Select your exported JSON file
3. ✅ Scenes loaded!

### Step 3: View Scene Images
1. Navigate scenes with ◀ ▶ arrows
2. Click `Load Image from URL`
3. Click `Create Plane` to see image in 3D view

### Step 4: Add 3D Models
1. Scroll to "3D Models Needed" section
2. Click any model button (e.g., "teacher character")
3. A placeholder cube appears in scene
4. Replace with your actual 3D model

### Step 5: Generate Narrations (Optional)
1. Scroll to "Audio Narration" section
2. Check: ✓ ElevenLabs API Key set
3. Click `Generate All Narrations`
4. Wait ~30 seconds
5. Switch to `Video Editing` workspace
6. Press `Space` to play timeline with audio!

## Workflow Example

```
1. Export JSON from web app
   ↓
2. Import in Blender addon
   ↓
3. Load scene images
   ↓
4. Create reference planes
   ↓
5. Add model placeholders
   ↓
6. Generate narrations
   ↓
7. Build 3D scene
   ↓
8. Animate & render!
```

## Panel Layout

```
┌─────────────────────────────────┐
│ STORYBOARD STUDIO               │
├─────────────────────────────────┤
│ Import                          │
│ [Import Storyboard JSON]        │
│ Project: My Storyboard          │
│ Scenes: 6                       │
├─────────────────────────────────┤
│ Audio Narration                 │
│ ✓ ElevenLabs API Key set        │
│ [Generate All Narrations]       │
├─────────────────────────────────┤
│ Scenes                          │
│ Scene 1 of 6    [◀] [▶]        │
├─────────────────────────────────┤
│ Active Scene                    │
│ Scene 1: Opening                │
│ Description: Teacher enters...  │
│                                 │
│ Scene Image                     │
│ ✓ Scene_1_Opening               │
│ Size: 1920 x 1080 px            │
│ [View] [Create Plane]           │
│ [Load Image from URL]           │
│                                 │
│ Scene Setup                     │
│ [Setup Scene]                   │
│ [Export Scene Data]             │
├─────────────────────────────────┤
│ 3D Models Needed                │
│ Scene 1 Models:                 │
│ [teacher character]             │
│ [classroom desk]                │
│ [whiteboard]                    │
│ [student characters]            │
│ [textbooks]                     │
└─────────────────────────────────┘
```

## Keyboard Shortcuts

- `N` - Toggle sidebar (show/hide Storyboard panel)
- `Space` - Play timeline (after generating narrations)
- `Home` - Frame all objects in view
- `Numpad 0` - Camera view

## Tips

✅ **Load images first** - Helps visualize the scene
✅ **Create reference planes** - Best way to see images in 3D
✅ **Use collections** - Click "Setup Scene" for organized structure
✅ **Generate narrations last** - After finalizing scene text
✅ **Save often** - Blender auto-save is your friend

## Troubleshooting

**Panel not visible?**
- Press `N` in 3D Viewport
- Look for "Storyboard" tab

**Image is black?**
- Click "Create Plane" instead of "View"
- Switch viewport to Material Preview (Z → Material Preview)

**No narration button?**
- Set API key in addon preferences
- Restart Blender after setting key

**Audio not in timeline?**
- Switch to Video Editing workspace
- Check Sequencer editor
- Look for strips on Channel 1

## Get Help

- Check `README.md` for detailed features
- Check `NARRATION_SETUP.md` for API setup
- Check Blender console for error messages (Window → Toggle System Console)

Happy storyboarding! 🎬
