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
    -   **Value**: Paste the same single-line JSON string for your Firebase client config that you used in your `.env.local` file.

### 5. Deploy

Trigger a new deploy from the "Deploys" tab.

---

## Firebase Configuration Guide

The most common point of failure is an incorrectly formatted `FIREBASE_CLIENT_CONFIG` variable. Follow these steps exactly.

### Step 1: Register Your Web App (The Missing Step)

1.  In the Firebase Console, go to **Project Settings > General**.
2.  Scroll down to the **"Your apps"** card.
3.  If it says "There are no apps in your project", click the **Web icon (`</>`)**.
4.  Give your app a nickname (e.g., "Operations Dashboard").
5.  Click **"Register app"**. Do **not** set up Hosting at this time.
6.  On the next screen ("Add Firebase SDK"), Firebase will display the `firebaseConfig` object. This is what you need. Proceed to Step 2.

### Step 2: How to Get and Format Your Config

1.  On the "Add Firebase SDK" screen, find the `firebaseConfig` object. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:12345..."
    };
    ```
2.  Copy the entire object, from the opening `{` to the closing `}`.
3.  Paste it into a text editor and **remove all newlines and extra spaces** so it becomes a single line.
4.  Wrap this single line in single quotes (`'`) and use this as the value in your `.env.local` or Netlify environment variable settings.

#### ✅ Correct Final Format:
`'{"apiKey":"AIzaSy...","authDomain":"your-project.firebaseapp.com","projectId":"your-project","storageBucket":"your-project.appspot.com","messagingSenderId":"1234567890","appId":"1:12345..."}'`

#### ❌ Common Mistakes to Avoid:
-   Using multi-line strings.
-   Using double quotes around the whole string (this can interfere with the quotes inside the JSON).
-   Missing quotes around keys or values inside the JSON.
-   Having a trailing comma after the last property.
-   Copying the `const firebaseConfig = ` part.