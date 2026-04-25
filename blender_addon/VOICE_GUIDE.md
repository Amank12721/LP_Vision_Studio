# Voice Selection Guide

## Available Voices

The addon includes 12 pre-configured ElevenLabs voices:

### Male Voices

| Voice | Description | Best For |
|-------|-------------|----------|
| **George** (Default) | Warm, friendly narrator | Educational content, storytelling |
| **Antoni** | Well-rounded, versatile | General narration, tutorials |
| **Josh** | Deep, authoritative | Documentary, serious content |
| **Arnold** | Crisp, clear | Technical content, instructions |
| **Adam** | Deep narrative | Audiobooks, dramatic content |
| **Sam** | Dynamic, raspy | Character voices, energetic content |
| **Daniel** | British accent | Formal content, British English |

### Female Voices

| Voice | Description | Best For |
|-------|-------------|----------|
| **Rachel** | Clear, professional | Corporate, professional content |
| **Domi** | Young, energetic | Youth content, upbeat narration |
| **Bella** | Soft, gentle | Calm content, meditation, children |
| **Elli** | Emotional, expressive | Dramatic content, storytelling |
| **Dorothy** | Pleasant British | Formal British content |

## How to Change Voice

### Step 1: Open Preferences
```
Edit → Preferences → Add-ons
```

### Step 2: Find Storyboard Studio
```
Search: "Storyboard"
Expand: Import-Export: Storyboard Studio Importer
```

### Step 3: Select Voice
```
┌─────────────────────────────────────────┐
│ Voice Settings                          │
│ ┌─────────────────────────────────────┐ │
│ │ Voice: George (Warm Narrator)    ▼ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Advanced Voice Controls                 │
│ Stability:        ████████░░ 0.55       │
│ Similarity Boost: ███████████ 0.75      │
│ Style:            ████░░░░░░ 0.40       │
│ Speed:            ██████████ 1.00       │
└─────────────────────────────────────────┘
```

### Step 4: Adjust Settings (Optional)

**Stability** (0.0 - 1.0)
- Lower = More variable, expressive
- Higher = More consistent, stable
- Default: 0.55

**Similarity Boost** (0.0 - 1.0)
- Lower = More creative interpretation
- Higher = Closer to original voice
- Default: 0.75

**Style** (0.0 - 1.0)
- Lower = More neutral
- Higher = More exaggerated
- Default: 0.40

**Speed** (0.5 - 2.0)
- 0.5x = Half speed (slow)
- 1.0x = Normal speed
- 2.0x = Double speed (fast)
- Default: 1.0

## Voice Recommendations by Content Type

### Educational Content (Class 10 Students)
- **Primary**: George (Warm, friendly)
- **Alternative**: Rachel (Clear, professional)
- Settings: Stability 0.6, Speed 0.9-1.0

### Technical/Scientific
- **Primary**: Arnold (Crisp, clear)
- **Alternative**: Daniel (British, formal)
- Settings: Stability 0.7, Speed 0.9

### Storytelling/Drama
- **Primary**: Adam (Deep narrative)
- **Alternative**: Elli (Emotional)
- Settings: Stability 0.4, Style 0.6

### Children's Content
- **Primary**: Bella (Soft, gentle)
- **Alternative**: Domi (Energetic)
- Settings: Stability 0.5, Speed 1.1

### Corporate/Professional
- **Primary**: Rachel (Professional)
- **Alternative**: Josh (Authoritative)
- Settings: Stability 0.7, Speed 1.0

## Testing Voices

### Quick Test Method

1. Import a small storyboard (1-2 scenes)
2. Change voice in preferences
3. Click "Generate All Narrations"
4. Listen in timeline
5. Adjust settings if needed
6. Repeat with different voices

### A/B Comparison

```python
Test 1: George, Stability 0.55, Speed 1.0
Test 2: Rachel, Stability 0.60, Speed 0.95
Test 3: Antoni, Stability 0.50, Speed 1.0

Listen and choose the best!
```

## Voice Settings Presets

### Preset 1: Natural Narrator
```
Voice: George
Stability: 0.55
Similarity: 0.75
Style: 0.40
Speed: 1.0
```

### Preset 2: Professional Speaker
```
Voice: Rachel
Stability: 0.70
Similarity: 0.80
Style: 0.30
Speed: 0.95
```

### Preset 3: Energetic Host
```
Voice: Domi
Stability: 0.45
Similarity: 0.70
Style: 0.60
Speed: 1.1
```

### Preset 4: Documentary Narrator
```
Voice: Adam
Stability: 0.60
Similarity: 0.75
Style: 0.50
Speed: 0.90
```

### Preset 5: Fast Tutorial
```
Voice: Arnold
Stability: 0.65
Similarity: 0.80
Style: 0.35
Speed: 1.2
```

## Troubleshooting

**Voice sounds robotic:**
- Increase Style (0.5-0.7)
- Decrease Stability (0.4-0.5)

**Voice is too variable:**
- Increase Stability (0.7-0.8)
- Increase Similarity (0.8-0.9)

**Speech is too fast/slow:**
- Adjust Speed slider
- Recommended range: 0.8-1.2

**Voice doesn't match character:**
- Try different voice from list
- Adjust Style for more personality

## Advanced: Custom Voice IDs

If you have custom cloned voices in your ElevenLabs account:

1. Get voice ID from ElevenLabs dashboard
2. Edit `storyboard_importer.py`
3. Add to voice enum list (line ~30)
4. Reload addon

```python
('your_voice_id_here', 'Your Voice Name', 'Description'),
```

## API Usage & Costs

Each narration generation uses:
- ~50-200 characters per scene
- ~1-5 seconds processing time
- Counts toward ElevenLabs monthly quota

**Free Tier**: 10,000 characters/month
**Paid Plans**: Starting at $5/month for 30,000 characters

Tip: Finalize your script before generating to avoid wasting quota!

## Best Practices

✅ Test with 1-2 scenes first
✅ Keep narrations under 40 words per scene
✅ Use consistent voice across project
✅ Adjust speed for pacing
✅ Save voice settings for future projects

Happy narrating! 🎙️
