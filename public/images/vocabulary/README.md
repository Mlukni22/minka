# Vocabulary Images

This directory contains images for German vocabulary words that appear in lessons.

## Image Naming Convention

Images should be named using the German word in lowercase with spaces replaced by hyphens:

- `hallo.png` - for "Hallo"
- `guten-morgen.png` - for "Guten Morgen"  
- `die-sonne.png` - for "Die Sonne"
- `das-haus.png` - for "Das Haus"
- `die-katze.png` - for "Die Katze"

## Supported Formats

- PNG (recommended for transparency)
- JPG
- SVG (for simple illustrations)

## Image Specifications

- **Size**: Recommended 64x64px minimum, 128x128px ideal
- **Format**: PNG with transparent background preferred
- **Style**: Simple, clear, recognizable illustrations or icons

## Examples

When a user hovers over a German word in a lesson, the tooltip will display:
1. The article (der/die/das)
2. The image (if available)
3. The English translation
4. The plural form (if applicable)
5. A hint to add to flashcards

Images will gracefully fail if not found - the tooltip will still show the translation and other information.
