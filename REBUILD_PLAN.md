# KPI Dashboard Nuclear Rebuild Plan

## Executive Summary

Complete rebuild of backend infrastructure and API layer while preserving ALL frontend UI, business logic, and data. This addresses the root cause of persistent API connectivity issues: bloated, multi-AI-generated code with conflicting architectures.

## Current Problems Identified

1. **Dual backend directories** - `functions/` (legacy Vertex AI) and `server/` (current) causing confusion
2. **Inconsistent API architecture** - Multiple migration attempts leaving legacy code
3. **Deployment issues** - Functions and hosting out of sync
4. **Bloated codebase** - Multiple AI iterations layered on top of each other
5. **Hard-to-debug errors** - Unclear error paths and mixed patterns

## What We Will PRESERVE (Do Not Touch)

### ✅ Frontend Components (src/components/)
- All 43 React components remain unchanged
- All UI/UX styling and layouts
- Component business logic

### ✅ Core Business Data (src/)
- `constants.ts` - ALL director profiles, store details, KPI configs **PRESERVED EXACTLY**
- `types.ts` - All TypeScript type definitions
- `data/mockData.ts` - Mock data for development
- All utility functions (dateUtils, imageUtils, weatherUtils)
- All custom hooks (useAnimatedNumber, useGoogleMaps)

### ✅ Frontend Services (KEEP, may need minor updates)
- `services/weatherService.ts`
- `services/firebaseService.ts`
- `services/geminiService.ts` - Interface only, no changes to function signatures

### ✅ Pages & App Structure
- `App.tsx`
- All pages (DashboardPage, DataEntryPage, FinancialsPage, NewsFeedPage)
- `index.tsx`

### ✅ Configuration Files (Keep)
- `package.json` (root)
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- Firebase project settings
- All GitHub secrets

### ✅ Database & Infrastructure
- Firestore database and all data
- Firebase Storage
- Google Secret Manager secrets
- GitHub repository and Actions

## What We Will REBUILD from Scratch

### 🔥 Backend (Complete Rewrite)

#### 1. Delete Entirely
- `functions/` directory (legacy Vertex AI code)
- `server/` directory (current but problematic)
- Create fresh `functions/` with modern structure

