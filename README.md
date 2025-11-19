# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for a multi-unit restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API (via Netlify Proxy)
- **Maps**: Google Maps Platform (via Netlify Proxy)
- **Database**: Google Firestore & Firebase Storage

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
    *   `MAPS_API_KEY`: Get this from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). See the "Google Maps API Key Guide" below.
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

### Step 2: Enable the Correct APIs (Important Update)

You must enable three specific APIs for all map features to work.

1.  Go to the **[Google Cloud API Library](https://console.cloud.google.com/apis/library)**.
2.  Search for and **ENABLE** each of the following APIs one by one:
    *   **Maps Embed API** (for Street View)
    *   **Places API** (for photos and ratings)
    *   **Geocoding API** (for finding locations accurately)

### Step 3: Add the Key to Your Project

-   **For Local Development:** Paste the key into your `.env.local` file for the `MAPS_API_KEY` variable.
-   **For Deployment:** Paste the key into your Netlify site's environment variables with the key `MAPS_API_KEY`.

---

## Firebase Configuration Guide

Follow these steps to configure your Firebase project correctly.

### Step 1: Get Your Firebase Config Object

1.  In the Firebase Console, go to **Project Settings > General**.
2.  Scroll down to the **"Your apps"** card. If you don't have one, create a new Web app (`</>`).
3.  In the app settings, find the **"SDK setup and configuration"** section and select **"Config"**.
4.  Copy the `firebaseConfig` object.

### Step 2: Format the Config for Environment Variables

1.  Copy the entire object, from the opening `{` to the closing `}`.
2.  Paste it into a text editor and **remove all newlines and extra spaces** so it becomes a **single, continuous line of text**.
3.  This single line is the value you will paste into your `.env.local` file and your Netlify settings for `FIREBASE_CLIENT_CONFIG`.

#### ✅ Correct Final Format:
`{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}`

### Step 3: Update Firestore Security Rules (Required)

By default, your database is locked. For this demo app, we need to allow read/write operations.

1.  Go to the **Firebase Console**.
2.  Navigate to **Firestore Database > Rules**.
3.  Replace the existing rules with the following:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true; // WARNING: Allows public access. For demo purposes only.
        }
      }
    }
    ```
4.  Click **"Publish"**.

### Step 4: Update Firebase Storage Security Rules (Required for Importer)

The new data importer uploads files to Firebase Storage for analysis. We need to create a rule to allow this.

1.  Go to the **Firebase Console**.
2.  Navigate to **Storage > Rules**.
3.  Replace the existing rules with the following:
    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        // Allow anyone to upload to the temporary 'imports' folder.
        // Also allow the app to delete from this folder after processing.
        match /imports/{allPaths=**} {
          allow write, delete: if true;
        }

        // Secure other folders (like director photos, note attachments)
        // by requiring user authentication for writes.
        match /{path}/{allPaths=**} {
          allow read;
          allow write: if request.auth != null;
        }
      }
    }
    ```
4.  Click **"Publish"**. Changes can take a minute. After this step, the data importer will be fully functional.