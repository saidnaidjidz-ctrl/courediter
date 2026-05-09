from PIL import Image
import os

# Convert JPG to PNG
source = r'C:\Users\saidn\Downloads\qpp\icon.jpg'
dest = os.path.join(os.path.dirname(__file__), 'assets', 'icon.png')
dest_adaptive = os.path.join(os.path.dirname(__file__), 'assets', 'adaptive-icon.png')

img = Image.open(source)
img.save(dest, 'PNG')
img.save(dest_adaptive, 'PNG')

print(f"✅ Converted to PNG: {dest}")
print(f"✅ Converted to PNG: {dest_adaptive}")
