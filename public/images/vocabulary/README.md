# Vocabulary Images

This directory contains icon-sized images for German vocabulary words that appear in lessons.

## Image Naming Convention

Images should be named using the German word in lowercase with spaces replaced by hyphens:

- `hallo.png` - for "Hallo"
- `guten-morgen.png` - for "Guten Morgen"  
- `die-sonne.png` - for "Die Sonne"
- `das-haus.png` - for "Das Haus"
- `die-katze.png` - for "Die Katze"

**Special characters:**
- `ä` → `ae` (e.g., `kaese.png` for "Käse")
- `ö` → `oe` (e.g., `schoen.png` for "schön")
- `ü` → `ue` (e.g., `fuehrerschein.png` for "Führerschein")
- `ß` → `ss` (e.g., `strasse.png` for "Straße")

## Supported Formats

- PNG (recommended for transparency)
- JPG
- SVG (for simple illustrations)
- WebP (automatically optimized by Next.js)
- AVIF (automatically optimized by Next.js)

## Image Specifications

- **Size**: 64x64px to 128x128px (icon-sized)
  - Display size: 64px (mobile) / 80px (desktop)
  - Source images should be square (1:1 aspect ratio)
- **Format**: PNG with transparent background preferred
- **Style**: Simple, clear, recognizable icons or illustrations
- **Optimization**: Images are automatically optimized by Next.js Image component
  - Formats: AVIF, WebP (with PNG fallback)
  - Lazy loading enabled
  - Responsive sizing

## Usage in Firestore

For each word document in Firestore, set the `imageUrl` field:

**Firestore path:**
```
stories/{storyId}/chapters/{chapterId}/words/{wordId}
```

**Set `imageUrl` to:**
```
/images/vocabulary/{word-name}.png
```

**Example:**
- Word: "der Apfel"
- `imageUrl`: `/images/vocabulary/der-apfel.png`
- `imageAlt`: "An apple" (optional, for accessibility)

## Display Locations

Images appear in two places:

1. **Vocabulary Panel (Right Sidebar)**: 64px × 64px (mobile) / 80px × 80px (desktop)
2. **Hover Tooltip**: 80px × 80px when hovering over words in the story text

## Best Practices

- Keep images simple and recognizable at small sizes
- Use transparent backgrounds for better integration
- Ensure icons are clear and readable at 64-80px
- Test images on both light and dark backgrounds
- Optimize file sizes (aim for < 50KB per image)

Images will gracefully fail if not found - placeholders will show the word name instead.
