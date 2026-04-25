# 🚀 INSTALLATION GUIDE - START HERE

## 📦 What You Downloaded

A complete, production-ready **Localizer MVP** - Customer Feedback System

**19 files** including:
- ✅ Full Next.js application
- ✅ Database schema
- ✅ API endpoints  
- ✅ Manager dashboard
- ✅ Customer feedback form
- ✅ QR code generator
- ✅ Complete documentation

---

## ⚡ Quick Start (10 Minutes)

### Step 1: Extract Files
```bash
# Extract the archive
tar -xzf localizer-mvp.tar.gz

# Enter directory
cd localizer-mvp
```

### Step 2: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: `localizer-mvp`
4. Set database password (save it!)
5. Choose region (closest to you)
6. Wait 2 minutes for setup

### Step 3: Set Up Database
1. In Supabase dashboard → **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste and click **Run**
5. Wait for: ✅ Database schema created!

### Step 4: Get Credentials
1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local - paste your credentials
# (Use any text editor)
```

Your `.env.local` should look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

### Step 7: Start Development Server
```bash
npm run dev
```

**Output:**
```
▲ Next.js 14.1.0
- Local: http://localhost:3000
✓ Ready in 2.1s
```

### Step 8: Test It!
1. Open browser: [http://localhost:3000](http://localhost:3000)
2. Click "Customer Feedback"
3. Rate all categories
4. Submit feedback
5. Go back and click "Manager Dashboard"
6. See your feedback appear!

---

## 📂 Project Structure

```
localizer-mvp/
├── 📄 README.md              ← Full documentation
├── 📄 QUICKSTART.md          ← This file (detailed)
├── 📄 DEPLOYMENT.md          ← Production deployment
├── 📄 PROJECT-SUMMARY.md     ← Feature overview
├── 
├── app/                      ← Next.js pages
│   ├── page.tsx              ← Home page
│   ├── feedback/page.tsx     ← Customer form
│   ├── dashboard/page.tsx    ← Manager dashboard
│   ├── admin/qr-codes/       ← QR generator
│   └── api/                  ← API routes
│       ├── feedback/
│       └── analytics/
├── 
├── lib/
│   └── supabase.ts           ← Database client
├── 
├── 🗄️ supabase-schema.sql   ← Database setup
├── 📧 supabase-edge-function-alert.ts  ← Email alerts (Phase 2)
├── 
└── ⚙️ Config files
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    └── tailwind.config.js
```

---

## 🎯 What Each File Does

### Core Application Files

**`app/page.tsx`** - Home Page
- Navigation to feedback form and dashboard
- Quick links to admin tools

**`app/feedback/page.tsx`** - Customer Feedback Form
- Mobile-first star rating interface
- Auto-detects branch from URL parameter
- Submits to Supabase database
- Shows thank you screen

**`app/dashboard/page.tsx`** - Manager Dashboard
- Real-time analytics and KPIs
- Charts showing trends
- Recent feedback feed
- Negative feedback alerts

**`app/admin/qr-codes/page.tsx`** - QR Code Generator
- Generates QR codes for each branch
- Download as PNG files
- Copy direct URLs

**`app/api/feedback/route.ts`** - Feedback API
- POST: Submit new feedback
- GET: Retrieve feedback (with filters)
- Validation and error handling

**`app/api/analytics/route.ts`** - Analytics API
- Aggregated metrics calculation
- Filter by date range and branch
- Returns JSON data for dashboard

### Database & Infrastructure

**`supabase-schema.sql`** - Complete Database Setup
- Creates 3 tables (branches, feedback, users)
- Sets up indexes for performance
- Enables Row Level Security
- Includes sample data

**`lib/supabase.ts`** - Database Client
- Supabase connection
- TypeScript types
- Reusable client instance

### Configuration Files

**`package.json`** - Dependencies
- Next.js, React, TypeScript
- Supabase client
- Chart.js, QRCode
- Tailwind CSS

**`.env.example`** - Environment Template
- Shows required environment variables
- Copy to `.env.local` and fill in

**`next.config.js`** - Next.js Configuration
**`tsconfig.json`** - TypeScript Settings
**`tailwind.config.js`** - Styling Configuration
**`postcss.config.js`** - CSS Processing

### Documentation

**`README.md`** - Main Documentation (41 pages!)
- Complete feature documentation
- API reference
- Database schema
- Security settings
- Troubleshooting

**`QUICKSTART.md`** - 10-Minute Setup Guide
- Step-by-step instructions
- Troubleshooting tips
- Testing guide

**`DEPLOYMENT.md`** - Production Deployment
- Vercel deployment guide
- Custom domain setup
- SSL configuration
- Monitoring setup

**`PROJECT-SUMMARY.md`** - Project Overview
- Feature list
- Tech stack
- Roadmap
- Cost breakdown

---

## 🗄️ Database Tables Explained

### `branches` Table
Stores your business locations.

**Example:**
| id | name | location |
|----|------|----------|
| uuid-001 | Downtown Cafe | Dubai Mall, Ground Floor |
| uuid-002 | Airport Lounge | Terminal 3, Gate A12 |

**Usage:** Customer selects branch via QR code

---

### `feedback` Table
Stores all customer submissions.

**Example:**
| id | branch_id | overall_rating | service_speed | staff_friendliness | cleanliness | comment | shift | created_at |
|----|-----------|----------------|---------------|-------------------|-------------|---------|-------|-----------|
| uuid-101 | uuid-001 | 5 | 5 | 5 | 4 | "Amazing!" | morning | 2024-01-15 09:30 |
| uuid-102 | uuid-001 | 2 | 2 | 3 | 2 | "Slow service" | afternoon | 2024-01-15 14:20 |

**Usage:** Powers dashboard analytics

---

### `users` Table
For manager/admin authentication (Phase 2).

**Example:**
| id | name | email | role | branch_id |
|----|------|-------|------|-----------|
| uuid-201 | John Manager | john@cafe.com | manager | uuid-001 |
| uuid-202 | Sarah Admin | sarah@cafe.com | admin | NULL |

**Usage:** Restrict dashboard access per branch

---

## 🔗 URL Structure

### Customer URLs (via QR Code)
```
https://yourapp.com/feedback?branch=BRANCH_UUID
```

**Example:**
```
https://yourapp.com/feedback?branch=123e4567-e89b-12d3-a456-426614174000
```

This pre-selects the branch and loads the feedback form.

### Manager URLs
```
https://yourapp.com/dashboard
```

Open dashboard to view all feedback.

### Admin URLs
```
https://yourapp.com/admin/qr-codes
```

Generate and download QR codes.

---

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR',  // Main brand color
    600: '#DARKER_SHADE', // Hover state
  }
}
```

