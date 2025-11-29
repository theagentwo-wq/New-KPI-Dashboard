# Firestore Diagnostic Steps

## The Problem
Deployment save operations are timing out after 10 seconds. The code is correct, but Firebase is not responding to write requests.

## Step 1: Verify Firestore is Enabled

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `kpi-dashboardgit-9913298-66e65`
3. **Click "Firestore Database"** in the left sidebar
4. **Check what you see**:

### ✅ GOOD - If you see:
- A database interface with collections listed
- Ability to click "Start collection"
- Database location shown (e.g., "us-central1")

### ❌ BAD - If you see:
- "Get started by creating a database"
- A button that says "Create database"
- **→ This means Firestore is NOT enabled - you must enable it first!**

## Step 2: Enable Firestore (If Needed)

If Firestore is not enabled:

1. Click **"Create database"**
2. **Choose production mode** (NOT test mode)
3. **Select a location**: Choose `us-central1` (or closest to you)
4. Click **"Enable"**
5. Wait for it to provision (takes ~30 seconds)

## Step 3: Check Existing Data

Once Firestore is enabled, check if these collections exist:
- ✅ `directors` - Should have director profiles
- ✅ `notes` - May be empty
- ✅ `performance_actuals` - May have some data
- ✅ `goals` - May be empty
- ❓ `deployments` - Probably doesn't exist yet (that's OK - it will be created on first write)

## Step 4: Test Manual Write

Let's verify you can write to Firestore manually:

1. In Firestore Database, click **"Start collection"**
2. **Collection ID**: `test_deployments`
3. Click **"Next"**
4. **Document ID**: `test1`
5. **Add field**:
   - Field: `name`
   - Type: `string`
   - Value: `test`
6. Click **"Save"**

### If this works:
✅ Firestore is working - the issue is with security rules or code

### If this fails:
❌ Firestore has a configuration problem

## Step 5: Verify Security Rules

1. In Firebase Console, click **"Firestore Database"** > **"Rules"** tab
2. **Check the rules content** - should look like this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Check the "Last published" timestamp** - it should be recent (today)
4. If rules are wrong, fix them and click **"Publish"**

## Step 6: Check Firestore Mode

1. In Firestore Database main page, look at the top
2. Check if it says:
   - ✅ **"Cloud Firestore"** (GOOD - this is what we want)
   - ❌ **"Realtime Database"** (BAD - wrong database type)

If you see "Realtime Database", you're in the wrong place:
- Go back to left sidebar
- Click **"Firestore Database"** (not "Realtime Database")

## What to Report Back

Please tell me:
1. ✅ or ❌ - Is Firestore enabled?
2. ✅ or ❌ - Can you see existing collections?
3. ✅ or ❌ - Can you manually create a test document?
4. What does the "Last published" timestamp say on the Rules tab?
5. Take a screenshot of your Firestore Database main page

## Next Steps Based on Results

### If Firestore was NOT enabled:
- Enable it following Step 2
- Try creating a deployment again
- Should work immediately

### If Firestore IS enabled but writes fail:
- There's a security rules or permissions issue
- We'll need to check your Firebase project settings
- May need to check if billing is enabled

### If manual write works but code doesn't:
- The issue is in the code or configuration
- We'll add more detailed logging
- May need to check the Firebase config in production
