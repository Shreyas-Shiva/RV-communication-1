import os
from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

TEAL = (15, 139, 141)        # #0F8B8D
AMBER = (255, 183, 3)        # #FFB703
WHITE = (255, 255, 255)      # #FFFFFF
CREAM = (255, 248, 239)      # #FFF8EF
CHARCOAL = (31, 27, 22)      # #1F1B16

def create_base_icon(size: int, is_maskable: bool = False) -> Image.Image:
    # Flat color icon without gradients
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if is_maskable:
        # Maskable icon requires full bleed background
        draw.rectangle([0, 0, size, size], fill=TEAL)
        margin = int(size * 0.22)
    else:
        radius = int(size * 0.22)
        margin = int(size * 0.08)
        draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=radius, fill=TEAL)
        margin = int(size * 0.18)

    cx = size / 2.0
    cy = size / 2.0
    s = size - 2 * margin

    # Draw speech aperture arches and amber core
    dot_radius = int(s * 0.14)
    draw.ellipse([cx - dot_radius, cy - dot_radius, cx + dot_radius, cy + dot_radius], fill=AMBER)

    arc_width = max(3, int(s * 0.10))
    r1 = int(s * 0.32)
    draw.arc([cx - r1, cy - r1, cx + r1, cy + r1], start=135, end=315, fill=WHITE, width=arc_width)

    r2 = int(s * 0.46)
    draw.arc([cx - r2, cy - r2, cx + r2, cy + r2], start=130, end=320, fill=WHITE, width=arc_width)

    return img

def create_og_image() -> Image.Image:
    # 1200x630 Open Graph card with flat brand colors and crisp messaging
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), CREAM)
    draw = ImageDraw.Draw(img)

    # Top accent bar (flat teal)
    draw.rectangle([0, 0, w, 16], fill=TEAL)

    # Left side card badge
    icon = create_base_icon(220, is_maskable=False)
    img.paste(icon, (80, 180), icon)

    # Clean text layout
    # Brand title
    draw.rectangle([340, 185, 340 + 6, 260], fill=AMBER)
    # Fallback to default bitmap or system font
    try:
        font_large = ImageFont.truetype("arial.ttf", 68)
        font_tagline = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 26)
    except Exception:
        font_large = ImageFont.load_default()
        font_tagline = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((364, 180), "COMMUNIQ", fill=TEAL, font=font_large)
    draw.text((364, 270), "Everyone deserves a voice.", fill=CHARCOAL, font=font_tagline)
    draw.text((364, 325), "Communicate naturally. Connect confidently.", fill=TEAL, font=font_sub)
    draw.text((364, 375), "Accessible communication for children, students, adults and elders.", fill=(90, 80, 70), font=font_sub)

    # Bottom pill-free feature indicators
    features = ["Offline First", "Multilingual (EN, KN, HI)", "Web Speech Audio", "No Internet Required"]
    fx = 80
    for feat in features:
        draw.rounded_rectangle([fx, 510, fx + 240, 560], radius=10, fill=WHITE, outline=TEAL, width=2)
        draw.text((fx + 16, 524), feat, fill=CHARCOAL, font=font_sub)
        fx += 265

    return img

def create_svg_favicon() -> str:
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="4" y="4" width="92" height="92" rx="20" fill="#0F8B8D"/>
  <circle cx="50" cy="50" r="8" fill="#FFB703"/>
  <path d="M 28 50 A 22 22 0 0 1 72 50" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
  <path d="M 18 50 A 32 32 0 0 1 82 50" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
</svg>"""

def main():
    # 1. Favicon SVG
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(create_svg_favicon())
    print("Generated favicon.svg")

    # 2. Apple Touch Icon (180x180)
    icon_180 = create_base_icon(180)
    icon_180.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
    print("Generated apple-touch-icon.png")

    # 3. PWA Icons (192, 512, maskable)
    icon_192 = create_base_icon(192)
    icon_192.save(os.path.join(PUBLIC_DIR, "icon-192.png"), "PNG")
    print("Generated icon-192.png")

    icon_512 = create_base_icon(512)
    icon_512.save(os.path.join(PUBLIC_DIR, "icon-512.png"), "PNG")
    print("Generated icon-512.png")

    icon_maskable = create_base_icon(512, is_maskable=True)
    icon_maskable.save(os.path.join(PUBLIC_DIR, "icon-maskable.png"), "PNG")
    print("Generated icon-maskable.png")

    # 4. Favicon ICO (multi-size: 16, 32, 48)
    ico_img = create_base_icon(64)
    ico_img.save(
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print("Generated favicon.ico")

    # 5. Open Graph Image (1200x630)
    og = create_og_image()
    og.save(os.path.join(PUBLIC_DIR, "og-image.png"), "PNG")
    print("Generated og-image.png")

if __name__ == "__main__":
    main()
