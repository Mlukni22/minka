# Image Debug Checklist

If images still don't appear after adding them to Firestore, check these:

## 1. Check Browser Console

Open browser console (F12) and look for:
- `✅ Image loaded successfully:` - Image is working
- `❌ Image failed to load:` - Image path is wrong or file doesn't exist
- `Word with image:` - imageUrl is set in Firestore
- `Word without image:` - imageUrl is NOT set in Firestore

## 2. Verify Firestore imageUrl Format

The `imageUrl` field in Firestore must be exactly:
```
/images/vocabulary/{filename}.png
```

**Correct examples:**
- ✅ `/images/vocabulary/die-katze.png`
- ✅ `/images/vocabulary/das-haus.png`

**Wrong examples:**
- ❌ `images/vocabulary/die-katze.png` (missing leading slash)
- ❌ `/public/images/vocabulary/die-katze.png` (includes /public/)
- ❌ `die-katze.png` (missing path)
- ❌ `vocabulary/die-katze.png` (missing /images/)

## 3. Verify Image Files Exist

Check that files exist in `public/images/vocabulary/`:
- File names must match EXACTLY (case-sensitive)
- If Firestore has `/images/vocabulary/die-katze.png`
- File must be: `public/images/vocabulary/die-katze.png`

## 4. Test Image URL Directly

Try accessing the image directly in your browser:
```
http://localhost:3000/images/vocabulary/die-katze.png
```

- ✅ If image shows: Path is correct, check Firestore
- ❌ If 404 error: File doesn't exist or wrong name

## 5. Common Issues

### Issue: imageUrl has wrong format
**Solution:** Make sure it starts with `/images/vocabulary/` (not `/public/`)

### Issue: File name mismatch
**Solution:** Check case sensitivity and special characters:
- Firestore: `/images/vocabulary/die-katze.png`
- File: `public/images/vocabulary/die-katze.png` ✅
- File: `public/images/vocabulary/Die-Katze.png` ❌ (wrong case)

### Issue: Image file doesn't exist
**Solution:** Create the image file with the exact name from Firestore

### Issue: Next.js cache
**Solution:** 
1. Stop dev server
2. Delete `.next` folder
3. Restart: `npm run dev`
4. Hard refresh browser (Ctrl+Shift+R)

## 6. Quick Test

1. Check console for: `Word with image: die Katze Image URL: /images/vocabulary/die-katze.png`
2. If you see this, the imageUrl is set correctly
3. Check if you see: `✅ Image loaded successfully` or `❌ Image failed to load`
4. If failed, check the Network tab for 404 errors

## 7. Verify Your Setup

Based on your files, you have:
- ✅ `public/images/vocabulary/das-haus.png`
- ✅ `public/images/vocabulary/die-katze.png`

So in Firestore, make sure:
- Word "das Haus" has: `imageUrl: "/images/vocabulary/das-haus.png"`
- Word "die Katze" has: `imageUrl: "/images/vocabulary/die-katze.png"`

## 8. Still Not Working?

1. Check browser Network tab (F12 → Network)
2. Look for failed image requests (red entries)
3. Check the exact URL being requested
4. Compare with your Firestore imageUrl field
5. Make sure they match exactly

