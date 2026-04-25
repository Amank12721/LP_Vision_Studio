bl_info = {
    "name": "Storyboard Studio Importer",
    "author": "LP Vision Studio",
    "version": (1, 0, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Sidebar > Storyboard",
    "description": "Import storyboard JSON and manage 3D models per scene",
    "category": "Import-Export",
}

import bpy
import json
import os
from bpy.props import StringProperty, IntProperty, CollectionProperty, PointerProperty
from bpy.types import Panel, Operator, PropertyGroup, UIList, AddonPreferences
import urllib.request
import base64
import tempfile


# ============================================================================
# ADDON PREFERENCES
# ============================================================================

class StoryboardAddonPreferences(AddonPreferences):
    bl_idname = __name__
    
    elevenlabs_api_key: StringProperty(
        name="ElevenLabs API Key",
        description="Your ElevenLabs API key for narration generation",
        default="",
        subtype='PASSWORD'
    )
    
    voice_id: bpy.props.EnumProperty(
        name="Voice",
        description="Select voice for narration",
        items=[
            ('TmPeb2hSxdVrThJLywkg', 'Custom Voice (Recommended)', 'Your custom voice - Best for educational content'),
            ('JBFqnCBsd6RMkjVDRZzb', 'George (Warm Narrator)', 'Warm, friendly male narrator voice'),
            ('21m00Tcm4TlvDq8ikWAM', 'Rachel (Professional)', 'Clear, professional female voice'),
            ('AZnzlk1XvdvUeBnXmlld', 'Domi (Energetic)', 'Young, energetic female voice'),
            ('EXAVITQu4vr4xnSDxMaL', 'Bella (Soft)', 'Soft, gentle female voice'),
            ('ErXwobaYiN019PkySvjV', 'Antoni (Well-Rounded)', 'Well-rounded male voice'),
            ('MF3mGyEYCl7XYWbV9V6O', 'Elli (Emotional)', 'Emotional, expressive female voice'),
            ('TxGEqnHWrfWFTfGW9XjX', 'Josh (Deep)', 'Deep, authoritative male voice'),
            ('VR6AewLTigWG4xSOukaG', 'Arnold (Crisp)', 'Crisp, clear male voice'),
            ('pNInz6obpgDQGcFmaJgB', 'Adam (Narrative)', 'Deep narrative male voice'),
            ('yoZ06aMxZJJ28mfd3POQ', 'Sam (Dynamic)', 'Dynamic, raspy male voice'),
            ('onwK4e9ZLuTAKqWW03F9', 'Daniel (British)', 'British male voice'),
            ('ThT5KcBeYPX3keUQqHPh', 'Dorothy (Pleasant)', 'Pleasant British female voice'),
        ],
        default='TmPeb2hSxdVrThJLywkg'
    )
    
    voice_stability: bpy.props.FloatProperty(
        name="Stability",
        description="Voice stability (0.0 = more variable, 1.0 = more stable)",
        default=0.55,
        min=0.0,
        max=1.0
    )
    
    voice_similarity: bpy.props.FloatProperty(
        name="Similarity Boost",
        description="Voice similarity to original (0.0 = more creative, 1.0 = more similar)",
        default=0.75,
        min=0.0,
        max=1.0
    )
    
    voice_style: bpy.props.FloatProperty(
        name="Style",
        description="Voice style exaggeration",
        default=0.4,
        min=0.0,
        max=1.0
    )
    
    voice_speed: bpy.props.FloatProperty(
        name="Speed",
        description="Narration speed",
        default=1.0,
        min=0.5,
        max=2.0
    )
    
    def draw(self, context):
        layout = self.layout
        
        box = layout.box()
        box.label(text="ElevenLabs Narration Settings", icon='SPEAKER')
        
        col = box.column()
        col.prop(self, "elevenlabs_api_key")
        
        # Voice selection
        layout.separator()
        voice_box = layout.box()
        voice_box.label(text="Voice Settings", icon='OUTLINER_OB_SPEAKER')
        
        col = voice_box.column()
        col.prop(self, "voice_id")
        
        # Advanced settings
        adv_box = voice_box.box()
        adv_box.label(text="Advanced Voice Controls", icon='PREFERENCES')
        
        col = adv_box.column(align=True)
        col.prop(self, "voice_stability", slider=True)
        col.prop(self, "voice_similarity", slider=True)
        col.prop(self, "voice_style", slider=True)
        col.prop(self, "voice_speed", slider=True)
        
        # Help text
        layout.separator()
        help_box = layout.box()
        help_box.label(text="How to get API Key:", icon='QUESTION')
        help_col = help_box.column(align=True)
        help_col.scale_y = 0.8
        help_col.label(text="1. Go to elevenlabs.io")
        help_col.label(text="2. Sign up / Log in")
        help_col.label(text="3. Profile → API Keys")
        help_col.label(text="4. Copy and paste above")
        
        # Status
        layout.separator()
        if self.elevenlabs_api_key:
            status_row = layout.row()
            status_row.label(text="✓ API Key is set", icon='CHECKMARK')
        else:
            status_row = layout.row()
            status_row.label(text="⚠ No API Key set", icon='ERROR')


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_api_key(context):
    """Get ElevenLabs API key from addon preferences or environment"""
    # Try addon preferences first
    preferences = context.preferences
    addon_prefs = preferences.addons[__name__].preferences
    
    if addon_prefs.elevenlabs_api_key:
        return addon_prefs.elevenlabs_api_key
    
    # Fallback to environment variable
    return os.environ.get('ELEVENLABS_API_KEY', '')


# ============================================================================
# DATA STRUCTURES
# ============================================================================

class StoryboardScene(PropertyGroup):
    """Represents a single scene from the storyboard"""
    scene_id: StringProperty(name="ID")
    title: StringProperty(name="Title")
    description: StringProperty(name="Description")
    image_prompt: StringProperty(name="Image Prompt")
    narration: StringProperty(name="Narration")
    context: StringProperty(name="Context")
    models3d: StringProperty(name="3D Models")
    mood: StringProperty(name="Mood")
    image_url: StringProperty(name="Image URL")
    audio_url: StringProperty(name="Audio URL")
    image_loaded: StringProperty(name="Loaded Image Name")


class StoryboardData(PropertyGroup):
    """Main storyboard project data"""
    project_name: StringProperty(name="Project Name", default="Untitled")
    script: StringProperty(name="Script")
    mode: StringProperty(name="Mode", default="script")
    style: StringProperty(name="Style", default="animated cartoon")
    scene_count: IntProperty(name="Scene Count", default=6)
    scenes: CollectionProperty(type=StoryboardScene)
    active_scene_index: IntProperty(name="Active Scene", default=0)
    json_filepath: StringProperty(name="JSON File", subtype='FILE_PATH')


# ============================================================================
# OPERATORS
# ============================================================================

class STORYBOARD_OT_ImportJSON(Operator):
    """Import storyboard JSON file"""
    bl_idname = "storyboard.import_json"
    bl_label = "Import Storyboard JSON"
    bl_options = {'REGISTER', 'UNDO'}
    
    filepath: StringProperty(subtype="FILE_PATH")
    filter_glob: StringProperty(default="*.json", options={'HIDDEN'})
    
    def execute(self, context):
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            sb = context.scene.storyboard_data
            sb.scenes.clear()
            
            # Load project metadata
            sb.project_name = data.get('name', 'Untitled')
            sb.script = data.get('script', '')
            sb.mode = data.get('mode', 'script')
            sb.style = data.get('style', 'animated cartoon')
            sb.scene_count = data.get('sceneCount', len(data.get('scenes', [])))
            sb.json_filepath = self.filepath
            
            # Load scenes
            scenes = data.get('scenes', [])
            for scene_data in scenes:
                scene = sb.scenes.add()
                scene.scene_id = scene_data.get('id', '')
                scene.title = scene_data.get('title', 'Untitled Scene')
                scene.description = scene_data.get('description', '')
                scene.image_prompt = scene_data.get('imagePrompt', '')
                scene.narration = scene_data.get('narration', '')
                scene.context = scene_data.get('context', '')
                scene.models3d = scene_data.get('models3d', '')
                scene.mood = scene_data.get('mood', '')
                scene.image_url = scene_data.get('imageUrl', '')
                scene.audio_url = scene_data.get('audioUrl', '')
            
            sb.active_scene_index = 0
            self.report({'INFO'}, f"Loaded {len(scenes)} scenes from {sb.project_name}")
            return {'FINISHED'}
            
        except Exception as e:
            self.report({'ERROR'}, f"Failed to import JSON: {str(e)}")
            return {'CANCELLED'}
    
    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


class STORYBOARD_OT_LoadImage(Operator):
    """Load scene image into Blender"""
    bl_idname = "storyboard.load_image"
    bl_label = "Load Scene Image"
    bl_options = {'REGISTER', 'UNDO'}
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        if self.scene_index >= len(sb.scenes):
            self.report({'ERROR'}, "Invalid scene index")
            return {'CANCELLED'}
        
        scene = sb.scenes[self.scene_index]
        image_url = scene.image_url
        
        if not image_url:
            self.report({'WARNING'}, "No image URL for this scene")
            return {'CANCELLED'}
        
        try:
            filepath = None
            
            # Handle base64 data URLs
            if image_url.startswith('data:image'):
                # Extract base64 data
                try:
                    header, encoded = image_url.split(',', 1)
                except ValueError:
                    self.report({'ERROR'}, "Invalid base64 image format")
                    return {'CANCELLED'}
                
                image_data = base64.b64decode(encoded)
                
                # Determine extension from mime type
                if 'png' in header.lower():
                    ext = '.png'
                elif 'jpeg' in header.lower() or 'jpg' in header.lower():
                    ext = '.jpg'
                elif 'webp' in header.lower():
                    ext = '.webp'
                else:
                    ext = '.png'
                
                # Save to temp file with proper mode
                import tempfile
                temp_file = tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix=ext)
                temp_file.write(image_data)
                temp_file.close()
                filepath = temp_file.name
                
                self.report({'INFO'}, f"Decoded base64 image ({len(image_data)} bytes)")
                
            else:
                # Download from URL
                import tempfile
                temp_file = tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.jpg')
                temp_file.close()
                urllib.request.urlretrieve(image_url, temp_file.name)
                filepath = temp_file.name
                
                self.report({'INFO'}, f"Downloaded image from URL")
            
            # Verify file exists and has content
            if not os.path.exists(filepath):
                self.report({'ERROR'}, "Temp file not created")
                return {'CANCELLED'}
            
            file_size = os.path.getsize(filepath)
            if file_size == 0:
                self.report({'ERROR'}, "Image file is empty")
                os.unlink(filepath)
                return {'CANCELLED'}
            
            self.report({'INFO'}, f"Image file size: {file_size} bytes")
            
            # Load image into Blender
            image_name = f"Scene_{self.scene_index + 1}_{scene.title[:20].replace(' ', '_')}"
            
            # Remove existing image with same name
            if image_name in bpy.data.images:
                bpy.data.images.remove(bpy.data.images[image_name])
            
            # Load the image
            img = bpy.data.images.load(filepath, check_existing=False)
            img.name = image_name
            
            # Force reload and pack
            img.reload()
            img.pack()
            
            # Set colorspace
            img.colorspace_settings.name = 'sRGB'
            
            scene.image_loaded = image_name
            
            # Clean up temp file
            try:
                os.unlink(filepath)
            except:
                pass
            
            self.report({'INFO'}, f"✓ Loaded: {image_name} ({img.size[0]}x{img.size[1]})")
            
            # Force UI refresh
            for area in context.screen.areas:
                area.tag_redraw()
            
            return {'FINISHED'}
            
        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            print("Image load error:", error_msg)
            self.report({'ERROR'}, f"Failed: {str(e)}")
            
            # Clean up on error
            if filepath and os.path.exists(filepath):
                try:
                    os.unlink(filepath)
                except:
                    pass
            
            return {'CANCELLED'}


