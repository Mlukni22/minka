# 🔧 DNS Setup for Resend Email Domain

This guide will help you verify your domain in Resend so you can send emails from your own domain (e.g., `noreply@yourdomain.com`).

## 📋 DNS Records to Add

Add the following DNS records in your domain provider (GoDaddy, Namecheap, Cloudflare, etc.):

### 1. Domain Verification (TXT Record)

**Purpose:** Verifies you own the domain

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsYldRVHfiXQ0pW+dbuAINBvIjxNHhyzD2JixwIN7gGRJyQmOGHp3GB9DIxDx4RJiQ/Fv1ZEKymmgUak+vbkBXJg2hLaMZQ53GJDAPNE5K4qlhC2iGEv+rUgINUYoTsustnbpDj6TNBFl1mV5AMwLepyN3sP19VE9Chf17+uEKowIDAQAB` | Auto | - |

### 2. Enable Sending (MX Record)

**Purpose:** Allows Resend to send emails on your behalf

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | Auto | 10 |

### 3. SPF Record (TXT Record)

**Purpose:** Prevents email spoofing

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Auto | - |

### 4. DMARC Record (TXT Record - Optional but Recommended)

**Purpose:** Email authentication policy

| Type | Name | Content | TTL | Priority |
|------|------|---------|-----|----------|
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Auto | - |

---

## 🚀 Step-by-Step Instructions

### Step 1: Access Your Domain's DNS Settings

1. Log in to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)
2. Find your domain in the dashboard
3. Look for **DNS Management**, **DNS Settings**, or **Zone Editor**
4. Click to open DNS settings

### Step 2: Add Each Record

For each record above:

1. Click **Add Record** or **Create Record**
2. Select the **Type** (TXT or MX)
3. Enter the **Name/Host** (e.g., `resend._domainkey`, `send`, `_dmarc`)
4. Enter the **Content/Value** (copy exactly from the table above)
5. Set **TTL** to Auto or 3600
6. For MX record, set **Priority** to 10
7. Click **Save** or **Add Record**

### Step 3: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes** for most providers
- You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net)

### Step 4: Verify in Resend

1. Go back to [Resend Dashboard](https://resend.com/domains)
2. Click on your domain
3. Click **Verify Domain**
4. Resend will check if all DNS records are correct
5. Once verified, you'll see a green checkmark ✅

---

## 📝 Quick Copy-Paste Values

### TXT Record for Domain Verification
```
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsYldRVHfiXQ0pW+dbuAINBvIjxNHhyzD2JixwIN7gGRJyQmOGHp3GB9DIxDx4RJiQ/Fv1ZEKymmgUak+vbkBXJg2hLaMZQ53GJDAPNE5K4qlhC2iGEv+rUgINUYoTsustnbpDj6TNBFl1mV5AMwLepyN3sP19VE9Chf17+uEKowIDAQAB
```

### MX Record for Sending
```
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
```

### TXT Record for SPF
```
Name: send
Value: v=spf1 include:amazonses.com ~all
```

### TXT Record for DMARC (Optional)
```
Name: _dmarc
Value: v=DMARC1; p=none;
```

---

## 🔍 Common Domain Providers

### GoDaddy
1. Go to **My Products** → **DNS**
2. Scroll to **Records** section
3. Click **Add** for each record

### Namecheap
1. Go to **Domain List** → Click **Manage**
2. Go to **Advanced DNS** tab
3. Click **Add New Record** for each

### Cloudflare
1. Select your domain
2. Go to **DNS** → **Records**
3. Click **Add record** for each

### Google Domains
1. Go to **DNS** section
2. Scroll to **Custom resource records**
3. Click **Add** for each record

---

## ✅ Verification Checklist

- [ ] Added TXT record: `resend._domainkey`
- [ ] Added MX record: `send` → `feedback-smtp.eu-west-1.amazonses.com` (Priority: 10)
- [ ] Added TXT record: `send` → `v=spf1 include:amazonses.com ~all`
- [ ] Added TXT record: `_dmarc` → `v=DMARC1; p=none;` (optional)
- [ ] Waited 15-30 minutes for DNS propagation
- [ ] Verified domain in Resend dashboard
- [ ] Updated `.env.local` with your domain email (e.g., `noreply@yourdomain.com`)

---

## 🎯 After Verification

Once your domain is verified:

1. Update your `.env.local` file:
   ```env
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
   (Replace `yourdomain.com` with your actual domain)

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Test sending an email from your waitlist

---

## 🐛 Troubleshooting

### DNS Records Not Showing Up
- Wait longer (can take up to 48 hours)
- Check for typos in the record values
- Make sure you're editing the correct domain

### Domain Verification Failing
- Double-check all records are added correctly
- Wait for DNS propagation
- Check Resend dashboard for specific error messages

### Still Using `onboarding@resend.dev`
- That's fine for testing! You can use it without domain verification
- Domain verification is only needed for production emails from your own domain

---

**Need Help?** Check [Resend's Domain Documentation](https://resend.com/docs/dashboard/domains/introduction) or contact Resend support.