### Add Your Branches

Two options:

**Option 1: Supabase Dashboard**
1. Go to Supabase → Table Editor
2. Select `branches` table
3. Click "Insert" → "Insert row"
4. Fill in name and location

**Option 2: SQL Editor**
```sql
INSERT INTO branches (name, location) VALUES 
  ('Your Branch Name', 'Your Address Here');
```

### Change Form Questions

Edit `app/feedback/page.tsx`:
- Add/remove `<StarRating>` components
- Update database schema to match
- Update API validation

---

## 🚀 Deploy to Production

### Quick Deploy to Vercel (Free)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/localizer-mvp.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! Live at `https://your-app.vercel.app`

3. **Generate Production QR Codes:**
   - Visit `https://your-app.vercel.app/admin/qr-codes`
   - Download QR codes (now pointing to production)
   - Print and distribute

**Full deployment guide:** See `DEPLOYMENT.md`

---

## 📊 Understanding the Dashboard

### KPI Cards

**Average Rating** (4.2)
- Overall customer satisfaction
- Target: ≥4.0
- Calculated from all feedback in selected period

**Total Responses** (47)
- Number of submissions
- Shows engagement level
- Compare across time periods

**Negative Feedback** (8.5%)
- Percentage of ratings ≤2 stars
- Target: <10%
- Requires immediate action

**Response Rate** (23%)
- Estimated participation
- Industry average: 15-25%
- Increases with QR code visibility

### Ratings by Category

Shows average for each rating category:
- Overall Experience
- Service Speed
- Staff Friendliness
- Cleanliness

**Use this to identify specific improvement areas.**

### Rating Trend Chart

7-day line chart showing daily average ratings.
- Spot patterns (weekday vs weekend)
- Track improvement over time
- Correlate with operational changes

### Recent Feedback Feed

Live feed of customer comments.
- Sorted by newest first
- Red highlighting for negative feedback (≤2)
- Includes shift and timestamp