class STORYBOARD_OT_AddModel(Operator):
    """Add a 3D model placeholder for the scene"""
    bl_idname = "storyboard.add_model"
    bl_label = "Add Model"
    bl_options = {'REGISTER', 'UNDO'}
    
    model_name: StringProperty()
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        # Create a placeholder cube for the model
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
        obj = context.active_object
        obj.name = f"Scene{self.scene_index + 1}_{self.model_name}"
        
        # Add custom property to track scene
        obj["storyboard_scene"] = self.scene_index
        obj["model_type"] = self.model_name
        
        self.report({'INFO'}, f"Added placeholder: {obj.name}")
        return {'FINISHED'}


class STORYBOARD_OT_CreateSceneCollection(Operator):
    """Create a collection for the scene with camera and lighting"""
    bl_idname = "storyboard.create_scene_collection"
    bl_label = "Setup Scene"
    bl_options = {'REGISTER', 'UNDO'}
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        # Create collection
        collection_name = f"Scene_{self.scene_index + 1}_{scene.title[:20]}"
        
        # Remove existing collection if it exists
        if collection_name in bpy.data.collections:
            old_col = bpy.data.collections[collection_name]
            bpy.data.collections.remove(old_col)
        
        collection = bpy.data.collections.new(collection_name)
        context.scene.collection.children.link(collection)
        
        # Add camera
        bpy.ops.object.camera_add(location=(7, -7, 5))
        camera = context.active_object
        camera.name = f"Camera_Scene{self.scene_index + 1}"
        camera.rotation_euler = (1.1, 0, 0.785)
        collection.objects.link(camera)
        context.scene.collection.objects.unlink(camera)
        
        # Add key light
        bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
        light = context.active_object
        light.name = f"KeyLight_Scene{self.scene_index + 1}"
        light.data.energy = 2.0
        collection.objects.link(light)
        context.scene.collection.objects.unlink(light)
        
        # Add fill light
        bpy.ops.object.light_add(type='AREA', location=(-5, -5, 5))
        fill = context.active_object
        fill.name = f"FillLight_Scene{self.scene_index + 1}"
        fill.data.energy = 0.5
        collection.objects.link(fill)
        context.scene.collection.objects.unlink(fill)
        
        self.report({'INFO'}, f"Created scene setup: {collection_name}")
        return {'FINISHED'}