#### 2. New Backend Structure
```
functions/
├── src/
│   ├── index.ts              # Main entry point - clean, simple
│   ├── routes/
│   │   └── gemini.ts         # All AI endpoints
│   ├── services/
│   │   └── gemini-client.ts  # Gemini AI wrapper
│   ├── middleware/
│   │   ├── cors.ts           # CORS configuration
│   │   └── error-handler.ts  # Centralized error handling
│   └── types/
│       └── api.ts            # API request/response types
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

#### 3. New Backend Features
- **Single responsibility**: One Cloud Function (`api`) handling all routes
- **Clear routing**: Express router with explicit routes for each action
- **Proper error handling**: Standardized error responses
- **Type safety**: Full TypeScript with strict mode
- **Clean dependencies**: Only what's needed, no legacy packages
- **Proper logging**: Structured logging for debugging
- **Secret management**: Only GEMINI_API_KEY from Secret Manager

### 🔄 Frontend API Client (Minimal Updates)

#### Update `src/lib/ai-client.ts`
- Keep the same interface (no changes to function signatures)
- Add better error handling and retry logic
- Add request/response logging (dev mode only)
- Ensure proper typing

## Implementation Steps

### Phase 1: Preparation (NO CODE CHANGES YET)
1. ✅ Create this plan document
2. Create backup branch: `git checkout -b backup-before-rebuild`
3. Document all current API endpoints and their payloads
4. Verify all constants.ts data is backed up
5. Get user approval for plan

### Phase 2: Backend Scaffold (Clean Build)
1. Delete `functions/` and `server/` directories
2. Create new `functions/` directory
3. Initialize new package.json with ONLY needed dependencies:
   - `firebase-functions` (v5.x - latest)
   - `firebase-admin` (v12.x)
   - `@google/generative-ai` (latest)
   - `express`
   - `cors`
4. Set up TypeScript with strict configuration
5. Create folder structure

### Phase 3: Core Backend Implementation
1. **Create Gemini service client** (`functions/src/services/gemini-client.ts`)
   - Single class wrapping GoogleGenerativeAI
   - Model: `gemini-2.0-flash-exp`
   - Proper error handling
   - Rate limiting considerations

2. **Create API routes** (`functions/src/routes/gemini.ts`)
   - Map each frontend service call to a route
   - All existing endpoints (19 total from geminiService.ts)
   - Consistent request/response format

3. **Create main entry point** (`functions/src/index.ts`)
   - Simple Express app setup
   - Route registration
   - Export single Cloud Function: `api`
   - Secret declaration: `onRequest({ secrets: ["GEMINI_API_KEY"] })`

4. **Add middleware**
   - CORS configuration
   - JSON body parsing
   - Error handling
   - Request logging (development)

### Phase 4: Configuration Updates
1. Update `firebase.json`:
   ```json
   {
     "functions": {
       "source": "functions",
       "runtime": "nodejs20"
     }
   }
   ```

2. Update `.github/workflows/firebase-hosting-merge.yml`:
   - Build step: `cd functions && npm install && npm run build`
   - Deploy: Both hosting and functions together

3. Update `.gitignore`:
   - Ensure `functions/node_modules` ignored
   - Ensure `server/` (old) not tracked

### Phase 5: Deployment & Testing
1. Build locally: `cd functions && npm run build`
2. Test locally with Firebase emulators (optional)
3. Delete old Cloud Function: `firebase functions:delete api --force`
4. Deploy new function: `firebase deploy --only functions`
5. Deploy hosting: `firebase deploy --only hosting`
6. Test each API endpoint from dashboard
7. Monitor Cloud Function logs for errors

### Phase 6: Cleanup & Documentation
1. Delete `server/` directory permanently
2. Update `DEVELOPMENT.md` with new architecture
3. Create API documentation in `API.md`
4. Update README with new structure
5. Commit all changes with detailed message

### Phase 7: Director Hub UI Redesign ✅ COMPLETE

**Status:** Completed Nov 30, 2024

The Director Hub has been completely redesigned to match the desired comprehensive profile layout.

#### Completed Changes:

**1. DirectorProfileModal Layout Redesign** ([DirectorProfileModal.tsx](src/components/DirectorProfileModal.tsx))
- ✅ Split into left panel (director info) and right panel (deployments + AI snapshot)
- ✅ Modal height reduced from `h-[90vh]` to `h-[75vh]` for more square proportions
- ✅ Deployments section uses `flex-grow` instead of fixed heights for better responsiveness
- ✅ Added overflow-auto for scrolling timeline
- ✅ Reduced spacing (space-y-6 to space-y-4) for more compact layout

**2. Enhanced Director Information Display** ([DirectorProfileSubComponents.tsx](src/components/DirectorProfileSubComponents.tsx))
- ✅ DirectorInfo: Added decorative yellow/orange gradient background to director photo
- ✅ RegionStores: List of all stores in director's region
- ✅ GoalsAndPerformance: Shows top performing store with metrics
  - Sales (formatted as $XXXk)
  - Prime Cost (percentage)
  - SOP% (percentage)
- ✅ AIPerformanceSnapshot: Integrated AI-powered performance summary for W48 FY2025

**3. Google Maps Enhancements** ([DeploymentMap.tsx](src/components/DeploymentMap.tsx))
- ✅ Map zooms out to show entire United States (zoom level 4, centered on Kansas)
- ✅ Removed auto-fitBounds behavior to maintain US-wide view
- ✅ Person name labels added below ALL map markers:
  - Home marker: Director's first name in green (#4ade80)
  - Director deployment: Director's first name in cyan (#22d3ee)
  - Strike team deployment: Person's first name in pink (#f472b6)
- ✅ Custom CSS class `marker-label-below` with `margin-top: 28px` for positioning

**4. Top Store Metrics Calculation**
- ✅ Fetches performance data from Firebase `performance_actuals` collection
- ✅ Calculates aggregated totals per store
- ✅ Identifies top performing store by sales
- ✅ Calculates average Prime Cost and SOP% across periods

**5. Backend Integration**
- ✅ Fixed missing export: `getDirectorPerformanceSnapshot` in [geminiService.ts](src/services/geminiService.ts)
- ✅ Added Period properties (year, quarter) for AI snapshot requests

#### Files Modified:
- [DirectorProfileModal.tsx](src/components/DirectorProfileModal.tsx) - Layout and data fetching
- [DirectorProfileSubComponents.tsx](src/components/DirectorProfileSubComponents.tsx) - Visual components
- [DeploymentMap.tsx](src/components/DeploymentMap.tsx) - Map configuration and labels
- [geminiService.ts](src/services/geminiService.ts) - Export fix

#### Deployment:
- Committed as: "Improve Director Hub: reduce height, zoom out map, add person names to markers"
- Successfully deployed to Firebase Hosting
- Live URL: https://kpi-dashboardgit-9913298-66e65.web.app

---

### Phase 7b: Restore Deployments Feature (Post-Rebuild)

The Deployments feature UI is **100% complete** and CRUD operations are **WORKING**. All components exist and look perfect:
- ✅ [DeploymentPlannerModal.tsx](src/components/DeploymentPlannerModal.tsx) - Form with all fields
- ✅ [DeploymentMap.tsx](src/components/DeploymentMap.tsx) - Google Maps with home/suitcase icons
- ✅ [DeploymentBudget.tsx](src/components/DeploymentBudget.tsx) - Budget tracking
- ✅ [DeploymentTimeline.tsx](src/components/DeploymentTimeline.tsx) - List view with edit/delete

#### What's Broken:
1. **Missing Firebase Functions** ([firebaseService.ts:199-204](src/services/firebaseService.ts#L199-L204)):
   - Only `getDeploymentsForDirector()` exists
   - Need: `createDeployment()`, `updateDeployment()`, `deleteDeployment()`

2. **Stub Handlers** ([DirectorProfileModal.tsx:44-54](src/components/DirectorProfileModal.tsx#L44-L54)):
   - `handleSaveDeployment()` - just logs to console
   - `handleDeleteDeployment()` - just logs to console
   - `setDeployments([])` - doesn't fetch from Firebase

#### Implementation Steps:

**Step 1: Add Firebase CRUD Functions** (src/services/firebaseService.ts)
```typescript
export const createDeployment = async (deployment: Omit<Deployment, 'id' | 'createdAt'>): Promise<Deployment> => {
    const newDeployment = {
        ...deployment,
        createdAt: new Date().toISOString()
    };
    const docRef = await deploymentsCollection.add(newDeployment);
    return { id: docRef.id, ...newDeployment };
};

export const updateDeployment = async (deploymentId: string, updates: Partial<Deployment>): Promise<void> => {
    await deploymentsCollection.doc(deploymentId).update(updates);
};

