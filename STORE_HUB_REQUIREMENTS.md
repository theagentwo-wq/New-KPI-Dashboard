# Store Hub / Location Insights Modal - Detailed Requirements

## Overview
The Store Hub is the **definitive information and action resource** for each store location. It provides AI-powered insights across 6 tabs, integrating Google Maps, weather, performance data, and local market intelligence.

## Tab 1: Details & Photos ✅ WORKING

**Current Implementation:** Uses Google Places API to fetch location details
- Store name, rating, reviews, photos
- Displays in carousel format

**Status:** ✅ Complete - no changes needed

## Tab 2: Street View ✅ WORKING

**Current Implementation:** Google Street View embedded iframe
- Uses store coordinates from Google Places
- Falls back to "unavailable" message if no street view

**Status:** ✅ Complete - no changes needed

## Tab 3: Reviews & Buzz ⚠️ NEEDS FIX

**Current Behavior:** Auto-loads when page opens ❌
**Required Behavior:** User must click "Generate Analysis" button ✅

### Implementation Fix:
**File:** [LocationInsightsModal.tsx:180-190](src/components/LocationInsightsModal.tsx#L180-L190)

**Remove auto-load logic:**
```typescript
// REMOVE THIS useEffect that auto-loads reviews
useEffect(() => {
    if (isOpen && placeDetails) {
        if (placeDetails.reviews && placeDetails.reviews.length > 0) {
            if (!analysisContent.reviews) {
                handleAnalysis('reviews', placeDetails); // ❌ REMOVE AUTO-LOAD
            }
        }
    }
}, [isOpen, placeDetails, analysisContent.reviews, handleAnalysis]);
```

### Backend API: `POST /api/getReviewSummary`

**Input:**
- Location name (e.g., "Tupelo Honey Cafe Columbia, SC")
- Reviews array from Google Places API

**Prompt Requirements:**
```
You are analyzing Google reviews for {locationName}.

FOCUS ON:
1. **Newest reviews** (prioritize recent feedback)
2. **Themes** - recurring topics across reviews
3. **Positives** - what customers love
4. **Negatives** - pain points and complaints
5. **Actionable insights** for the management team

FORMAT:
- Summary paragraph
- Key themes (bullet points)
- Top 3 positives
- Top 3 areas for improvement
- Recommended actions
```

**Status:** ✅ Endpoint exists, prompt is good

---

## Tab 4: Local Market ❌ NEEDS MAJOR ENHANCEMENT

**Purpose:** Analyze local demographics, events, and competition to suggest opportunities

### Backend API: `POST /api/getLocationMarketAnalysis`

**Input:**
- Location name
- City, State

**Prompt Requirements - VERY DETAILED:**

```
You are a local market analyst for {locationName} in {city}, {state}.

Conduct a comprehensive market analysis covering:

## 1. LOCAL DEMOGRAPHICS
- Population trends
- Age distribution
- Income levels
- Tourism statistics (if applicable)

## 2. MACRO EVENTS (City-Wide)
- Search: "{city} events calendar"
- Search: "{city} news"
- Major festivals, conventions, sporting events
- Citywide celebrations
- Conference schedules

## 3. MICRO EVENTS (Neighborhood-Level)
- Nearby venues (theaters, arenas, stadiums)
- Art galleries and museums
- Entertainment districts
- Local business associations
- Street fairs and markets

## 4. HOLIDAY IMPACT (CRITICAL)
- Upcoming holidays in next 30 days
- Historical impact of holidays on restaurant traffic
- Specific opportunities (Valentine's Day, Mother's Day, etc.)
- Cultural/religious holidays relevant to local demographics

## 5. LOCAL NEWS & ENTERTAINMENT
- Search: "{city} entertainment guide"
- Local news sites
- Independent event websites
- What's trending in the city
- New businesses opening nearby
- Construction/road closures affecting traffic

## 6. COMPETITION ANALYSIS
- Other restaurants in area (similar cuisine)
- Recent reviews of competitors
- Market gaps and opportunities

## 7. WEATHER PATTERNS
- Seasonal trends
- How weather affects local dining habits

PROVIDE:
- Executive summary (2-3 paragraphs)
- Top 5 opportunities for this location
- Timing recommendations (when to capitalize)
- Specific actionable tactics
```

**Web Search Required:**
- Google Search API or web scraping
- "{city} events calendar 2025"
- "{city} entertainment guide"
- "{city} news"
- "restaurants near {location}"

**Status:** ❌ Endpoint exists but prompt needs major enhancement

---

## Tab 5: Huddle Brief ❌ NEEDS MAJOR ENHANCEMENT

**Purpose:** Generate pre-shift briefs tailored to FOH, BOH, or Managers

### Backend API: `POST /api/generateHuddleBrief`

**Input:**
- Location name
- Audience: "FOH", "BOH", or "Managers"
- Performance data (from performance_actuals)
- Weather forecast (current day)

---

### FOH Brief Requirements

**Prompt Template:**
```
You are the General Manager of {locationName} preparing a pre-shift brief for the FRONT OF HOUSE team.

INCORPORATE:

## Performance Context
- Yesterday's sales: {data}
- Week-to-date performance vs. goal
- Top-selling items

## Weather & Local Events
- Today's weather: {weather}
- Local events happening today (from Local Market analysis)
- Expected traffic patterns

## Company Promotions
- Check tupelohoneycafe.com for current promotions
- Feature menu items
- Limited-time offers
- Happy hour specials

## Sales Contests & Games (CRITICAL)
Create 1-2 **fun, proven sales contests** for servers/bartenders:
- Examples: "Upsell Challenge", "Dessert Derby", "Cocktail Champion"
- Clear rules, friendly competition
- Prizes/recognition
- Make the shift engaging and profitable

## Direct Actions for Smooth Shift
- Table turnover goals
- Guest check-in frequency
- Teamwork focus areas
- Potential challenges to watch for

TONE: Energetic, motivating, team-oriented
FORMAT: Brief (2-3 minutes to read aloud)
```

---

### BOH Brief Requirements

**Prompt Template:**
```
You are the Executive Chef of {locationName} preparing a pre-shift brief for the BACK OF HOUSE team.

INCORPORATE:

## Performance Context
- Yesterday's ticket times
- Food cost performance
- Top-selling dishes

## Weather & Volume Forecast
- Today's weather: {weather}
- Expected covers based on forecast
- Prep priorities

## Kitchen Safety & Health Standards
- Today's safety focus (e.g., knife handling, slip prevention)
- Food safety reminder (temps, cross-contamination)
- Equipment maintenance check

## Anthony Bourdain-Style Passion (CRITICAL)
- The pride of working in kitchens
- Craftsmanship and excellence
- Team camaraderie
- "We're not just cooking food, we're creating experiences"
- Respect the ingredients, respect the craft

## Execution Focus
- Key menu items to prioritize
- Timing goals (ticket times)
- Team coordination
- Quality standards

TONE: Passionate, professional, pride in craft
FORMAT: Brief (2-3 minutes to read aloud)
```

---

### Managers Brief Requirements

**Prompt Template:**
```
You are preparing a comprehensive pre-shift brief for the MANAGEMENT TEAM at {locationName}.

INCORPORATE:

## ALL OF FOH + BOH
- Include elements from both FOH and BOH briefs above
- Sales contests for FOH
- Kitchen passion for BOH

## Management-Specific Elements

### Performance & Profitability
- P&L snapshot (sales, labor %, prime cost)
- Today's profitability goals
- Cost control priorities

### Operations Excellence
- Floor management strategy
- Labor deployment
- Guest recovery protocols
- VIP/special occasions today

### Culture Building (CRITICAL)
- Hospitality industry best practices
- Reference leading hospitality websites (e.g., Toast, Restaurant Business Online, Nation's Restaurant News)
- Inspiring leadership moment
- Team recognition opportunities
- "How can we make today exceptional?"

### Weather & Local Context
- Weather impact on traffic
- Local events driving business
- Competitor activity

### Action Plan
- Specific goals for the shift
- Metrics to track
- Team check-in points

TONE: Strategic, inspiring, action-oriented
FORMAT: Comprehensive (5-7 minutes to read/discuss)
```

**Status:** ❌ Endpoint exists but prompt needs major enhancement + web scraping for tupelohoneycafe.com

---

## Tab 6: Forecast ❌ NEEDS HISTORICAL DATA

**Purpose:** Predict daily sales for next 7 days based on weather and historical data

### Backend API: `POST /api/getSalesForecast`

**Input:**
- Location name
- 7-day weather forecast (already has this ✅)
- **Historical data** from performance_actuals ❌ (depends on Phase 8)
- **Historical tourist/market conditions** for that city ❌

**Prompt Requirements:**
```
You are a sales forecasting analyst for {locationName}.

ANALYZE:

## Weather Impact
- 7-day forecast: {weatherData}
- Historical correlation between weather and sales at this location
- Temperature, precipitation, severe weather

## Historical Performance
- Same period last year sales
- Same day-of-week averages
- Seasonal trends for this location

## Market Conditions
- Historical tourist patterns for {city}
- Convention calendar impact
- Local events (from Local Market analysis)
- Holiday proximity

PROVIDE:
- Daily sales forecast for next 7 days
- Confidence level for each day
- Key factors driving forecast
- Recommendations for staffing/prep

FORMAT:
{
  "summary": "markdown summary",
  "chartData": [
    { "name": "Mon", "predictedSales": 65000, "weatherCondition": "sunny", "weatherDescription": "Sunny, 75°F" },
    ...
  ]
}
```

**Dependency:** Requires Phase 8 (performance_actuals loading) to be complete

**Status:** ❌ Endpoint exists but needs historical data integration

---

## Tab 7: Marketing ❌ NEEDS MAJOR ENHANCEMENT

**Purpose:** Generate creative, locally-tailored marketing ideas

### Backend API: `POST /api/getMarketingIdeas`

**Input:**
- Location name
- City, State
- User location (optional - for proximity-based ideas)

**Prompt Requirements - MULTI-GENERATIONAL:**

```
You are a creative marketing strategist for {locationName}.

Generate 10-15 **actionable, locally-tailored** marketing ideas that:

## 1. Target Multiple Generations
- **Gen Z (1997-2012)**: TikTok, Instagram Reels, viral challenges
- **Millennials (1981-1996)**: Instagram, experiences, sustainability
- **Gen X (1965-1980)**: Facebook, email, value + quality
- **Boomers (1946-1964)**: Facebook, traditional media, loyalty programs
- **Gen Alpha (2013+)**: YouTube, family-friendly, visual content

## 2. Address Different Financial Classes
- **Budget-conscious**: Value deals, happy hour, lunch specials
- **Mid-market**: Quality-to-price ratio, experiences
- **Premium**: Exclusive offerings, VIP experiences

## 3. Easy for Managers to Execute (CRITICAL)
- **Store-level initiatives** (not just corporate)
- Minimal budget required
- Can be implemented within 1-2 weeks
- Use local partnerships
- Social media tactics they can do themselves

## 4. Locally-Tailored
- Leverage {city} culture and identity
- Partner with nearby businesses
- Local influencers and micro-influencers
- Neighborhood events
- City pride and community

## 5. Seasonal & Timely
- Current season opportunities
- Upcoming holidays
- Local event tie-ins (from Local Market analysis)

EXAMPLES OF IDEAS:
- "Local Heroes Happy Hour" (partner with police/fire/teachers)
- "Sunny Day Flash Sale" (text club when weather perfect)
- "Neighborhood Passport" (stamp card with nearby businesses)
- "TikTok Recipe Challenge" (user-generated content)
- "Lunch & Learn" series (host local experts)

FORMAT:
- Idea title
- Target demographic
- Budget level ($ low, $$ medium, $$$ high)
- Implementation difficulty (Easy/Medium/Hard)
- Expected ROI
- Step-by-step execution plan
```

**Status:** ❌ Endpoint exists but prompt needs major enhancement

---

## Summary of Changes Needed

### Frontend Changes:
1. **Reviews & Buzz**: Remove auto-load behavior (1 line change)

### Backend Prompt Enhancements:
1. **getReviewSummary**: ✅ Already good
2. **getLocationMarketAnalysis**: ❌ Add web search, detailed event/news scraping, holiday calendar
3. **generateHuddleBrief**: ❌ Add tupelohoneycafe.com scraping, detailed FOH/BOH/Manager templates
4. **getSalesForecast**: ❌ Add historical data integration (depends on Phase 8)
5. **getMarketingIdeas**: ❌ Add multi-generational, multi-class, manager-executable focus

### Dependencies:
- **Phase 8 must be complete** (performance_actuals loading) before Forecast tab will work properly
- **Web search/scraping capability** needed for Local Market and Huddle Brief
- **Holiday calendar API** for holiday-aware insights

### Time Estimate:
- Frontend fix: 5 minutes
- Backend prompt enhancements: 1-2 hours (comprehensive prompts + web search integration)
- Testing all 6 tabs: 30 minutes
- **Total: ~2.5 hours** (can be done as Phase 9 after Phase 8 complete)
