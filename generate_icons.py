#!/usr/bin/env python3
"""
Generate PWA icons with 'F' letter
Requires: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Installing required packages...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont
    import os

# Icon sizes needed for PWA
sizes = [16, 32, 48, 72, 96, 144, 192, 512]

# Generate each icon size
for size in sizes:
    # Create image with dark background
    img = Image.new('RGB', (size, size), color='#1a1a1a')
    draw = ImageDraw.Draw(img)
    
    # Try to use a monospace font, fallback to default
    try:
        # Try to find a monospace font
        font_size = int(size * 0.7)
        font = ImageFont.truetype("consola.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("cour.ttf", font_size)
        except:
            # Use default font
            font = ImageFont.load_default()
            font_size = size // 2
    
    # Calculate text position (centered)
    text = "F"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    
    # Draw the 'F' in white
    draw.text((x, y), text, fill='#ffffff', font=font)
    
    # Save PNG
    filename = f'icon-{size}.png'
    img.save(filename, 'PNG')
    print(f'Generated {filename}')

# Create favicon.ico (16x16 and 32x32 combined)
img_16 = Image.new('RGB', (16, 16), color='#1a1a1a')
draw_16 = ImageDraw.Draw(img_16)
try:
    font_16 = ImageFont.truetype("consola.ttf", 11)
except:
    try:
        font_16 = ImageFont.truetype("cour.ttf", 11)
    except:
        font_16 = ImageFont.load_default()
bbox_16 = draw_16.textbbox((0, 0), "F", font=font_16)
text_width_16 = bbox_16[2] - bbox_16[0]
text_height_16 = bbox_16[3] - bbox_16[1]
x_16 = (16 - text_width_16) // 2
y_16 = (16 - text_height_16) // 2 - bbox_16[1]
draw_16.text((x_16, y_16), "F", fill='#ffffff', font=font_16)

img_32 = Image.new('RGB', (32, 32), color='#1a1a1a')
draw_32 = ImageDraw.Draw(img_32)
try:
    font_32 = ImageFont.truetype("consola.ttf", 22)
except:
    try:
        font_32 = ImageFont.truetype("cour.ttf", 22)
    except:
        font_32 = ImageFont.load_default()
bbox_32 = draw_32.textbbox((0, 0), "F", font=font_32)
text_width_32 = bbox_32[2] - bbox_32[0]
text_height_32 = bbox_32[3] - bbox_32[1]
x_32 = (32 - text_width_32) // 2
y_32 = (32 - text_height_32) // 2 - bbox_32[1]
draw_32.text((x_32, y_32), "F", fill='#ffffff', font=font_32)

# Save as ICO
img_16.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32)])
print('Generated favicon.ico')

print('\nAll icons generated successfully!')