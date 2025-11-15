# Operations KPI Dashboard

This is a world-class, interactive, and visually polished Operations KPI Dashboard for the Tupelo Honey Cafe restaurant group. It provides a comprehensive suite of tools for tracking, budgeting, and analyzing key performance indicators, featuring several advanced AI-powered features using the Gemini API for deep analysis and forecasting.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API

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

This project requires a Google Gemini API key to function.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your API key to this file. **It must be prefixed with `VITE_`**.

```
VITE_API_KEY=your_gemini_api_key_here
```

### 4. Running the Development Server

Once the dependencies are installed and the environment variable is set, you can start the local development server:

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

Netlify should automatically detect the following settings from the `netlify.toml` file. If not, you can set them manually:

-   **Build command**: `npm run build`
-   **Publish directory**: `dist`

### 4. Add Environment Variable

This is the most important step for the deployed application to work.

1.  In your site's dashboard on Netlify, go to "Site configuration" -> "Environment variables".
2.  Click "Add a variable".
3.  Enter the **Key** as `VITE_API_KEY`.
4.  Enter your Google Gemini API key as the **Value**.
5.  Click "Create variable".

### 5. Deploy

Trigger a new deploy from the "Deploys" tab in your Netlify dashboard. Netlify will build your site and deploy it to a public URL.