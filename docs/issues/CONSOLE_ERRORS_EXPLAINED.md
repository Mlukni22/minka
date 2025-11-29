# Console Errors Explained

## ✅ Fixed Issues

### 1. Word Image Debug Logs
**Status**: ✅ Fixed
**What was happening**: Debug logs were showing for every word without an image
**Fix**: Made debug logs conditional - they now only show if:
- `NODE_ENV === 'development'` AND
- `NEXT_PUBLIC_DEBUG_WORDS === 'true'` (environment variable)

**To enable debug logs again** (if needed):
Add to your `.env.local`:
```
NEXT_PUBLIC_DEBUG_WORDS=true
```

---

## ⚠️ Browser Extension Errors (Cannot Fix)

These errors are **NOT from your code** - they're from Chrome extensions you have installed:

### 1. `contentScript.js` Errors
```
jQuery.Deferred exception: Cannot read properties of null (reading 'indexOf')
Uncaught TypeError: Cannot read properties of null (reading 'indexOf')
```
**Source**: Chrome extension (likely a translation or language learning extension)
**Action**: Can't fix - this is from a browser extension, not your app
**Solution**: 
- Ignore these errors (they don't affect your app)
- Or disable the problematic extension if it's annoying

### 2. `gpc.js` / `gpcWindowSetting.js` Errors
```
Denying load of chrome-extension://gomekmidlodglbbmalcneegieacbdmki/client/gpcWindowSetting.js
GET chrome-extension://invalid/ net::ERR_FAILED
Unchecked runtime.lastError: The message port closed before a response was received
```
**Source**: Chrome extension (likely a privacy/security extension)
**Action**: Can't fix - this is from a browser extension
**Solution**: Ignore these errors (they don't affect your app)

### 3. `i18next` Messages
```
i18next: languageChanged en-US
i18next: initialized
```
**Source**: Chrome extension (likely a translation extension)
**Action**: These are just informational logs, not errors
**Solution**: Can be ignored

---

## 📝 How to Identify Extension Errors

Extension errors typically have these characteristics:
- Path includes `chrome-extension://`
- File names like `contentScript.js`, `gpc.js`, `injectScript`
- Errors from extensions you've installed

**Your app's errors** will have paths like:
- `src/app/...`
- `src/components/...`
- `src/lib/...`
- `page.tsx`, `route.ts`, etc.

---

## 🧹 Clean Console Tips

If you want a cleaner console during development:

1. **Filter out extension errors**:
   - In Chrome DevTools Console, click the filter icon
   - Add negative filter: `-chrome-extension`

2. **Disable problematic extensions**:
   - Go to `chrome://extensions/`
   - Disable extensions that are causing errors
   - Or use Incognito mode (extensions disabled by default)

3. **Use browser without extensions**:
   - Use a different browser for development
   - Or use Chrome's "Guest mode" (extensions disabled)

---

## ✅ Summary

**Fixed**:
- ✅ Word image debug logs (now conditional)

**Cannot Fix** (not our code):
- ❌ Browser extension errors (from Chrome extensions)
- ❌ Extension content script errors
- ❌ Extension runtime errors

**Your app is working correctly!** The extension errors are harmless and don't affect functionality.