export const deleteDeployment = async (deploymentId: string): Promise<void> => {
    await deploymentsCollection.doc(deploymentId).delete();
};
```

**Step 2: Wire Up Handlers** (src/components/DirectorProfileModal.tsx)
- Import Firebase functions
- Update `useEffect` to fetch deployments: `getDeploymentsForDirector(director.id)`
- Update `handleSaveDeployment` to call `createDeployment()` or `updateDeployment()`
- Update `handleDeleteDeployment` to call `deleteDeployment()`
- Refresh deployments list after each operation

**Step 3: Test**
- Create new deployment → saves to Firestore
- View on map → home icon vs suitcase icon
- View on timeline → shows dates, budget
- Budget tracker → updates totals
- Edit deployment → updates Firestore
- Delete deployment → removes from Firestore

#### Data Structure (Already Defined):
```typescript
interface Deployment {
  id: string;
  directorId: string;
  deployedPerson: string;        // Director name or Strike Team member name
  destination: string;            // Store name
  startDate: string;             // ISO date
  endDate: string;               // ISO date
  purpose: string;               // e.g., "Manager shift cover"
  estimatedBudget: number;       // Dollar amount
  stores: string[];              // [destination]
  description: string;           // Same as purpose
  status?: string;               // Optional
  createdAt: string;             // ISO date
}
```

#### No Backend API Needed
Deployments is a **frontend-only feature** using direct Firestore CRUD. No Cloud Functions required.

### Phase 8: Restore Performance Data Loading & Import (45 minutes - CRITICAL)

**THIS IS THE ROOT CAUSE OF EVERYTHING BEING BROKEN**

The `performance_actuals` Firebase collection is the backbone of the entire app. Without this data loading properly:
- ❌ Dashboard shows no data
- ❌ Store Rankings empty
- ❌ AI analysis has nothing to analyze
- ❌ Executive summaries fail
- ❌ Regional performance broken
- ❌ Everything fails

**PLUS: Graceful Degradation Issue (User Requested)**
- ❌ When data is missing, KPI cards and Store Rankings **completely disappear**
- ❌ User wants to see UI structure with "0" or "--" placeholders instead of blank screen
- ❌ Better for debugging and user experience

#### What's Broken:

**1. Data Fetching is Stubbed** ([firebaseService.ts:171-175](src/services/firebaseService.ts#L171-L175)):
```typescript
export const getAggregatedPerformanceDataForPeriod = async (period: Period, storeId?: string): Promise<PerformanceData> => {
    // This is a placeholder implementation. A real implementation would query and aggregate data from Firestore.
    console.log('Fetching aggregated data for', period, storeId);
    return {}; // ❌ RETURNS EMPTY OBJECT - NO DATA EVER LOADS
}
```

**2. Import Report Broken** ([ImportDataModal.tsx:163](src/components/ImportDataModal.tsx#L163)):
- Calls `startImportJob()` → backend API endpoint `POST /api/startTask`
- Backend processes uploaded files (Excel, CSV, images) with AI
- Extracts KPI data automatically
- **Currently fails with 404 because backend is broken**

**3. Manual Data Entry**:
- ✅ SAVE works - `savePerformanceDataForPeriod()` writes to Firebase
- ❌ FETCH broken - can't load existing data to edit
- Users can enter data blind but can't see what they entered before

#### Current State in Firebase:

User's screenshot shows `performance_actuals` collection exists with data:
- Documents like `Arlington_VA_2023-01-02`
- Contains: Sales, SOP, Food Cost, Prime Cost, Variable Labor, Culinary Audit Score
- **Data EXISTS in Firebase but app can't READ it**

#### Implementation Steps:

**Step 1: Fix Frontend Data Loading** (src/services/firebaseService.ts)

Replace stub implementation:
```typescript
export const getAggregatedPerformanceDataForPeriod = async (period: Period, storeId?: string): Promise<PerformanceData> => {
    try {
        // Query performance_actuals for matching period
        const startDateStr = period.startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const endDateStr = period.endDate.toISOString().split('T')[0];

        // Build query
        let query = actualsCollection
            .where('workStartDate', '>=', period.startDate.toISOString())
            .where('workStartDate', '<=', period.endDate.toISOString());

        if (storeId) {
            query = query.where('storeId', '==', storeId);
        }

        const snapshot = await query.get();

        // Aggregate data across matching documents
        const aggregated: PerformanceData = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data().data as PerformanceData;
            for (const kpi in data) {
                if (!aggregated[kpi as Kpi]) {
                    aggregated[kpi as Kpi] = 0;
                }
                aggregated[kpi as Kpi]! += data[kpi as Kpi]!;
            }
        });

        return aggregated;
    } catch (error) {
        console.error('Error fetching performance data:', error);
        return {};
    }
};
```

Also implement:
```typescript
export const getPerformanceDataForStore = async (storeId: string, period: Period): Promise<PerformanceData> => {
    // Same as above but only for one store
};

export const getAllStoresPerformanceForPeriod = async (period: Period): Promise<{[storeId: string]: PerformanceData}> => {
    // Fetch all stores for dashboard/rankings
};
```

**Step 2: Backend API for Import Report** (functions/src/routes/gemini.ts)

Add endpoints:
```typescript
// POST /api/startTask - Process uploaded document/text with AI
router.post('/startTask', async (req, res) => {
    const { fileUrl, fileName, importType } = req.body;

    // 1. Fetch file from Firebase Storage URL
    // 2. Send to Gemini AI with extraction prompt
    // 3. Parse JSON response
    // 4. Store job status in Firestore (imports_jobs collection)
    // 5. Return jobId
});

// GET /api/getTaskStatus/:jobId - Poll import job status
router.get('/getTaskStatus/:jobId', async (req, res) => {
    // 1. Query imports_jobs collection
    // 2. Return { status, extractedData, errors }
});
```

**Step 3: Wire Up Dashboard Data Loading**

Update DashboardPage.tsx to:
- Call `getAllStoresPerformanceForPeriod(currentPeriod)`
- Populate KPI cards with real data
- Update Store Rankings with actual values
- Fix any components that depend on performance data

**Step 4: Add Graceful Degradation (User Requested)**

**Issue:** When data is missing, KPI cards return `null` and disappear completely.

**Fix KPISummaryCards.tsx** ([line 134](src/components/KPISummaryCards.tsx#L134)):

Current code:
```typescript
if (value === undefined || isNaN(value)) return null; // ❌ Card disappears
```

New code:
```typescript
const displayValue = (value === undefined || isNaN(value)) ? '--' : value;