class STORYBOARD_OT_SetActiveScene(Operator):
    """Set the active scene"""
    bl_idname = "storyboard.set_active_scene"
    bl_label = "Set Active Scene"
    
    scene_index: IntProperty()
    
    def execute(self, context):
        context.scene.storyboard_data.active_scene_index = self.scene_index
        return {'FINISHED'}


class STORYBOARD_OT_ExportSceneData(Operator):
    """Export scene data as text file"""
    bl_idname = "storyboard.export_scene_data"
    bl_label = "Export Scene Data"
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        # Create text data block
        text_name = f"Scene_{self.scene_index + 1}_Data"
        if text_name in bpy.data.texts:
            text = bpy.data.texts[text_name]
            text.clear()
        else:
            text = bpy.data.texts.new(text_name)
        
        # Write scene data
        text.write(f"SCENE {self.scene_index + 1}: {scene.title}\n")
        text.write("=" * 60 + "\n\n")
        text.write(f"Description: {scene.description}\n\n")
        text.write(f"Narration: {scene.narration}\n\n")
        text.write(f"Context: {scene.context}\n\n")
        text.write(f"Mood: {scene.mood}\n\n")
        text.write(f"3D Models Needed:\n{scene.models3d}\n\n")
        text.write(f"Image Prompt: {scene.image_prompt}\n")
        
        self.report({'INFO'}, f"Exported to text: {text_name}")
        return {'FINISHED'}


