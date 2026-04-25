# Quick Start Guide - 10 Minutes to Live App

Follow these steps to get Localizer running in 10 minutes.

---

## ⏱️ Step 1: Set Up Supabase (3 minutes)

### 1.1 Create Account
- Go to [supabase.com](https://supabase.com)
- Click "Start your project"
- Sign up with GitHub (fastest)

### 1.2 Create Project
- Click "New Project"
- Fill in:
  - **Name:** localizer-mvp
  - **Database Password:** (save this!)
  - **Region:** Choose closest to you
- Click "Create new project"
- Wait ~2 minutes for setup

### 1.3 Run Database Schema
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase-schema.sql` from this project
4. Copy ALL contents
5. Paste into Supabase SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message: ✅ Database schema created!

### 1.4 Get Your Credentials
1. Click **Settings** (gear icon in left sidebar)
2. Click **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## 💻 Step 2: Install & Configure (2 minutes)

### 2.1 Install Dependencies
```bash
cd localizer-mvp
npm install
```

### 2.2 Set Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local and paste your Supabase credentials
# Replace these values with yours from Step 1.4:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example `.env.local` file:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjg1OTQwOCwiZXhwIjoxOTMyNDM1NDA4fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

**Output should show:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

## ✅ Step 4: Test Everything (4 minutes)

### 4.1 Test Home Page
1. Open browser: [http://localhost:3000](http://localhost:3000)
2. You should see: "Localizer" with two cards

### 4.2 Test Customer Feedback Form
1. Click **"Customer Feedback"** card
2. You'll see the feedback form
3. Rate all 4 categories (click stars)
4. Add a comment (optional)
5. Click **"Submit Feedback"**
6. You should see: "Thank You!" screen ✓

### 4.3 Test Manager Dashboard
1. Go back to home: [http://localhost:3000](http://localhost:3000)
2. Click **"Manager Dashboard"** card
3. You should see:
   - Metrics showing your test feedback
   - Chart with data
   - Your comment in "Recent Feedback"

### 4.4 Test QR Code Generator
1. Visit: [http://localhost:3000/admin/qr-codes](http://localhost:3000/admin/qr-codes)
2. You should see QR codes for 3 sample branches
3. Click **"Download QR Code"** to save
4. Scan with your phone camera
5. Should open feedback form for that branch

---

## 🎉 Success!

Your Localizer MVP is now running locally. You can:

✅ Submit feedback via the form
✅ View analytics in the dashboard
✅ Generate QR codes for branches

---

## 🌐 Next: Deploy to Production

Want to make it live on the internet?

### Option A: Quick Deploy (5 minutes)
1. Push code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

**Follow:** `DEPLOYMENT.md` for detailed steps

### Option B: Stay Local (For Testing)
Keep running `npm run dev` and share your local network:
- Get your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Share URL: `http://YOUR_IP:3000/feedback?branch=xxx`
- Only works on same WiFi network

---

## 🐛 Troubleshooting

### "Failed to fetch branches"
**Problem:** Environment variables not set correctly

**Fix:**
1. Check `.env.local` exists in project root
2. Verify values are correct (no quotes, no spaces)
3. Restart dev server: Ctrl+C then `npm run dev`

### "Build error" or TypeScript errors
**Problem:** Missing dependencies or version mismatch

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection fails
**Problem:** Supabase RLS policies blocking access

**Fix:**
1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Run this query:
```sql
-- Allow public to read branches
CREATE POLICY "Public read branches" ON branches
  FOR SELECT USING (true);
```

### QR codes not loading
**Problem:** Browser permissions or canvas errors

**Fix:**
1. Try a different browser (Chrome recommended)
2. Clear cache and refresh
3. Check browser console for errors (F12)

---

## 📱 Mobile Testing

Test the feedback form on your phone:

1. **Find your computer's local IP:**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **On your phone (same WiFi):**
   - Open browser
   - Go to: `http://YOUR_IP:3000/feedback?branch=123e4567-e89b-12d3-a456-426614174000`
   - Test the form

3. **Or scan the QR code:**
   - Generate QR code from `/admin/qr-codes`
   - Download to phone
   - Scan with camera app

---

## 🎯 What's Next?

### Customize Your App

**1. Update Branch Information**
```sql
-- In Supabase SQL Editor
UPDATE branches 
SET name = 'Your Cafe Name', 
    location = 'Your Address'
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

**2. Add New Branches**
```sql
INSERT INTO branches (name, location) VALUES 
  ('Downtown Branch', '123 Main St'),
  ('Airport Location', 'Terminal 3');
```

**3. Change Brand Colors**
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR', // Change this
  }
}
```

**4. Customize Questions**
Edit `app/feedback/page.tsx` to add/remove rating categories

---

## 📊 Understanding the Data

### Check Database in Supabase

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Select **feedback** table
4. See all submissions in real-time

### Export Data

```sql
-- In Supabase SQL Editor
COPY (
  SELECT * FROM feedback 
  WHERE created_at >= NOW() - INTERVAL '7 days'
) TO STDOUT WITH CSV HEADER;
```

Or use the Table Editor → Export button

---

## 🚀 Production Checklist

Before going live with real customers:

- [ ] Test all features locally
- [ ] Replace sample branch data with real branches
- [ ] Generate QR codes with production URLs
- [ ] Deploy to Vercel (see DEPLOYMENT.md)
- [ ] Test deployed app on phone
- [ ] Print and distribute QR codes
- [ ] Train staff on dashboard
- [ ] Set up email alerts (optional - Phase 2)

---

## 💡 Tips for Success

1. **Start Small:** Test with 1 branch first
2. **Monitor Daily:** Check dashboard every morning
3. **Respond Fast:** Address negative feedback within 24 hours
4. **Iterate:** Improve based on patterns in comments
5. **Promote:** Remind customers to leave feedback

---

## 📞 Need Help?

- **Check README.md** for detailed documentation
- **Check DEPLOYMENT.md** for production setup
- **Check browser console** for error messages (F12)
- **Check Supabase logs** in dashboard → Logs section

---

## 🎓 Learning Resources

New to Next.js or Supabase?

- [Next.js Tutorial](https://nextjs.org/learn)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [React Basics](https://react.dev/learn)

---

**You're all set! Start collecting feedback and improving your business.** 🚀
