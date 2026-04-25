# Quick Installation Guide

## Fixed Issue
✅ The class definition order error has been fixed. The addon should now install properly.

## Installation Steps

### For Blender 4.4+

1. **Open Blender 4.4**

2. **Go to Edit > Preferences**

3. **Click on "Add-ons" tab**

4. **Click "Install..." button** (top right)

5. **Navigate to and select:**
   ```
   storyboard-studio/blender_addon/storyboard_importer.py
   ```

6. **Enable the addon** by checking the checkbox next to "Import-Export: Storyboard Studio Importer"

7. **The panel appears in:**
   - 3D Viewport (press `N` to show sidebar if hidden)
   - Look for "Storyboard" tab

## Quick Test

1. Export a JSON file from your Storyboard Studio web app
2. In Blender, go to the Storyboard tab
3. Click "Import Storyboard JSON"
4. Select your JSON file
5. Navigate scenes with arrow buttons
6. Click "Load Image from URL" to download scene images
7. Click "View in Image Editor" to see the full image
8. Expand "Image Preview" panel to see inline preview
9. Click model buttons to add placeholders

## Troubleshooting

**If the addon won't enable:**
- Check Blender version (needs 3.0+, tested on 4.4)
- Look at the console for error messages (Window > Toggle System Console)

**If images won't load:**
- Check internet connection (for URL images)
- Verify the JSON has valid imageUrl fields
- Try opening Blender as administrator (for temp file access)

**If no preview shows:**
- The "View in Image Editor" button is the most reliable way
- Split your workspace to show Image Editor
- The inline preview may not work in all Blender versions

## Features Working

✅ Import JSON
✅ Navigate scenes
✅ Load images from base64 or URLs
✅ View images in Image Editor
✅ Display scene metadata
✅ Parse 3D models list
✅ Add model placeholders
✅ Create scene collections
✅ Export scene data as text

Enjoy creating your 3D storyboards! 🎬
