#!/usr/bin/env python3
"""
Lossless asset processor for The Journey to Bappa - Level 1.
Extracts clean transparent RGBA sprites from original user artwork
without altering artwork pixels or using AI generation.
"""

from PIL import Image
import os
import shutil
from collections import deque

SRC_DIR = "/Work/Main-computer/Game-1/project-1/asset/level 1"
OUT_DIR = "/Work/Main-computer/Game-1/public/assets"
ARTIFACT_SRC = "/Work/Main-computer/Final Build/asssets/artfact/left.png"

def flood_fill_checkerboard(img, is_bg_pixel_fn):
    """Flood-fill outer background pixels to transparent alpha."""
    rgba = img.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    
    visited = bytearray(width * height)
    queue = deque()
    
    # Add border pixels to start queue if they match bg condition
    for x in range(width):
        for y in (0, height - 1):
            if is_bg_pixel_fn(pixels[x, y][:3]):
                queue.append((x, y))
                visited[y * width + x] = 1
                
    for y in range(height):
        for x in (0, width - 1):
            if not visited[y * width + x] and is_bg_pixel_fn(pixels[x, y][:3]):
                queue.append((x, y))
                visited[y * width + x] = 1

    # BFS flood fill
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                idx = ny * width + nx
                if not visited[idx]:
                    visited[idx] = 1
                    if is_bg_pixel_fn(pixels[nx, ny][:3]):
                        queue.append((nx, ny))

    # Crop to non-transparent bounding box
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    return rgba

# 1. Floor / Room Shell
shutil.copyfile(os.path.join(SRC_DIR, "floor.png"), os.path.join(OUT_DIR, "room/floor.png"))
print("✓ room/floor.png")

# 2. Bed (already RGBA)
bed = Image.open(os.path.join(SRC_DIR, "bed.png"))
bbox = bed.getbbox()
if bbox:
    bed = bed.crop(bbox)
bed.save(os.path.join(OUT_DIR, "room/bed.png"))
print("✓ room/bed.png")

# 3. Furniture with white/gray checkerboard (r,g,b > 195 and low saturation)
def is_light_checker(rgb):
    r, g, b = rgb
    diff = max(r, g, b) - min(r, g, b)
    return min(r, g, b) >= 190 and diff <= 25

for src_name, out_path in [
    ("Table.png", "room/table.png"),
    ("drawer.png", "room/drawer.png"),
    ("cupboard.png", "room/cupboard.png"),
    ("mat.png", "room/mat.png"),
    ("cupboard-Handle.png", "items/handle.png"),
]:
    im = Image.open(os.path.join(SRC_DIR, src_name))
    cleaned = flood_fill_checkerboard(im, is_light_checker)
    cleaned.save(os.path.join(OUT_DIR, out_path))
    print(f"✓ {out_path} ({cleaned.size})")

# 4. Note (already RGBA)
shutil.copyfile(os.path.join(SRC_DIR, "Note.png"), os.path.join(OUT_DIR, "puzzles/note.png"))
print("✓ puzzles/note.png")

# 5. Puzzle Boxes (already RGBA)
shutil.copyfile(os.path.join(SRC_DIR, "smallBox.png"), os.path.join(OUT_DIR, "puzzles/small_box.png"))
shutil.copyfile(os.path.join(SRC_DIR, "OpendSmallBox.png"), os.path.join(OUT_DIR, "puzzles/opend_small_box.png"))
print("✓ puzzles/small_box.png & opend_small_box.png")

# 6. Screwdriver (already RGBA)
sd = Image.open(os.path.join(SRC_DIR, "Screwdriver.png"))
bbox = sd.getbbox()
if bbox:
    sd = sd.crop(bbox)
sd.save(os.path.join(OUT_DIR, "items/screwdriver.png"))
print("✓ items/screwdriver.png")

# 7. Key (dark background)
def is_dark_bg(rgb):
    r, g, b = rgb
    return max(r, g, b) <= 60 and (max(r, g, b) - min(r, g, b) <= 25)

key_im = Image.open(os.path.join(SRC_DIR, "Key.png"))
key_cleaned = flood_fill_checkerboard(key_im, is_dark_bg)
key_cleaned.save(os.path.join(OUT_DIR, "items/key.png"))
print(f"✓ items/key.png ({key_cleaned.size})")

# 8. Player Directional Sprites (darker checkerboard around boy: 45 <= rgb <= 125, low diff)
def is_player_checker(rgb):
    r, g, b = rgb
    diff = max(r, g, b) - min(r, g, b)
    return diff <= 22 and (40 <= min(r, g, b) and max(r, g, b) <= 135)

for src_name, out_name in [
    ("Front.png", "boy_down.png"),
    ("bacl.png", "boy_up.png"),
    ("left.png", "boy_left.png"),
    ("Right.png", "boy_right.png"),
]:
    im = Image.open(os.path.join(SRC_DIR, src_name))
    cleaned = flood_fill_checkerboard(im, is_player_checker)
    cleaned.save(os.path.join(OUT_DIR, "player", out_name))
    print(f"✓ player/{out_name} ({cleaned.size})")

# 9. Artifact Fragment
if os.path.exists(ARTIFACT_SRC):
    shutil.copyfile(ARTIFACT_SRC, os.path.join(OUT_DIR, "items/artifact_fragment.png"))
    print("✓ items/artifact_fragment.png")
else:
    print("! ARTIFACT_SRC not found, checking alternatives")

print("\nAll assets processed successfully!")
