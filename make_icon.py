from PIL import Image, ImageDraw
S = 1024
im = Image.new("RGB", (S, S), "#3a2e2a")
d = ImageDraw.Draw(im)
d.rounded_rectangle((232, 170, 792, 854), 48, fill="#fbf4ea")
d.rounded_rectangle((232, 170, 792, 300), 48, fill="#e8788a")
d.rectangle((232, 250, 792, 300), fill="#e8788a")
cols = ["#e8788a", "#4aa3a0", "#e9a23b", "#7a6bc4"]
y = 360
for i, c in enumerate(cols):
    d.rounded_rectangle((292, y, 332, y + 40), 12, fill=c)
    d.rounded_rectangle((362, y + 6, 362 + [300, 240, 280, 200][i], y + 34), 14, fill="#cfc3b2")
    d.rounded_rectangle((700, y + 4, 752, y + 36), 16, fill=c)
    y += 110
im.save("Pedidos/Assets.xcassets/AppIcon.appiconset/icon-1024.png")
print("icon ok")
