# Phase 1: Pre-Rebuild Documentation

**Created:** 2025-11-28
**Branch:** backup-before-rebuild
**Purpose:** Document current state before nuclear rebuild

---

## Current Backend Structure

### Dual Backend Directories (PROBLEM!)

**functions/** - Legacy Vertex AI backend
- Located: Root `/functions/`
- Entry: `functions/index.ts` (Vertex AI imports on line 7)
- Status: Old, conflicting with server/
- Node modules: Present
- Will be: **DELETED** in Phase 2

**server/** - Current backend
- Located: Root `/server/`
- Entry: `server/src/index.ts`
- Status: Current but problematic
- Node modules: Present
- Will be: **DELETED** in Phase 2

**Problem:**
Two backend directories create confusion, deployment conflicts, and bloated codebase from multiple AI iterations.

---

## All 18 API Endpoints Required

Based on analysis of [geminiService.ts](src/services/geminiService.ts):

### AI Analysis Endpoints (14 total)

1. **POST /api/getInsights** (Line 5-7)
   - Payload: `{ data, view, period, prompt }`
   - Purpose: Generate insights from KPI data with custom prompt
   - Status: Missing/broken

2. **POST /api/getExecutiveSummary** (Line 9-11)
   - Payload: `{ data, view, period }`
   - Purpose: Executive summary for period
   - Status: Missing/broken

3. **POST /api/getReviewSummary** (Line 13-15)
   - Payload: `{ location }`
   - Purpose: Summarize customer reviews
   - Status: Missing/broken

4. **POST /api/getLocationMarketAnalysis** (Line 17-19)
   - Payload: `{ location }`
   - Purpose: Market analysis by location
   - Status: Missing/broken
   - Enhancement: Phase 9 (web search, events, holidays)

5. **POST /api/generateHuddleBrief** (Line 21-23)
   - Payload: `{ location, storeData, audience, weather }`
   - Purpose: Daily huddle briefing (FOH/BOH/Manager)
   - Status: Missing/broken
   - Enhancement: Phase 9 (audience-specific prompts)

6. **POST /api/getSalesForecast** (Line 25-27)
   - Payload: `{ location, weatherForecast, historicalData }`
   - Purpose: Sales forecasting
   - Status: Missing/broken
   - Enhancement: Phase 8 (historical data integration)

7. **POST /api/getMarketingIdeas** (Line 29-31)
   - Payload: `{ location, userLocation }`
   - Purpose: Marketing recommendations
   - Status: Missing/broken
   - Enhancement: Phase 9 (multi-generational)

8. **POST /api/getNoteTrends** (Line 33-35)
   - Payload: `{ notes[] }`
   - Purpose: Analyze note trends
   - Status: Missing/broken
   - Critical: Notes feature waiting on this

9. **POST /api/getAnomalyDetections** (Line 37-39)
   - Payload: `{ allStoresData, periodLabel }`
   - Purpose: Detect anomalies in data
   - Status: Missing/broken

10. **POST /api/getAnomalyInsights** (Line 41-43)
    - Payload: `{ anomaly, data }`
    - Purpose: Explain detected anomalies
    - Status: Missing/broken

11. **POST /api/getVarianceAnalysis** (Line 45-47)
    - Payload: `{ location, kpi, variance, allKpis }`
    - Purpose: Variance analysis
    - Status: Missing/broken

12. **POST /api/runWhatIfScenario** (Line 49-51)
    - Payload: `{ data, prompt }`
    - Purpose: What-if scenario modeling
    - Status: Missing/broken

13. **POST /api/getStrategicExecutiveAnalysis** (Line 61-75)
    - Payload: `{ kpi, period, companyTotal, directorPerformance[], anchorStores[] }`
    - Purpose: Strategic executive KPI deep-dive
    - Status: Missing/broken

14. **POST /api/getDirectorPerformanceSnapshot**
    - Payload: TBD (used in director modals)
    - Purpose: Director performance summary
    - Status: Missing/broken

### Strategic Planning Endpoints (2 total)

15. **POST /api/startStrategicAnalysisJob** (Line 53-55)
    - Payload: `{ ...fileUploadResult, mode, period, view }`
    - Purpose: Long-running strategic analysis
    - Status: Missing/broken

16. **POST /api/chatWithStrategy** (Line 57-59)
    - Payload: `{ context, userQuery, mode }`
    - Purpose: Chat with strategic AI
    - Status: Missing/broken

### Data Import Endpoints (2 total) - CRITICAL

17. **POST /api/startTask** (Line 77-109)
    - Payload: `{ model, prompt, files[], taskType }`
    - Purpose: Process uploaded Excel/CSV/image with AI extraction
    - Status: Missing/broken
    - **CRITICAL:** Import Report completely broken without this
    - Returns: `{ jobId }`

18. **GET /api/getTaskStatus/:jobId**
    - Payload: URL param `jobId`
    - Purpose: Poll import job status
    - Status: Missing/broken
    - **CRITICAL:** Import Report polling

---

## Frontend Services (Keep - Interface Only)

### geminiService.ts
- **Status:** ✅ Keep exactly as-is
- **Location:** [src/services/geminiService.ts](src/services/geminiService.ts)
- **Purpose:** Frontend API client calling all 18 endpoints
- **Changes:** None - backend will implement matching endpoints

### firebaseService.ts
- **Status:** ⚠️ Keep, fix stubbed functions in Phase 8
- **Location:** [src/services/firebaseService.ts](src/services/firebaseService.ts)
- **Issues:**
  - Line 171-175: `getAggregatedPerformanceDataForPeriod()` returns empty object
  - Line 199-204: Missing `createDeployment()`, `updateDeployment()`, `deleteDeployment()`
- **Fixes:**
  - Phase 7: Add deployment CRUD
  - Phase 8: Implement real data fetching

### weatherService.ts
- **Status:** ✅ Working
- **Location:** [src/services/weatherService.ts](src/services/weatherService.ts)
- **Changes:** None

---

## Data Preserved (Do Not Touch)

### constants.ts
- **ALL director profiles** - EXACT details preserved
- **ALL store details** - EXACT details preserved
- **ALL KPI configurations** - EXACT details preserved
- **Location:** [src/constants.ts](src/constants.ts)

### types.ts
- **ALL TypeScript type definitions** - EXACT details preserved
- **Location:** [src/types.ts](src/types.ts)

### All React Components (43 total)
- **Location:** [src/components/](src/components/)
- **Status:** ✅ Zero changes - 100% preserved
- **UI/UX:** All styling, layouts, business logic intact

### All Pages
- [App.tsx](src/App.tsx)
- [DashboardPage.tsx](src/pages/DashboardPage.tsx)
- [DataEntryPage.tsx](src/pages/DataEntryPage.tsx)
- etc. - All preserved

---

## Firebase Collections (Existing Data)

1. **performance_actuals** - ✅ HAS DATA, ❌ can't be read (stub function)
2. **deployments** - ✅ initialized, empty
3. **directors** - ✅ working
4. **goals** - ✅ working
5. **notes** - ✅ working
6. **budgets** - ✅ working

---

## Secrets Configuration

### Google Secret Manager (Backend)
- `GEMINI_API_KEY` - ✅ Configured

### GitHub Secrets (Frontend Build)
- `VITE_MAPS_KEY` - ✅ Keep
- `FIREBASE_CLIENT_CONFIG` - ✅ Keep
- `FIREBASE_SERVICE_ACCOUNT_OPERATIONS_KPI_DASHBOARD` - ✅ Keep

### Removed
- `FIREBASE_TOKEN` - ❌ Deleted (old method)

---

## What Gets Deleted in Phase 2

### Complete Deletion
- `functions/` directory (ALL files, node_modules, dist)
- `server/` directory (ALL files, node_modules, dist)

### What Gets Created
New `functions/` directory with:
```
functions/
├── src/
│   ├── index.ts              # Main entry point
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

---

## Backup Strategy

### Git Backup
- **Branch:** `backup-before-rebuild` (current branch)
- **Last Commit:** 851bdb50 "Add Nuclear Rebuild Plan - Ready for tomorrow morning execution"
- **Rollback:** `git checkout backup-before-rebuild && firebase deploy --force`

### Service Account
- User should confirm local backup of service account JSON
- Location: Likely in GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT_OPERATIONS_KPI_DASHBOARD`

---

## Next Steps (Phase 2)

1. ⚠️ **ASK USER APPROVAL** before proceeding
2. Delete `functions/` directory
3. Delete `server/` directory
4. Create new clean `functions/` scaffold
5. Initialize package.json with minimal dependencies
6. Set up TypeScript strict mode

---

## Questions for User Before Proceeding

1. ✅ Do you have service account JSON backed up locally?
2. ✅ Are you okay with ~10 minutes of downtime during deployment?
3. ✅ Should I prioritize testing specific API endpoints first?
4. ✅ Confirmed: Keep ALL data in constants.ts exactly as-is?

---

**Status:** Phase 1 Complete - Ready for User Approval
**Next:** Present to user and await approval to proceed with Phase 2
