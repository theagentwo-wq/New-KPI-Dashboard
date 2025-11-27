# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for a multi-unit restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Frontend Hosting**: Firebase Hosting
- **Backend**: Cloud Functions for Firebase
- **Database**: Firestore & Firebase Storage
- **AI**: Google Gemini via Vertex AI
- **Maps**: Google Maps Platform
- **Deployment**: Automated via GitHub Actions with Workload Identity Federation

---

## Project Workflow

This project uses automated deployment via GitHub Actions with all development tracked in version control.

1.  **Local Development**: Edit code in your IDE and test locally using `npm run dev`
    *   Requires `.env.local` file with environment variables (see "Local Development Setup" below)
    *   The `/server` directory contains Cloud Functions source code
2.  **Version Control**: All work happens on the `main` branch
    *   All changes are committed automatically with Claude Code attribution
    *   Push to `main` triggers automatic deployment
3.  **Automated Deployment**: GitHub Actions workflow handles build and deployment
    *   Builds frontend React app with Vite
    *   Builds server functions from `/server` directory
    *   Deploys to Firebase Hosting and Cloud Functions
    *   Injects production secrets from GitHub Secrets during build
4.  **Development Tracking**: See `DEVELOPMENT.md` for ongoing work, known issues, and session notes

---

## Local Development Setup

To run the application in the local development environment, you must create a file named `.env.local` in the root of the project. This file is ignored by Git and will not be committed to the repository.

The `.env.local` file must contain the following variables:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_MAPS_KEY=your_maps_api_key_here
VITE_FIREBASE_CLIENT_CONFIG='your_firebase_config_json_here'
```

**Note:** The `VITE_FIREBASE_CLIENT_CONFIG` must be a valid JSON object on a single line, enclosed in single quotes. All environment variables use the `VITE_` prefix to ensure they are available during the build process.

---

## Cloud Project Setup (First-Time Only)

Before the application can be deployed for the first time, the underlying Google Cloud and Firebase services must be configured.

### 1. Enable Google Cloud APIs

For all features to work, you must enable six specific APIs in your Google Cloud project.

1.  Go to the **[Google Cloud API Library](https://console.cloud.google.com/apis/library)**.
2.  Search for and **ENABLE** each of the following APIs one by one:
    *   **Vertex AI API** (for Gemini AI features)
    *   **Maps JavaScript API** (the core for all map functionality)
    *   **Street View Static API** (to display Street View images)
    *   **Maps Embed API** (for embedding maps)
    *   **Places API** (for photos and ratings)
    *   **Geocoding API** (for finding locations accurately)

### 2. Security Rules

This project's security rules for Firestore and Firebase Storage are configured to allow public read and write access. This is intentional to allow a small, trusted group of users to use the application without needing to sign in.

**Warning:** This configuration means that anyone with the link to your project can read and write data. This is suitable for a demo or for a very limited, trusted audience.

---

## Deployment via Workload Identity Federation

Deployment is handled automatically by a GitHub Action workflow. This project uses **Workload Identity Federation** to securely authenticate with Google Cloud without needing to manage service account keys.

### 1. First-Time Setup

The following steps have already been performed, but are documented here for reference. This configuration establishes a trust relationship between your GitHub repository and your Google Cloud project.

1.  **Create a Service Account:** A dedicated service account named `github-actions-deployer` was created.
2.  **Grant Permissions:** The `github-actions-deployer` service account was granted the necessary roles (`Firebase Admin`, `API Keys Admin`, `Vertex AI User`, `Secret Manager Admin`, `Editor`, `Service Account User`, `iam.workloadIdentityUser`).
3.  **Create a Workload Identity Pool:** A pool named `github-actions-pool` was created to manage identities from external providers.
4.  **Create a Workload Identity Provider:** A provider named `github-actions-provider` was created within the pool. It is configured to trust your GitHub repository (`theagentwo-wq/New-KPI-Dashboard`).
5.  **Link Service Account:** The service account was linked to the GitHub provider, allowing workflows from your repository to impersonate the service account.

### 2. Required GitHub Secrets

You must still provide the application with its necessary client-side API keys.

1.  In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2.  Click **"New repository secret"** and create the following two secrets:
    *   **`VITE_MAPS_KEY`**: The Google Maps API key.
    *   **`FIREBASE_CLIENT_CONFIG`**: The single-line JSON configuration object for your Firebase web app.

With these secrets in place, every push to your repository's `main` branch will automatically deploy a new version of your application with the correct keys.

---

## Project Identification

These are the official identifiers for the active projects.

### GitHub Repository
*   **Repository:** `theagentwo-wq/New-KPI-Dashboard`

### Google Cloud Project
*   **Project Name:** `Firebase app`
*   **Project ID:** `kpi-dashboardgit-9913298-66e65`
*   **Project Number:** `265139900488`

### Firebase Project
*   **Project Name:** `Firebase app` (Display Name: `KPI-Dashboard-git`)
*   **Project ID:** `kpi-dashboardgit-9913298-66e65`
*   **Project Number:** `265139900488`

---

## Architecture Notes

### API Structure
- **Frontend**: Calls `/api/{action}` via `src/lib/ai-client.ts`
- **Firebase Hosting**: Routes `/api/**` to Cloud Function named `api`
- **Server**: Express app in `server/src/index.ts` with individual routes per action
- **Gemini Handler**: All AI actions go through `handleGeminiRequest()` function

### Functions Directory
The project uses `/server` as the Cloud Functions source directory (as specified in `firebase.json`). The `/functions` directory exists but is not used in deployment.

---

## Development Notes

For ongoing development work, known issues, and session notes, see **[DEVELOPMENT.md](DEVELOPMENT.md)**.

This includes:
- Current work in progress
- Known issues and their status
- Architecture decisions
- Quick reference commands
- Context for continuing work across sessions

