/**
 * Cloud Functions Entry Point
 * Single Cloud Function 'api' handling all routes
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import geminiRoutes from './routes/gemini';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' })); // Support larger payloads for file uploads

// Request logging (development)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KPI Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount Gemini AI routes
app.use('/api', geminiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// CLOUD FUNCTION EXPORT
// ============================================================================

/**
 * Main Cloud Function
 * Handles all API requests with proper secret management
 */
export const api = onRequest(
  {
    secrets: ['GEMINI_API_KEY'], // Declare secret from Google Secret Manager
    timeoutSeconds: 540, // 9 minutes (max for 2nd gen is 60 min, but 9 min is safer)
    memory: '512MiB',
    cors: true,
  },
  app
);
