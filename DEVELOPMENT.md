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

## Context for Next Session

**Current Priority**: Connect Firestore financial data to dashboard

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