return (
    <Card
        key={kpi}
        kpi={kpi}
        value={displayValue}  // Show "--" instead of hiding
        isSelected={selectedKpi === kpi}
        onSelect={() => onKpiSelect(kpi)}
    />
);
```

**Also Check CompanyStoreRankings.tsx** for similar pattern - ensure stores show with "--" when data missing.

**Why:** User wants full UI visible even without data (better UX, easier debugging).

**Step 5: Test Data Flow**

Test Manual Entry:
1. Open Data Entry page
2. Select store and period
3. **Should see existing data loaded** (not empty)
4. Edit values
5. Save
6. Reload - should see updated values

Test Import Report:
1. Open Import Data modal
2. Upload Excel file or paste CSV
3. **Backend processes with AI** (not 404)
4. Verify extracted data
5. Confirm import
6. Check Firebase - data should appear in performance_actuals

Test Dashboard:
1. Open Dashboard
2. **See real KPI numbers** (not blank/zero)
3. Store Rankings shows real data
4. AI features work because they have data to analyze

#### Data Structure (Already Defined):
```typescript
// Firestore: performance_actuals/{storeId}_{YYYY-MM-DD}
{
  storeId: "Denver, CO",
  workStartDate: "2023-01-02T00:00:00.000Z",
  data: {
    "Sales": 65526.14,
    "SOP%": 0.1530,
    "Food Cost": 0.228,
    "Prime Cost": 0.601,
    "Variable Labor": 0.265,
    "Culinary Audit Score": 93.95,
    "Avg Reviews": 4.48
  }
}
```

#### Backend API Endpoints Needed:
- `POST /api/startTask` - Upload & process document with AI
- `GET /api/getTaskStatus/:jobId` - Poll job status
- Both already defined in geminiService.ts, just need backend implementation

---

## ✅ Features Already Working (No Changes Needed)

### Notes Feature - FULLY FUNCTIONAL

**Status:** 95% complete, production-ready

The Notes feature is beautifully implemented and requires NO changes during the rebuild, just backend endpoint verification.

**Working Features:**
- ✅ Period selection (P1-P12 FY2025) with navigation
- ✅ View scoping (Total Company, Director Regions, Individual Stores)
- ✅ Category filtering (8 categories: General, Operations, Marketing, HR, GuestFeedback, Staffing, Facilities, Reviews)
- ✅ Text search across note content
- ✅ Photo upload with preview (Firebase Storage at `notes_images/`)
- ✅ Voice-to-text dictation (Web Speech API)
- ✅ Full CRUD operations (Add, Edit, Delete notes)
- ✅ AI Trend Analysis button

**Backend Dependency:**
- Needs `POST /api/getNoteTrends` (endpoint #8 in rebuild - Phase 3)
- Will work automatically after Phase 6 backend deployment

**Firebase Collections:**
- `notes` collection: ✅ Working with real data
- `notes_images/` storage: ✅ Working
- All CRUD operations: ✅ Fully implemented in [firebaseService.ts:100-133](src/services/firebaseService.ts#L100-L133)

**Verification During Rebuild:**
- Phase 6: Test "Analyze Trends" button works (calls backend endpoint #8)
- No frontend code changes needed

---

### Phase 9: Enhance Store Hub AI Prompts ✅ COMPLETE

**Status:** Completed Nov 30, 2024

**What:** Improve AI prompts for Store Hub's 5 analysis tabs with detailed, actionable intelligence

The Store Hub UI is **100% complete** and backend prompts are **fully enhanced**.

#### Frontend Fix (5 minutes):

**File:** [LocationInsightsModal.tsx:180-190](src/components/LocationInsightsModal.tsx#L180-L190)

**Change:** Remove auto-load behavior for Reviews & Buzz
```typescript
// REMOVE the useEffect that auto-loads reviews
// Reviews should only load when user clicks "Generate Analysis"
```

#### Backend Prompt Enhancements:

**1. getReviewSummary** - ✅ Already good
- Summarizes newest reviews
- Identifies themes, positives, negatives

**2. getLocationMarketAnalysis** - ❌ Needs major enhancement
Add comprehensive market intelligence:
- Web search for local events calendars
- City news and entertainment guides
- **Holiday awareness** (CRITICAL - holidays impact everywhere)
- Macro events (conventions, festivals)
- Micro events (neighborhood venues, art, culture)
- Demographics and tourism data
- Competition analysis
- Seasonal trends

**3. generateHuddleBrief** - ❌ Needs major enhancement
Create detailed audience-specific briefs:

**FOH (Front of House):**
- Performance data + weather + local events
- Scrape tupelohoneycafe.com for current promotions
- **Sales contests & games** (proven impact for servers/bartenders)
- Direct actions for smooth shift
- Make it fun and profitable

**BOH (Back of House):**
- Kitchen safety & health standards
- **Anthony Bourdain-style passion** for working in kitchens
- Performance data + prep priorities
- Volume forecast based on weather
- Team camaraderie focus

**Managers:**
- ALL of FOH + BOH elements
- P&L snapshot and profitability goals
- **Hospitality industry best practices** (reference leading sites)
- Inspiring leadership moments
- Culture building initiatives
- Strategic goals for the shift

**4. getSalesForecast** - ❌ Needs historical data integration
- 7-day weather forecast (already has)
- **Historical performance data** from performance_actuals
- **Historical tourist/market conditions** for city
- Same period last year comparison
- Day-of-week patterns

**5. getMarketingIdeas** - ❌ Needs major enhancement
Generate **creative, actionable, locally-tailored** ideas:
- **Multi-generational**: Gen Z, Millennials, Gen X, Boomers, Gen Alpha
- **Multi-class**: Budget, mid-market, premium
- **Manager-executable**: Store-level initiatives (not just corporate)
- Leverage local culture and identity
- Seasonal and timely
- Low budget options
- Clear ROI expectations

---

#### ✅ APPROVED Enhanced Prompts (from AI_PROMPTS_REVIEW.md)

**2. getLocationMarketAnalysis - Comprehensive Prompt:**
```
You are a local market analyst for {locationName} in {city}, {state}.

Conduct a comprehensive market analysis covering:

## 1. LOCAL DEMOGRAPHICS
- Population trends, age distribution, income levels, tourism statistics

## 2. MACRO EVENTS (City-Wide)
- Search: "{city} events calendar"
- Search: "{city} news"
- Major festivals, conventions, sporting events, citywide celebrations

## 3. MICRO EVENTS (Neighborhood-Level)
- Nearby venues (theaters, arenas), art galleries, entertainment districts
- Local business associations, street fairs and markets

## 4. HOLIDAY IMPACT (CRITICAL)
- Upcoming holidays in next 30 days
- Historical impact on restaurant traffic
- Cultural/religious holidays relevant to local demographics

## 5. LOCAL NEWS & ENTERTAINMENT
- Search: "{city} entertainment guide"
- What's trending, new businesses, construction/road closures

## 6. COMPETITION ANALYSIS
- Other restaurants (similar cuisine), recent reviews, market gaps

## 7. WEATHER PATTERNS
- Seasonal trends, how weather affects local dining habits

PROVIDE:
- Executive summary (2-3 paragraphs)
- Top 5 opportunities for this location
- Timing recommendations
- Specific actionable tactics
```

**3. generateHuddleBrief - Three Audience-Specific Prompts:**

*FOH Prompt:*
```
You are the General Manager of {locationName} preparing a pre-shift brief for the FRONT OF HOUSE team.

INCORPORATE:
- Performance data: {data}
- Weather: {weather}
- Local events happening today

