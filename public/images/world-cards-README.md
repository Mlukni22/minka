# World Cards Background Images

This directory is where you should place your background images for the Forest, Village, and Library cards.

## Required Images:

Place these PNG/JPG images in the `public/images/` directory:

1. **`forest-icon.png`** - Full background for the Forest card (trees, nature theme)
2. **`village-icon.png`** - Full background for the Village card (house, village theme)  
3. **`library-icon.png`** - Full background for the Library card (books, library theme)

## Image Specifications:

- **Format**: PNG or JPG (PNG with transparency works best)
- **Recommended Size**: 800x600 pixels minimum (landscape orientation)
- **Aspect Ratio**: ~4:3 or 16:9 works well
- **File Size**: Keep under 200KB for faster loading
- **Style**: Should match the illustration style from your design (similar to the cat and forest background)

## How the Images Are Used:

The images stretch to cover the entire card background:
- **Display**: Full card background using `background-size: cover`
- **Position**: Centered (`background-position: center`)
- **Fallback**: Solid color backgrounds (#E7F7E8 for Forest, #FFF0DC for Village, #E5DFFF for Library)
- **Text**: Card text appears on top with subtle shadows for readability
- **Hover**: Slight brightness increase on hover

## Expected Paths:

```
public/
└── images/
    ├── forest-icon.png    ← Forest card icon
    ├── village-icon.png   ← Village card icon
    └── library-icon.png   ← Library card icon
```

## CSS Integration:

The images are automatically loaded via CSS:
- `.world-card.forest .world-card-icon` → `/images/forest-icon.png`
- `.world-card.village .world-card-icon` → `/images/village-icon.png`
- `.world-card.library .world-card-icon` → `/images/library-icon.png`

## Alternative: Using Emojis

If you don't have custom icons yet, you can temporarily use emojis by modifying the JSX in `page.tsx`:

```tsx
<div className="world-card-icon">🌲</div>  // Forest
<div className="world-card-icon">🏠</div>  // Village
<div className="world-card-icon">📚</div>  // Library
```

But for the best visual result matching your design, custom PNG illustrations are recommended!

