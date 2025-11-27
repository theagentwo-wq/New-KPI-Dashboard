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

## API Endpoints to Implement

All endpoints from `src/services/geminiService.ts`:

1. `POST /api/getInsights`
2. `POST /api/getExecutiveSummary`
3. `POST /api/getReviewSummary`
4. `POST /api/getLocationMarketAnalysis`
5. `POST /api/generateHuddleBrief`
6. `POST /api/getSalesForecast`
7. `POST /api/getMarketingIdeas`
8. `POST /api/getNoteTrends`
9. `POST /api/getAnomalyDetections`
10. `POST /api/getAnomalyInsights`
11. `POST /api/getVarianceAnalysis`
12. `POST /api/runWhatIfScenario`
13. `POST /api/startStrategicAnalysisJob`
14. `POST /api/chatWithStrategy`
15. `POST /api/getStrategicExecutiveAnalysis`
16. `POST /api/startTask`
17. `POST /api/getDirectorPerformanceSnapshot`

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

✅ All 17 API endpoints working
✅ No 404 or 500 errors in dashboard
✅ AI responses generating correctly
✅ Fast response times (< 5 seconds)
✅ Clean Cloud Function logs
✅ Automatic deployments via GitHub Actions working
✅ All UI components unchanged and working
✅ All constants and business data intact

## Timeline Estimate

- Phase 1 (Prep): 10 minutes
- Phase 2 (Scaffold): 15 minutes
- Phase 3 (Implementation): 30-45 minutes
- Phase 4 (Config): 10 minutes
- Phase 5 (Deploy & Test): 20 minutes
- Phase 6 (Cleanup): 10 minutes

**Total: ~2 hours of focused work**

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