class STORYBOARD_OT_ViewInEditor(Operator):
    """Open image in Image Editor"""
    bl_idname = "storyboard.view_in_editor"
    bl_label = "View in Image Editor"
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        if not scene.image_loaded or scene.image_loaded not in bpy.data.images:
            self.report({'WARNING'}, "Load image first")
            return {'CANCELLED'}
        
        img = bpy.data.images[scene.image_loaded]
        
        # Force reload to ensure it's not black
        img.reload()
        
        # Find or create an image editor area
        for area in context.screen.areas:
            if area.type == 'IMAGE_EDITOR':
                area.spaces.active.image = img
                # Set proper display settings
                space = area.spaces.active
                space.image = img
                space.display_channels = 'COLOR'
                area.tag_redraw()
                self.report({'INFO'}, f"✓ Opened in Image Editor")
                return {'FINISHED'}
        
        # If no image editor found, just report success
        self.report({'INFO'}, f"Image ready: {scene.image_loaded}. Open Image Editor to view.")
        return {'FINISHED'}


class STORYBOARD_OT_CreateImagePlane(Operator):
    """Create a plane with the scene image as texture"""
    bl_idname = "storyboard.create_image_plane"
    bl_label = "Create Reference Plane"
    bl_options = {'REGISTER', 'UNDO'}
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        if not scene.image_loaded or scene.image_loaded not in bpy.data.images:
            self.report({'WARNING'}, "Load image first")
            return {'CANCELLED'}
        
        img = bpy.data.images[scene.image_loaded]
        
        # Calculate plane size based on image aspect ratio
        aspect = img.size[0] / img.size[1] if img.size[1] > 0 else 1.0
        
        # Create plane
        bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
        plane = context.active_object
        plane.name = f"RefPlane_Scene{self.scene_index + 1}"
        plane.scale = (aspect, 1, 1)
        
        # Create material
        mat = bpy.data.materials.new(name=f"Mat_Scene{self.scene_index + 1}")
        mat.use_nodes = True
        plane.data.materials.append(mat)
        
        # Setup nodes
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Clear default nodes
        nodes.clear()
        
        # Add nodes
        tex_node = nodes.new('ShaderNodeTexImage')
        tex_node.image = img
        tex_node.location = (0, 0)
        
        bsdf_node = nodes.new('ShaderNodeBsdfPrincipled')
        bsdf_node.location = (300, 0)
        
        output_node = nodes.new('ShaderNodeOutputMaterial')
        output_node.location = (600, 0)
        
        # Link nodes
        links.new(tex_node.outputs['Color'], bsdf_node.inputs['Base Color'])
        links.new(bsdf_node.outputs['BSDF'], output_node.inputs['Surface'])
        
        # Set viewport shading to material preview
        for area in context.screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'
        
        self.report({'INFO'}, f"✓ Created reference plane with image")
        return {'FINISHED'}


