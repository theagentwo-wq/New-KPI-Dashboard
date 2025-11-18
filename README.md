# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for the Tupelo Honey Cafe restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API (via Netlify Proxy)
- **Maps**: Google Maps Platform (via Netlify Proxy)
- **Database**: Google Firestore

## Local Setup (Foolproof Guide)

Follow these steps exactly to get the dashboard running locally.

### 1. Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Netlify CLI (for running the backend functions)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate into the project directory
cd operations-kpi-dashboard

# Install all project dependencies
npm install

# Install the Netlify CLI globally if you haven't already
npm install -g netlify-cli
```

### 3. Configure Your API Keys

This is the most important step. All API keys are managed in a local environment file.

1.  **Find the template file:** In the project root, you will find a file named `.env.local.example`.
2.  **Rename the file:** Rename this file to **`.env.local`**.
3.  **Edit `.env.local`:** Open the new `.env.local` file and replace the placeholder values with your actual keys.
    *   `GEMINI_API_KEY`: Get this from [Google AI Studio](https://makersuite.google.com/app/apikey). This key is used by the backend service.
    *   `MAPS_API_KEY`: **(New & Required)** Get this from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). See the "Google Maps API Key Guide" below.
    *   `FIREBASE_CLIENT_CONFIG`: Get this from your Firebase project console. See the "Firebase Configuration Guide" section below for detailed, step-by-step instructions.

### 4. Run the Development Server

The `netlify dev` command starts both the frontend application and the backend proxy functions. **You must restart this server any time you change your `.env.local` file.**

```bash
# Run the local development server
netlify dev
```

The application will now be running at `http://localhost:8888`.

## Deployment to Netlify

### 1. Push to a GitHub Repository

Push your project code to a GitHub repository.

### 2. Connect to Netlify

1.  Log in to your Netlify account.
2.  "Add new site" -> "Import an existing project".
3.  Connect to your Git provider and select the repository.

### 3. Configure Build Settings

Netlify should automatically detect these settings:

-   **Build command**: `npm run build`
-   **Publish directory**: `dist`
-   **Functions directory**: `netlify/functions`

### 4. Add Environment Variables

This step is **critical** for the deployed application to work. You must add **all** of the following variables from your `.env.local` file to your Netlify settings.

1.  In your Netlify site's dashboard, go to **Site configuration > Environment variables**.
2.  Add your **Gemini API Key**:
    -   **Key**: `GEMINI_API_KEY`
    -   **Value**: Paste your Google Gemini API key.
3.  Add your **Maps API Key**:
    -   **Key**: `MAPS_API_KEY`
    -   **Value**: Paste your Google Maps Platform API key.
4.  Add your **Firebase Client Config**:
    -   **Key**: `FIREBASE_CLIENT_CONFIG`
    -   **Value**: Paste the single-line JSON string for your Firebase client config. See the guide below for the exact format.

### 5. Deploy

Trigger a new deploy from the "Deploys" tab.

---

## Google Maps API Key Guide

A dedicated API key is required for the Store Hub map features.

### Step 1: Create the API Key

1.  Go to the **[Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials)**.
2.  Make sure you have a project selected.
3.  Click **"+ CREATE CREDENTIALS"** at the top of the page and select **"API key"**.
4.  Copy the new API key that is generated. This is the value you will use.

### Step 2: Enable the Correct API

1.  After creating the key, a dialog will appear. Click the **"EDIT API KEY"** button (or find your new key in the list and click the pencil icon to edit it).
2.  Under **"API restrictions"**, select **"Restrict key"**.
3.  In the dropdown menu, find and enable the **"Maps Embed API"**. This is the only API needed for the current map feature.
4.  Click **"Save"**.

### Step 3: Add the Key to Your Project

-   **For Local Development:** Paste the key into your `.env.local` file for the `MAPS_API_KEY` variable.
-   **For Deployment:** Paste the key into your Netlify site's environment variables with the key `MAPS_API_KEY`.

---

## Firebase Configuration Guide

The most common point of failure is an incorrectly formatted `FIREBASE_CLIENT_CONFIG` variable. Follow these steps exactly.

### Step 1: Get Your Config Object

1.  In the Firebase Console, go to **Project Settings > General**.
2.  Scroll down to the **"Your apps"** card.
3.  If you don't have an app, click the Web icon (`</>`) to create one.
4.  In the app settings, find the **"SDK setup and configuration"** section and select **"Config"**.
5.  You will see the `firebaseConfig` object. This is what you need.
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      // ... and so on
    };
    ```

### Step 2: Format the Config for Use

1.  Copy the entire object, from the opening `{` to the closing `}`.
2.  Paste it into a text editor and **remove all newlines and extra spaces** so it becomes a **single, continuous line of text**.
3.  This single line is the value you will paste into your `.env.local` file and your Netlify settings.

#### ✅ Correct Final Format:
`{"apiKey":"AIzaSy...","authDomain":"your-project.firebaseapp.com","projectId":"your-project","storageBucket":"your-project.appspot.com","messagingSenderId":"1234567890","appId":"1:12345..."}`

#### ❌ Common Mistakes to Avoid:
-   **Do not** wrap the final string in any quotes (`'` or `"`). Paste the raw `{"key":...}` object.
-   **Do not** include `const firebaseConfig =` or the final semicolon `;`.
-   Ensure there are no newlines or line breaks. It must be a single line.
-   Ensure there is no trailing comma after the last property inside the `{...}`.

---

## Troubleshooting

### "Database Connection Failed" Error

If you see an error in the Notes panel saying `The config value from your Netlify settings is invalid...`, it means the value for `FIREBASE_CLIENT_CONFIG` in your Netlify environment variables is not a valid JSON string. The error panel will show you the **exact problematic string** it received.

**To fix this:**
1.  Go to an online JSON validator, like [jsonlint.com](https://jsonlint.com).
2.  Paste the string from the error panel into the validator. It will highlight the exact syntax error.
3.  Correct the error, copy the valid single-line JSON, paste it into your Netlify `FIREBASE_CLIENT_CONFIG` variable, and redeploy.

### "Successfully connected, but failed to fetch notes" Error

If you see this error, your Firebase config is correct, but there's an issue reading from the database. The specific error message will tell you which of the two common problems below is the cause.

#### 1. Error Message: "Permission denied..."

This means your Firestore Security Rules are blocking the app. This is the **default, secure behavior** for a new database.

**To Fix (for this demo project):**

1.  Go to the **Firebase Console**.
2.  Navigate to **Firestore Database > Rules**.
3.  You will see rules that look like `allow read, write: if request.auth != null;`. This means only logged-in users can access the database.
4.  For this project, which has no login system, you can open up access by replacing the existing rules with the following:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow public read access to the 'notes' and 'directors' collections
        match /{collectionId}/{documentId} {
          allow read, write: if true; // Allows anyone to read/write, use for demo purposes only
        }
      }
    }
    ```
5.  Click **"Publish"**. Changes can take a minute to take effect. Refresh your app.

#### 2. Error Message: "A Firestore index is required..."

This means Firestore needs you to create an index to handle the app's query for notes (which are sorted by date). The error message from the app will often include a **direct link to create the index**.

**To Fix:**

1.  **Click the link** provided in the error message in the app's UI.
2.  The link will take you directly to the "Create Index" page in your Firebase console with all the fields pre-filled.
3.  Click the **"Create"** button.
4.  Index creation can take a few minutes. You can monitor its status in the "Indexes" tab.
5.  Once the index is enabled, refresh your app. The notes will now load correctly.