# Vertex AI Setup Guide

## Current Status

✅ **Migrated from AI Studio SDK → Vertex AI SDK**
❌ **Vertex AI API not enabled** (this is the final step!)

## What We Fixed

The root cause of all 500 errors was:
- **Google Cloud API keys don't work with the `@google/generative-ai` SDK**
- We've now switched to **Vertex AI SDK** which is designed for Google Cloud

## Enable Vertex AI API (Required)

### Option 1: Google Cloud Console (Web UI)

1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=kpi-dashboardgit-9913298-66e65
2. Click **"Enable"** button
3. Wait 1-2 minutes for API to activate

### Option 2: Command Line (gcloud)

```bash
gcloud services enable aiplatform.googleapis.com \
  --project=kpi-dashboardgit-9913298-66e65
```

## After Enabling

Once Vertex AI API is enabled, test the endpoint:

```bash
curl -X POST https://api-3jm7sombua-uc.a.run.app/api/getInsights \
  -H "Content-Type: application/json" \
  -d '{"data":{"data":{"Columbia":{"Sales":50000,"Labor":0.28}},"view":"totalCompany","period":"Week 1","prompt":"Provide a brief analysis."}}'
```

**Expected result**: `{"success":true,"data":"... AI-generated insights ..."}`

## Architecture Changes

### Before (Broken)
```
Frontend → Cloud Function → @google/generative-ai SDK → Generative Language API
                             ↓
                             Google Cloud API Key (404 error - incompatible!)
```

### After (Fixed)
```
Frontend → Cloud Function → Vertex AI SDK → Vertex AI API
                            ↓
                            Service Account Auth (automatic, no API key!)
```

## Benefits of Vertex AI

| Feature | AI Studio | Vertex AI (New) |
|---------|-----------|-----------------|
| Authentication | API Key | Service Account |
| SDK | @google/generative-ai | @google-cloud/vertexai |
| Free tier | 15 RPM | No free tier |
| Paid tier | 1,000 RPM | **2,000 RPM** |
| Quotas | Lower | **Higher** |
| Enterprise ready | No | **Yes** |
| No API key management | No | **Yes** (automatic) |
| Works with Google Cloud keys | ❌ | ✅ |

## What Changed in Code

### 1. gemini-client.ts
```typescript
// OLD (AI Studio SDK)
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// NEW (Vertex AI SDK)
import { VertexAI } from '@google-cloud/vertexai';
const vertex = new VertexAI({
  project: 'kpi-dashboardgit-9913298-66e65',
  location: 'us-central1'
});
const model = vertex.getGenerativeModel({ model: 'gemini-1.5-flash-002' });
```

### 2. index.ts (Cloud Function)
```typescript
// OLD (required API key secret)
export const api = onRequest({
  secrets: ['GEMINI_API_KEY'], // ❌ No longer needed!
  timeoutSeconds: 540,
  memory: '512MiB',
  cors: true,
}, app);

// NEW (no secrets needed)
export const api = onRequest({
  timeoutSeconds: 540,
  memory: '512MiB',
  cors: true,
}, app);
```

### 3. package.json
```json
{
  "dependencies": {
    "@google-cloud/vertexai": "^1.10.0"  // ← Added
  }
}
```

## Model Name Format

Vertex AI uses **explicit version numbers**:

| AI Studio Format | Vertex AI Format |
|------------------|------------------|
| gemini-1.5-pro | gemini-1.5-pro-001 |
| gemini-1.5-flash | gemini-1.5-flash-002 |
| gemini-2.0-flash-exp | ❌ Not available on Vertex AI |

We're currently using: **`gemini-1.5-flash-002`**
- Fast responses
- Good quality
- Stable and reliable

## Permissions

The Cloud Function service account automatically has permission to call Vertex AI.

Service account: `kpi-dashboardgit-9913298-66e65@appspot.gserviceaccount.com`

Default roles include:
- Vertex AI User
- Cloud Functions Invoker

No additional IAM configuration needed!

## No More API Key Management!

✅ **Removed dependencies**:
- No GEMINI_API_KEY in Secret Manager (can be deleted)
- No API key rotation needed
- No API key restrictions to configure
- No "invalid API key" errors

✅ **Automatic authentication**:
- Service account handles everything
- Cloud Functions have built-in credentials
- No secret management overhead

## Troubleshooting

### Error: "Publisher Model was not found"

**Cause**: Vertex AI API not enabled

**Fix**: Enable the API at:
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=kpi-dashboardgit-9913298-66e65

### Error: "Permission denied"

**Cause**: Service account missing Vertex AI permissions

**Fix**:
```bash
gcloud projects add-iam-policy-binding kpi-dashboardgit-9913298-66e65 \
  --member="serviceAccount:kpi-dashboardgit-9913298-66e65@appspot.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Test Model Availability

To list all available Vertex AI models:

```bash
curl -X GET \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/kpi-dashboardgit-9913298-66e65/locations/us-central1/publishers/google/models" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"
```

## Next Steps

1. ✅ **Enable Vertex AI API** (link above)
2. ⏳ Wait 1-2 minutes for activation
3. ✅ **Test endpoint** with curl command
4. ✅ **Test in frontend** - open your dashboard and click "Location Insights"
5. 🎉 **All Gemini features should work!**

---

**Migration completed**: December 2, 2024
**Status**: ⏳ Waiting for Vertex AI API to be enabled
