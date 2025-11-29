# ⚡ Quick Email Setup - 3 Steps

## Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free account = 100 emails/day)
2. Once logged in, go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Minka Waitlist"
5. **Copy the API key** (starts with `re_` - you'll only see it once!)

## Step 2: Update .env.local

Open `.env.local` in your project root and replace the placeholder:

```env
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Important:** Replace `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API key from Step 1.

## Step 3: Restart Your Dev Server

1. Stop your current server (Ctrl+C in the terminal)
2. Start it again: `npm run dev`
3. Environment variables are only loaded when the server starts

## ✅ Test It

1. Go to your waitlist page
2. Submit an email
3. Check your inbox (and spam folder)
4. Check the server console - you should see: `[waitlist] Confirmation email sent successfully`

## 🐛 Still Not Working?

1. **Check server console** - Look for error messages
2. **Verify API key** - Make sure it starts with `re_` and is the full key
3. **Check spam folder** - Emails sometimes go there
4. **Test endpoint** - Visit `http://localhost:3000/api/test-email` (POST request with `{"email":"your@email.com"}`)

## 📝 Current Status

✅ `.env.local` file created  
✅ Email code configured  
⏳ **You need to:** Add your Resend API key to `.env.local` and restart the server

---

**Need help?** Check `TROUBLESHOOTING_EMAIL.md` for detailed troubleshooting.