class STORYBOARD_OT_CopyToClipboard(Operator):
    """Copy text to clipboard"""
    bl_idname = "storyboard.copy_to_clipboard"
    bl_label = "Copy to Clipboard"
    
    text: StringProperty()
    label: StringProperty(default="Text")
    
    def execute(self, context):
        if not self.text:
            self.report({'WARNING'}, "No text to copy")
            return {'CANCELLED'}
        
        # Copy to clipboard
        context.window_manager.clipboard = self.text
        self.report({'INFO'}, f"✓ Copied {self.label} to clipboard")
        return {'FINISHED'}


class STORYBOARD_OT_GenerateNarration(Operator):
    """Generate narration audio using ElevenLabs API"""
    bl_idname = "storyboard.generate_narration"
    bl_label = "Generate Narration"
    bl_options = {'REGISTER'}
    
    scene_index: IntProperty()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        scene = sb.scenes[self.scene_index]
        
        if not scene.narration or not scene.narration.strip():
            self.report({'WARNING'}, "No narration text for this scene")
            return {'CANCELLED'}
        
        # Get API key and voice settings from preferences
        api_key = get_api_key(context)
        
        if not api_key:
            self.report({'ERROR'}, "Set ElevenLabs API Key in addon preferences")
            return {'CANCELLED'}
        
        # Get voice settings from preferences
        preferences = context.preferences
        addon_prefs = preferences.addons[__name__].preferences
        
        voice_id = addon_prefs.voice_id
        stability = addon_prefs.voice_stability
        similarity = addon_prefs.voice_similarity
        style = addon_prefs.voice_style
        speed = addon_prefs.voice_speed
        
        try:
            import json
            
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
            
            headers = {
                "xi-api-key": api_key,
                "Content-Type": "application/json"
            }
            
            data = {
                "text": scene.narration,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity,
                    "style": style,
                    "use_speaker_boost": True,
                    "speed": speed
                }
            }
            
            # Make request
            req = urllib.request.Request(url, 
                                        data=json.dumps(data).encode('utf-8'),
                                        headers=headers,
                                        method='POST')
            
            with urllib.request.urlopen(req) as response:
                audio_data = response.read()
            
            # Save to temp file
            temp_file = tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.mp3')
            temp_file.write(audio_data)
            temp_file.close()
            
            # Store audio URL (file path)
            scene.audio_url = temp_file.name
            
            self.report({'INFO'}, f"✓ Generated narration audio ({len(audio_data)} bytes)")
            return {'FINISHED'}
            
        except Exception as e:
            self.report({'ERROR'}, f"Failed to generate narration: {str(e)}")
            return {'CANCELLED'}


class STORYBOARD_OT_GenerateAllNarrations(Operator):
    """Generate all narrations and add to timeline"""
    bl_idname = "storyboard.generate_all_narrations"
    bl_label = "Generate All Narrations"
    bl_options = {'REGISTER'}
    
    _timer = None
    _current_index = 0
    _audio_files = []
    
    def modal(self, context, event):
        if event.type == 'TIMER':
            sb = context.scene.storyboard_data
            
            # Check if we're done
            if self._current_index >= len(sb.scenes):
                self.finish(context)
                return {'FINISHED'}
            
            scene = sb.scenes[self._current_index]
            
            # Skip if no narration
            if not scene.narration or not scene.narration.strip():
                self._current_index += 1
                return {'RUNNING_MODAL'}
            
            # Generate narration
            self.report({'INFO'}, f"Generating narration {self._current_index + 1}/{len(sb.scenes)}...")
            
            try:
                # Call the single narration generator
                bpy.ops.storyboard.generate_narration(scene_index=self._current_index)
                
                # Store the audio file path
                if sb.scenes[self._current_index].audio_url:
                    self._audio_files.append({
                        'index': self._current_index,
                        'path': sb.scenes[self._current_index].audio_url,
                        'title': scene.title
                    })
                
            except Exception as e:
                print(f"Error generating narration {self._current_index}: {e}")
            
            self._current_index += 1
            
        return {'RUNNING_MODAL'}
    
    def finish(self, context):
        wm = context.window_manager
        wm.event_timer_remove(self._timer)
        
        if not self._audio_files:
            self.report({'WARNING'}, "No narrations generated")
            return
        
        # Add audio files to timeline
        self.add_to_timeline(context)
        
        self.report({'INFO'}, f"✓ Generated {len(self._audio_files)} narrations and added to timeline")
    
    def add_to_timeline(self, context):
        """Add all audio files to the timeline sequencer"""
        
        # Ensure we have a scene
        if not context.scene.sequence_editor:
            context.scene.sequence_editor_create()
        
        seq_editor = context.scene.sequence_editor
        
        # Set frame rate
        fps = context.scene.render.fps
        
        # Starting frame
        current_frame = 1
        
        # Add each audio file
        for audio_info in self._audio_files:
            try:
                # Add sound strip
                sound_strip = seq_editor.sequences.new_sound(
                    name=f"Narration_{audio_info['index'] + 1}_{audio_info['title'][:20]}",
                    filepath=audio_info['path'],
                    channel=1,
                    frame_start=current_frame
                )
                
                # Move to next position (add some padding)
                current_frame += int(sound_strip.frame_final_duration) + int(fps * 0.5)  # 0.5 sec gap
                
            except Exception as e:
                print(f"Error adding audio to timeline: {e}")
        
        # Set timeline end
        context.scene.frame_end = current_frame
        
        # Switch to Video Editing workspace if available
        for area in context.screen.areas:
            if area.type == 'SEQUENCE_EDITOR':
                area.tag_redraw()
    
    def execute(self, context):
        sb = context.scene.storyboard_data
        
        if len(sb.scenes) == 0:
            self.report({'WARNING'}, "No scenes to generate narrations for")
            return {'CANCELLED'}
        
        # Check for API key from preferences
        api_key = get_api_key(context)
        if not api_key:
            self.report({'ERROR'}, "Set ElevenLabs API Key in addon preferences (Edit > Preferences > Add-ons)")
            return {'CANCELLED'}
        
        # Reset state
        self._current_index = 0
        self._audio_files = []
        
        # Start modal timer
        wm = context.window_manager
        self._timer = wm.event_timer_add(0.5, window=context.window)
        wm.modal_handler_add(self)
        
        self.report({'INFO'}, "Starting narration generation...")
        return {'RUNNING_MODAL'}
    
    def cancel(self, context):
        wm = context.window_manager
        wm.event_timer_remove(self._timer)


