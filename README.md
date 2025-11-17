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

## Local Setup

### 1. Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd operations-kpi-dashboard
npm install
```

### 3. Environment Variables

This project requires environment variables for both Google Gemini and Google Firebase to function.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your configuration to this file.

```
# This key is only used for local development for the Netlify proxy.
# The `netlify dev` command will pick this up automatically.
GEMINI_API_KEY=your_gemini_api_key_here

# Your Firebase Web App's configuration object, as a JSON string.
# See the "Firebase Configuration Troubleshooting" section below for details.
VITE_FIREBASE_CLIENT_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'
```

### 4. Running the Development Server

This project uses Netlify Functions for its backend. To run it locally, you need to use the Netlify CLI.

```bash
# Install the Netlify CLI
npm install -g netlify-cli

# Run the local development server with the proxy
netlify dev
```

The application will be available at `http://localhost:8888`.

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

This is the most important step for the deployed application to work.

1.  In your Netlify site's dashboard, go to "Site configuration" -> "Environment variables".
2.  Add the `GEMINI_API_KEY`:
    -   **Key**: `GEMINI_API_KEY`
    -   **Value**: Your Google Gemini API key.
3.  Add the `VITE_FIREBASE_CLIENT_CONFIG`:
    -   **Key**: `VITE_FIREBASE_CLIENT_CONFIG`
    -   **Value**: The same single-line JSON string for your Firebase client config.

### 5. Deploy

Trigger a new deploy from the "Deploys" tab.

---

## Firebase Configuration Troubleshooting

The most common point of failure is an incorrectly formatted `VITE_FIREBASE_CLIENT_CONFIG` variable. It **must be a valid JSON object presented as a single-line string.**

#### ✅ Correct Method:

1.  In the Firebase Console, go to **Project Settings > General > Your apps > Web app**.
2.  Find the `firebaseConfig` object. It looks like this:
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
3.  Copy the entire object, from the opening `{` to the closing `}`.
4.  Paste it into a text editor and **remove all newlines and extra spaces** so it becomes a single line.
5.  Wrap this single line in single quotes (`'`) in your `.env.local` or Netlify environment variable settings.

#### ✅ Correct Final Format:
`'{"apiKey":"AIzaSy...","authDomain":"your-project.firebaseapp.com","projectId":"your-project","storageBucket":"your-project.appspot.com","messagingSenderId":"1234567890","appId":"1:12345..."}'`

#### ❌ Incorrect Formats to Avoid:
-   Multi-line strings.
-   Using double quotes around the whole string (this can interfere with the quotes inside the JSON).
-   Missing quotes around keys or values inside the JSON.
-   Having a trailing comma after the last property.
-   Copying the `const firebaseConfig = ` part.