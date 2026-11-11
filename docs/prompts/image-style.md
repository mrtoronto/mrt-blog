# Image Style Guide (`mrt-blog`)

This document defines the visual language and prompt engineering guidelines for all generated and illustrated imagery on **m-r-t.xyz** (favicons, OpenGraph social embeds, blog post headers, inline diagrams, and landing page visuals).

Future agents and contributors **must** read this file before generating or designing any visual assets for the site so that everything feels cohesive.

---

## 1. Core Aesthetic Philosophy

**"Warm Digital Geometric"**

The blog sits at the intersection of software engineering and personal tinkering. The visual style is **digital and geometric** at its core—clean shapes, modular grids, isometric or flat-vector construction, crisp lines—but grounded in a **warm, earthy, approachable palette** rather than cold sci-fi or sterile corporate tech.

- **Not** cyberpunk 3077, neon synthwave, or cold blue enterprise SaaS.
- **Not** aged parchment or faux-handwritten scrapbooking.
- **Yes** to clean geometric forms, tactile warmth, high contrast, uncluttered compositions, and a human, slightly low-key personality.

---

## 2. Color Palette & Contrast

Images should feel warm, grounded, and high-contrast, designed to sit comfortably on dark warm-charcoal surfaces without glowing or screaming for attention.

### Primary Surfaces (Backgrounds)
- **Deep Warm Charcoal / Espresso Slate:** `#121110` to `#1c1917` (primary dark background)
- **Elevated Warm Stone:** `#262320` to `#292524` (secondary blocks, cards, subtle grid planes)

### Accent & Subject Colors (Earthy & Punchy)
- **Terracotta / Burnt Amber:** `#e07a5f` or `#d97706` (primary warm focal color)
- **Warm Sand / Cream:** `#f4f1de` or `#ede0d4` (high-contrast highlights, primary geometric strokes/fills)
- **Sage / Moss Green:** `#81b29a` or `#6b9080` (secondary calm accent, great for "active/healthy" states or balance)
- **Muted Ochre / Mustard:** `#f2cc8f` (warm secondary highlight)
- **Dusty Slate / Clay Gray:** `#78716c` to `#a8a29e` (structural lines, background geometry, inactive elements)

### Contrast Rule
Keep compositions **more minimal than maximal**: use a dark, quiet background (`#141210`–`#1c1917`) with 1–2 dominant warm/earthy accent colors and crisp cream/sand highlights so the silhouette reads immediately even at thumbnail size.

---

## 3. Context-Specific Modes (Vibe & Subject Matter)

Rather than forcing one rigid template onto every image, tailor the subject matter and tone to where the image lives:

### A. Site Branding, Landing Page & OG Embeds → *Modular Geometric Tiles & Clean Typography*
- **Role:** Favicons, site-wide OpenGraph social card (`static/og-image.jpg`), brand marks.
- **Vibe:** Intentional, grounded, clean, and immediately recognizable—never random abstract shapes, scattered `+` crosshairs, or fake desktop window chrome.
- **Reference Anchor (`static/og-image.jpg`):** Three rounded-corner square tiles arranged horizontally on a deep warm charcoal background (`#161412`):
  1. **`M` Tile:** Terracotta (`#e07a5f`) tile with a bold cream (`#f4f1de`) geometric `M`.
  2. **`R` Tile:** Sage green (`#81b29a`) tile with a bold cream (`#f4f1de`) geometric `R`.
  3. **`T` Tile:** Mustard ochre (`#f2cc8f`) tile with a high-contrast deep charcoal (`#161412`) geometric `T`.
- **Favicon (`static/favicon.svg`):** A 2×2 bento grid variation where the top row is `M` (terracotta) and `R` (sage green), and the bottom row is `.` (warm stone tile with a terracotta period dot on the bottom-left) and `T` (mustard ochre on the bottom-right)—subtly reading **"MR. T"**.
- **Header Brand Mark (`static/logo.svg`):** A horizontal 3-tile row (`[M][R] . [T]`) with the subtle terracotta dot resting on the baseline between the `R` and `T` tiles, paired beside "Matt Toronto" in the site navigation bar.
- **Goal:** Immediately communicate *whose* site this is (`MRT`) with zero visual clutter.

