# Character Avatar Images

Place character avatar PNG images in this directory.

## Required Images

- `minka.png` - Minka the cat (main character)
- `lisa.png` - Lisa (friend)
- `pinko.png` - Pinko (pig character)
- `boby.png` - Boby (dog character)
- `emma.png` - Emma (friend)

## Image Specifications

- **Format**: PNG with transparent background (recommended)
- **Size**: 200x200 pixels minimum (will be displayed at 56x56px)
- **Style**: Circular crop will be applied automatically
- **File size**: Keep under 100KB for fast loading

## Fallback

If an image is not found, the app will automatically display an emoji:
- 🐱 for Minka
- 👧 for Lisa
- 🐷 for Pinko
- 🐶 for Boby
- 👩 for Emma

## How to Add Images

1. Save your character PNG files in this directory
2. Name them exactly as listed above (lowercase, .png extension)
3. The app will automatically load them in the dialogue scenes

## Example Structure

```
public/images/avatars/
├── minka.png
├── lisa.png
├── pinko.png
├── boby.png
└── emma.png
```

