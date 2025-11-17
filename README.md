# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for the Tupelo Honey Cafe restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API (via Netlify Proxy)
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

This step is critical for the deployed application to work.

1.  In your Netlify site's dashboard, go to **Site configuration > Environment variables**.
2.  Add your **Gemini API Key**:
    -   **Key**: `GEMINI_API_KEY`
    -   **Value**: Paste your Google Gemini API key.
3.  Add your **Firebase Client Config**:
    -   **Key**: `FIREBASE_CLIENT_CONFIG`
    -   **Value**: Paste the single-line JSON string for your Firebase client config. See the guide below for the exact format.

### 5. Deploy

Trigger a new deploy from the "Deploys" tab.

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

##  Troubleshooting

### "Database Connection Failed" Error in the Notes Panel

If you see an error in the Notes panel saying `The config value from your Netlify settings is invalid...`, it means the value for `FIREBASE_CLIENT_CONFIG` in your Netlify environment variables is not a valid JSON string.

The error panel will show you the **exact problematic string** it received from Netlify.

**To fix this:**

1.  **Go to an online JSON validator**, like [jsonlint.com](https://jsonlint.com).
2.  **Paste the string from the error panel** into the validator. It will highlight the exact syntax error (e.g., a trailing comma, a missing quote).
3.  **Correct the error in the validator.**
4.  Once it's valid, **copy the corrected, single-line JSON string**.
5.  Go back to your **Netlify Environment Variables** and **paste the corrected string** into the `FIREBASE_CLIENT_CONFIG` value field.
6.  **Trigger a new deploy.** This will solve the issue.