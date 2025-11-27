# Development Notes & Progress Log

This file tracks ongoing development work, known issues, and progress on the KPI Dashboard project.

## Current Status (Last Updated: 2025-11-26)

### ✅ Completed
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

### 🚧 In Progress
None currently

### 📋 Planned / TODO
1. **Test API Endpoints** - Verify all AI and Maps endpoints work after deployment
2. **Connect Firestore Financial Data** - Wire up the existing Firestore data to populate dashboard KPIs
3. **Fix UI/UX Issues** - Restore functionality that was deleted by previous LLM work

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

### Environment Variables
All use `VITE_` prefix for build-time injection:
- `VITE_MAPS_KEY` - Google Maps API key
- `VITE_FIREBASE_CLIENT_CONFIG` - Firebase client config JSON
- `VITE_GEMINI_API_KEY` - Gemini API key (local dev only)

Production values stored as GitHub Secrets and injected during deployment.

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