## Company Promotions
- Check tupelohoneycafe.com for current promotions
- Feature menu items, limited-time offers, happy hour specials

## Sales Contests & Games (CRITICAL)
Create 1-2 fun, proven sales contests for servers/bartenders:
- Examples: "Upsell Challenge", "Dessert Derby", "Cocktail Champion"
- Clear rules, friendly competition, prizes/recognition

## Direct Actions for Smooth Shift
- Table turnover goals, guest check-in frequency
- Teamwork focus areas, potential challenges

TONE: Energetic, motivating, team-oriented
FORMAT: Brief (2-3 minutes to read aloud)
```

*BOH Prompt:*
```
You are the Executive Chef of {locationName} preparing a pre-shift brief for the BACK OF HOUSE team.

INCORPORATE:
- Performance data: {data}
- Weather: {weather}
- Expected covers based on forecast

## Kitchen Safety & Health Standards
- Today's safety focus (e.g., knife handling, slip prevention)
- Food safety reminder (temps, cross-contamination)

## Anthony Bourdain-Style Passion (CRITICAL)
- The pride of working in kitchens
- Craftsmanship and excellence, team camaraderie
- "We're not just cooking food, we're creating experiences"
- Respect the ingredients, respect the craft

## Execution Focus
- Key menu items to prioritize, timing goals, quality standards

TONE: Passionate, professional, pride in craft
FORMAT: Brief (2-3 minutes to read aloud)
```

*Managers Prompt:*
```
You are preparing a comprehensive pre-shift brief for the MANAGEMENT TEAM at {locationName}.

INCORPORATE ALL OF FOH + BOH:
- Sales contests for FOH, kitchen passion for BOH

## Management-Specific Elements

### Performance & Profitability
- P&L snapshot (sales, labor %, prime cost), today's profitability goals

### Operations Excellence
- Floor management strategy, labor deployment, guest recovery protocols

