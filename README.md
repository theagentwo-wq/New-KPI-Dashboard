# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for the Tupelo Honey Cafe restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API
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

1.  Create a file named `.env` in the root of the project.
2.  Add your configuration to this file.

```
# Your Google AI Gemini API Key (used by a backend function)
GEMINI_API_KEY=your_gemini_api_key_here

# Your Firebase Web App's configuration object, as a JSON string.
# In the Firebase Console, go to Project Settings > General > Your apps > Web app.
# Find the firebaseConfig object and copy its entire content as a single line string.
VITE_FIREBASE_CLIENT_CONFIG='{"apiKey": "...", "authDomain": "...", "projectId": "...", ...}'
```

### 4. Running the Development Server

Once the dependencies are installed and the environment variables are set, you can start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Deployment to Netlify

This project is configured for easy deployment to Netlify.

### 1. Push to a GitHub Repository

Create a new repository on GitHub and push your local project code to it.

### 2. Connect to Netlify

1.  Log in to your Netlify account.
2.  Click "Add new site" -> "Import an existing project".
3.  Connect to your Git provider (e.g., GitHub) and select the repository for this project.

### 3. Configure Build Settings

Netlify should automatically detect the following settings. If not, you can set them manually:

-   **Build command**: `npm run build`
-   **Publish directory**: `dist`

### 4. Add Environment Variables

This is the most important step for the deployed application to work.

1.  In your site's dashboard on Netlify, go to "Site configuration" -> "Environment variables".
2.  Click "Add a variable".
3.  Add the `GEMINI_API_KEY`:
    -   **Key**: `GEMINI_API_KEY`
    -   **Value**: Your Google Gemini API key.
    -   Click "Create variable".
4.  Add the `VITE_FIREBASE_CLIENT_CONFIG`:
    -   Click "Add a variable" again.
    -   **Key**: `VITE_FIREBASE_CLIENT_CONFIG`
    -   **Value**: The same single-line JSON string for your Firebase client config that you used in your `.env` file.
    -   Click "Create variable".

### 5. Deploy

Trigger a new deploy from the "Deploys" tab in your Netlify dashboard. Netlify will build your site and deploy it to a public URL.