"""Run after generate-brand-assets.cjs; requires Pillow."""
from PIL import Image

image = Image.open("apps/electron/assets/icon.png")
image.save("apps/electron/assets/icon.ico", sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
image.save("apps/electron/assets/icon.icns")
Image.open("apps/web/public/favicon-dark.png").save("apps/web/public/favicon.ico", sizes=[(16,16),(32,32),(48,48),(64,64)])