**Action:** Respond to negative feedback within 24 hours.

---

## 🚨 Handling Negative Feedback

When a customer gives ≤2 stars:

### Immediate Actions (Within 24 Hours)

1. **Acknowledge the Issue**
   - Review comment carefully
   - Identify specific problem (speed, staff, cleanliness)

2. **Take Corrective Action**
   - Brief staff on issue
   - Implement immediate fix if possible
   - Document the incident

3. **Follow Up (Optional)**
   - If customer left contact info
   - Apologize and explain resolution
   - Offer compensation if appropriate

### Long-Term Actions

1. **Track Patterns**
   - Same issues repeatedly?
   - Specific shift/time of day?
   - Staffing problems?

2. **Implement Solutions**
   - Training for staff
   - Process improvements
   - Equipment upgrades

3. **Measure Impact**
   - Monitor ratings over next week
   - Did the issue decrease?
   - Adjust as needed

---

## 🎯 Best Practices

### QR Code Placement

**High-Visibility Locations:**
- Table tents (every table)
- Checkout counter
- Receipts (printed QR)
- Restroom mirrors
- Exit doors
- Wi-Fi password cards

**Pro Tips:**
- Include text: "Scan to share feedback"
- Make QR code large (min 3x3 inches)
- Laminate for durability
- Test scannability before printing

### Encouraging Feedback

**Staff Training:**
- Mention at checkout: "We'd love your feedback!"
- Don't pressure customers
- Be genuine and friendly

**Incentives (Optional):**
- "Share feedback, get 10% off next visit"
- Monthly prize draw for respondents
- Free coffee/dessert for completing survey

**Don't:**
- Beg for 5-star ratings
- Offer incentives for positive reviews only
- Ignore negative feedback

### Daily Dashboard Routine

**Morning Check (5 minutes):**
1. Open dashboard
2. Check yesterday's average rating
3. Read new negative feedback
4. Note any patterns

**Weekly Review (30 minutes):**
1. Compare week-over-week trends
2. Identify improvement areas
3. Share wins with staff
4. Plan corrective actions

**Monthly Report:**
1. Export data to spreadsheet
2. Create report for management
3. Set goals for next month
4. Celebrate improvements

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Failed to fetch branches"
**Check:**
1. Is `.env.local` in project root?
2. Are credentials correct?
3. Is Supabase project active?
4. Run: `cat .env.local` to verify

### "Build failed" on Vercel
**Fix:**
1. Test locally first: `npm run build`
2. Fix any TypeScript errors
3. Check all environment variables set in Vercel
4. Retry deployment

### QR codes not scanning
**Fix:**
1. Increase QR code size
2. Print on white background
3. Ensure good lighting
4. Test with multiple phone cameras

### Dashboard shows no data
**Check:**
1. Have you submitted test feedback?
2. Time period filter (try "This Week")
3. Browser console for errors (F12)
4. Database permissions in Supabase

---

## 📞 Need Help?

### Documentation Files
1. **README.md** - Full reference (check this first!)
2. **This file** - Setup and basics
3. **DEPLOYMENT.md** - Production deployment
4. **PROJECT-SUMMARY.md** - Feature overview

### Community Resources
- Next.js Discord
- Supabase Discord
- Stack Overflow (tag: nextjs, supabase)

### Professional Support
- Hire a developer on Upwork/Fiverr
- Anthropic Claude (ask me anything!)

---

## ✅ Final Checklist

### Before First Use
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] App runs locally (npm run dev)
- [ ] Test feedback submission works
- [ ] Dashboard shows submitted feedback
- [ ] QR codes generated

### Before Production Launch
- [ ] Real branch data added
- [ ] Sample/test data removed
- [ ] Deployed to Vercel
- [ ] Production QR codes generated
- [ ] QR codes printed and distributed
- [ ] Staff trained on dashboard
- [ ] Monitoring enabled

---

## 🎉 You're Ready!

Everything is set up and ready to collect customer feedback.

**Next Steps:**
1. Test locally (5 min)
2. Add your real branches (5 min)
3. Deploy to Vercel (10 min)
4. Generate production QR codes (5 min)
5. Print and distribute (1 day)
6. Start collecting feedback! 🚀

**Questions?** Check README.md or ask Claude!

---

**Built with ❤️ for your success**

*Happy feedback collecting!*
