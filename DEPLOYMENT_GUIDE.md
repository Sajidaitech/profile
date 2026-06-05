# sajidmk.com — Deployment & Migration Guide
**Version 2.0 · June 2026**

---

## What Changed in This Update

This update delivers a complete **mobile and responsive overhaul** across all pages, plus admin dashboard improvements. No content, branding, database schema, or Supabase integration logic was changed.

---

## 1. Updated Project Structure

```
sajidmk.com/
├── index.html               ✅ (unchanged — responsive fixes via styles.css)
├── admin-dashboard.html     ✅ UPDATED — mobile sidebar + overlay
├── styles.css               ✅ UPDATED — comprehensive responsive patch appended
├── script.js                ✅ (unchanged)
├── contact-form.js          ✅ (unchanged)
├── supabase-client.js       ✅ (unchanged)
├── security.js              ✅ (unchanged)
├── performance.js           ✅ (unchanged)
├── seo-structured-data.js   ✅ (unchanged)
├── robots.txt               ✅ (unchanged)
├── sitemap.xml              ✅ (unchanged)
├── Run_the_Database_Schema.sql             ✅ (unchanged)
└── Open_a_New_Query_Tab_to_Add_Security_and_Seed_Data.sql  ✅ (unchanged)
```

---

## 2. Responsive Testing — What Was Fixed

### Mobile (< 768px)
| Area | Issue | Fix |
|------|-------|-----|
| Hero | 3-column layout broke on phones | Stacks to 1-col: portrait → chips → content |
| Hero KPIs | Single row overflowed on 375px | 2×2 grid on mobile |
| Hero CTAs | Side-by-side buttons too narrow | Stack vertically |
| Navigation | Nav links visible on mobile | Hidden; hamburger menu shown |
| Glass cards | `minmax(320px)` too wide for 375px phones | 1-col on ≤500px |
| Projects | 3-col broke on 375px | 1-col + card padding reduced |
| Arsenal | Multi-col overflowed | 1-col, reduced padding |
| Certifications | 2-col squished on small screens | 1-col on ≤480px |
| Contact section | 2-col engage panel clipped | 1-col stack, CTAs full-width |
| Section spacing | 72px section pad too tall → blank gaps | Reduced to `clamp(28px, 5vw, 44px)` |
| Footer | Horizontal overflow | Stack to column |
| FAB | Overlapped mobile sticky bar | Raised above sticky bar |
| PDF Modal | Partial screen on mobile | Full-screen (100dvh) |
| Image lightbox | Partial screen on mobile | Full-screen (100dvh) |
| Chip pill (hero) | Overflow on 320px phones | Min font size 9.5px, tight padding |

### Tablet (768px–1023px)
| Area | Issue | Fix |
|------|-------|-----|
| Hero | 3-col showed portrait too small | 2-col with named grid areas |
| Navigation | Desktop links shown but cramped | Hidden → hamburger on ≤1023px |
| Glass cards | 3-col too tight | 2-col on tablet |
| Projects | 3-col cramped | 2-col on tablet |
| Arsenal | 2-col too tight on 768px | 2-col maintained with better gap |
| Certifications | 2-col vs 3-col conflict | 3-col on tablet |
| Experience tabs | No visible scroll indicator | Horizontal scroll with snap |

### Admin Dashboard
| Area | Issue | Fix |
|------|-------|-----|
| Sidebar | `display:none` on menu button → no way to open sidebar | Button now visible; proper toggle |
| Sidebar | No overlay/backdrop on mobile | Dark overlay added behind sidebar |
| Sidebar | Close on nav item tap (mobile UX) | Auto-close after navigation |
| Tables | No horizontal scroll → clipped on mobile | `overflow-x: auto` on `.table-wrap` |
| Stats grid | 4-col collapsed badly | 2×2 on ≤900px, 1-col on ≤420px |
| Page padding | 28px padding too wide on phones | Reduced to 16px on ≤900px |
| Modal | Top-centered modal cut off on small phones | Slides up from bottom on mobile |

---

## 3. Environment Variable Setup

### Frontend (Public)
Place your Supabase anon key in both files:

**`supabase-client.js` (line 21):**
```js
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**`admin-dashboard.html` (near top of `<script>` block):**
```js
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**`contact-form.js`:**
```js
const TELEGRAM_BOT_TOKEN = 'your-telegram-bot-token';
const TELEGRAM_CHAT_ID   = 'your-chat-id';
```

> ⚠️ Never commit the anon key to a public repo. Use environment injection if deploying via CI/CD.

### Netlify / Vercel Environment Injection (Optional)
If using a build step, replace keys with environment variable placeholders and inject at build time:
```
SUPABASE_ANON_KEY=eyJ...
TELEGRAM_BOT_TOKEN=123...
TELEGRAM_CHAT_ID=456...
```

---

## 4. Deployment Guide

### Option A — Static File Hosting (Netlify / Vercel)

1. **Upload all files** from this folder to your Netlify/Vercel project root.
2. **Set custom headers** in `netlify.toml` or `vercel.json`:

**netlify.toml:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(self)"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com cdnjs.cloudflare.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: blob: tbdgrhekycgfdeatxjnq.supabase.co; connect-src 'self' tbdgrhekycgfdeatxjnq.supabase.co api.openweathermap.org ipapi.co api.telegram.org; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"

