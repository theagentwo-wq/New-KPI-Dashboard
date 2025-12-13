# Development Notes & Progress Log

This file tracks ongoing development work, known issues, and progress on the KPI Dashboard project.

## ✅ NUCLEAR REBUILD COMPLETE - 2025-11-28

**Status**: Backend successfully rebuilt and deployed!

**Problem Solved**: Persistent API 404 errors caused by bloated, multi-AI-generated backend code with two conflicting function directories (`functions/` and `server/`)

**Solution Implemented**: Complete backend rebuild with clean, modern architecture while preserving ALL frontend UI, business logic, and data

**Results**:
- ✅ ALL 18 API endpoints now working (no more 404 errors!)
- ✅ Clean, modern TypeScript architecture with strict mode
- ✅ Single Cloud Function `api` handling all routes
- ✅ Gemini AI integration verified and working
- ✅ Zero frontend changes - all UI preserved perfectly
- ✅ All data and secrets preserved
- ✅ Successfully deployed to production

**Completed Phases**:
1. ✅ **Phase 1**: Preparation - Backup branch created, endpoints documented
2. ✅ **Phase 2**: Backend Scaffold - Deleted old directories, created clean structure
3. ✅ **Phase 3**: Core Backend Implementation - All 18 endpoints implemented
4. ✅ **Phase 4**: Configuration Updates - firebase.json, workflow, .gitignore updated
5. ✅ **Phase 5**: Deploy & Test - Deployed and verified working

**Backup Branch**: `backup-before-rebuild` (for rollback if needed)

**New Architecture**:
```
functions/
├── src/
│   ├── index.ts              # Main entry point - single Cloud Function
│   ├── routes/
│   │   └── gemini.ts         # All 18 AI endpoints
│   ├── services/
│   │   └── gemini-client.ts  # Gemini AI wrapper
│   ├── middleware/
│   │   ├── cors.ts           # CORS configuration
│   │   └── error-handler.ts  # Error handling
│   └── types/
│       └── api.ts            # Request/response types
├── package.json              # Clean dependencies
├── tsconfig.json             # Strict TypeScript
└── .eslintrc.js              # Linting rules
```

**Cloud Function URL**: https://api-3jm7sombua-uc.a.run.app
**Hosting URL**: https://kpi-dashboardgit-9913298-66e65.web.app

---

## ✅ FIRESTORE DATABASE CONNECTION COMPLETE - 2025-11-30

**Status**: Database successfully connected and app loading real data!

**Problem Solved**: App couldn't connect to Firestore database, causing blank page crashes

**Root Causes Discovered**:
1. **Wrong Database**: App was connecting to `(default)` database, but data was in `firebaseapp` database
2. **Duplicate Initialization**: Firebase was being initialized multiple times, causing config errors
3. **Missing Error Handling**: Undefined KPI configs crashed the dashboard rendering

**Solutions Implemented**:
1. ✅ Updated `initializeFirestore()` to connect to `firebaseapp` database (not `(default)`)
2. ✅ Added `getApps()` check to prevent duplicate Firebase initialization
3. ✅ Added ErrorBoundary component to catch and display React rendering errors
4. ✅ Added safety checks for undefined KPI configs in DashboardPage
5. ✅ Added loading screens and comprehensive error logging
6. ✅ Added error handling in all async data fetching operations

**Results**:
- ✅ Dashboard loads successfully with real data from Firestore!
- ✅ Sales rankings showing actual store data ($1,122,146 for Columbia, SC, etc.)
- ✅ Deployments working (Danny to Denver, Brenna Johnson to Denver, etc.)
- ✅ KPI cards displaying real financial metrics
- ✅ No more blank page crashes
- ✅ Comprehensive error handling prevents silent failures

**Files Modified**:
- `src/services/firebaseService.ts` - Database connection and initialization
- `src/App.tsx` - Error handling and loading states
- `src/index.tsx` - ErrorBoundary wrapper
- `src/components/ErrorBoundary.tsx` - New error boundary component
- `src/pages/DashboardPage.tsx` - KPI config safety checks

**Database Configuration**:
- **Project**: kpi-dashboardgit-9913298-66e65
- **Database**: `firebaseapp` (NOT `(default)`)
- **Collections**: notes, performance_actuals, goals, deployments, directors, budgets, analysis_jobs, import_jobs
- **Cache**: Memory-only (no IndexedDB persistence)

---

## Current Status (Last Updated: 2025-11-30)

### ✅ Completed

1. **Comprehensive Notes Redesign for Weekly Director Calls** (2025-11-30)
   - **Purpose**: Optimized notes section for weekly director call workflow, replacing period dropdown with intuitive navigation
   - **User Request**: "I want to have the most recent notes populate when opening the app. I would rather have a right and left selector to scroll through the weeks and an option to change the month."

   **Navigation Enhancements**:
   - ✅ Replaced dropdown period selector with intuitive left/right arrow navigation
   - ✅ Added month picker dropdown (2025-2028) for quick month jumps
   - ✅ Auto-loads current week on app open using Monday-start logic
   - ✅ Added "Today" button to instantly jump back to current week
   - ✅ Displays date range for selected week (e.g., "Dec 16 - Dec 22")
   - ✅ Week navigation with getCurrentWeek() function using Monday-based week calculation

   **Quick Director Context**:
   - ✅ Shows top 3 stores with real-time sales KPIs at a glance
   - ✅ Fetches performance data from Firestore via getPerformanceData()
   - ✅ Compact grid display at top of notes panel
   - ✅ Director-specific context during calls
   - ✅ Only displays when viewing director-specific notes (not Total Company)

   **Action Items Tracking**:
   - ✅ Auto-populates uncompleted checkboxes from previous week's notes
   - ✅ Markdown checkbox syntax support: `- [ ]` (unchecked) and `- [x]` (checked)
   - ✅ Highlighted follow-up section with amber background for visibility
   - ✅ "View All" button opens modal with full last week's notes
   - ✅ Displays up to 3 action items with count indicator (e.g., "+ 5 more")
   - ✅ parseCheckboxes() function extracts action items from markdown

   **Auto-save Indicator**:
   - ✅ Debounced auto-save with 2-second delay after typing stops
   - ✅ "Saved Xs ago" timestamp display for user feedback
   - ✅ Resets when note is submitted
   - ✅ Uses useEffect with cleanup to manage save timeout

   **Category Indicators**:
   - ✅ Badge display with note counts per category
   - ✅ "All (X)" shows total filtered notes count
   - ✅ Empty categories show no count (cleaner UI)
   - ✅ Quick visual overview of note distribution
   - ✅ categoryBadges memo for performance optimization

   **Preserved Features**:
   - ✅ Voice-to-text dictation (Web Speech API)
   - ✅ Image upload and preview functionality
   - ✅ Search functionality
   - ✅ Category filtering
   - ✅ Note editing and deletion
   - ✅ Trends analysis via Gemini AI

   **Technical Changes**:
   - Removed unused props: mainDashboardPeriod, weeksInSelectedMonth
   - Fixed type errors: Changed PerformanceData → StorePerformanceData
   - Added getCurrentWeek() for Monday-start week calculation
   - Implemented parseCheckboxes() for action item extraction
   - Multiple useMemo optimizations: lastWeekNotes, actionItemsFromLastWeek, directorContext, weekDateRange, categoryBadges
   - Enhanced modal system for last week's notes view
   - Performance data fetching with useEffect (triggered on dbStatus.connected)

   **Files Modified**:
   - [src/components/NotesPanel.tsx](src/components/NotesPanel.tsx) - Complete rewrite (862 lines, +363/-146 changes)
   - Added 6 new memos for performance
   - Enhanced UI with 3 new sections (Quick Context, Action Items, Auto-save indicator)

   **UX Improvements**:
   - Weekly director calls now have contextualized notes with action item tracking
   - Navigation is faster (arrows + month picker vs scrolling through dropdown)
   - Auto-load current week reduces clicks needed to start taking notes
   - Follow-ups automatically surface from last week (no manual searching)
   - Real-time store performance context helps inform discussions
   - Auto-save indicator builds user confidence

   **Deployment**:
   - ✅ Built successfully with Vite
   - ✅ Deployed to Firebase Hosting: https://kpi-dashboardgit-9913298-66e65.web.app
   - ✅ Committed to git with comprehensive commit message

   **User Satisfaction**: All requested features implemented plus recommended enhancements accepted

