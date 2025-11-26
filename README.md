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

This project uses a hybrid workflow that combines local development and testing with automated deployment via GitHub.

1.  **Local Development**: All code is edited and tested within this cloud IDE, which functions as a local development environment.
    *   To run the app for testing, use the `npm run dev` command in the terminal.
    *   This requires local environment variables to be set (see "Local Development Setup" below).
2.  **Version Control**: Changes are committed and pushed to the project's GitHub repository. All work should happen on the `main` branch.
3.  **Automated Deployment**: Pushing code to the `main` branch of the GitHub repository automatically triggers a GitHub Action. This action builds the application and deploys it to the live Firebase Hosting environment.
4.  **Deployment Secrets**: For the automated deployment to succeed, API keys and configuration must be stored as **Secrets** in the GitHub repository. The deployment workflow injects these secrets into the live application.

---

## Local Development Setup

To run the application in the local development environment, you must create a file named `.env.local` in the root of the project. This file is ignored by Git and will not be committed to the repository.

The `.env.local` file must contain the following variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
MAPS_API_KEY=your_maps_api_key_here
FIREBASE_CLIENT_CONFIG='your_firebase_config_json_here'
```

**Note:** The `FIREBASE_CLIENT_CONFIG` must be a valid JSON object on a single line, enclosed in single quotes. The project includes a validation script that checks for these variables when you run `npm run dev`.

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

## Assistant Instructions

**For the AI Assistant:**

1.  **Review this `README.md` file in its entirety before starting any new task.** It contains critical information about how the project is managed and configured. If there are discrepencies ask the user to define
2.  If any part of a request is unclear, or if it seems to conflict with the information in this document, you **must** ask for clarification before taking any action.
3.  **Never assume a local file system or terminal.** All project code and configuration lives in this IDE and GitHub. The local file system is not part of the development workflow and DOES not contain all the updates files for use.
4.  **Clarification on Environment:** To be perfectly clear, I am an AI assistant operating in a sandboxed cloud IDE. I am not on your local computer. The only files I can access are the ones inside this project, provided by the IDE's environment.

## Development Environment Troubleshooting Log

This project recently underwent significant troubleshooting to resolve persistent build and compilation errors. The primary issue stemmed from phantom errors related to a deleted script (`scripts/seed-database.ts`) that were being cached by the TypeScript server.

The following steps were taken to stabilize the development environment:

1.  **Deleted Obsolete Scripts:** The unused `scripts/seed-database.ts` file was removed.
2.  **Corrected TypeScript Configuration:**
    *   Modified `tsconfig.json` to have a more specific `"include"` array (`["src", "netlify/**/*.ts"]`) to prevent it from scanning the entire project.
    *   Modified `tsconfig.node.json` to remove `scripts/**/*.ts` from its `"include"` array, which was the primary source of the phantom errors.
    *   Removed a restrictive `types` array from `tsconfig.json` to allow automatic detection of React types.
3.  **Cleaned Project Dependencies:** The `node_modules` directory and `package-lock.json` file were deleted, followed by a fresh `npm install` to ensure a clean, non-corrupted state.
4.  **Resolved Code Warnings:** Removed an unused `FileUploadResult` import from `src/App.tsx`.

**Current Status:** As of this writing, all underlying file and configuration issues have been resolved. However, the IDE's TypeScript server is still caching the old, phantom errors. A full restart of the IDE application is required to clear this cache.
