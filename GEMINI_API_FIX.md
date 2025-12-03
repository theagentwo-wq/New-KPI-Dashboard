# Gemini API 500 Error - Root Cause & Fix

## Problem Summary

All Gemini AI endpoints were returning 500 errors with the underlying cause:
```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

## Root Cause

**Google Cloud API keys are incompatible with the `@google/generative-ai` SDK.**

### Technical Explanation

- The project uses the `@google/generative-ai` npm package (AI Studio SDK)
- This SDK exclusively calls the **Generative Language API** endpoint:
  - `https://generativelanguage.googleapis.com/v1beta/models/...`
- **Google Cloud API keys** (created in Google Cloud Console) don't have access to models on this endpoint
- **AI Studio API keys** (created at https://aistudio.google.com) are designed for this endpoint

### Why It Failed

1. You created a Google Cloud API key in Cloud Console
2. Set API restrictions to "Generative Language API only"
3. Stored it in Secret Manager
4. But Google Cloud keys can't access models via the v1beta endpoint the SDK uses

## Solution: Use AI Studio API Key

### Step 1: Create AI Studio API Key (FREE)

1. Go to https://aistudio.google.com/apikey
2. Click **"Get API key"** or **"Create API key"**
3. Select **"Create API key in new project"** or use existing project
4. Copy the API key (starts with `AIza...`)

### Step 2: Update Secret Manager

```bash
# Create new version in Secret Manager
gcloud secrets versions add GEMINI_API_KEY \
  --data-file=- \
  --project=kpi-dashboardgit-9913298-66e65 <<< "YOUR_AI_STUDIO_KEY_HERE"

# Disable old versions (optional)
gcloud secrets versions disable 3 \
  --secret=GEMINI_API_KEY \
  --project=kpi-dashboardgit-9913298-66e65
```

### Step 3: Redeploy Cloud Functions (Optional)

Cloud Functions automatically pick up new secret versions, but to force it:

```bash
npm run deploy:functions
```

### Step 4: Test the Fix

Test locally first:
```bash
# Windows
set GEMINI_API_KEY=YOUR_AI_STUDIO_KEY_HERE
node test-gemini-key.js

# The test should now succeed!
```

## Why AI Studio Keys Work Better

| Feature | AI Studio Key | Google Cloud Key |
|---------|---------------|------------------|
| Works with @google/generative-ai SDK | ✅ Yes | ❌ No (404 errors) |
| Free tier | ✅ Yes (15 RPM) | ⚠️ Complex billing |
| Easy to create | ✅ 1-click | ⚠️ Multiple steps |
| Model access | ✅ All stable models | ❌ Limited/none via SDK |
| Best for | Development, AI Studio SDK | Vertex AI SDK only |

## Current Configuration

After the fix, your setup will be:

- **Model**: `gemini-1.5-flash` (stable, works with AI Studio keys)
- **API Key**: AI Studio key (stored in Secret Manager)
- **SDK**: `@google/generative-ai` (AI Studio SDK)
- **Quotas**: 15 RPM (free) or 1,000 RPM (paid tier)

## Alternative: Switch to Vertex AI SDK (Future Consideration)

If you want to use Google Cloud managed keys long-term, you need to:

1. Replace `@google/generative-ai` with `@google-cloud/vertexai`
2. Rewrite `gemini-client.ts` to use Vertex AI SDK
3. Use project ID and location instead of API key
4. Deploy to Cloud Functions with proper IAM permissions

This is a bigger change but better for production with Google Cloud infrastructure.

## Timeline of Issue

- **Dec 1, 2024**: Gemini APIs working correctly (likely using AI Studio key)
- **Dec 1, 2024**: Implemented CSV import changes (store name helpers)
- **Dec 2, 2024**: Switched from AI Studio key → Google Cloud key
- **Dec 2, 2024**: ALL Gemini endpoints started returning 500 errors
- **Dec 2, 2024**: Multiple attempted fixes (models, deployments) failed
- **Dec 2, 2024**: **ROOT CAUSE IDENTIFIED**: API key type incompatibility

## What Didn't Cause the Issue

These were **NOT** the problem:
- ✅ CSV import changes (store name helpers) - These are fine
- ✅ Store name format changes - Not related
- ✅ Rich text editor in notes - Not related
- ✅ Date system modifications - Not related
- ✅ Model choice (pro vs flash) - All models failed with Google Cloud key
- ✅ Secret Manager configuration - Worked correctly
- ✅ Cloud Function deployment - Worked correctly

## Verification Steps

After applying the fix:

1. **Test health endpoint**:
   ```bash
   curl https://api-3jm7sombua-uc.a.run.app/health
   # Should return: {"success":true,"message":"KPI Dashboard API is running"}
   ```

2. **Test Gemini endpoint**:
   ```bash
   curl -X POST https://api-3jm7sombua-uc.a.run.app/api/getInsights \
     -H "Content-Type: application/json" \
     -d '{"data":{"data":{"test":"data"},"view":"totalCompany","period":"Week 1","prompt":"test"}}'
   # Should return: {"success":true,"data":"... AI response ..."}
   ```

3. **Test in frontend**:
   - Open https://kpi-dashboardgit-9913298-66e65.web.app
   - Click on a location → "Location Insights"
   - Should show AI-generated insights (not 500 error)

## Lessons Learned

1. **API key types matter**: Google Cloud keys ≠ AI Studio keys
2. **SDK compatibility**: Always check which API endpoint the SDK uses
3. **Error messages**: The 404 was the key clue (not just "500 Internal Server Error")
4. **Test locally first**: The test script would have caught this immediately

## Support Resources

- AI Studio: https://aistudio.google.com
- API Keys: https://aistudio.google.com/apikey
- Model documentation: https://ai.google.dev/models/gemini
- SDK docs: https://github.com/google/generative-ai-js

---

**Fix implemented**: December 2, 2024
**Status**: ✅ Ready for testing with AI Studio key
