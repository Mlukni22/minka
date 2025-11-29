# 🔍 Email Troubleshooting Checklist

## Step 1: Check Server Console

When you submit an email on the waitlist, look at your **server console** (terminal where `npm run dev` is running). You should see one of these:

### ✅ Success Message:
```
[waitlist] new subscriber saved: your@email.com
[email] Attempting to send email to: your@email.com
[email] ✅ Confirmation email sent successfully!
[email] Email ID: re_xxxxx
[waitlist] Confirmation email sent successfully to: your@email.com
```

### ❌ Error Messages to Look For:

**Missing Configuration:**
```
⚠️  EMAIL CONFIGURATION MISSING ⚠️
Missing required environment variables: RESEND_API_KEY, RESEND_FROM_EMAIL
```

**API Error:**
```
[email] Resend API error: {...}
[email] Error message: Invalid API key
```

**Other Errors:**
```
[email] ❌ Exception caught while sending email:
[email] Error message: ...
```

## Step 2: Verify Environment Variables

1. **Check if server was restarted:**
   - Environment variables are only loaded when the server starts
   - If you added/updated `.env.local` AFTER starting the server, you need to restart it

2. **Restart the server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again:
   npm run dev
   ```

3. **Verify .env.local exists:**
   - File should be in project root (same folder as `package.json`)
   - Should contain:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     RESEND_FROM_EMAIL=onboarding@resend.dev
     ```

## Step 3: Test Email Endpoint

You can test the email configuration directly:

**Using curl (in terminal):**
```bash
curl -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d "{\"email\":\"your@email.com\"}"
```

**Using browser console (F12):**
```javascript
fetch('http://localhost:3000/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com' })
})
.then(r => r.json())
.then(console.log)
```

This will show you:
- If environment variables are loaded
- The exact error message
- Whether the API key is valid

## Step 4: Common Issues

### Issue: "Invalid API key"
**Solution:**
- Check your API key in Resend dashboard
- Make sure it starts with `re_`
- Try creating a new API key
- Make sure there are no extra spaces in `.env.local`

### Issue: "Domain not verified"
**Solution:**
- For testing, use `onboarding@resend.dev` (no verification needed)
- For production, verify your domain in Resend dashboard

### Issue: "Email sent but not received"
**Solutions:**
- Check spam/junk folder
- Check Resend dashboard → Logs to see delivery status
- Try a different email address
- Wait a few minutes (can take 1-5 minutes)

### Issue: Server console shows no email logs
**Solution:**
- The email sending might be failing silently
- Check if there are any error messages
- Make sure the server console is visible
- Try the test endpoint to see detailed errors

## Step 5: Check Resend Dashboard

1. Go to [resend.com](https://resend.com) and log in
2. Go to **Logs** or **Emails** section
3. Check if emails are being sent
4. Look for any error messages or delivery failures

## Quick Fixes

1. **Restart server** (most common fix):
   ```bash
   # Stop: Ctrl+C
   # Start: npm run dev
   ```

2. **Verify API key**:
   - Go to Resend dashboard → API Keys
   - Make sure the key is active
   - Copy it again and update `.env.local`

3. **Check .env.local format**:
   - No quotes around values
   - No spaces around `=`
   - Each variable on its own line

---

**Still not working?** Share the exact error message from your server console and I can help debug further!

