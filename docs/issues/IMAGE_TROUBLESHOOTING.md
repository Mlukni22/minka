# Image Troubleshooting Guide

If images are not appearing for vocabulary words, check the following:

## ⚠️ Most Common Issue: imageUrl Not Set in Firestore

If you see "Word without image" in the console, the `imageUrl` field is not set in Firestore. See `SET_IMAGE_URLS.md` for instructions on how to set it.

## 1. Check Browser Console

Open your browser's developer console (F12) and look for:
- Image loading errors
- Console logs showing word image URLs
- Any 404 errors for image files

## 2. Verify Image Files Exist

Make sure your image files are in the correct location:
```
public/images/vocabulary/
```

Check that the file names match exactly (case-sensitive):
- ✅ `/images/vocabulary/der-apfel.png`
- ❌ `/images/vocabulary/Der-Apfel.png` (wrong case)
- ❌ `/images/vocabulary/der apfel.png` (spaces instead of hyphens)

## 3. Verify Firestore Data

Check that the `imageUrl` field is set correctly in Firestore:

**Path:** `stories/{storyId}/chapters/{chapterId}/words/{wordId}`

**Field:** `imageUrl` should be:
```
/images/vocabulary/{word-name}.png
```

**Example:**
- Word: "der Apfel"
- `imageUrl`: `/images/vocabulary/der-apfel.png`

## 4. Common Issues

### Issue: Image path starts with `/public`
❌ Wrong: `/public/images/vocabulary/der-apfel.png`
✅ Correct: `/images/vocabulary/der-apfel.png`

The `/public` folder is the root for static files in Next.js.

### Issue: Image URL is empty or undefined
Check Firestore - the `imageUrl` field might not be set. If it's undefined, the placeholder will show instead.

### Issue: Image file doesn't exist
Make sure the file exists in `public/images/vocabulary/` with the exact name from Firestore.

### Issue: Special characters in filename
Use the conversion rules:
- `ä` → `ae`
- `ö` → `oe`
- `ü` → `ue`
- `ß` → `ss`
- Spaces → hyphens

## 5. Test Image Path

You can test if an image exists by visiting:
```
http://localhost:3000/images/vocabulary/der-apfel.png
```

If you see the image, the path is correct. If you get a 404, the file doesn't exist or the path is wrong.

## 6. Check Image Format

Supported formats:
- PNG (recommended)
- JPG
- SVG
- WebP
- AVIF

Make sure your image file has the correct extension.

## 7. Debug Steps

1. Open browser console (F12)
2. Navigate to a chapter with vocabulary
3. Look for console logs showing word image URLs
4. Check the Network tab for failed image requests
5. Verify the image URL in Firestore matches the file name
6. Test the image URL directly in the browser

## 8. Quick Fix Checklist

- [ ] Image file exists in `public/images/vocabulary/`
- [ ] File name matches exactly (case-sensitive, no spaces)
- [ ] `imageUrl` field is set in Firestore
- [ ] `imageUrl` starts with `/images/vocabulary/` (not `/public/`)
- [ ] Image file has correct extension (.png, .jpg, etc.)
- [ ] No console errors about image loading
- [ ] Image URL is accessible when typed directly in browser