### B. Blog Post Header / Hero Images → *Playful & Grounded Editorial*
- **Role:** Header art or social card for a specific write-up.
- **Vibe:** Witty, approachable, doesn't take itself too seriously, but **directly tied to the subject of the post**.
- **Subject Matter:** Concrete, recognizable visual representations of the actual tech or problem in the article—never random mystery machines or abstract floating cubes. Prefer 2D flat-geometric vector style (with optional light isometric accents only when showing a concrete object).
- **Goal:** Give the reader an immediate visual anchor for the topic.

### C. Inline Technical Visuals & Diagrams → *Clean & Precise*
- **Role:** Explaining architecture, data flow, or system trade-offs inside a post.
- **Vibe:** Clear, structured, intentional.
- **Subject Matter:** Literal diagrams, modular block flows, packet paths, or isometric system layers using the warm charcoal + terracotta/sage/cream palette.
- **Goal:** Communicate how the system works at a glance while matching the site's aesthetic.

---

## 4. Visual Construction Rules

1. **Purpose Over Randomness:** Every image must have an obvious subject. Avoid "floating random geometric shapes", scattered blueprint `+` signs, random dots/lines, fake OS window frames, or mystery contraptions that don't clearly mean anything.
2. **2D Flat Geometric Primary Style:** Lean primarily toward **2D flat geometric vector illustration** with clean rounded-rectangle modular tiles, bold geometric typography, and subtle matte warmth rather than floating 3D voxel islands or noisy schematic clutter.
3. **Simplicity & High Contrast:** Favor bold silhouettes, generous negative space, and 3–5 distinct visual elements over crowded scenes.
4. **Subtle Texture (Restrained):** A whisper of matte grain keeps digital shapes feeling warm and human without looking noisy or gritty.

---

## 5. Strict Anti-Patterns (What to Avoid)

Never include any of the following in prompts or designs:
- **No AI clichés:** No glowing brains, neural network constellations, sparkling magic wands, or humanoid robots typing on laptops.
- **No corporate 3D slop:** No shiny, inflatable 3D pastel blobs, glassmorphism spheres, or Corporate Memphis (Alegria) flat-art characters with giant limbs.
- **No neon / cyberpunk:** No neon purple-and-cyan gradients, laser grids, glitch art, or "year 3077" sci-fi HUDs.
- **No stock photo vibes:** No photorealistic office desks, coffee cups next to MacBooks, or generic handshake/teamwork imagery.
- **No meaningless abstract filler:** No random piles of cubes, mystery Rube Goldberg machines with no clear meaning, or decorative shapes that don't relate to `MRT` or the specific technical topic.
- **No baked-in gibberish text:** Only include intentional, exact typography (like `MRT` or `m-r-t.xyz`); avoid background pseudo-text that turns into AI gibberish.

---

## 6. Prompt Template for Image Generation Tools

When calling an image generation model (e.g. `GenerateImage`), construct the prompt using this structure:

```text
[Subject & Composition]: <Describe the specific object, metaphor, or geometric arrangement clearly in 1-2 sentences. Emphasize simple silhouettes and generous negative space.>

[Mode]: <Choose one: "Calm and atmospheric" | "Playful and slightly quirky editorial illustration" | "Clean geometric technical diagram">

[Style & Medium]: Minimalist digital geometric illustration, clean vector and isometric forms, crisp edges, flat graphic shading with subtle matte warmth, structured grid sensibility.

[Color Palette]: Deep warm charcoal background (#161412), warm terracotta orange (#e07a5f), muted sage green (#81b29a), warm sand/cream highlights (#f4f1de), and muted stone gray structural lines. High contrast, earthy and warm palette.

[Avoid]: No neon colors, no purple/cyan gradients, no glowing AI brains, no shiny 3D corporate blobs, no photorealism, no clutter, no text or watermarks.
```

### Example Prompt (Blog Post Header for "How This Site Works")
> A compact, slightly quirky geometric contraption that takes a single code block on the left and stamps it through a small mechanical press into a neat stack of static pages, with a tiny radio beacon on top transmitting a warm signal wave. Playful and slightly quirky editorial illustration. Minimalist digital geometric illustration, clean vector and isometric forms, crisp edges, flat graphic shading with subtle matte warmth, generous negative space. Deep warm charcoal background (#161412), warm terracotta orange (#e07a5f), muted sage green (#81b29a), warm sand/cream highlights (#f4f1de), and warm stone gray lines. High contrast, earthy and warm palette. No neon colors, no purple/cyan gradients, no shiny 3D blobs, no photorealism, no text.