1. **Fixed Store Hub Street View & Details Location Accuracy** (2025-11-30)
   - Issue: Street View showing "Invalid 'location' parameter" error and wrong addresses (1924 Gregg St, 2179 Pickens St)
   - Root cause: Google Street View Embed API has severe limitations - rejects almost all location parameter formats
   - **What was tested** (all failed with 400 Bad Request):
     - ❌ Business names (`"Tupelo Honey Southern Kitchen and Bar Columbia, SC"`)
     - ❌ Street addresses (`"2138 Pickens Street, Columbia, SC 29201"`)
     - ❌ Coordinates (`34.0165288,-81.0327102`)
     - ❌ Plus Codes (`"2X88+PR Columbia, SC, USA"`) - even Google's own geocoding system rejected!
   - **Final solution**: Use Google Maps "place" mode with place_id
     1. **Search by business name** via Places API: `"Tupelo Honey Southern Kitchen and Bar [City, State]"`
     2. **Extract place_id** from Places API result
     3. **Use place mode embed**: `https://www.google.com/maps/embed/v1/place?q=place_id:XXXXX&zoom=19&maptype=satellite`
   - This shows an interactive map (not direct Street View) where users can click the pegman icon to enter Street View
   - Benefits:
     - place_id is guaranteed to work (only format that worked)
     - Shows location context on satellite map
     - User has full control (pan, zoom, Street View access)
     - More reliable than fighting with broken Street View Embed API
     - Actually better UX - users see context before diving into Street View
   - Also fixed: Updated Columbia, SC coordinates in STORE_DETAILS from `34.01509,-81.02641` to `34.0165288,-81.0327102`
   - Files: [LocationInsightsModal.tsx:211-234](src/components/LocationInsightsModal.tsx#L211-L234), [constants.ts:68](src/constants.ts#L68)
1. **Fixed Store Hub AI Analysis: Missing Location Context** (2025-11-30)
   - Issue: All AI analyses showing placeholder text "[Insert Restaurant Name and Location Here]" instead of actual location
   - Root cause: API was only receiving city/state (e.g., "Columbia, SC") without restaurant name
   - Solution: Pass full restaurant name to all AI API calls
     - Format: `"Tupelo Honey Southern Kitchen and Bar [City, State]"`
     - Applied to all analysis tabs: Reviews & Buzz, Local Market, Huddle Brief, Forecast, Marketing
   - Now AI receives proper context: "Tupelo Honey Southern Kitchen and Bar Columbia, SC" instead of just "Columbia, SC"
   - Files: [LocationInsightsModal.tsx:132](src/components/LocationInsightsModal.tsx#L132)
1. **Fixed Backend API Parameter Mismatch** (2025-11-30)
   - Issue: AI still showing "Okay. I'm ready to analyze customer reviews for undefined" even after frontend fix
   - Root cause: Backend expecting `location` but frontend sending `locationName`, backend not using passed `reviews` data
   - Solution: Updated backend to match frontend data structure
     - All API interfaces changed from `location: string` to `locationName: string`
     - Updated `getReviewSummary` to analyze actual Google reviews passed from frontend (was asking AI to search)
     - Updated `generateHuddleBrief` to use `performanceData` instead of `storeData`
     - All endpoints now extract from `req.body.data` (matching frontend format)
   - Now backend receives and uses: `{ locationName: "Tupelo Honey Southern Kitchen and Bar Columbia, SC", reviews: [...] }`
   - Files: [functions/src/types/api.ts](functions/src/types/api.ts), [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Fixed Store Hub: Local Market 500 Error & Hot Topics Issues** (2025-11-30)
   - Issue 1: Local Market returning 500 error when generating analysis
   - Root cause: Leftover `${location}` variable reference in prompt (should be `${locationName}`)
   - Issue 2: Hot Topics generating all 3 briefs (FOH, BOH, Managers) when only Managers was requested
   - Root cause: Prompt said "INCORPORATE ALL OF FOH + BOH" which AI interpreted as "generate all three"
   - Issue 3: Tab name "Huddle Brief" should be "Hot Topics"
   - Solution:
     - Fixed Local Market prompt variable reference (line 135)
     - Rewrote Managers prompt with explicit instruction: "Generate ONLY ONE brief for Managers"
     - Renamed tab from "Huddle Brief" to "Hot Topics" throughout UI
     - Updated description and section headers
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts), [LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx)
1. **Fixed Store Hub: Outdated Local Market Data & Persistent Hot Topics Duplication** (2025-11-30)
   - Issue 1: Local Market showing outdated events (Labor Day in September when current date is December)
   - Root cause: No current date context in prompt, AI defaulting to training data
   - Issue 2: Hot Topics for Managers STILL generating all 3 briefs (FOH + BOH + Managers) instead of one
   - Root cause: Previous prompt still said "incorporate FOH/BOH" which AI interpreted as "write all three"
   - Solution:
     - **Local Market**: Added server-side current date to prompt
       - `const today = new Date()` to get actual current date
       - Emphasized "NEXT 30 DAYS from ${currentDate}"
       - Broadened event search: music, sports, arts, conventions, construction, city initiatives
       - Added "DO NOT reference past events" instruction
       - Specific date requirements in timing recommendations
     - **Hot Topics Managers**: Completely rewrote prompt structure
       - Changed focus from "comprehensive brief with FOH/BOH" to "manager talking points"
       - Added ⚠️ CRITICAL warning against duplicating briefs
       - New structure: 5 manager-focused sections (Performance, Team Leadership, Operations, Culture, Action Plan)
       - FOH/BOH mentions are now "suggestions for what managers should communicate" not separate briefs
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Fixed Store Hub: FOH and BOH Hot Topics Duplication - Complete Solution** (2025-11-30)
   - Issue: FOH generating all 3 briefs (FOH+BOH+Manager), BOH generating 2 briefs (BOH+Manager)
   - Root cause: FOH and BOH prompts lacked the same explicit anti-duplication instructions as Managers
   - Solution: Applied identical fix pattern to FOH and BOH that worked for Managers
     - **FOH**: Added ⚠️ CRITICAL warning, restructured into 5 FOH-only sections (Sales, Guest Experience, Teamwork, Weather, Motivation)
     - **BOH**: Added ⚠️ CRITICAL warning, restructured into 5 BOH-only sections (Safety, Craft Pride, Execution, Kitchen Teamwork, Motivation)
     - Both now explicitly state: "Write ONE brief for [AUDIENCE] ONLY. Do NOT write [other] sections."
   - All three audience types now have consistent structure and anti-duplication safeguards
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Fixed FOH and BOH Still Combining: Added STOP Instructions** (2025-11-30)
   - Issue: After previous fix, Manager was separated but FOH and BOH were still appearing together in one brief
   - User feedback: "The manager hot topics no longer appears but the FOH and BOH are still combined into one"
   - Solution: Added even stronger anti-duplication instructions matching the most explicit pattern:
     - **FOH (lines 242-247)**: Added "STOP after completing the FOH brief" as final instruction
     - **BOH (lines 291-296)**: Applied identical pattern with "STOP after completing the BOH brief"
     - Both now have 7-point CRITICAL INSTRUCTIONS list with explicit "Do NOT write [other audience]" and "STOP after completing"
   - This mirrors the exact pattern that successfully fixed Manager Hot Topics
   - Expected result: Complete separation of all three audience briefs (FOH, BOH, Manager)
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Added Local Events to All Hot Topics Briefs** (2025-11-30)
   - User request: Include local events (like USC games, concerts) in FOH Hot Topics similar to marketing brief
   - Example: "There is a Clemson football game at 4 PM today" or "Concert at the auditorium will bring guests before the show"
   - Solution: Added event context to all three audience briefs (FOH, BOH, Managers)
     - Added current date generation with weekday format for all briefs
     - **FOH**: New section "Weather, Events & Traffic Impact" with:
       - Local events happening today/tonight (USC games, concerts, Vista events)
       - Specific times when known (e.g., "USC vs Clemson at 4:00 PM")
       - Pre-event rush timing predictions
       - Traffic flow predictions based on events and weather
     - **BOH**: Enhanced section "Today's Execution Plan & Traffic Drivers" with:
       - Same event listings as FOH
       - Prep priorities based on expected event-driven volume
       - Timing goals for high-volume periods
     - **Managers**: Expanded section "Operations Strategy & Traffic Drivers" with:
       - Event context for staffing decisions
       - Expected traffic patterns based on events
       - Floor management and section assignments based on expected volume
   - All briefs now show USC Gamecocks games, Colonial Life Arena concerts, Trustus Theatre shows, Vista events, and conventions
   - Helps teams anticipate traffic patterns and prepare accordingly
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Added Company Promotions to All Hot Topics Briefs** (2025-11-30)
   - User request: Reference https://www.tupelohoneycafe.com in all Hot Topics briefs for current company promotions
   - Solution: Added company promotions section to all three audience briefs
     - **FOH**: Added to "Sales Focus & Contests" section
       - Check website for current promotions/specials
       - Highlight active promotions to guests
       - Train servers on promotion details and upselling points
     - **BOH**: Added to "Today's Execution Plan & Traffic Drivers" section
       - Identify promoted menu items requiring extra prep
       - Ensure ingredients stocked for promoted dishes
       - Communicate special preparation needs
       - Updated execution planning to consider active promotions
     - **Managers**: Added to "Team Leadership & Communication" section (marked CRITICAL)
       - Ensure all teams aware of active promotions
       - Communicate promotion details, upselling points, execution requirements
       - Verify FOH knows presentation and BOH knows preparation
   - All briefs now reference the Tupelo Honey corporate website to identify live promotions
   - Ensures consistent execution of company-wide promotional campaigns across all teams
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Implemented Enhanced 7-Day Sales Forecast** (2025-11-30)
   - Challenge: No daily historical data available, only weekly/period averages
   - User question: "How do we display forecast information without daily data?"
   - Solution: Hybrid forecast approach combining industry baselines, weather, and local events
     - **Backend methodology** ([functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)):
       - Baseline calculation: $70-85K weekly sales ÷ 7 days = $10-12K daily baseline
       - Day-of-week multipliers: Mon/Tue (0.7-0.8x), Wed/Thu (0.9-1.0x), Fri/Sat (1.3-1.5x), Sun (1.1-1.2x)
       - Weather impact factors: Sunny 60-75°F (+10-15%), Rain (-15-25%), Very Hot/Cold (-5-15%)
       - Event impact factors: USC games (+30-50%), Concerts (+20-35%), Vista Art Walks (+15-25%)
       - Returns JSON with `summary`, `chartData` (salesLow/Mid/High for 7 days), `dailyBreakdown` (detailed info per day)
     - **Frontend display** ([src/components/LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx)):
       - **Overview Summary**: Markdown-formatted week outlook with trends and key recommendations
       - **3-Line Chart**: Shows sales forecast with confidence bands (solid mid-line, dashed low/high range lines)
       - **Daily Breakdown Cards**: For each of 7 days shows:
         - Sales range ($XX,XXX - $XX,XXX) with variance indicator
         - Traffic level badge (color-coded: VERY HIGH=red, HIGH=orange, MEDIUM=yellow, LOW=gray)
         - Weather impact description with patio viability
         - Local events list (USC games with times, concerts, Vista events)
         - Expected rush periods (displayed as chips)
         - Operational recommendations (staffing levels, prep priorities, special considerations)
       - **Weather Outlook**: 7-day weather grid at bottom
   - Benefits:
     - ✅ Works with limited historical data (uses industry-standard baseline methodology)
     - ✅ Provides actionable insights (not just numbers - includes staffing recommendations)
     - ✅ Sets realistic expectations (shows ranges instead of false precision)
     - ✅ Accounts for local context (weather + Columbia, SC events)
     - ✅ Can be enhanced later when daily data becomes available
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts), [src/components/LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx)
1. **Enhanced 7-Day Forecast with Actual Historical Data** (2025-11-30)
   - User request: "ADD to all of the above the actual historical data into the equation"
   - Previous implementation: Used only generic industry baselines ($70-85K weekly) with `historicalData: 'N/A'`
   - Solution: Integrated actual sales data from Firestore `performance_actuals` collection
     - **Frontend enhancement** ([src/components/LocationInsightsModal.tsx:139-196](src/components/LocationInsightsModal.tsx#L139-L196)):
       - Fetches all performance data from Firestore using `getPerformanceData()`
       - Filters for the selected location (storeId)
       - Sorts by date descending (most recent first)
       - Calculates **last 5 weeks average**: Recent weekly sales average from actual data
       - Calculates **YOY comparison**: Same 5 weeks from last year for trend analysis
       - Formats summary JSON with:
         - `recentWeeksCount`: Number of recent weeks with data
         - `recentWeeklyAverage`: Actual recent weekly sales average
         - `recentWeeklySales`: Array of actual weekly sales figures
         - `yoyWeeksCount`: Number of year-over-year weeks available
         - `yoyWeeklyAverage`: YOY weekly sales average
         - `yoyChange`: YOY growth/decline percentage
       - Falls back to 'N/A' if no historical data available (graceful degradation)
     - **Backend enhancement** ([functions/src/routes/gemini.ts:470-491](functions/src/routes/gemini.ts#L470-L491)):
       - Updated prompt to use actual historical data when available
       - AI now uses `recentWeeklyAverage` as baseline instead of generic $70-85K estimate
       - Considers `yoyChange` percentage to inform forecast direction (growth/decline trend)
       - References `recentWeeklySales` array to understand week-to-week variation
       - Falls back to industry baseline only when historical data is 'N/A'
       - Overview summary now mentions YOY performance trend when using real data
   - **Data Flow**:
     1. User opens forecast for a location (e.g., "Columbia, SC")
     2. Frontend queries Firestore for all `performance_actuals` where `storeId === location`
     3. Extracts recent 5 weeks of Sales data and YOY data
     4. Passes JSON summary to backend API
     5. Backend AI uses actual data for baseline, applies day-of-week multipliers, weather, and events
     6. Returns forecast with real historical context
   - **Benefits**:
     - ✅ Uses actual store performance instead of generic estimates
     - ✅ Shows YOY trends to understand if location is growing or declining
     - ✅ More accurate baselines lead to better forecasts
     - ✅ Still works when no historical data exists (falls back gracefully)
     - ✅ AI can reference actual week-to-week variation patterns
   - Files: [src/components/LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx), [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Fixed Forecast Chart Display Issue** (2025-11-30)
   - Issue: After deployment, chart was blank despite summary text displaying correctly
   - Root cause: TypeScript build error (`CustomTooltip` declared but never used) prevented frontend rebuild
   - Solution: Removed unused `CustomTooltip` component from LocationInsightsModal.tsx
   - Result: Chart now displays correctly with 3-line sales forecast (low/mid/high)
   - Files: [src/components/LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx)
1. **Reordered Forecast Tab Sections for Better UX** (2025-11-30)
   - User request: "Move the 7 day weather up to the top above the 7 day forecast chart"
   - Solution: Reorganized forecast display sections
   - New order:
     1. Overview Summary (week outlook and trends)
     2. 7-Day Weather Outlook ☀️ (moved up from bottom)
     3. 7-Day Sales Forecast Chart 📊
     4. Daily Breakdown Cards (detailed day-by-day analysis)
   - Result: Better information flow - users see weather context before sales forecast
   - Files: [src/components/LocationInsightsModal.tsx](src/components/LocationInsightsModal.tsx)
1. **Enhanced Local Market: Provide Specific Events or Clickable Links** (2025-11-30)
   - Issue: AI telling users to "check local listings" instead of providing actionable information
   - User requirement: Show specific events (TOP 3 in each category) OR provide clickable links to venues
   - Solution: Completely rewrote Local Market prompt with directive instructions
     - Added CRITICAL rule: "Provide SPECIFIC information OR links, DO NOT say 'check local listings'"
     - Restructured to request TOP 3 specific items in each category
     - Added specific Columbia, SC venue links:
       - University of South Carolina Athletics (gamecocksonline.com)
       - Colonial Life Arena, Trustus Theatre, Koger Center
       - Columbia Museum of Art
       - Columbia Metropolitan Convention Center
       - SCDOT traffic advisories
     - Enhanced all sections: Demographics (actual numbers), Competition (3-5 named competitors), Weather (specific ranges)
   - Result: AI provides concrete data or markdown links, not vague instructions
   - Files: [functions/src/routes/gemini.ts](functions/src/routes/gemini.ts)
1. **Fixed TypeScript Build Errors** (2025-11-26)
   - Issue: Server build failing with "Not all code paths return a value" errors
   - Solution: Added explicit `Promise<void>` return types to async route handlers
   - Files: `server/src/index.ts`

2. **Fixed API 404 Errors** (2025-11-26)
   - Issue: Frontend calling `/api/{action}` but server only had `/gemini` and `/getPlaceDetails`
   - Solution: Created individual routes for each AI action that forward to main gemini handler
   - Added handlers for: getInsights, getNoteTrends, getAnomalyDetections, getAnomalyInsights, getVarianceAnalysis, runWhatIfScenario, startTask, getStrategicExecutiveAnalysis
   - Files: `server/src/index.ts`

3. **Cleaned Up Git Tracking** (2025-11-26)
   - Removed `server/node_modules` from Git tracking (7,681 files)
   - Already properly ignored in `.gitignore`

4. **Fixed API 500 Errors** (2025-11-26)
   - Issue: Frontend receiving 500 Internal Server Error from all API calls
   - Root cause: Response format mismatch - server returned `{ content }` but frontend expected `{ data }`
   - Solution: Changed server response format in `handleGeminiRequest()` and `getReviewSummary` early return
   - Files: `server/src/index.ts`

5. **Fixed Local Build Environment** (2025-11-26)
   - Issue: `tsc` command not found when running `npm run build` locally
   - Root cause: Root `node_modules` directory was missing
   - Solution: Ran `npm install` to install all dependencies including TypeScript
   - Local builds now work successfully

### 🚧 In Progress
None currently

### 📋 Top Priorities

#### Priority 1: API Connectivity ✅ COMPLETE
**Status**: All routing and response format issues resolved, deployed to production

**What was done**:
- ✅ Fixed all API routing issues (404 errors resolved)
- ✅ Created individual routes for each Gemini AI action
- ✅ Added missing action handlers in server
- ✅ Fixed response format mismatch (500 errors resolved)
- ✅ Deployed to production via GitHub Actions
- ✅ Local build environment configured correctly

**What's needed**:
- Test API endpoints in production environment
- Verify Gemini AI responses work correctly
- Verify Google Maps Places API works correctly
- Check for any permission/authentication issues with Vertex AI

**Files involved**:
- `server/src/index.ts` - All API routing and handlers
- `src/lib/ai-client.ts` - Frontend API client
- `src/services/geminiService.ts` - Service layer for AI calls

---

#### Priority 2: Financial Data Population ✅ COMPLETE
**Status**: Firestore database connected, real data now displaying in dashboard!

**What was done**:
- ✅ Fixed database connection to use `firebaseapp` database
- ✅ Dashboard now shows real financial data from Firestore
- ✅ Sales rankings displaying actual store performance
- ✅ KPI metrics populated from database
- ✅ All data fetching operations working correctly

**Current Functionality**:
- ✅ Dashboard displaying real sales data by location
- ✅ KPI cards showing actual financial metrics (Sales, SOP%, Prime Cost, etc.)
- ✅ Deployments feature working (showing director deployments with dates and budgets)
- ✅ Data filtering by period (Q3 2025 visible in UI)
- ✅ Director profiles and store data integrated
- ✅ Error handling prevents crashes from missing/malformed data

**Next Steps** (if needed):
- Verify all KPI metrics are displaying correctly
- Test period filtering (week, month, quarter, year)
- Test view filtering (Total Company, Region, Location)
- Confirm data accuracy matches expected business metrics

---

#### Priority 2.5: Notes Feature Complete ✅ COMPLETE
**Status**: Notes feature fully functional with period filtering and legacy data support!

**Session Summary (2025-11-30)**:
This session focused on implementing comprehensive notes functionality with weekly/monthly period filtering for 2025-2028, as well as fixing critical bugs that prevented notes from working.

**Problems Discovered & Solved**:

1. **Notes Not Loading from Database** ✅ FIXED
   - Issue: Notes filtering logic was too strict, filtered out all notes
   - Solution: Set default to show "All Periods" instead of filtering by current period
   - Notes now visible immediately on page load

2. **Period Selector Dropdown Empty** ✅ FIXED
   - Issue: `ALL_PERIODS` array only had 4 quarterly/yearly periods
   - Root cause: No monthly or weekly periods were being generated
   - Solution: Created `generateMonthlyPeriods()` and `generateWeeklyPeriods()` functions
   - Now generates 48 monthly periods + ~208 weekly periods for 2025-2028
   - File: `src/utils/dateUtils.ts`

3. **TypeError: Cannot read 'view' from undefined** ✅ FIXED
   - Issue: Some notes in database missing `scope` property
   - Solution: Added null safety check, filter out invalid notes with warning
   - File: `src/components/NotesPanel.tsx:271-327`

4. **Note Creation Error: "Unsupported field value: undefined"** ✅ FIXED
   - Issue: Firestore doesn't allow `undefined` values, was setting `imageUrl: undefined` when no image
   - Solution: Only include `imageUrl` in note object if image exists
   - Used spread operator: `...(imageRefUrl && { imageUrl: imageRefUrl })`
   - File: `src/services/firebaseService.ts:152-160`

5. **Old Notes Not Displaying** ✅ FIXED
   - Issue: Legacy notes used different data format (view/storeId as top-level fields vs nested in scope)
   - Issue 2: Legacy notes used capitalized director names ("Heather") vs lowercase IDs ("heather")
   - Solution: Updated filtering to handle both old and new formats
   - Solution 2: Added case-insensitive comparison for director view matching
   - File: `src/components/NotesPanel.tsx:309-335`

**Features Implemented**:
- ✅ Default view shows all notes from all periods (no filtering on load)
- ✅ Dropdown selector with 256+ periods (48 monthly + 208 weekly for 2025-2028)
- ✅ Period navigation buttons (prev/next) - disabled when showing all periods
- ✅ Heading displays "All Periods" or specific period label
- ✅ New notes use selected period or fallback to current monthly period
- ✅ Comprehensive logging for all CRUD operations (create, read, update, delete)
- ✅ Legacy data format support (backward compatibility with old notes)
- ✅ Case-insensitive director name matching
- ✅ Null safety checks prevent crashes from malformed data

**Technical Implementation**:

1. **Period Generation** (`src/utils/dateUtils.ts`):
   - `generateMonthlyPeriods(2025, 2028)`: Creates 48 monthly periods
   - `generateWeeklyPeriods(2025, 2028)`: Creates ~208 weekly periods (52-53 per year)
   - Weekly periods start on Monday, end on Sunday
   - Handles year boundaries correctly

2. **Period Selector UI** (`src/components/NotesPanel.tsx`):
   - Two-column grid: Scope selector | Period selector
   - Period dropdown organized in optgroups: "Monthly Periods (2025-2028)" and "Weekly Periods (2025-2028)"
   - Shows "All Periods" option at top
   - Navigation buttons (chevron left/right) for cycling through periods of same type

3. **Data Compatibility** (`src/components/NotesPanel.tsx:309-335`):
   ```typescript
   // Handles both formats:
   // Old: { view: "Heather", storeId: "Knoxville, TN", ... }
   // New: { scope: { view: "heather", storeId: "Knoxville, TN" }, ... }

   if (note.scope) {
     noteView = note.scope.view;
     noteStoreId = note.scope.storeId;
   } else if ((note as any).view) {
     noteView = (note as any).view;
     noteStoreId = (note as any).storeId;
   }

   // Case-insensitive comparison
   const viewMatches = noteView.toLowerCase() === scope.view.toLowerCase();
   ```

4. **Firestore Write Safety** (`src/services/firebaseService.ts:152-160`):
   ```typescript
   // Only include imageUrl if it exists (Firestore rejects undefined)
   const newNote = {
     monthlyPeriodLabel,
     category,
     content,
     scope,
     createdAt: new Date().toISOString(),
     ...(imageRefUrl && { imageUrl: imageRefUrl }),
   };
   ```

**Database Verification**:
- ✅ Confirmed connection to `firebaseapp` database (NOT default)
- ✅ Collection path: `notes` (verified in logs)
- ✅ 9 existing notes successfully loaded from database
- ✅ Notes write operation logs show successful creation with document ID
- ✅ Legacy notes (with old format) now display correctly

**Files Modified**:
- `src/utils/dateUtils.ts` - Added period generation functions (75 new lines)
- `src/components/NotesPanel.tsx` - Period selector UI, legacy format support, null safety
- `src/services/firebaseService.ts` - Fixed undefined value issue, added comprehensive logging

**User Request Fulfilled**:
> "I want to be able to pick notes weekly or monthly for years 2025 thru 2028"

**Testing Status**:
- ✅ Period dropdown populates with all periods
- ✅ Period selection changes heading text
- ✅ Navigation buttons work (when period selected)
- ✅ Notes display correctly (both old and new formats)
- ✅ Note creation works without errors
- ⏸️ Note write verification pending user testing (logs show success)
- ⏸️ Update/delete operations pending user testing

**Next Session TODO**:
1. Test note creation in production (verify writes to database)
2. Test note update functionality
3. Test note deletion functionality
4. Verify period filtering works correctly (select a period, confirm only those notes show)
5. Test period navigation buttons (prev/next)
6. Optional: Migrate old notes to new format for consistency

---

#### Priority 3: UI/UX Functionality Restoration 🔴 REQUIRES USER INPUT
**Status**: Needs assessment, user has screenshots and descriptions

**Problem**:
A previous LLM deleted or broke significant portions of the UI functionality. User has screenshots showing how things should work.

**What needs to happen**:
1. **Get screenshots and descriptions from user**
   - What functionality is missing?
   - What should each feature do?
   - How should it look and behave?

2. **Assess what's broken/missing**
   - Compare current state to desired state
   - Identify deleted components
   - Identify broken interactions

3. **Prioritize restoration work**
   - Critical functionality first
   - Nice-to-have features later

4. **Rebuild missing features**
   - Restore deleted components
   - Fix broken interactions
   - Match design to screenshots

**Next steps**:
- User to provide screenshots and feature descriptions
- Create detailed list of missing/broken features
- Break down into smaller tasks

---

### 📋 Other TODO Items
- **Test API Endpoints** - After Priority 1 deployment completes
- **Performance optimization** - After data is connected
- **Error handling improvements** - Ongoing as issues are discovered

## Known Issues

### API & Backend
- **AI API 404s**: FIXED - All routes now properly forwarded to gemini handler
- **Maps API**: Uses client-side Google Maps SDK (in `src/lib/ai-client.ts:50-80`)
- **Gemini Actions Not Implemented**: Some actions in frontend call non-existent backend handlers

### Database
- Financial data exists in Firestore but not connected to dashboard UI
- Need to wire up data fetching layer

### UI/UX
- Large portion of functionality was deleted by another LLM
- User has screenshots and descriptions of how things should work
- Will need to restore based on those references

## Architecture Notes

### API Structure
- **Frontend**: Calls `/api/{action}` via `src/lib/ai-client.ts`
- **Firebase Hosting**: Routes `/api/**` to Cloud Function named `api`
- **Server**: Express app in `server/src/index.ts` with individual routes per action
- **Gemini Handler**: All AI actions go through `handleGeminiRequest()` function

### Environment Variables & Secrets Management

**Frontend Environment Variables** (use `VITE_` prefix for build-time injection):
- `VITE_MAPS_KEY` - Google Maps API key
- `VITE_FIREBASE_CLIENT_CONFIG` - Firebase client config JSON

**Backend Secrets** (Google Secret Manager):
- `GEMINI_API_KEY` - Gemini AI API key (accessed by Cloud Functions via Firebase secrets mechanism)
  - Configured in `server/src/index.ts` via `onRequest({ secrets: ["GEMINI_API_KEY"] })`
  - Stored in Google Secret Manager: https://console.cloud.google.com/security/secret-manager?project=kpi-dashboardgit-9913298-66e65
  - Cloud Functions automatically pull from Secret Manager (no GitHub secret needed)

**GitHub Secrets** (for deployment):
- `VITE_MAPS_KEY` - Injected during build for frontend
- `FIREBASE_CLIENT_CONFIG` - Injected during build for frontend Firebase initialization
- `FIREBASE_SERVICE_ACCOUNT_OPERATIONS_KPI_DASHBOARD` - Service account JSON for GitHub Actions to deploy to Firebase
  - **IMPORTANT**: This is needed for automated deployments via GitHub Actions
  - Do NOT delete this secret - it's not related to Gemini API
  - Used by `.github/workflows/firebase-hosting-merge.yml` to authenticate deployments

**Secret Separation**:
- Frontend secrets → GitHub Secrets (injected at build time)
- Backend secrets → Google Secret Manager (accessed at runtime by Cloud Functions)
- Deployment secrets → GitHub Secrets (used by GitHub Actions)

### Deployment Flow
1. Code pushed to `main` branch
2. GitHub Actions triggers
3. Builds frontend and server functions
4. Deploys to Firebase Hosting
5. Server functions deployed as Cloud Functions

## Git Workflow

- Main branch: `main`
- All commits include Claude Code attribution
- Auto-commit on all changes (user request)
- node_modules properly ignored

## Quick Reference Commands

```bash
# Local development
npm run dev                    # Run frontend dev server
cd server && npm run build     # Build server functions

# Deployment (automatic via GitHub Actions)
git push origin main           # Triggers auto-deployment

# Firebase
firebase deploy --only hosting           # Deploy frontend only
firebase deploy --only functions         # Deploy functions only
```

---

## 📋 IMPLEMENTATION PLAN: Weekly MTD Snapshot Feature

**Status**: Plan approved, ready for implementation
**Created**: 2025-12-13
**Estimated Effort**: 6-8 hours

### Executive Summary

Implement weekly MTD (Month-to-Date) snapshot storage to preserve performance data for each week within a fiscal period. Currently, weekly imports overwrite previous weeks because all weeks within the same fiscal period share the same document ID. The new system will store each week separately using a week number suffix in the document ID pattern.

**Key Decision**: User chose **Option B** - Store weekly snapshots as separate documents with understanding that MTD values are cumulative.

### Current State Analysis

#### Problem
```typescript
// Current docId generation in App.tsx:
const matchingPeriod = findFiscalMonthForDate(dateObj);
// Returns: { label: "FY2025 P11", startDate: Date(2024-12-30) }

// In firebaseService.ts:
const docId = `${storeId}_${period.startDate}`;
// Result: "Columbia_2024-12-30" for ALL weeks in P11
// ❌ Week 2 import overwrites Week 1 data
```

#### CSV Data Structure (Confirmed)
- **Week 1 CSV**: Only "Week 1" column populated, MTD = $91,706
- **Week 2 CSV**: Both "Week 1" + "Week 2" columns populated, MTD = $158,128 (cumulative)
- **Important**: MTD values are cumulative snapshots, NOT incremental deltas
  - Week 2's $158K includes Week 1's $91K
  - Dollar metrics are summed week-over-week
  - Percentage metrics are weighted averages

#### Current Data Flow
1. User uploads CSV (e.g., "Financial Tracker - Week 2.csv")
2. CSV sent to Cloud Function `/gemini` endpoint
3. `parsePnLCsvHorizontal()` extracts MTD column data
4. Frontend calls `findFiscalMonthForDate()` to get period
5. `savePerformanceDataForPeriod()` saves with date-based docId
6. **Problem**: Same docId for all weeks → only last week survives

### Target Architecture

#### New Document ID Pattern
```
{storeId}_{fiscalPeriodLabel}_W{weekNumber}

Examples:
- "Columbia_FY2025-P11_W1"
- "Columbia_FY2025-P11_W2"
- "Columbia_FY2025-P11_W3"
- "Knoxville_FY2025-P12_W1"
```

#### Week Number Detection
Extract from CSV filename or header:
- **Filename**: "Financial Tracker - Week 2.csv" → 2
- **Header**: "Week 3" column → 3
- **Fallback**: Default to Week 1 if not found

#### Period Interface Enhancement
```typescript
export interface Period {
  startDate: Date;
  endDate: Date;
  label: string;              // "FY2025 P11"
  type: PeriodType;           // "weekly" for new periods
  year: number;
  quarter: number;
  weekNumber?: number;        // NEW: 1-5 for weekly periods
  periodLabel?: string;       // NEW: Parent period label for weekly periods
}
```

#### Navigation Behavior
- **UI**: Keep existing arrow navigation (<<  >>)
- **Default View**: Load latest imported week on dashboard open
- **Week List**: Chronological list of weekly MTD periods
  - "FY2025 P11 W1 (MTD)" through "FY2025 P11 W5 (MTD)"
  - Users navigate with arrow buttons, no dropdown

#### Duplicate Handling
When re-importing existing week:
- Show warning dialog: "Week 2 already exists for Columbia, SC"
- Display comparison:
  - **Old Data**: Imported 2024-12-07, Sales: $158,128
  - **New Data**: Sales: $160,450
- User chooses: Replace or Cancel

### Implementation Changes by File

#### 1. `src/types.ts`
**Purpose**: Add week number support to Period interface

```typescript
export interface Period {
  startDate: Date;
  endDate: Date;
  label: string;
  type: PeriodType;
  year: number;
  quarter: number;
  weekNumber?: number;        // NEW: Optional week number (1-5)
  periodLabel?: string;       // NEW: Parent period label for weekly periods
}
```

**Changes**:
- Add optional `weekNumber` field
- Add optional `periodLabel` field to reference parent fiscal period

---

#### 2. `functions/src/routes/gemini.ts`
**Purpose**: Extract week number from CSV during parsing

**Current Code** (lines ~200-250):
```typescript
function parsePnLCsvHorizontal(csvContent: string, fileName: string) {
  // ... existing code ...
  return {
    results: [{
      dataType: 'Actuals',
      sourceName: fileName,
      data: results,
    }]
  };
}
```

**New Code**:
```typescript
/**
 * Detects week number from CSV filename or header
 * Examples:
 *   "Financial Tracker - Week 2.csv" → 2
 *   CSV header with "Week 3" → 3
 *   No match → 1 (fallback)
 */
function detectWeekNumber(csvContent: string, fileName: string): number {
  // Try filename first
  const fileMatch = fileName.match(/Week\s+(\d+)/i);
  if (fileMatch) {
    const weekNum = parseInt(fileMatch[1], 10);
    console.log(`[detectWeekNumber] Detected Week ${weekNum} from filename`);
    return weekNum;
  }

  // Try CSV header
  const headerMatch = csvContent.match(/Week\s+(\d+)/i);
  if (headerMatch) {
    const weekNum = parseInt(headerMatch[1], 10);
    console.log(`[detectWeekNumber] Detected Week ${weekNum} from header`);
    return weekNum;
  }

  // Default to Week 1
  console.warn('[detectWeekNumber] No week number found, defaulting to Week 1');
  return 1;
}

function parsePnLCsvHorizontal(csvContent: string, fileName: string) {
  const weekNumber = detectWeekNumber(csvContent, fileName);

  // ... existing parsing code ...

  return {
    results: [{
      dataType: 'Actuals',
      weekNumber: weekNumber,  // NEW: Include week number
      sourceName: `Week ${weekNumber} Financial Tracker`,
      data: results,
    }]
  };
}
```

**Changes**:
- Add `detectWeekNumber()` helper function
- Call it in `parsePnLCsvHorizontal()`
- Include `weekNumber` in results object
- Update `sourceName` to reflect detected week

---

#### 3. `src/utils/dateUtils.ts`
**Purpose**: Generate weekly MTD period options

**Current Code**:
```typescript
export const ALL_PERIODS = [
  ...generate445FiscalPeriods(2024, 2024),
  ...generate445FiscalPeriods(2025, 2025),
  // ...
];
```

**New Code**:
```typescript
/**
 * Generates weekly MTD periods for a fiscal year
 * Each period has 4-5 weeks, creating ~60 weekly periods per year
 */
export const generateWeeklyMTDPeriods = (fiscalYear: number): Period[] => {
  const periods: Period[] = [];
  const fiscalPeriods = generate445FiscalPeriods(fiscalYear, fiscalYear);

  fiscalPeriods.forEach(period => {
    // Calculate weeks in period based on 4-4-5 pattern
    const periodDurationMs = period.endDate.getTime() - period.startDate.getTime();
    const weeksInPeriod = Math.ceil(periodDurationMs / (7 * 24 * 60 * 60 * 1000));

    // Create a weekly MTD period for each week
    for (let weekNum = 1; weekNum <= weeksInPeriod; weekNum++) {
      periods.push({
        label: `${period.label} W${weekNum} (MTD)`,
        startDate: period.startDate,  // MTD always starts at period start
        endDate: period.endDate,      // MTD always ends at period end
        type: 'weekly',
        year: period.year,
        quarter: period.quarter,
        weekNumber: weekNum,
        periodLabel: period.label     // Reference to parent period
      });
    }
  });

  return periods;
};

export const ALL_PERIODS = [
  ...generateWeeklyMTDPeriods(2024),
  ...generateWeeklyMTDPeriods(2025),
  ...generateWeeklyMTDPeriods(2026),
  // Keep existing monthly/quarterly/yearly periods if needed
  // ...generate445FiscalPeriods(2024, 2024),
  // ...generate445FiscalPeriods(2025, 2025),
];
```

**Changes**:
- Create `generateWeeklyMTDPeriods()` function
- Generate ~60 weekly periods per fiscal year (12 periods × 4-5 weeks)
- Update `ALL_PERIODS` to use weekly periods
- Each week is labeled as MTD to reflect cumulative nature

---

#### 4. `src/services/firebaseService.ts`
**Purpose**: Save and retrieve with week-specific document IDs

**Current Code** (lines ~140-160):
```typescript
export const savePerformanceDataForPeriod = async (
  storeId: string,
  period: Period,
  data: PerformanceData,
  pnl?: FinancialLineItem[]
): Promise<void> => {
  const docId = `${storeId}_${period.startDate.getFullYear()}-${String(period.startDate.getMonth() + 1).padStart(2, '0')}-${String(period.startDate.getDate()).padStart(2, '0')}`;

  const docRef = doc(actualsCollection, docId);
  await setDoc(docRef, { storeId, data, pnl }, { merge: true });
};
```

**New Code**:
```typescript
export const savePerformanceDataForPeriod = async (
  storeId: string,
  period: Period,
  data: PerformanceData,
  pnl?: FinancialLineItem[],
  weekNumber?: number  // NEW parameter
): Promise<void> => {
  // Generate docId with week number
  const weekSuffix = weekNumber ? `_W${weekNumber}` : '';
  const periodLabel = period.periodLabel || period.label;
  const docId = `${storeId}_${periodLabel}${weekSuffix}`;
  // Example: "Columbia_FY2025-P11_W2"

  console.log(`[savePerformanceDataForPeriod] Saving to docId: ${docId}`);

  const docRef = doc(actualsCollection, docId);
  const docData: any = {
    storeId,
    periodLabel: periodLabel,
    weekNumber: weekNumber || null,
    weekStartDate: period.startDate.toISOString(),
    weekEndDate: period.endDate.toISOString(),
    importedAt: new Date().toISOString(),
    data: data
  };

  if (pnl && pnl.length > 0) {
    docData.pnl = pnl;
  }

  await setDoc(docRef, docData, { merge: true });
  console.log(`[savePerformanceDataForPeriod] Successfully saved week ${weekNumber || 'N/A'} for ${storeId}`);
};

/**
 * Check if week data already exists for duplicate detection
 */
export const checkExistingWeekData = async (
  storeId: string,
  period: Period,
  weekNumber: number
): Promise<{ data: PerformanceData; importedAt: string } | null> => {
  const periodLabel = period.periodLabel || period.label;
  const docId = `${storeId}_${periodLabel}_W${weekNumber}`;

  console.log(`[checkExistingWeekData] Checking for existing data: ${docId}`);

  const docRef = doc(actualsCollection, docId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const docData = snapshot.data();
    console.log(`[checkExistingWeekData] Found existing week ${weekNumber} data, imported at ${docData.importedAt}`);
    return {
      data: docData.data as PerformanceData,
      importedAt: docData.importedAt
    };
  }

  console.log(`[checkExistingWeekData] No existing data found for week ${weekNumber}`);
  return null;
};

/**
 * Get latest imported week for a store
 */
export const getLatestWeekForStore = async (
  storeId: string
): Promise<{ period: Period; weekNumber: number } | null> => {
  const q = query(
    actualsCollection,
    where('storeId', '==', storeId),
    orderBy('importedAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docData = snapshot.docs[0].data();
    const period: Period = {
      label: docData.periodLabel,
      startDate: new Date(docData.weekStartDate),
      endDate: new Date(docData.weekEndDate),
      type: 'weekly',
      year: new Date(docData.weekStartDate).getFullYear(),
      quarter: 1, // Will be calculated properly
      weekNumber: docData.weekNumber,
      periodLabel: docData.periodLabel
    };

    console.log(`[getLatestWeekForStore] Latest week for ${storeId}: Week ${docData.weekNumber}`);
    return { period, weekNumber: docData.weekNumber };
  }

  return null;
};
```

**Changes**:
- Add `weekNumber` parameter to `savePerformanceDataForPeriod()`
- Change docId pattern to include week number: `{storeId}_{periodLabel}_W{weekNumber}`
- Add `checkExistingWeekData()` for duplicate detection
- Add `getLatestWeekForStore()` for default view
- Enhanced logging for debugging

---

#### 5. `src/App.tsx`
**Purpose**: Add duplicate warning and week number handling

**Current Code** (lines ~146-200):
```typescript
const handleConfirmImport = async (job: ActiveJob) => {
  // ... existing code ...

  await savePerformanceDataForPeriod(
    storeName,
    matchingPeriod,
    performanceData,
    pnl
  );
};
```

**New Code**:
```typescript
const handleConfirmImport = async (job: ActiveJob) => {
  setImportProgress({ status: 'processing', message: 'Processing import data...' });

  try {
    const extractedData = job.extractedData;

    // NEW: Extract week number from extracted data
    const weekNumber = extractedData[0]?.weekNumber || 1;
    console.log(`[handleConfirmImport] Detected week number: ${weekNumber}`);

    // Check for week-specific duplicates
    const duplicates: Array<{
      store: string;
      week: number;
      importedAt: string;
      existingKpis: string[];
    }> = [];

    for (const result of extractedData) {
      const storeName = result.data.store || result.data.Store;
      if (!storeName) continue;

      const dateObj = new Date(job.file.name.match(/\d{1,2}[-.]\d{1,2}[-.]\d{2,4}/)?.[0] || Date.now());
      const matchingPeriod = findFiscalMonthForDate(dateObj);

      if (!matchingPeriod) continue;

      // NEW: Check for existing week data
      const existingWeekData = await checkExistingWeekData(
        storeName,
        matchingPeriod,
        weekNumber
      );

      if (existingWeekData) {
        duplicates.push({
          store: storeName,
          week: weekNumber,
          importedAt: existingWeekData.importedAt,
          existingKpis: Object.keys(existingWeekData.data)
        });
      }
    }

    // NEW: Show enhanced warning if duplicates found
    if (duplicates.length > 0) {
      setDuplicateWarning({ job, duplicates });
      setImportProgress({ status: 'idle', message: '' });
      return;
    }

    // Proceed with import
    await performImport(job, weekNumber);

  } catch (error) {
    console.error('[handleConfirmImport] Error:', error);
    setImportProgress({
      status: 'error',
      message: error instanceof Error ? error.message : 'Import failed'
    });
  }
};

const performImport = async (job: ActiveJob, weekNumber: number) => {
  const extractedData = job.extractedData;

  for (const result of extractedData) {
    const storeName = result.data.store || result.data.Store;
    if (!storeName) continue;

    const dateObj = new Date(job.file.name.match(/\d{1,2}[-.]\d{1,2}[-.]\d{2,4}/)?.[0] || Date.now());
    const matchingPeriod = findFiscalMonthForDate(dateObj);

    if (!matchingPeriod) continue;

    const performanceData = { /* ... existing extraction logic ... */ };
    const pnl = result.pnl || [];

    // NEW: Pass week number to save function
    await savePerformanceDataForPeriod(
      storeName,
      matchingPeriod,
      performanceData,
      pnl,
      weekNumber  // NEW parameter
    );

    console.log(`[performImport] Saved week ${weekNumber} for ${storeName}`);
  }

  setImportProgress({ status: 'complete', message: 'Import completed successfully!' });
  setActiveJobs(prev => prev.filter(j => j.id !== job.id));

  // Refresh dashboard data
  // ... existing refresh logic ...
};

// NEW: Enhanced duplicate warning dialog
const DuplicateWarningDialog = ({ job, duplicates, onConfirm, onCancel }) => {
  return (
    <div className="duplicate-warning-modal">
      <h3>⚠️ Week Already Imported</h3>
      <p>
        Week {duplicates[0].week} data already exists for {duplicates.length} store(s).
      </p>

      <div className="duplicate-list">
        {duplicates.map((dup, idx) => (
          <div key={idx} className="duplicate-item">
            <strong>{dup.store}</strong> - Week {dup.week}
            <br />
            <small>Previously imported: {new Date(dup.importedAt).toLocaleString()}</small>
            <br />
            <small>Contains: {dup.existingKpis.join(', ')}</small>
          </div>
        ))}
      </div>

      <p>Do you want to replace the existing data with the new import?</p>

      <div className="dialog-actions">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => onConfirm(job, duplicates[0].week)} className="btn-warning">
          Replace Existing Data
        </button>
      </div>
    </div>
  );
};
```

**Changes**:
- Extract `weekNumber` from parsed CSV results
- Add duplicate detection before import
- Show enhanced warning dialog with comparison
- Pass `weekNumber` to `savePerformanceDataForPeriod()`
- Add `DuplicateWarningDialog` component

---

#### 6. `src/pages/DashboardPage.tsx`
**Purpose**: Initialize with latest imported week

**Current Code** (lines ~50-100):
```typescript
useEffect(() => {
  // Load default period
  const defaultPeriod = ALL_PERIODS.find(p => p.type === 'quarter');
  if (defaultPeriod) {
    setSelectedPeriod(defaultPeriod);
  }
}, []);
```

**New Code**:
```typescript
useEffect(() => {
  const initializeDashboard = async () => {
    try {
      // Try to load latest imported week for current store
      const currentStore = selectedScope.storeId || 'Total Company';

      if (currentStore !== 'Total Company') {
        const latestWeek = await getLatestWeekForStore(currentStore);

        if (latestWeek) {
          console.log(`[DashboardPage] Loading latest week ${latestWeek.weekNumber} for ${currentStore}`);
          setSelectedPeriod(latestWeek.period);
          return;
        }
      }

      // Fallback: Load most recent weekly period
      const weeklyPeriods = ALL_PERIODS.filter(p => p.type === 'weekly');
      if (weeklyPeriods.length > 0) {
        setSelectedPeriod(weeklyPeriods[weeklyPeriods.length - 1]);
      }

    } catch (error) {
      console.error('[DashboardPage] Error loading latest week:', error);
      // Fallback to first weekly period
      const defaultPeriod = ALL_PERIODS.find(p => p.type === 'weekly');
      if (defaultPeriod) {
        setSelectedPeriod(defaultPeriod);
      }
    }
  };

  initializeDashboard();
}, [selectedScope.storeId]);
```

**Changes**:
- Load latest imported week on dashboard open
- Use `getLatestWeekForStore()` to find most recent data
- Fallback to most recent weekly period if no data
- Re-initialize when store selection changes

---

#### 7. `src/components/ImportDataModal.tsx`
**Purpose**: Remove period type toggle (always MTD)

**Current Code** (lines ~50-70):
```typescript
<div className="period-type-selector">
  <label>
    <input type="radio" value="monthly" checked={periodType === 'monthly'} />
    Monthly
  </label>
  <label>
    <input type="radio" value="weekly" checked={periodType === 'weekly'} />
    Weekly
  </label>
</div>
```

**New Code**:
```typescript
{/* Period type toggle removed - all imports are weekly MTD */}
<p className="import-info">
  📊 Importing weekly MTD (Month-to-Date) data
</p>
```

**Changes**:
- Remove period type toggle UI
- Add informational text explaining MTD import
- Simplify import flow (always weekly MTD)

---

### Data Migration Considerations

#### Existing Data Compatibility
**Current documents** (without week numbers):
```
Columbia_2024-12-30
Knoxville_2024-11-25
```

**New documents** (with week numbers):
```
Columbia_FY2025-P11_W1
Columbia_FY2025-P11_W2
Knoxville_FY2025-P10_W4
```

**Migration Strategy**: No migration needed
- Old documents remain in database (won't conflict with new pattern)
- New imports use new document ID pattern
- Old data can be manually deleted or archived later
- Both patterns can coexist without issues

**Read Logic**:
- Dashboard will only query for new document pattern
- Old documents will no longer be visible (expected behavior)
- Data is preserved if rollback needed

---

### Testing Checklist

#### Unit Testing
- [ ] `detectWeekNumber()` correctly extracts week from filename
- [ ] `detectWeekNumber()` correctly extracts week from CSV header
- [ ] `detectWeekNumber()` defaults to Week 1 when not found
- [ ] `generateWeeklyMTDPeriods()` creates correct number of periods
- [ ] `checkExistingWeekData()` correctly detects duplicates
- [ ] `getLatestWeekForStore()` returns most recent week

#### Integration Testing
- [ ] Import Week 1 CSV → creates `{store}_FY2025-P11_W1` document
- [ ] Import Week 2 CSV → creates `{store}_FY2025-P11_W2` document
- [ ] Week 1 and Week 2 documents coexist without overwriting
- [ ] Re-import Week 2 → shows duplicate warning
- [ ] Duplicate warning shows correct comparison data
- [ ] Replace existing data → updates document correctly
- [ ] Cancel duplicate warning → preserves existing data

#### UI Testing
- [ ] Dashboard loads with latest imported week
- [ ] Arrow navigation shows weekly periods
- [ ] Period selector displays "FY2025 P11 W2 (MTD)" format
- [ ] KPI cards display correct MTD values for selected week
- [ ] Store rankings show correct data for selected week
- [ ] Import modal shows "Weekly MTD" informational text
- [ ] No period type toggle visible in import modal

#### Data Integrity Testing
- [ ] Week 2 MTD ($158K) is higher than Week 1 MTD ($91K) ✓ Expected
- [ ] Percentages are weighted averages ✓ Expected
- [ ] All KPIs present in both Week 1 and Week 2 snapshots
- [ ] Document structure matches schema
- [ ] Firestore queries return correct week data

---

### Rollback Plan

If issues arise after deployment:

#### Immediate Rollback (Git)
```bash
# Revert to pre-implementation commit
git log --oneline  # Find commit before weekly MTD changes
git revert <commit-hash>
git push origin main
```

#### Data Rollback (Firestore)
- No data migration was performed, so no data rollback needed
- Old document pattern still exists in database
- New documents can be manually deleted if needed:
  ```typescript
  // Delete all weekly documents
  const weeklyDocs = await getDocs(
    query(actualsCollection, where('weekNumber', '!=', null))
  );
  weeklyDocs.forEach(doc => deleteDoc(doc.ref));
  ```

#### Feature Flag (Future Enhancement)
Consider adding feature flag in future:
```typescript
const ENABLE_WEEKLY_MTD = process.env.VITE_ENABLE_WEEKLY_MTD === 'true';

if (ENABLE_WEEKLY_MTD) {
  // Use new weekly MTD logic
} else {
  // Use old monthly logic
}
```

---

### Performance Considerations

#### Document Count
- **Before**: 1 document per store per period (~12/year/store)
- **After**: 4-5 documents per store per period (~60/year/store)
- **Impact**: 5x increase in document count
- **Mitigation**: Firestore scales well to millions of documents

#### Query Performance
- Queries use indexed fields (`storeId`, `weekNumber`, `periodLabel`)
- No full collection scans
- Expected query time: <100ms (unchanged)

#### Storage Costs
- Each document: ~2KB (estimated)
- 10 stores × 60 weeks/year × 2KB = ~1.2MB/year
- Cost: Negligible (Firestore free tier: 1GB)

#### Network Bandwidth
- Dashboard fetches 1 week at a time (not all weeks)
- No impact on page load time
- Arrow navigation fetches on-demand

---

### Timeline

**Total Estimated Effort**: 6-8 hours

#### Phase 1: Backend Changes (2 hours)
- [ ] Update `functions/src/routes/gemini.ts` - Add `detectWeekNumber()` (30 min)
- [ ] Update `src/types.ts` - Add week fields to Period interface (15 min)
- [ ] Update `src/utils/dateUtils.ts` - Add `generateWeeklyMTDPeriods()` (45 min)
- [ ] Update `src/services/firebaseService.ts` - Add week parameter and helpers (30 min)

#### Phase 2: Frontend Changes (3 hours)
- [ ] Update `src/App.tsx` - Add duplicate detection and warning dialog (90 min)
- [ ] Update `src/pages/DashboardPage.tsx` - Add latest week initialization (30 min)
- [ ] Update `src/components/ImportDataModal.tsx` - Remove period toggle (15 min)
- [ ] Update any other components using periods (45 min)

#### Phase 3: Testing (2 hours)
- [ ] Unit tests for new functions (45 min)
- [ ] Integration testing with real CSV files (45 min)
- [ ] UI testing (30 min)

#### Phase 4: Deployment & Verification (1 hour)
- [ ] Build and deploy to production (15 min)
- [ ] Smoke testing in production (30 min)
- [ ] Monitor Firestore for correct document creation (15 min)

---

### Success Criteria

✅ **Feature Complete** when:
1. Import Week 1 CSV creates `{store}_FY2025-P11_W1` document
2. Import Week 2 CSV creates separate `{store}_FY2025-P11_W2` document
3. Both weeks coexist in Firestore without overwriting
4. Dashboard loads with latest imported week by default
5. Arrow navigation allows browsing through weekly periods
6. Re-importing same week shows comparison warning
7. All KPI cards and store rankings display correct MTD values
8. No regressions in existing functionality

✅ **User Acceptance** when:
- User can import weekly CSVs without data loss
- User can navigate between weeks using arrows
- User can see progression of MTD values across weeks
- Duplicate imports show clear warning with comparison

---

### Files Modified Summary

| File | Lines Changed | Purpose |
|------|--------------|---------|
| `src/types.ts` | +2 | Add weekNumber and periodLabel to Period |
| `functions/src/routes/gemini.ts` | +30 | Add detectWeekNumber() and update parser |
| `src/utils/dateUtils.ts` | +25 | Add generateWeeklyMTDPeriods() |
| `src/services/firebaseService.ts` | +80 | Add week parameter, duplicate check, latest week query |
| `src/App.tsx` | +60 | Add duplicate detection and warning dialog |
| `src/pages/DashboardPage.tsx` | +20 | Initialize with latest week |
| `src/components/ImportDataModal.tsx` | -15, +5 | Remove period toggle |
| **TOTAL** | **~207 lines** | **7 files** |

---

### Next Steps

1. **Review this plan** - User approval required before implementation
2. **Ask clarifying questions** - Address any uncertainties
3. **Begin implementation** - Follow phases in order
4. **Test incrementally** - Validate each phase before moving forward
5. **Deploy cautiously** - Monitor production after deployment

---

## Context for Next Session

**Current Priority**: Implement weekly MTD snapshot feature (plan approved)

**What to know**:
- API routes are now working (deployed)
- Financial data already exists in Firestore
- Need to implement data fetching layer to populate KPIs
- User has screenshots of desired functionality

**Files to Review**:
- Financial data structure: Check Firestore collections
- Dashboard components: `src/components/*.tsx`
- Data services: `src/services/*.ts`

## User Preferences

- **Auto-commit**: Yes, commit all changes automatically
- **Communication**: Direct and concise
- **Focus**: Get things working, then refine

## CRITICAL Deployment Workflow

**ALWAYS push to Git after making code changes** - This triggers GitHub Actions to deploy automatically.

When making changes:
1. Make code changes
2. Build locally (if needed): `npm run build` and `cd server && npm run build`
3. **ALWAYS commit and push to Git**: `git add -A && git commit -m "message" && git push origin main`
4. GitHub Actions will automatically deploy both hosting and functions
5. Wait 2-3 minutes for deployment to complete
6. Test the live site

**Never just deploy locally without pushing to Git** - The automated deployment ensures consistency.