# ============================================================================
# UI PANELS
# ============================================================================

class STORYBOARD_PT_MainPanel(Panel):
    """Main storyboard panel"""
    bl_label = "Storyboard Studio"
    bl_idname = "STORYBOARD_PT_main_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Storyboard'
    
    def draw(self, context):
        layout = self.layout
        sb = context.scene.storyboard_data
        
        # Import section
        box = layout.box()
        box.label(text="Import", icon='IMPORT')
        box.operator("storyboard.import_json", icon='FILE_FOLDER')
        
        if sb.project_name:
            box.label(text=f"Project: {sb.project_name}", icon='FILE_TEXT')
            box.label(text=f"Scenes: {len(sb.scenes)}")
            
            # Narration generation section
            if len(sb.scenes) > 0:
                layout.separator()
                narr_box = layout.box()
                narr_box.label(text="Audio Narration", icon='SPEAKER')
                
                # Check for API key from preferences
                api_key = get_api_key(context)
                if api_key:
                    # Get voice name
                    preferences = context.preferences
                    addon_prefs = preferences.addons[__name__].preferences
                    
                    # Get voice name from enum
                    voice_items = {
                        'TmPeb2hSxdVrThJLywkg': 'Custom Voice',
                        'JBFqnCBsd6RMkjVDRZzb': 'George',
                        '21m00Tcm4TlvDq8ikWAM': 'Rachel',
                        'AZnzlk1XvdvUeBnXmlld': 'Domi',
                        'EXAVITQu4vr4xnSDxMaL': 'Bella',
                        'ErXwobaYiN019PkySvjV': 'Antoni',
                        'MF3mGyEYCl7XYWbV9V6O': 'Elli',
                        'TxGEqnHWrfWFTfGW9XjX': 'Josh',
                        'VR6AewLTigWG4xSOukaG': 'Arnold',
                        'pNInz6obpgDQGcFmaJgB': 'Adam',
                        'yoZ06aMxZJJ28mfd3POQ': 'Sam',
                        'onwK4e9ZLuTAKqWW03F9': 'Daniel',
                        'ThT5KcBeYPX3keUQqHPh': 'Dorothy',
                    }
                    voice_name = voice_items.get(addon_prefs.voice_id, 'Unknown')
                    
                    status_col = narr_box.column(align=True)
                    status_col.scale_y = 0.8
                    status_col.label(text="✓ ElevenLabs API Key set", icon='CHECKMARK')
                    status_col.label(text=f"Voice: {voice_name} (Speed: {addon_prefs.voice_speed:.1f}x)")
                    
                    narr_box.separator()
                    
                    col = narr_box.column(align=True)
                    col.scale_y = 1.3
                    col.operator("storyboard.generate_all_narrations", 
                                text="Generate All Narrations", 
                                icon='PLAY_SOUND')
                    
                    info_col = narr_box.column(align=True)
                    info_col.scale_y = 0.7
                    info_col.label(text="Generates audio for all scenes")
                    info_col.label(text="and adds to timeline track")
                else:
                    narr_box.label(text="⚠ Set ElevenLabs API Key", icon='ERROR')
                    info_col = narr_box.column(align=True)
                    info_col.scale_y = 0.7
                    info_col.label(text="Go to: Edit > Preferences")
                    info_col.label(text="Add-ons > Storyboard Studio")
                    info_col.label(text="Enter your API key there")


