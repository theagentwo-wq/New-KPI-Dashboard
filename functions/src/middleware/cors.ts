/**
 * CORS Middleware
 * Configured for Firebase hosting and local development
 */

import cors from 'cors';

export const corsMiddleware = cors({
  origin: true, // Allow all origins (Firebase hosting handles this securely)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