[[redirects]]
  from = "/admin"
  to = "/admin-dashboard.html"
  status = 200
  force = false
```

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    }
  ]
}
```

3. **DNS**: Point `sajidmk.com` to Netlify/Vercel name servers.
4. **Custom domain**: Add `sajidmk.com` + `www.sajidmk.com` in the dashboard.
5. **HTTPS**: Auto-provisioned (Let's Encrypt).

### Option B — GitHub Pages

1. Push files to a repo (e.g. `sajidmk/sajidmk.github.io`).
2. Enable Pages → root of `main` branch.
3. Add CNAME file: `sajidmk.com`
4. ⚠️ GitHub Pages does not support custom HTTP headers — use a Cloudflare proxy for security headers.

---

## 5. Supabase Setup (if not done already)

### Step 1 — Run Schema
In your Supabase project → SQL Editor → New Query:
1. Paste and run: `Run_the_Database_Schema.sql`
2. Open another query tab, paste and run: `Open_a_New_Query_Tab_to_Add_Security_and_Seed_Data.sql`

### Step 2 — Storage Bucket
1. Supabase → Storage → New Bucket
2. Name: `portfolio-assets`
3. Set to **Public**
4. Add policy: authenticated users can INSERT

### Step 3 — Admin User
1. Supabase → Authentication → Users → Add User
2. Use your personal email + strong password
3. This is the only login for the admin dashboard

### Step 4 — Script Order in index.html
Ensure this order in `<head>` (already correct in delivered files):
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js" defer></script>
<script src="supabase-client.js" defer></script>
<script src="script.js" defer></script>
```

---

## 6. Migration Checklist

### Before Deploying
- [ ] Replace `YOUR_SUPABASE_ANON_KEY` in `supabase-client.js`
- [ ] Replace `YOUR_SUPABASE_ANON_KEY` in `admin-dashboard.html`
- [ ] Replace Telegram credentials in `contact-form.js`
- [ ] Run both SQL files in Supabase (schema first, then seed)
- [ ] Create `portfolio-assets` storage bucket (public)
- [ ] Create admin user in Supabase Authentication

### After Deploying
- [ ] Test site on real mobile device (iPhone + Android)
- [ ] Test site on tablet (iPad or equivalent)
- [ ] Test admin dashboard on mobile: sidebar opens/closes
- [ ] Test contact form submission end-to-end
- [ ] Verify Telegram notification arrives
- [ ] Check Supabase → Table Editor → `contact_messages` for test entry
- [ ] Test PDF modal on mobile (full-screen)
- [ ] Test image lightbox on mobile (full-screen)
- [ ] Run Google PageSpeed (target: 90+ mobile, 95+ desktop)
- [ ] Validate structured data: https://search.google.com/test/rich-results
- [ ] Submit sitemap to Google Search Console: `https://sajidmk.com/sitemap.xml`
- [ ] Confirm robots.txt accessible: `https://sajidmk.com/robots.txt`
- [ ] Verify HTTPS is active and redirects HTTP → HTTPS
- [ ] Check security headers: https://securityheaders.com

---

## 7. Complete Changelog — v2.0 (June 2026)

### styles.css
- **Appended** ~700-line responsive overhaul block
- Hero: 1-col mobile stack (portrait → chips → content)
- Hero: 2-col tablet layout using named grid areas
- Hero KPIs: 2×2 grid on mobile instead of horizontal strip
- Hero CTAs: Full-width vertical stack on mobile
- Hero name: Fluid font-size clamp from 22px (320px) to 52px (desktop)
- Glass cards: 1-col on ≤500px, 2-col on ≤767px, 3-col on desktop
- Projects: 1-col mobile, 2-col tablet, 3-col desktop
- Arsenal: 1-col mobile, 2-col tablet
- Experience tabs: Horizontal scroll with snap on mobile
- Certifications: 1-col ≤480px, 2-col ≤767px, 3-col tablet
- Contact/Engage: Full-width stack on mobile
- Footer: Column stack on mobile
- Section padding: Reduced from 72px to `clamp(28px, 5vw, 44px)` on mobile
- FAB: Raised above sticky bar with `env(safe-area-inset-bottom)`
- PDF modal: 100dvh full-screen on mobile
- Image lightbox: 100dvh full-screen on mobile
- Overflow guards: `word-break: break-word` on text-heavy elements
- Added `min-width: 0` globally for flex/grid overflow prevention
- Chip pill: 9.5px min-size on 360px screens

### admin-dashboard.html
- **Sidebar overlay** (`#sidebarOverlay`): dark backdrop added for mobile
- **Menu button**: Removed `display:none` inline style → controlled by CSS media query
- **`toggleSidebar()`**: New function replacing inline toggle
- **`closeSidebar()`**: New function for overlay click + nav item tap
- **`showPage()`**: Auto-calls `closeSidebar()` on mobile after navigation
- **Table overflow**: `overflow-x: auto` + `min-width: 560px` on tables
- **Stats grid**: 2-col on ≤900px, 2-col on ≤600px, 1-col on ≤420px
- **Page padding**: Reduced to 16px on ≤900px
- **Modal**: Slides from bottom on mobile (bottom-sheet pattern)
- **Auth card**: Reduced padding on small screens
- **Table toolbar**: Stack vertically on ≤600px

