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

1.  **Code Editing**: All code is edited directly within Google's cloud environment (e.g., the Firebase Console's editor or a connected Cloud Shell).
2.  **Version Control**: Changes are committed and pushed to the project's GitHub repository.
3.  **Secrets Management**: All API keys and configuration secrets are stored securely in the GitHub repository's **Secrets** section. They are injected into the application only during the deployment process.
4.  **Automated Deployment**: Pushing code to the `main` branch of the GitHub repository automatically triggers a GitHub Action that builds, tests, and deploys the application to Firebase Hosting and Cloud Functions.
5.  **Cloud Infrastructure**: API access and permissions are managed in the Google Cloud Console.

---

## Cloud Project Setup (First-Time Only)

Before the application can be deployed for the first time, the underlying Google Cloud and Firebase services must be configured.

### 1. Enable Google Cloud APIs

For all features to work, you must enable four specific APIs in your Google Cloud project.

1.  Go to the **[Google Cloud API Library](https://console.cloud.google.com/apis/library)**.
2.  Search for and **ENABLE** each of the following APIs one by one:
    *   **Vertex AI API** (for Gemini AI features)
    *   **Maps Embed API** (for Street View)
    *   **Places API** (for photos and ratings)
    *   **Geocoding API** (for finding locations accurately)

### 2. Grant Permissions for AI Features

The backend authenticates to the Gemini API using its service account identity. You must grant it the correct permission.

1.  Go to the **[IAM & Admin Page](https://console.cloud.google.com/iam-admin/iam)**.
2.  Find the principal (service account) named **`[YOUR-PROJECT-ID]@appspot.gserviceaccount.com`**.
3.  Click the **pencil icon** to edit its roles.
4.  Click **"+ ADD ANOTHER ROLE"** and add the **"Vertex AI User"** role.
5.  Click **"SAVE"**.

### 3. Update Security Rules

You must update the security rules for Firestore and Firebase Storage to allow the application to read and write data.

1.  **Firestore:** Go to **Firestore Database > Rules** in the Firebase Console and replace the rules with:
    '''
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true; // WARNING: Allows public access. For demo purposes only.
        }
      }
    }
    '''
2.  **Storage:** Go to **Storage > Rules** in the Firebase Console and replace the rules with:
    '''
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /{allPaths=**} {
          allow read, write: if true; // WARNING: Allows public access. For demo purposes only.
        }
      }
    }
    '''
3.  Click **"Publish"** for both sets of rules.

---

## Deployment and Secrets Configuration

Deployment is handled automatically by GitHub Actions. For the deployment to succeed, you must provide it with the necessary API keys and configuration by storing them as secrets in your GitHub repository.

### 1. Create a Google Maps API Key

1.  Go to the **[Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials)**.
2.  Click **"+ CREATE CREDENTIALS"** and select **"API key"**.
3.  **Copy the new API key immediately.** This will be used in the next step.

### 2. Get Your Firebase Configuration

1.  In the **Firebase Console**, go to **Project Settings > General**.
2.  Scroll to the **"Your apps"** card and select your web app.
3.  Find the **"SDK setup and configuration"** section and select **"Config"**.
4.  Copy the `firebaseConfig` object. It must be formatted as a **single, continuous line of JSON text.**
    *   **✅ Correct Format:** `{"apiKey":"...","authDomain":"...","projectId":"..."}`

### 3. Add Keys to GitHub Secrets

1.  In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2.  Click **"New repository secret"** and create the following two secrets:
    *   **`VITE_MAPS_KEY`**: Paste the Google Maps API key you copied.
    *   **`FIREBASE_CLIENT_CONFIG`**: Paste the single-line JSON configuration from Firebase.

With these secrets in place, every push to your repository's `main` branch will automatically deploy a new version of your application with the correct keys.

---

## Project Identification

These are the official identifiers for the currently active Google Cloud and Firebase project.

*   **Project Name:** `Firebase app`
*   **Project ID:** `kpi-dashboardgit-9913298-66e65`
*   **Project Number:** `265139900488`

---

## Assistant Instructions

**For the AI Assistant:**

1.  **Review this `README.md` file in its entirety before starting any new task.** It contains critical information about how the project is managed and configured.
2.  If any part of a request is unclear, or if it seems to conflict with the information in this document, you **must** ask for clarification before taking any action.
