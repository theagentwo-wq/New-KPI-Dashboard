"use strict";
/**
 * Cloud Functions Entry Point
 * Single Cloud Function 'api' handling all routes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const error_handler_1 = require("./middleware/error-handler");
const gemini_1 = __importDefault(require("./routes/gemini"));
// Initialize Firebase Admin
admin.initializeApp();
// Create Express app
const app = (0, express_1.default)();
// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json({ limit: '10mb' })); // Support larger payloads for file uploads
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
app.use('/api', gemini_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`,
    });
});
// Error handler (must be last)
app.use(error_handler_1.errorHandler);
// ============================================================================
// CLOUD FUNCTION EXPORT
// ============================================================================
/**
 * Main Cloud Function
 * Handles all API requests with proper secret management
 */
exports.api = (0, https_1.onRequest)({
    secrets: ['GEMINI_API_KEY'], // Declare secret from Google Secret Manager
    timeoutSeconds: 540, // 9 minutes (max for 2nd gen is 60 min, but 9 min is safer)
    memory: '512MiB',
    cors: true,
}, app);
//# sourceMappingURL=index.js.map