# Netlify Cleanup - Remove Legacy References

**Issue:** App used to be hosted on Netlify, now on Firebase. Need to remove all Netlify references to avoid issues.

---

## Netlify References Found

### 🔴 CRITICAL - Needs Fixing

#### 1. **NewsFeed.tsx:59** - RSS Feed API Call
**File:** [src/components/NewsFeed.tsx:59](src/components/NewsFeed.tsx#L59)

**Current Code:**
```typescript
const response = await fetch('/.netlify/functions/rss-proxy');
```

**Problem:**
- Calls Netlify serverless function that doesn't exist anymore
- This is why Industry News tab doesn't work!

**Fix:**
Replace with Firebase Cloud Function endpoint:
```typescript
const response = await fetch('/api/getRSSFeed');
// OR use full URL:
const response = await fetch('https://us-central1-{PROJECT_ID}.cloudfunctions.net/api/getRSSFeed');
```

**Backend Endpoint Needed:**
Create new endpoint in Phase 2: `GET /api/getRSSFeed`
- Fetches RSS feeds from industry sources
- Returns aggregated articles as JSON
- Cache for 24 hours (reduce API calls)

---

### ⚠️ MINOR - Legacy Config

#### 2. **tsconfig.json:29** - Includes Non-Existent Directory
**File:** [tsconfig.json:29](tsconfig.json#L29)

**Current Code:**
```json
"include": ["src", "netlify/**/*.ts"]
```

**Problem:**
- References `netlify/**/*.ts` directory that doesn't exist
- Harmless but causes confusion

**Fix:**
```json
"include": ["src"]
```

---

#### 3. **tsconfig.functions.json:17** - Includes Non-Existent Directory
**File:** [tsconfig.functions.json:17](tsconfig.functions.json#L17)

**Current Code:**
```json
"include": [
  "netlify/functions/**/*.ts",
  "services/**/*.ts",
  "utils/**/*.ts",
  "types.ts",
  "constants.ts"
]
```

**Problem:**
- References `netlify/functions/**/*.ts` directory that doesn't exist
- File is for legacy build system

**Fix:**
Delete this file entirely - it's not used with new Firebase Functions architecture

---

## Implementation Plan

### Phase 1 (Preparation):
- [ ] Add to cleanup checklist: Remove Netlify references

### Phase 2 (Backend Scaffold):
- [ ] **Add new endpoint:** `GET /api/getRSSFeed`
  - Fetch RSS from industry sources (Nation's Restaurant News, Restaurant Business, QSR, etc.)
  - Parse RSS feeds
  - Return aggregated JSON
  - Cache results for 24 hours

### Phase 3 (Configuration Updates):
- [ ] **Fix NewsFeed.tsx:59:**
  ```typescript
  // Replace Netlify endpoint with Firebase
  const response = await fetch('/api/getRSSFeed');
  ```

- [ ] **Fix tsconfig.json:29:**
  ```json
  "include": ["src"]
  ```

- [ ] **Delete tsconfig.functions.json**
  - No longer needed with new Firebase Functions architecture

### Phase 11 (Industry News Page):
- [ ] **Verify NewsFeed.tsx works:**
  - UI stays exactly the same (grid layout, cards, modal)
  - Backend now uses Firebase Cloud Function
  - RSS feeds load successfully
  - Category filtering works
  - Fullscreen modal works

---

## NewsFeed.tsx - Design Preservation

**Current Design (KEEP AS-IS):**
- ✅ Beautiful card-based grid layout (responsive: 1 col → 2 col → 3 col)
- ✅ Source name badges (cyan)
- ✅ Hover effects on cards
- ✅ Category filter buttons at top
- ✅ Click card → Opens modal with full article
- ✅ Modal has fullscreen toggle
- ✅ "Read Full Article" external link button
- ✅ Loading animation (3 pulsing dots)
- ✅ Error handling display
- ✅ Framer Motion animations

**What Changes:**
- ❌ Only line 59: API endpoint URL
- ✅ Everything else: UNCHANGED

**UI is 100% complete and beautiful - don't touch it!**

---

## RSS Feed Sources (for Backend Endpoint)

**Industry News Sources:**
1. **Nation's Restaurant News** - https://www.nrn.com/rss.xml
2. **Restaurant Business Online** - https://www.restaurantbusinessonline.com/rss.xml
3. **QSR Magazine** - https://www.qsrmagazine.com/rss.xml
4. **Modern Restaurant Management** - https://modernrestaurantmanagement.com/feed/
5. **Food & Wine (Restaurant Section)** - https://www.foodandwine.com/syndication/rss

**Backend Implementation:**
```typescript
// GET /api/getRSSFeed
app.get('/getRSSFeed', async (req, res) => {
  try {
    const sources = [
      'https://www.nrn.com/rss.xml',
      'https://www.restaurantbusinessonline.com/rss.xml',
      'https://www.qsrmagazine.com/rss.xml',
      // ... etc
    ];

    // Fetch all RSS feeds in parallel
    const allArticles = await Promise.all(
      sources.map(url => fetchAndParseRSS(url))
    );

    // Flatten, sort by date, limit to 50 most recent
    const articles = allArticles
      .flat()
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 50);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
});
```

---

## Success Criteria

### After Netlify Cleanup:
- ✅ No references to "netlify" anywhere in src/ code
- ✅ No references to "netlify" in tsconfig files
- ✅ tsconfig.functions.json deleted (not needed)
- ✅ NewsFeed.tsx calls Firebase endpoint
- ✅ Industry News tab loads articles successfully
- ✅ UI looks exactly the same (grid, cards, modal, animations)
- ✅ No errors in console related to Netlify

---

**Status:** Ready to implement in rebuild (Phase 2 + Phase 3 + Phase 11)
