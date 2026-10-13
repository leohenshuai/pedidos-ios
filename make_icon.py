#!/usr/bin/env python3
"""合并 icon_parts/*.b64 并还原成 App 图标 PNG（iOS 要求 1024x1024 无透明通道）。
分片不齐或 JPEG 损坏时直接失败，避免生成残缺图标。"""
import base64, glob, io, sys
from PIL import Image, ImageFile
parts = sorted(glob.glob("icon_parts/part_*.b64"))
if len(parts) < 8:
    sys.exit("parts incomplete: %d/8" % len(parts))
raw = base64.b64decode("".join("".join(open(p).read().split()) for p in parts))
if not raw.startswith(b"\xff\xd8") or not raw.rstrip(b"\x00").endswith(b"\xff\xd9"):
    sys.exit("icon source truncated")
im = Image.open(io.BytesIO(raw)); im.load()   # 强制完整解码
im = im.convert("RGB")
if im.size != (1024, 1024):
    im = im.resize((1024, 1024), Image.LANCZOS)
im.save("Pedidos/Assets.xcassets/AppIcon.appiconset/icon-1024.png", "PNG")
print("icon ok", im.size, im.mode)
