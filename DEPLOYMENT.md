# Deployment Guide - Localizer MVP

This guide walks you through deploying your Localizer app to production.

---

## 🎯 Deployment Options

| Platform | Cost | Speed | Difficulty | Recommended For |
|----------|------|-------|------------|-----------------|
| **Vercel** | Free tier available | ⚡ Fast | Easy | MVP, small teams |
| **Netlify** | Free tier available | ⚡ Fast | Easy | Alternative to Vercel |
| **Railway** | $5/month | Medium | Medium | Need databases too |
| **Digital Ocean** | $12/month | Slow | Hard | Full control |

**We recommend Vercel** for this MVP - it's free, fast, and built for Next.js.

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free - sign up at vercel.com)
- Supabase project set up

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Localizer MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/localizer-mvp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import your GitHub repository:**
   - Click "Import Git Repository"
   - Select `localizer-mvp`

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Click "Deploy"**

6. **Wait 2-3 minutes** ⏱️

7. **Done!** 🎉 Your app is live at:
   ```
   https://localizer-mvp-xxx.vercel.app
   ```

### Step 3: Add Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your domain: `feedback.yourcompany.com`
3. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: feedback
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~10-60 minutes)
5. Done! Now accessible at `https://feedback.yourcompany.com`

---

## 📱 Option 2: Deploy to Netlify

### Step 1: Push to GitHub (same as Vercel)

### Step 2: Deploy on Netlify

1. **Go to [netlify.com](https://netlify.com)**

2. **Click "Add new site" → "Import an existing project"**

3. **Connect to GitHub** and select `localizer-mvp`

4. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables

5. **Deploy!**

**Note:** Netlify requires a `netlify.toml` file for Next.js:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🐳 Option 3: Docker Deployment

For self-hosting on any platform.

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t localizer-mvp .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  localizer-mvp
```

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Deploy automatically

---

## 🔒 Post-Deployment Security

### 1. Secure Your Supabase Project

```sql
-- Restrict public access to specific operations
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only
CREATE POLICY "Public can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Authenticated reads only
CREATE POLICY "Authenticated can read" ON feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

### 2. Add Rate Limiting (Supabase Edge Function)

```typescript
// Prevent spam submissions
const rateLimit = new Map<string, number>()

export default async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const lastSubmit = rateLimit.get(ip) || 0
  
  if (now - lastSubmit < 60000) { // 1 minute
    return new Response('Too many requests', { status: 429 })
  }
  
  rateLimit.set(ip, now)
  // ... process feedback
}
```

### 3. Enable HTTPS

Vercel/Netlify handle this automatically. For custom deployments:
- Use Let's Encrypt (free SSL)
- Configure nginx reverse proxy
- Force HTTPS redirects

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

Free tier includes:
- Pageviews
- Top pages
- Referrers
- Devices

**Enable:** Vercel Dashboard → Analytics → Enable

### 2. Supabase Monitoring

Track database performance:
- Query performance
- API usage
- Storage usage

**Access:** Supabase Dashboard → Reports

### 3. Error Tracking (Optional)

Add Sentry for error monitoring:

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
})
```

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

Both Vercel and Netlify auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feedback form"
git push

# ✅ Automatically deploys to production
```

### Preview Deployments

Every pull request gets a unique preview URL:
- Test before merging
- Share with stakeholders
- QA testing

---

## 🌍 Multi-Region Deployment

For global customers, deploy to multiple regions:

### Vercel Edge Network
- Automatic worldwide CDN
- Edge functions in 70+ cities
- No configuration needed

### Custom Multi-Region (Advanced)

Use Vercel + Cloudflare:
1. Deploy to Vercel (auto-global)
2. Add Cloudflare in front (optional)
3. Enable Cloudflare caching rules
4. Configure geo-routing

---

## 📱 QR Code Distribution

After deployment, generate QR codes with production URLs:

### Update QR Code URLs

1. Visit: `https://your-app.vercel.app/admin/qr-codes`
2. QR codes auto-generate with production domain
3. Download and print
4. Distribute to branches

### Best Practices

- **Test first:** Scan codes before printing
- **Track separately:** Use different codes per location
- **Update easily:** No need to reprint - URLs stay same

---

## 🔐 Environment Variables Checklist

Before deploying, ensure you have:

```bash
# Required
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

# Optional (Phase 2)
⬜ RESEND_API_KEY (for email alerts)
⬜ ALERT_EMAIL (manager email)
⬜ SENTRY_DSN (error tracking)
```

---

## 🐛 Common Deployment Issues

### Issue: "500 Internal Server Error"

**Cause:** Missing environment variables

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Ensure `NEXT_PUBLIC_*` variables are set
3. Redeploy

### Issue: "Failed to connect to Supabase"

**Cause:** RLS policies blocking public access

**Fix:**
```sql
-- Allow public read on branches
CREATE POLICY "Public can read branches" ON branches
  FOR SELECT USING (true);
```

### Issue: Build fails on Vercel

**Cause:** TypeScript errors or missing dependencies

**Fix:**
```bash
# Test build locally first
npm run build

# Fix any errors, then push
```

---

## 📈 Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' }
        ]
      }
    ]
  }
}
```

### 2. Optimize Images

QR codes are already optimized. For future images:
```javascript
import Image from 'next/image'

<Image 
  src="/logo.png" 
  width={200} 
  height={200} 
  alt="Logo"
  priority
/>
```

### 3. Database Indexing

Already included in schema:
```sql
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_branch ON feedback(branch_id);
```

---

## 🔄 Backup & Recovery

### Automated Supabase Backups

Supabase Pro includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention (Pro)
- 30-day retention (Team)

### Manual Backup

```bash
# Export data via Supabase CLI
supabase db dump -f backup.sql

# Restore
supabase db reset --db-url postgresql://...
```

---

## ✅ Production Checklist

Before going live:

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Sample data inserted (or removed)
- [ ] Environment variables set
- [ ] App deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] QR codes generated
- [ ] QR codes printed and distributed
- [ ] Manager dashboard tested
- [ ] Feedback form tested from QR code
- [ ] Analytics working
- [ ] SSL certificate active (https://)
- [ ] Error tracking configured (optional)
- [ ] Monitoring enabled

---

## 🎉 You're Live!

Your Localizer MVP is now in production. Next steps:

1. **Share QR codes** with customers
2. **Monitor dashboard** daily
3. **Respond to feedback** within 24 hours
4. **Iterate based on** negative feedback trends
5. **Scale as needed** (upgrade Supabase/Vercel plans)

---

**Need help?** Check the main README.md or reach out to support.
