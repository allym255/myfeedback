# Localizer MVP - Customer Feedback System

Real-time customer feedback collection and analytics platform for hospitality businesses (restaurants, cafes, airport lounges).

---

## 🎯 Features

### Customer-Facing
- ✅ Mobile-first feedback form (no login required)
- ✅ QR code access per branch
- ✅ 4 rating categories (Overall, Speed, Staff, Cleanliness)
- ✅ Optional text comments
- ✅ Auto-detect shift (morning/afternoon/evening)
- ✅ Instant submission to database

### Manager Dashboard
- ✅ Real-time KPI metrics
- ✅ Rating trends (daily/weekly/monthly)
- ✅ Category breakdowns
- ✅ Recent feedback feed
- ✅ Negative feedback alerts (≤2 stars)
- ✅ Filter by time period
- ✅ Toggle negative-only view

### Admin Tools
- ✅ QR code generator per branch
- ✅ Branch management
- ✅ RESTful API endpoints

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### 2. Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name and password

2. **Run the database schema:**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `supabase-schema.sql`
   - Click "Run"
   - Wait for success message

3. **Get your credentials:**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
localizer-mvp/
├── app/
│   ├── api/
│   │   ├── feedback/route.ts      # POST/GET feedback
│   │   └── analytics/route.ts     # GET analytics
│   ├── admin/
│   │   └── qr-codes/page.tsx      # QR code generator
│   ├── dashboard/page.tsx         # Manager dashboard
│   ├── feedback/page.tsx          # Customer form
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── lib/
│   └── supabase.ts                # Supabase client
├── supabase-schema.sql            # Database schema
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Tables

**branches**
- `id` (UUID, primary key)
- `name` (text)
- `location` (text)
- `created_at` (timestamp)

**feedback**
- `id` (UUID, primary key)
- `branch_id` (UUID, foreign key → branches)
- `overall_rating` (integer 1-5)
- `service_speed` (integer 1-5)
- `staff_friendliness` (integer 1-5)
- `cleanliness` (integer 1-5)
- `comment` (text, nullable)
- `shift` (enum: morning/afternoon/evening)
- `created_at` (timestamp)

**users** (for future authentication)
- `id` (UUID, primary key)
- `name` (text)
- `email` (text, unique)
- `role` (enum: admin/manager)
- `branch_id` (UUID, nullable)
- `created_at` (timestamp)

---

## 🔌 API Endpoints

### POST `/api/feedback`

Submit new feedback.

**Request:**
```json
{
  "branch_id": "uuid",
  "overall_rating": 5,
  "service_speed": 4,
  "staff_friendliness": 5,
  "cleanliness": 4,
  "comment": "Great service!",
  "shift": "morning"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* feedback object */ }
}
```

### GET `/api/feedback`

Retrieve feedback with optional filters.

**Query Parameters:**
- `branch_id` (optional) - Filter by branch
- `low_rating=true` (optional) - Only negative feedback (≤2)
- `limit` (optional) - Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [ /* feedback array */ ],
  "count": 10
}
```

### GET `/api/analytics`

Get aggregated analytics.

**Query Parameters:**
- `branch_id` (optional)
- `period` (optional) - today/week/month (default: today)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_responses": 47,
    "avg_overall": "4.2",
    "avg_speed": "4.5",
    "avg_staff": "4.7",
    "avg_cleanliness": "3.9",
    "negative_count": 4,
    "negative_percentage": "8.5",
    "by_shift": { /* shift breakdown */ },
    "trend": [ /* daily averages */ ]
  }
}
```

---

## 🎨 Usage Flows

### Customer Journey

1. **Scan QR code** at table/counter
2. **Redirected to:** `/feedback?branch=<branch_id>`
3. **Rate experience** (1-5 stars across 4 categories)
4. **Submit** → stored in database
5. **Thank you screen** → done!

**Time to complete:** ~30 seconds

### Manager Journey

1. **Visit dashboard:** `/dashboard`
2. **View metrics:**
   - Average ratings
   - Total responses
   - Negative feedback %
3. **Filter by period** (today/week/month)
4. **Review recent comments**
5. **Toggle negative-only** to prioritize issues

---

## 🚨 Alert System

### Current Implementation

When `overall_rating ≤ 2`:
- Feedback is flagged in database
- Appears with red alert badge in dashboard
- Console log: `🚨 NEGATIVE FEEDBACK ALERT`

### Phase 2 Enhancement (TODO)

Implement via Supabase Edge Function:

```typescript
// supabase/functions/alert-negative-feedback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { record } = await req.json()
  
  if (record.overall_rating <= 2) {
    // Send email via Resend API
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'alerts@localizer.app',
        to: 'manager@yourcompany.com',
        subject: '🚨 Negative Feedback Alert',
        html: `<p>New negative feedback received: ${record.comment}</p>`
      })
    })
  }
  
  return new Response('OK')
})
```

**Trigger:** Database webhook on `feedback` INSERT

---

## 🎯 QR Code Generation

### How to Create QR Codes

1. Visit `/admin/qr-codes`
2. View all branches
3. Click "Download QR Code" for each branch
4. Print and place at customer touchpoints

### QR Code Format

- **Size:** 300x300px
- **URL:** `https://yourapp.com/feedback?branch=<branch_id>`
- **Color:** Primary brand color (#1D9E75)
- **Format:** PNG with transparent background

### Printing Tips

- **Material:** Laminated plastic or acrylic stand
- **Size:** Minimum 3x3 inches (7.5cm)
- **Placement:**
  - On tables (table tents)
  - At checkout counters
  - On receipts
  - In restrooms

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/localizer-mvp.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-app.vercel.app`

### Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `feedback.yourcompany.com`)
4. Update DNS records as instructed

---

## 📊 Analytics Explained

### Key Metrics

**Average Rating**
- Overall customer satisfaction score (1-5)
- Target: ≥4.0

**Total Responses**
- Number of submissions in selected period
- Tracks engagement

**Negative Feedback %**
- Percentage of ratings ≤2 stars
- Target: <10%

**Response Rate**
- (Total submissions / Total customers) × 100
- Industry average: 15-25%

### Rating Categories

| Category | What It Measures |
|----------|------------------|
| **Overall** | General satisfaction |
| **Service Speed** | Wait time, efficiency |
| **Staff Friendliness** | Customer service quality |
| **Cleanliness** | Hygiene, presentation |

---

## 🔐 Security & Privacy

### Row Level Security (RLS)

Supabase RLS policies protect data:

```sql
-- Anyone can submit feedback (no auth)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read feedback
CREATE POLICY "Authenticated users can view feedback" ON feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

### Data Protection

- Customer submissions are **anonymous**
- No personal data collected
- IP addresses not logged
- GDPR compliant

### Future: Manager Authentication

To restrict dashboard access:

1. Enable Supabase Auth
2. Add login page
3. Protect routes with middleware
4. Assign managers to specific branches

---

## 🛠️ Development

### Add a New Branch

```sql
INSERT INTO branches (name, location) VALUES 
  ('New Branch Name', 'Address Here');
```

Or use the Supabase dashboard table editor.

### Test Feedback Submission

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "123e4567-e89b-12d3-a456-426614174000",
    "overall_rating": 5,
    "service_speed": 5,
    "staff_friendliness": 5,
    "cleanliness": 4,
    "comment": "Test feedback",
    "shift": "morning"
  }'
```

---

## 📈 Roadmap (Phase 2)

- [ ] **Staff-level tracking** - Rate individual employees
- [ ] **SMS/WhatsApp alerts** - Real-time manager notifications
- [ ] **AI sentiment analysis** - Auto-categorize comments
- [ ] **Multi-branch comparison** - Side-by-side analytics
- [ ] **Customer loyalty tracking** - Repeat visitor insights
- [ ] **Email reports** - Weekly summary to managers
- [ ] **Export to CSV** - Download feedback data
- [ ] **Multi-language support** - Arabic + English

---

## 🐛 Troubleshooting

### "Failed to fetch branches"

**Cause:** Supabase credentials missing or incorrect

**Fix:**
1. Check `.env.local` exists and has correct values
2. Verify Supabase project is active
3. Check RLS policies allow public read on `branches` table

### "Feedback not appearing in dashboard"

**Cause:** RLS blocking authenticated reads

**Fix:**
```sql
-- Run in Supabase SQL editor
CREATE POLICY "Allow public read feedback" ON feedback
  FOR SELECT USING (true);
```

### QR codes not generating

**Cause:** Browser blocking canvas operations

**Fix:** Test in different browser or check console for errors

---

## 📞 Support

For issues or questions:
- 📧 Email: support@yourcompany.com
- 📖 Documentation: [docs.localizer.app](https://docs.localizer.app)
- 💬 Discord: [discord.gg/localizer](https://discord.gg/localizer)

---

## 📄 License

MIT License - Free to use and modify

---

## 🙏 Credits

Built with:
- [Next.js 14](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Chart.js](https://www.chartjs.org)
- [QRCode](https://www.npmjs.com/package/qrcode)

---

**Made with ❤️ for hospitality businesses**