class STORYBOARD_PT_ScenesPanel(Panel):
    """Scenes list panel"""
    bl_label = "Scenes"
    bl_idname = "STORYBOARD_PT_scenes_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Storyboard'
    bl_parent_id = "STORYBOARD_PT_main_panel"
    
    def draw(self, context):
        layout = self.layout
        sb = context.scene.storyboard_data
        
        if len(sb.scenes) == 0:
            layout.label(text="No scenes loaded", icon='INFO')
            return
        
        # Scene selector
        row = layout.row()
        row.label(text=f"Scene {sb.active_scene_index + 1} of {len(sb.scenes)}")
        
        row = layout.row(align=True)
        row.operator("storyboard.set_active_scene", text="", icon='TRIA_LEFT').scene_index = max(0, sb.active_scene_index - 1)
        row.operator("storyboard.set_active_scene", text="", icon='TRIA_RIGHT').scene_index = min(len(sb.scenes) - 1, sb.active_scene_index + 1)


class STORYBOARD_PT_ActiveScenePanel(Panel):
    """Active scene details panel"""
    bl_label = "Active Scene"
    bl_idname = "STORYBOARD_PT_active_scene_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Storyboard'
    bl_parent_id = "STORYBOARD_PT_main_panel"
    
    def draw(self, context):
        layout = self.layout
        sb = context.scene.storyboard_data
        
        if len(sb.scenes) == 0:
            return
        
        scene = sb.scenes[sb.active_scene_index]
        
        # Scene info
        box = layout.box()
        box.label(text=scene.title, icon='SCENE_DATA')
        
        col = box.column(align=True)
        col.scale_y = 0.8
        
        if scene.description:
            # Description with copy button
            desc_row = box.row()
            desc_col = desc_row.column()
            desc_col.scale_y = 0.8
            desc_col.label(text="Description:")
            
            copy_btn = desc_row.column()
            copy_btn.scale_x = 0.5
            op = copy_btn.operator("storyboard.copy_to_clipboard", text="", icon='COPYDOWN')
            op.text = scene.description
            op.label = "Description"
            
            desc_text = box.column(align=True)
            desc_text.scale_y = 0.8
            for line in scene.description[:150].split('\n'):
                if line.strip():
                    desc_text.label(text=line[:60])
        
        if scene.narration:
            box.separator()
            
            # Narration with copy button
            narr_row = box.row()
            narr_col = narr_row.column()
            narr_col.scale_y = 0.8
            narr_col.label(text="Narration:")
            
            copy_btn = narr_row.column()
            copy_btn.scale_x = 0.5
            op = copy_btn.operator("storyboard.copy_to_clipboard", text="", icon='COPYDOWN')
            op.text = scene.narration
            op.label = "Narration"
            
            narr_text = box.column(align=True)
            narr_text.scale_y = 0.8
            for line in scene.narration[:150].split('\n'):
                if line.strip():
                    narr_text.label(text=line[:60])
        
        # Context and Models info
        if scene.context or scene.models3d:
            info_box = layout.box()
            info_box.label(text="Additional Info", icon='INFO')
            
            if scene.context:
                ctx_row = info_box.row()
                ctx_col = ctx_row.column()
                ctx_col.scale_y = 0.7
                ctx_col.label(text=f"Context: {scene.context[:40]}...")
                
                copy_btn = ctx_row.column()
                copy_btn.scale_x = 0.5
                op = copy_btn.operator("storyboard.copy_to_clipboard", text="", icon='COPYDOWN')
                op.text = scene.context
                op.label = "Context"
            
            if scene.models3d:
                models_row = info_box.row()
                models_col = models_row.column()
                models_col.scale_y = 0.7
                models_col.label(text=f"Models: {len(scene.models3d.split(','))} items")
                
                copy_btn = models_row.column()
                copy_btn.scale_x = 0.5
                op = copy_btn.operator("storyboard.copy_to_clipboard", text="", icon='COPYDOWN')
                op.text = scene.models3d
                op.label = "3D Models List"
        
        # Image preview
        box = layout.box()
        box.label(text="Scene Image", icon='IMAGE_DATA')
        
        if scene.image_loaded and scene.image_loaded in bpy.data.images:
            img = bpy.data.images[scene.image_loaded]
            
            # Show image name and info
            info_col = box.column(align=True)
            info_col.scale_y = 0.8
            info_col.label(text=f"✓ {scene.image_loaded[:30]}", icon='CHECKMARK')
            info_col.label(text=f"Size: {img.size[0]} x {img.size[1]} px")
            
            # Buttons row
            btn_row = box.row(align=True)
            btn_row.scale_y = 1.2
            
            op = btn_row.operator("storyboard.view_in_editor", text="View", icon='IMAGE')
            op.scene_index = sb.active_scene_index
            
            op = btn_row.operator("storyboard.create_image_plane", text="Create Plane", icon='MESH_PLANE')
            op.scene_index = sb.active_scene_index
            
        elif scene.image_url:
            box.label(text="Image not loaded yet", icon='QUESTION')
        else:
            box.label(text="No image available", icon='ERROR')
        
        # Load button
        if scene.image_url:
            row = box.row()
            row.scale_y = 1.3
            op = row.operator("storyboard.load_image", text="Load Image from URL", icon='IMPORT')
            op.scene_index = sb.active_scene_index
        
        # Scene setup
        box = layout.box()
        box.label(text="Scene Setup", icon='SCENE')
        op = box.operator("storyboard.create_scene_collection", icon='COLLECTION_NEW')
        op.scene_index = sb.active_scene_index
        
        op = box.operator("storyboard.export_scene_data", icon='TEXT')
        op.scene_index = sb.active_scene_index


