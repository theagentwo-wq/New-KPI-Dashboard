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
- **Deployment**: Automated via GitHub Actions

---

## How This Project is Managed

This project is managed entirely through a cloud-based workflow. **No local development environment, terminal, or command-line tools are required.**

The development and deployment process is as follows:

1.  **Code Editing**: All code is edited directly within this dedicated cloud IDE.
2.  **Version Control**: Changes are committed and pushed to the project's GitHub repository.
3.  **Secrets Management**: All API keys and configuration secrets are stored securely in the GitHub repository's **Secrets** section. They are injected into the application only during the deployment process.
4.  **Automated Deployment**: Pushing code to the `main` branch of the GitHub repository automatically triggers a GitHub Action that builds, tests, and deploys the application. This includes both the frontend (Firebase Hosting) and the backend (Cloud Functions).
5.  **Branching Strategy**: All work should happen directly on the `main` branch.

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

## Deployment and Secrets Configuration

Deployment is handled automatically by a GitHub Action workflow. For the deployment to succeed, you must provide it with the necessary API keys and configuration by storing them as secrets in your GitHub repository.

### 1. Create a Service Account for Deployment

The deployment process uses a Google Cloud service account for secure authentication.

1.  Go to the **[IAM & Admin > Service Accounts Page](https://console.cloud.google.com/iam-admin/serviceaccounts)**.
2.  Click **"+ CREATE SERVICE ACCOUNT"**.
3.  Give it a name (e.g., `github-actions-deployer`) and an optional description.
4.  Click **"CREATE AND CONTINUE"**.
5.  In the "Grant this service account access to project" step, add the following three roles:
    *   **Firebase Admin** (for deploying to Firebase)
    *   **API Keys Admin** (for managing API keys)
    *   **Vertex AI User** (for AI features)
6.  Click **"CONTINUE"**, then click **"DONE"**.
7.  Find the service account you just created in the list. Click the three-dot menu on the right and select **"Manage keys"**.
8.  Click **"ADD KEY"** > **"Create new key"**.
9.  Choose **JSON** as the key type and click **"CREATE"**. A JSON file will be downloaded to your computer. **This is the only time you can download this file.** Keep it secure.

### 2. Create a Google Maps API Key

1.  Go to the **[Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials)**.
2.  Click **"+ CREATE CREDENTIALS"** and select **"API key"**.
3.  **Copy the new API key immediately.** This will be used in the next step.

### 3. Get Your Firebase Configuration

1.  In the **Firebase Console**, go to **Project Settings > General**.
2.  Scroll to the **"Your apps"** card and select your web app.
3.  Find the **"SDK setup and configuration"** section and select **"Config"**.
4.  Copy the `firebaseConfig` object. It must be formatted as a **single, continuous line of JSON text.**
    *   **✅ Correct Format:** `{"apiKey":"...","authDomain":"...","projectId":"..."}`

### 4. Add Keys to GitHub Secrets

1.  In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2.  Click **"New repository secret"** and create the following three secrets:
    *   **`FIREBASE_SERVICE_ACCOUNT_OPERATIONS_KPI_DASHBOARD`**: Open the JSON service account key you downloaded and paste its entire contents here.
    *   **`VITE_MAPS_KEY`**: Paste the Google Maps API key you copied.
    *   **`FIREBASE_CLIENT_CONFIG`**: Paste the single-line JSON configuration from Firebase.

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

1.  **Review this `README.md` file in its entirety before starting any new task.** It contains critical information about how the project is managed and configured.
2.  If any part of a request is unclear, or if it seems to conflict with the information in this document, you **must** ask for clarification before taking any action.
3.  **Never assume a local file system or terminal.** All project code and configuration lives in this IDE and GitHub. The local file system is not part of the development workflow.