### Culture Building (CRITICAL)
- Hospitality industry best practices (reference Toast, Restaurant Business Online, Nation's Restaurant News)
- Inspiring leadership moment, team recognition opportunities
- "How can we make today exceptional?"

### Weather & Local Context
- Weather impact on traffic, local events driving business

### Action Plan
- Specific goals for the shift, metrics to track

TONE: Strategic, inspiring, action-oriented
FORMAT: Comprehensive (5-7 minutes to read/discuss)
```

**5. getMarketingIdeas - Multi-Generational Prompt:**
```
You are a creative marketing strategist for {locationName}.

Generate 10-15 actionable, locally-tailored marketing ideas that:

## 1. Target Multiple Generations
- Gen Z (1997-2012): TikTok, Instagram Reels, viral challenges
- Millennials (1981-1996): Instagram, experiences, sustainability
- Gen X (1965-1980): Facebook, email, value + quality
- Boomers (1946-1964): Facebook, traditional media, loyalty programs
- Gen Alpha (2013+): YouTube, family-friendly, visual content

## 2. Address Different Financial Classes
- Budget-conscious: Value deals, happy hour, lunch specials
- Mid-market: Quality-to-price ratio, experiences
- Premium: Exclusive offerings, VIP experiences

## 3. Easy for Managers to Execute (CRITICAL)
- Store-level initiatives (not just corporate)
- Minimal budget required, can be implemented within 1-2 weeks
- Use local partnerships, social media tactics they can do themselves

## 4. Locally-Tailored
- Leverage {city} culture and identity, partner with nearby businesses
- Local influencers, neighborhood events, city pride

## 5. Seasonal & Timely
- Current season opportunities, upcoming holidays, local event tie-ins

EXAMPLES:
- "Local Heroes Happy Hour" (partner with police/fire/teachers)
- "Sunny Day Flash Sale" (text club when weather perfect)
- "TikTok Recipe Challenge" (user-generated content)

FORMAT FOR EACH IDEA:
- Idea title
- Target demographic
- Budget level ($ low, $$ medium, $$$ high)
- Implementation difficulty (Easy/Medium/Hard)
- Expected ROI
- Step-by-step execution plan
```

---

**Detailed Requirements:** See [STORE_HUB_REQUIREMENTS.md](STORE_HUB_REQUIREMENTS.md) for full specification

**Dependencies:**
- Phase 8 must be complete (for historical data in Forecast)
- Gemini's built-in Google Search grounding (already enabled in backend)
- Optional: tupelohoneycafe.com scraping for promotions

### Phase 10: Goal Setter Page ✅ COMPLETE

**Status:** Completed Nov 30, 2024

**What:** Create page to set and view quarterly goals for directors

#### Completed:
- ✅ Component exists: [GoalSetter.tsx](src/components/GoalSetter.tsx)
- ✅ Firebase functions exist: `addGoal()`, `getGoals()`, `updateGoal()`
- ✅ Page created: [GoalSetterPage.tsx](src/pages/GoalSetterPage.tsx)
- ✅ Wired up to App.tsx navigation
- ✅ Full CRUD functionality working

#### Implementation:

**Step 1: Create GoalSetterPage.tsx**
```typescript
// Display existing goals from Firebase
// Show form to add new goal (using existing GoalSetter component)
// List goals by director, quarter, year
// Edit and delete functionality
// Filter by director, quarter, year
```

**Step 2: Wire up navigation**
- Update App.tsx to route to GoalSetterPage
- Already in sidebar navigation

**Step 3: Test**
- Create goal for director
- View goals list
- Edit existing goal
- Delete goal
- Filter goals

### Phase 11: Industry News Page ✅ COMPLETE

**Status:** Completed Nov 30, 2024

**What:** RSS feed from restaurant industry news websites

#### Completed:
- ✅ Page created: [IndustryNewsPage.tsx](src/pages/IndustryNewsPage.tsx)
- ✅ Wired up to App.tsx navigation
- ✅ Category filtering system
- ✅ Simulated news content (ready for live RSS integration)

#### Implementation:

**Step 1: Create NewsPage.tsx**
```typescript
// RSS parser for industry sources:
// - Nation's Restaurant News
// - Restaurant Business Online
// - QSR Magazine
// - Modern Restaurant Management
// - Food & Wine (restaurant section)

// Display articles:
// - Title, source, date, summary
// - Link to full article
// - Refresh daily
// - Sort by date (newest first)
```

**Step 2: Backend endpoint (optional)**
- Could be client-side RSS parser
- Or backend endpoint: `GET /api/getIndustryNews`
- Cache results for 24 hours

**Step 3: Wire up navigation**
- Update App.tsx to route to NewsPage
- Already in sidebar navigation

**Step 4: Test**
- Load news feed
- Click article links
- Verify daily refresh

### Quick Fix: Remove Budget Planner

**File:** [Sidebar.tsx](src/components/Sidebar.tsx)
**Change:** Remove "Budget Planner" from navigation menu
**Time:** 2 minutes

---

### Phase 12: UX Polish - Executive Grade Features (3.25 hours)

**What:** Add professional polish features that make the app feel world-class

This phase adds the final touches that distinguish a good app from a great one - the kind of features executives expect in premium software.

---

#### 12.1 Fullscreen Toggle Buttons (30 minutes)

**Goal:** Let users maximize any component for focused analysis or presentations

**Where to Add:**
1. All modals (using existing `headerControls` prop)
2. KPI Summary Cards (expand single card to fullscreen)
3. Store Rankings table
4. Performance Matrix
5. Notes panel

**Implementation:**

**Step 1: Add fullscreen state to Modal component**
```tsx
// Modal.tsx - already supports fullscreen size
// Add toggle button to headerControls
const FullscreenToggle = ({ isFullscreen, onToggle }) => (
  <button onClick={onToggle} className="text-slate-400 hover:text-white">
    <Icon name={isFullscreen ? "minimize" : "maximize"} className="w-5 h-5" />
  </button>
);
```

**Step 2: Update modal usage across app**
```tsx
// Example: ExecutiveSummaryModal.tsx
const [isFullscreen, setIsFullscreen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Executive Summary"
  size={isFullscreen ? 'fullscreen' : 'large'}
  headerControls={
    <FullscreenToggle
      isFullscreen={isFullscreen}
      onToggle={() => setIsFullscreen(!isFullscreen)}
    />
  }
>
```

**Components to Update:**
- ExecutiveSummaryModal.tsx
- LocationInsightsModal.tsx
- ReviewAnalysisModal.tsx
- AnomalyDetailModal.tsx
- StrategyHubModal.tsx
- All other modals

**Why:** Perfect for weekly review meetings and executive presentations

---

#### 12.2 Command Palette (Cmd+K) (2 hours)

**Goal:** Instant fuzzy search navigation to any store, period, page, or action

**What Users Can Do:**
- Press `Cmd+K` or `/` to open palette
- Type "Denver" → Jump to Denver store performance
- Type "P12" → Jump to Period 12 data
- Type "Notes" → Navigate to Notes page
- See recent actions
- Keyboard navigation (arrows + Enter)

**Implementation:**

**Step 1: Install library**
```bash
npm install cmdk
```

**Step 2: Create CommandPalette.tsx component**
```tsx
import { Command } from 'cmdk';
import { useState, useEffect } from 'react';
import { ALL_STORES, DIRECTORS, ALL_PERIODS } from '../constants';

export const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
  const [search, setSearch] = useState('');

  // Build searchable index
  const stores = ALL_STORES.map(store => ({
    id: store,
    label: `Jump to ${store}`,
    action: () => onNavigate('store', store)
  }));

  const periods = ALL_PERIODS.map(period => ({
    id: period.label,
    label: `View ${period.label}`,
    action: () => onNavigate('period', period)
  }));

  const pages = [
    { id: 'dashboard', label: 'Dashboard', action: () => onNavigate('page', '/') },
    { id: 'notes', label: 'Notes', action: () => onNavigate('page', '/notes') },
    { id: 'data-entry', label: 'Data Entry', action: () => onNavigate('page', '/data-entry') },
    { id: 'goal-setter', label: 'Goal Setter', action: () => onNavigate('page', '/goals') },
    { id: 'news', label: 'Industry News', action: () => onNavigate('page', '/news') },
  ];

  return (
    <Command.Dialog open={isOpen} onOpenChange={onClose}>
      <Command.Input
        placeholder="Search stores, periods, pages..."
        value={search}
        onValueChange={setSearch}
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Stores">
          {stores.map(store => (
            <Command.Item key={store.id} onSelect={store.action}>
              {store.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Periods">
          {periods.map(period => (
            <Command.Item key={period.id} onSelect={period.action}>
              {period.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Pages">
          {pages.map(page => (
            <Command.Item key={page.id} onSelect={page.action}>
              {page.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};
```

**Step 3: Add global keyboard listener**
```tsx
// App.tsx or layout component
const [paletteOpen, setPaletteOpen] = useState(false);

useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setPaletteOpen(true);
    }
    if (e.key === '/') {
      e.preventDefault();
      setPaletteOpen(true);
    }
  };

  document.addEventListener('keydown', down);
  return () => document.removeEventListener('keydown', down);
}, []);
```

**Step 4: Style with Tailwind**
```css
/* Add to global CSS */
[cmdk-root] {
  @apply fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-800 rounded-lg border border-slate-600 shadow-2xl;
}

[cmdk-input] {
  @apply w-full p-4 bg-transparent text-white border-b border-slate-600 outline-none;
}

[cmdk-list] {
  @apply max-h-96 overflow-y-auto p-2;
}

[cmdk-group-heading] {
  @apply text-xs text-slate-400 px-2 py-1 font-semibold;
}

[cmdk-item] {
  @apply px-3 py-2 rounded text-slate-200 cursor-pointer hover:bg-slate-700;
}
```

**Why:** Modern apps (Linear, Notion, Vercel, VS Code) all have this. Users expect it.

---

#### 12.3 Enhanced Tooltips (45 minutes)

**Goal:** Rich, contextual tooltips that teach and inform

**What to Show:**
- **KPI Cards:** Formula, trend sparkline, YoY%
- **Table Headers:** Calculation method
- **AI Buttons:** Confidence score, keyboard shortcut
- **All Buttons:** Keyboard shortcuts where applicable

**Implementation:**

**Step 1: Create Tooltip.tsx component**
```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout: NodeJS.Timeout;

  const showTooltip = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-slate-900 text-slate-200 px-3 py-2 rounded-lg shadow-xl border border-slate-700 text-sm whitespace-nowrap max-w-xs">
              {content}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-slate-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

**Step 2: Use throughout app**
```tsx
// Example: KPI Card with rich tooltip
<Tooltip content={
  <div>
    <div className="font-bold mb-1">Sales</div>
    <div className="text-xs text-slate-400">Formula: Sum of all transactions</div>
    <div className="text-xs text-green-400 mt-1">↑ 12.4% vs last period</div>
    {/* Could add mini sparkline here */}
  </div>
}>
  <KPICard kpi="Sales" value={sales} />
</Tooltip>

// Example: Button with keyboard shortcut
<Tooltip content={
  <div>
    Export to PDF
    <span className="ml-2 text-slate-400 text-xs">⌘E</span>
  </div>
}>
  <button>Export</button>
</Tooltip>
```

**Step 3: Add to key components**
- All KPI cards in KPISummaryCards.tsx
- Table headers in CompanyStoreRankings.tsx
- All action buttons (Export, Print, etc.)
- AI analysis buttons (show confidence when available)
- Navigation items in Sidebar.tsx

**Why:** Reduces learning curve, looks premium, helps new users onboard faster

---

**Phase 12 Testing:**
1. ✅ Press Cmd+K → Command palette opens
2. ✅ Type "Denver" → Shows Denver store option
3. ✅ Select option → Navigates correctly
4. ✅ All modals have fullscreen button
5. ✅ Fullscreen toggle works smoothly
6. ✅ Hover KPI card → See rich tooltip with formula
7. ✅ Hover buttons → See keyboard shortcuts
8. ✅ All animations < 300ms (smooth, not sluggish)

---

**Phase 12 Success Criteria:**
- ✅ Command palette (Cmd+K) fully functional
- ✅ Fuzzy search works for stores, periods, pages
- ✅ All major modals have fullscreen toggle
- ✅ Fullscreen transitions are smooth
- ✅ Enhanced tooltips on all KPI cards
- ✅ Tooltips show formulas and trends
- ✅ Keyboard shortcuts displayed in tooltips
- ✅ Professional, executive-grade polish
- ✅ App feels world-class

---

## API Endpoints to Implement

Based on approved [AI_PROMPTS_REVIEW.md](AI_PROMPTS_REVIEW.md) plan:

### ✅ Phase 2 - Core Endpoints (12 total)

**Implement Now:**
1. `POST /api/getExecutiveSummary` - Executive summary for period ✅
2. `POST /api/getReviewSummary` - Summarize customer reviews ✅
3. `POST /api/getLocationMarketAnalysis` - Market analysis by location ⚠️ (enhance in Phase 9)
4. `POST /api/generateHuddleBrief` - Daily huddle briefing ⚠️ (enhance in Phase 9)
5. `POST /api/getSalesForecast` - Sales forecasting ✅ (auto-improves in Phase 8)
6. `POST /api/getMarketingIdeas` - Marketing recommendations ⚠️ (enhance in Phase 9)
7. `POST /api/getDirectorPerformanceSnapshot` - Director performance summary ✅
8. `POST /api/startStrategicAnalysisJob` - Long-running strategic analysis ✅
9. `POST /api/chatWithStrategy` - Chat with strategic AI ✅
10. **`POST /api/getNoteTrends`** - Analyze note trends ✅ **NEW**
11. **`POST /api/getVarianceAnalysis`** - Variance analysis ✅ **NEW**
12. **`POST /api/getStrategicExecutiveAnalysis`** - Strategic executive KPI deep-dive ✅ **NEW**

**Legend:**
- ✅ = Implement with existing/approved prompt
- ⚠️ = Implement now, enhance prompt in Phase 9
- **NEW** = Added to rebuild plan based on user approval

---

### 🔄 Phase 13+ - Deferred Endpoints (6 total)

**Defer to Future:**
- `POST /api/getInsights` - Generate insights from KPI data (custom prompts)
- `POST /api/getAnomalyDetections` - Detect anomalies in data (statistical)
- `POST /api/getAnomalyInsights` - Explain detected anomalies
- `POST /api/runWhatIfScenario` - What-if scenario modeling
- `POST /api/startTask` - Process uploaded Excel/CSV/image with AI extraction (complex)
- `GET /api/getTaskStatus/:jobId` - Poll import job status (complex)

**Why Deferred:**
- Nice-to-have features, not critical for core functionality
- File upload endpoints require additional Cloud Storage integration
- Can be added incrementally post-rebuild

---

### 📊 Endpoint Implementation Status

**Phase 2:** 12 endpoints (20 minutes) ← Updated from 9 endpoints
**Phase 9:** Enhance 3 prompts (#3, #4, #6) (1.5 hours)
**Phase 13+:** 6 endpoints (future)
**Total Endpoints:** 18 total identified

## Risk Mitigation

### Backup Strategy
- Create Git branch before starting
- Keep old `server/` directory until testing complete
- Document all changes in commit messages

### Rollback Plan
If rebuild fails:
1. Checkout backup branch: `git checkout backup-before-rebuild`
2. Force deploy: `firebase deploy --force`
3. Investigate issues before retry

### Testing Strategy
1. Test each endpoint individually via curl/Postman
2. Test from dashboard UI
3. Monitor Cloud Function logs in real-time
4. Check Secret Manager access
5. Verify billing/quotas

## Success Criteria

### After Phase 6 (Backend Complete):
✅ All 18 API endpoints return 200 (not 404)
✅ Cloud Function logs show successful requests
✅ No errors in browser console
✅ GitHub Actions deploys automatically
✅ Notes "Analyze Trends" button works (endpoint #8)

### After Phase 8 (Data Loading + Graceful Degradation):
✅ Dashboard KPI cards show real numbers from Firebase
✅ **KPI cards visible even when data missing** (shows "--" instead of disappearing)
✅ Store Rankings populated with actual performance metrics
✅ **Store Rankings visible even when data missing** (shows "--" placeholders)
✅ Manual Data Entry loads existing data for editing
✅ Import Report processes files (no 404 errors)
✅ All AI features have data to analyze

### After Phase 9 (Store Hub):
✅ All 6 tabs generate AI analysis
✅ Reviews wait for user click (not auto-load)
✅ Local Market includes events, holidays, web search
✅ Huddle Brief has FOH/BOH/Manager variations
✅ Marketing ideas are multi-generational

### Final Complete System:
✅ Deployments map shows home/suitcase icons
✅ Budget tracker calculates correctly
✅ Goal Setter page works
✅ Industry News page loads
✅ Everything works together seamlessly
✅ All UI components unchanged and working
✅ All constants and business data intact

## Timeline Estimate

### Backend Rebuild (Phases 1-6)
- Phase 1 (Prep): 10 minutes
- Phase 2 (Scaffold): 15 minutes
- Phase 3 (Implementation): 30-45 minutes
- Phase 4 (Config): 10 minutes
- Phase 5 (Deploy & Test): 20 minutes
- Phase 6 (Cleanup): 10 minutes

**Backend Total: ~2 hours**

### Feature Restoration (Phases 7-8)
- Phase 7 (Deployments Feature): 20 minutes
- Phase 8 (Performance Data & Import + Graceful Degradation): 45 minutes

**Restoration Total: ~65 minutes (~1 hour)**

### Enhancements (Phases 9-11)
- Phase 9 (Store Hub AI Prompts): 1.5 hours
- Phase 10 (Goal Setter Page): 30 minutes
- Phase 11 (Industry News Page): 30 minutes
- Quick Fix (Remove Budget Planner): 2 minutes

**Enhancements Total: ~2.5 hours**

### UX Polish (Phase 12)
- Phase 12.1 (Fullscreen Toggles): 30 minutes
- Phase 12.2 (Command Palette): 2 hours
- Phase 12.3 (Enhanced Tooltips): 45 minutes

**UX Polish Total: ~3.25 hours**

### Grand Total Timeline

**Critical Path (Phases 1-8):** ~3.25 hours - Makes app functional
**All Features (Phases 1-11):** ~6.25 hours - All features working and enhanced
**World-Class Polish (Phases 1-12):** ~9.5 hours - Executive-grade professional app

---

## ⚠️ Conversation Window Management Strategy

**Problem:** Conversation window expires after 5 hours, rebuild is now 9.5 hours with UX polish.

### Three-Session Approach

**SESSION 1 - CRITICAL PATH (3.5 hours)**
- **Goal:** Get app fully functional
- **Phases:** 1-8 (Backend + Data Loading + Deployments)
- **Deliverables:**
  - ✅ All 18 API endpoints working
  - ✅ Backend deployed and tested
  - ✅ Data loading from Firebase
  - ✅ Dashboard shows real KPIs
  - ✅ Store Rankings populated
  - ✅ Import Report works
  - ✅ Deployments feature complete
  - ✅ Graceful degradation (UI visible even without data)
- **Safe Stop Point:** After Phase 8 testing
- **Time Buffer:** 1.5 hours before conversation expires

**SESSION 2 - FEATURE ENHANCEMENTS (2.5 hours)**
- **Goal:** Enhance AI features and add new pages
- **Phases:** 9-11 (Store Hub + Goal Setter + Industry News + Budget Planner removal)
- **Can start:** Same day (after break) or next day
- **Deliverables:**
  - ✅ Enhanced Store Hub prompts
  - ✅ Goal Setter page
  - ✅ Industry News page
  - ✅ Budget Planner removed
- **Safe Stop Point:** After Phase 11 completion
- **Time Buffer:** 2.5 hours before conversation expires

**SESSION 3 - UX POLISH (3.25 hours)**
- **Goal:** Add world-class professional polish
- **Phases:** 12 (Fullscreen + Command Palette + Enhanced Tooltips)
- **Can start:** Day 2 or later
- **Deliverables:**
  - ✅ Fullscreen toggle on all modals
  - ✅ Command Palette (Cmd+K) working
  - ✅ Enhanced tooltips throughout
  - ✅ Executive-grade polish complete
- **Safe Stop Point:** After Phase 12 completion
- **Time Buffer:** 1.75 hours before conversation expires

### Progress Tracking System

**After EACH phase, I will create/update `PROGRESS.md`:**

```markdown
# KPI Dashboard Rebuild Progress

**Last Updated:** [timestamp]
**Session:** 1 of 3
**Current Phase:** [number]
**Status:** [in_progress | completed | blocked]

## Completed Phases
✅ Phase 1: Preparation - [timestamp]
✅ Phase 2: Backend Scaffold - [timestamp]
[etc...]

## Current Phase
🔄 Phase [N]: [Name]
- Started: [timestamp]
- Progress: [description]
- Next step: [what to do next]

## Changes Made
- Files modified: [list]
- Git commits: [commit hashes]
- Deployments: [what was deployed]
- Tests passed: [list]

## Issues Encountered
- [None | List of issues and resolutions]

## To Resume
1. Verify last deployment: `firebase deploy --only hosting,functions`
2. Check Cloud Function logs
3. Continue with Phase [N+1]: [Name]
```

### How to Resume After Conversation Expires

**If conversation ends mid-rebuild:**
1. All changes are saved in Git commits
2. `PROGRESS.md` shows exact state
3. Start new conversation
4. Say: **"Resume rebuild from PROGRESS.md"**
5. I'll read PROGRESS.md and continue from last checkpoint

**Recommended Approach:**
1. **Session 1 (Day 1 Morning):** Phases 1-8 → App functional
2. **Break / Verify:** Test all critical features working
3. **Session 2 (Day 1 Afternoon or Day 2):** Phases 9-11 → Feature enhancements
4. **Break / Verify:** Test new pages and Store Hub
5. **Session 3 (Day 2 or Later):** Phase 12 → UX polish

**Notes:**
- Notes feature is already 95% complete - just needs backend endpoint verification in Phase 6
- Sessions can be done same day with breaks, or spread across 2-3 days
- Each session has safe checkpoints for conversation expiration

## Questions for User Before Starting

1. ✅ Confirmed: Keep ALL data in constants.ts exactly as-is?
2. Do you have the service account JSON file backed up locally?
3. Are you okay with ~10 minutes of downtime during deployment?
4. Should I create the backup branch automatically?
5. Any specific API endpoints that are most critical to test first?

## Notes

- This is a **code quality** improvement, not a feature change
- Zero changes to UI/UX or business logic
- Modern, scalable architecture
- Single source of truth for backend
- Clear separation of concerns
- Easy to maintain and extend
- Proper error handling and logging
- Production-ready from day one