class STORYBOARD_PT_ModelsPanel(Panel):
    """3D Models panel"""
    bl_label = "3D Models Needed"
    bl_idname = "STORYBOARD_PT_models_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Storyboard'
    bl_parent_id = "STORYBOARD_PT_main_panel"
    
    def draw(self, context):
        layout = self.layout
        sb = context.scene.storyboard_data
        
        if len(sb.scenes) == 0:
            return
        
        scene = sb.scenes[sb.active_scene_index]
        
        if not scene.models3d:
            layout.label(text="No models specified", icon='INFO')
            return
        
        box = layout.box()
        box.label(text=f"Scene {sb.active_scene_index + 1} Models:", icon='MESH_CUBE')
        
        # Parse models (comma-separated)
        models = [m.strip() for m in scene.models3d.split(',') if m.strip()]
        
        if len(models) == 0:
            box.label(text="No models listed")
            return
        
        # Create button for each model
        for i, model in enumerate(models[:20]):  # Limit to 20 models
            row = box.row()
            op = row.operator("storyboard.add_model", text=model[:30], icon='ADD')
            op.model_name = model
            op.scene_index = sb.active_scene_index
        
        if len(models) > 20:
            box.label(text=f"... and {len(models) - 20} more", icon='THREE_DOTS')


# ============================================================================
# IMAGE PREVIEW PANEL (Alternative with inline preview)
# ============================================================================

class STORYBOARD_PT_ImagePreviewPanel(Panel):
    """Dedicated image preview panel"""
    bl_label = "Image Preview"
    bl_idname = "STORYBOARD_PT_image_preview_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Storyboard'
    bl_parent_id = "STORYBOARD_PT_main_panel"
    bl_options = {'DEFAULT_CLOSED'}
    
    def draw(self, context):
        layout = self.layout
        sb = context.scene.storyboard_data
        
        if len(sb.scenes) == 0:
            return
        
        scene = sb.scenes[sb.active_scene_index]
        
        if scene.image_loaded and scene.image_loaded in bpy.data.images:
            img = bpy.data.images[scene.image_loaded]
            
            # Use template_preview which should work for images
            layout.template_preview(img, show_buttons=False)
            
            # Image info
            box = layout.box()
            box.scale_y = 0.7
            box.label(text=f"Resolution: {img.size[0]} x {img.size[1]}")
            box.label(text=f"Channels: {img.channels}")
            
        else:
            layout.label(text="No image loaded", icon='INFO')


# ============================================================================
# REGISTRATION
# ============================================================================

classes = (
    StoryboardAddonPreferences,
    StoryboardScene,
    StoryboardData,
    STORYBOARD_OT_ImportJSON,
    STORYBOARD_OT_LoadImage,
    STORYBOARD_OT_AddModel,
    STORYBOARD_OT_CreateSceneCollection,
    STORYBOARD_OT_SetActiveScene,
    STORYBOARD_OT_ExportSceneData,
    STORYBOARD_OT_ViewInEditor,
    STORYBOARD_OT_CreateImagePlane,
    STORYBOARD_OT_CopyToClipboard,
    STORYBOARD_OT_GenerateNarration,
    STORYBOARD_OT_GenerateAllNarrations,
    STORYBOARD_PT_MainPanel,
    STORYBOARD_PT_ScenesPanel,
    STORYBOARD_PT_ActiveScenePanel,
    STORYBOARD_PT_ImagePreviewPanel,
    STORYBOARD_PT_ModelsPanel,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    
    bpy.types.Scene.storyboard_data = PointerProperty(type=StoryboardData)


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    
    del bpy.types.Scene.storyboard_data


if __name__ == "__main__":
    register()

