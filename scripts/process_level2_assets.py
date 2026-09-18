#!/usr/bin/env python3
import os
import shutil
from PIL import Image
from collections import deque

SRC_DIR = "/Work/Main-computer/Game-1/project-1/asset/level 2"
OUT_LEVEL2 = "/Work/Main-computer/Game-1/public/assets/level2"
OUT_PLAYER = "/Work/Main-computer/Game-1/public/assets/player"

os.makedirs(OUT_LEVEL2, exist_ok=True)
os.makedirs(OUT_PLAYER, exist_ok=True)

# 1. Copy maze.png
shutil.copyfile(os.path.join(SRC_DIR, "maze.png"), os.path.join(OUT_LEVEL2, "maze.png"))
print("✓ level2/maze.png")

# 2. Vighna sprite
vigna_im = Image.open(os.path.join(SRC_DIR, "Vigna.png"))
bbox = vigna_im.getbbox()
if bbox:
    vigna_im = vigna_im.crop(bbox)
# Resize to high-quality game size (e.g., height ~ 180)
vigna_w = int(vigna_im.width * (180.0 / vigna_im.height))
vigna_resized = vigna_im.resize((vigna_w, 180), Image.Resampling.LANCZOS)
vigna_resized.save(os.path.join(OUT_LEVEL2, "vighna.png"))
print(f"✓ level2/vighna.png ({vigna_resized.size})")

# 3. Diya pickup sprite
# Remove black/dark background around diya
diya_im = Image.open(os.path.join(SRC_DIR, "diya.png")).convert("RGBA")
dw, dh = diya_im.size
dpixels = diya_im.load()

# Flood fill outer dark pixels
visited = bytearray(dw * dh)
queue = deque()
for x in range(dw):
    for y in (0, dh - 1):
        r, g, b, _ = dpixels[x, y]
        if max(r, g, b) < 45:
            queue.append((x, y))
            visited[y * dw + x] = 1

for y in range(dh):
    for x in (0, dw - 1):
        if not visited[y * dw + x]:
            r, g, b, _ = dpixels[x, y]
            if max(r, g, b) < 45:
                queue.append((x, y))
                visited[y * dw + x] = 1

while queue:
    x, y = queue.popleft()
    dpixels[x, y] = (0, 0, 0, 0)
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < dw and 0 <= ny < dh:
            idx = ny * dw + nx
            if not visited[idx]:
                visited[idx] = 1
                r, g, b, _ = dpixels[nx, ny]
                if max(r, g, b) < 45:
                    queue.append((nx, ny))

dbbox = diya_im.getbbox()
if dbbox:
    diya_im = diya_im.crop(dbbox)

# Also smooth any faint dark fringe
dpixels = diya_im.load()
for y in range(diya_im.height):
    for x in range(diya_im.width):
        r, g, b, a = dpixels[x, y]
        if a > 0 and max(r, g, b) < 30:
            dpixels[x, y] = (0, 0, 0, 0)

diya_resized = diya_im.resize((64, int(64 * diya_im.height / diya_im.width)), Image.Resampling.LANCZOS)
diya_resized.save(os.path.join(OUT_LEVEL2, "diya_pickup.png"))
print(f"✓ level2/diya_pickup.png ({diya_resized.size})")

# 4. Extract walkingAnimationDiya frames with dynamic bounding boxes on uniform canvas
walk_im = Image.open(os.path.join(SRC_DIR, "walkingAnimationDiya.png"))
row_info = [
    ("down", 33, 252),
    ("up", 272, 500),
    ("left", 530, 744),
    ("right", 765, 983)
]

TARGET_H = 96
CANVAS_W = 76

for dir_name, y1, y2 in row_info:
    row_im = walk_im.crop((0, y1, walk_im.size[0], y2))
    x_sums = [sum(row_im.getpixel((x, y))[3] > 30 for y in range(row_im.size[1])) for x in range(walk_im.size[0])]
    x_regs = []
    in_x = False
    x_st = 0
    for x, s in enumerate(x_sums):
        if s > 10 and not in_x:
            in_x = True
            x_st = x
        elif s <= 10 and in_x:
            in_x = False
            x_regs.append((x_st, x))
    if in_x:
        x_regs.append((x_st, len(x_sums)))

    # Skip col 0 (label/thumbnail), frames are columns 1..7
    frames = x_regs[1:8]
    for idx, (x1, x2) in enumerate(frames):
        char = row_im.crop((x1, 0, x2, row_im.size[1]))
        bbox = char.getbbox()
        if bbox:
            char = char.crop(bbox)

        f_w = int(char.width * (TARGET_H / char.height))
        char_resized = char.resize((f_w, TARGET_H), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (CANVAS_W, TARGET_H), (0, 0, 0, 0))
        offset_x = (CANVAS_W - f_w) // 2
        offset_y = TARGET_H - char_resized.height
        canvas.paste(char_resized, (offset_x, offset_y))

        out_name = f"player_diya_{dir_name}_{idx}.png"
        canvas.save(os.path.join(OUT_PLAYER, out_name))

        if idx == 0:
            canvas.save(os.path.join(OUT_PLAYER, f"player_diya_{dir_name}.png"))
    print(f"✓ player/player_diya_{dir_name}_0..6.png (76x96 uniform)")

print("\nLevel 2 assets processed successfully!")
