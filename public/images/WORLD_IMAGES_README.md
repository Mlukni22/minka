# World Images for Roadmap

The roadmap component uses PNG images to represent each world type. These images should be placed in this directory.

## Required Images

Place the following PNG images in the `public/images/` directory:

### 1. `world-village.png`
- **Size**: 70x60 pixels (or similar aspect ratio)
- **Style**: Cozy village scene (house, buildings, warm colors)
- **Colors**: Match the village theme (#FFF0DC background, #FFD8BF accent)
- **Example content**: Small houses, a bakery, village square
- **Transparent background**: Recommended

### 2. `world-forest.png`
- **Size**: 70x60 pixels (or similar aspect ratio)
- **Style**: Natural forest scene (trees, nature, green colors)
- **Colors**: Match the forest theme (#E7F7E8 background, #CFE8DA accent)
- **Example content**: Trees, leaves, forest path, park bench
- **Transparent background**: Recommended

### 3. `world-library.png`
- **Size**: 70x60 pixels (or similar aspect ratio)
- **Style**: Library/study scene (books, learning, purple tones)
- **Colors**: Match the library theme (#F1ECFF background, #E1D9FF accent)
- **Example content**: Books, bookshelves, reading desk, scroll
- **Transparent background**: Recommended

## Fallback Behavior

If the PNG images are not available, the roadmap will automatically fall back to emoji icons:
- Village: 🏡
- Forest: 🌲
- Library: 📚

## Image Guidelines

- **Format**: PNG with transparent background preferred
- **Quality**: High resolution for crisp display
- **Style**: Should match Minka's soft, illustrated aesthetic
- **Consistency**: All three images should have a cohesive visual style

## Creating the Images

You can:
1. **Use AI tools**: Generate images with DALL-E, Midjourney, or Stable Diffusion
2. **Use existing assets**: From your design files or image library
3. **Create with design tools**: Figma, Illustrator, or similar
4. **Commission an artist**: For custom, professional illustrations

### Example Prompt for AI Generation

```
Create a cute, minimalist icon of a [village/forest/library] in a soft, pastel 
color palette. The style should be cozy and welcoming, suitable for a language 
learning app. Transparent background, simple shapes, illustrated style.
```

## Testing

After adding the images:
1. Navigate to the Roadmap page
2. Check that the images load correctly in the episode vignettes
3. Verify the images match the overall aesthetic
4. Ensure all three worlds have consistent visual quality

## Current Status

⚠️ **Images not yet added** - Currently using emoji fallbacks (🏡 🌲 📚)

Once you add the PNG files to `public/images/`, they will automatically be displayed in the roadmap!

