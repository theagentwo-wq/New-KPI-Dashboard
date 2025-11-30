/**
 * Gemini AI Routes
 * All 18 API endpoints for AI-powered analysis
 */

import { Router, Request, Response } from 'express';
import { getGeminiClient } from '../services/gemini-client';
import { asyncHandler } from '../middleware/error-handler';
import * as types from '../types/api';

const router = Router();

/**
 * Helper: Get Gemini client with API key from secret
 */
const getClient = (apiKey: string | undefined) => {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return getGeminiClient(apiKey);
};

// ============================================================================
// AI ANALYSIS ENDPOINTS (14 total)
// ============================================================================

/**
 * 1. POST /api/getInsights
 * Generate insights from KPI data with custom prompt
 */
router.post('/getInsights', asyncHandler(async (req: Request, res: Response) => {
  const { data, view, period, prompt }: types.GetInsightsRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const fullPrompt = `You are a restaurant operations analyst reviewing KPI data.

View: ${view}
Period: ${period}

${prompt}

Analyze the data and provide actionable insights.`;

  const result = await client.generateFromData(fullPrompt, data);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 2. POST /api/getExecutiveSummary
 * Executive summary for period
 */
router.post('/getExecutiveSummary', asyncHandler(async (req: Request, res: Response) => {
  const { data, view, period }: types.GetExecutiveSummaryRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are the Chief Operating Officer of a restaurant company reviewing ${period.label} performance.

View: ${view}
Period: ${period.label} (${period.startDate} to ${period.endDate})

Create a concise executive summary (3-4 paragraphs) covering:
1. Overall Performance Highlights
2. Key Wins and Challenges
3. Critical Action Items
4. Strategic Recommendations

Be specific with numbers and focus on what matters most.`;

  const result = await client.generateFromData(prompt, data);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 3. POST /api/getReviewSummary
 * Summarize customer reviews for a location
 */
router.post('/getReviewSummary', asyncHandler(async (req: Request, res: Response) => {
  const { locationName, reviews }: types.GetReviewSummaryRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are analyzing customer reviews for ${locationName}.

Here are the recent customer reviews from Google:
${JSON.stringify(reviews, null, 2)}

Analyze these reviews and provide:

## Overall Sentiment Summary
Brief overview of how customers feel about this location.

## Top 3 Positive Themes
What customers love most (with specific quotes from reviews as supporting evidence).

## Top 3 Negative Themes
What needs improvement (with specific quotes from reviews as supporting evidence).

## Recommended Actions for Management
Specific, actionable steps to address issues and capitalize on strengths.

Be specific and actionable. Use actual quotes from the reviews to support your analysis.`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 4. POST /api/getLocationMarketAnalysis
 * Market analysis for a location (will be enhanced in Phase 9)
 */
router.post('/getLocationMarketAnalysis', asyncHandler(async (req: Request, res: Response) => {
  const { locationName }: types.GetLocationMarketAnalysisRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  // Basic implementation - will be enhanced in Phase 9 with web search, events, holidays
  const prompt = `You are a local market analyst for ${locationName}.

Conduct a comprehensive market analysis covering:

1. LOCAL DEMOGRAPHICS
   - Population trends, age distribution, income levels, tourism statistics

2. MACRO EVENTS (City-Wide)
   - Search: "${locationName} events calendar"
   - Major festivals, conventions, sporting events, citywide celebrations

3. MICRO EVENTS (Neighborhood-Level)
   - Nearby venues (theaters, arenas), art galleries, entertainment districts

4. HOLIDAY IMPACT (CRITICAL)
   - Upcoming holidays in next 30 days
   - Historical impact on restaurant traffic

5. LOCAL NEWS & ENTERTAINMENT
   - What's trending, new businesses, construction/road closures

6. COMPETITION ANALYSIS
   - Other restaurants (similar cuisine), recent reviews, market gaps

7. WEATHER PATTERNS
   - Seasonal trends, how weather affects local dining habits

PROVIDE:
- Executive summary (2-3 paragraphs)
- Top 5 opportunities for this location
- Timing recommendations
- Specific actionable tactics`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 5. POST /api/generateHuddleBrief
 * Daily huddle briefing (will be enhanced in Phase 9 with audience-specific prompts)
 */
router.post('/generateHuddleBrief', asyncHandler(async (req: Request, res: Response) => {
  const { locationName, performanceData, audience, weather }: types.GenerateHuddleBriefRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  // Audience-specific prompts (enhanced in Phase 9)
  let prompt = '';

  if (audience === 'FOH') {
    prompt = `You are the General Manager of ${locationName} preparing a pre-shift brief for the FRONT OF HOUSE team.

INCORPORATE:
- Performance data: ${JSON.stringify(performanceData)}
- Weather: ${JSON.stringify(weather)}
- Local events happening today

## Sales Contests & Games (CRITICAL)
Create 1-2 fun, proven sales contests for servers/bartenders:
- Examples: "Upsell Challenge", "Dessert Derby", "Cocktail Champion"
- Clear rules, friendly competition, prizes/recognition

## Direct Actions for Smooth Shift
- Table turnover goals, guest check-in frequency
- Teamwork focus areas, potential challenges

TONE: Energetic, motivating, team-oriented
FORMAT: Brief (2-3 minutes to read aloud)`;
  } else if (audience === 'BOH') {
    prompt = `You are the Executive Chef of ${locationName} preparing a pre-shift brief for the BACK OF HOUSE team.

INCORPORATE:
- Performance data: ${JSON.stringify(performanceData)}
- Weather: ${JSON.stringify(weather)}
- Expected covers based on forecast

## Kitchen Safety & Health Standards
- Today's safety focus (e.g., knife handling, slip prevention)
- Food safety reminder (temps, cross-contamination)

## Anthony Bourdain-Style Passion (CRITICAL)
- The pride of working in kitchens
- Craftsmanship and excellence, team camaraderie
- "We're not just cooking food, we're creating experiences"
- Respect the ingredients, respect the craft

## Execution Focus
- Key menu items to prioritize, timing goals, quality standards

TONE: Passionate, professional, pride in craft
FORMAT: Brief (2-3 minutes to read aloud)`;
  } else {
    // Managers
    prompt = `You are preparing a comprehensive pre-shift brief ONLY for the MANAGEMENT TEAM at ${locationName}.

IMPORTANT: Generate ONLY ONE brief for Managers. Do not generate separate FOH or BOH briefs.

## Sales & Guest Experience Strategy
- Create 1-2 sales contests for the FOH team to announce (examples: "Upsell Challenge", "Dessert Derby")
- Guest experience focus areas, service standards

## Kitchen Excellence & Safety
- Kitchen safety focus for today, food safety reminders
- Quality standards and timing goals
- Motivate BOH with passion for craft and excellence

## Management-Specific Elements

### Performance & Profitability
- P&L snapshot from performance data below
- Today's profitability goals, labor %, prime cost targets

Performance Data: ${JSON.stringify(performanceData)}

### Operations Excellence
- Floor management strategy, labor deployment optimization
- Guest recovery protocols, handling peak periods

### Culture Building (CRITICAL)
- Hospitality industry best practices
- Inspiring leadership moment, team recognition opportunities
- "How can we make today exceptional for our team AND our guests?"

### Weather & Local Context
Weather: ${JSON.stringify(weather)}
- How weather impacts expected traffic
- Local events driving business today

### Action Plan
- Specific measurable goals for the shift
- Metrics to track throughout the day

TONE: Strategic, inspiring, action-oriented
FORMAT: Comprehensive (5-7 minutes to read/discuss)`;
  }

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 6. POST /api/getSalesForecast
 * Sales forecasting (will be enhanced in Phase 8 with historical data)
 */
router.post('/getSalesForecast', asyncHandler(async (req: Request, res: Response) => {
  const { locationName, weatherForecast, historicalData }: types.GetSalesForecastRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are a data analyst forecasting sales for ${locationName}.

7-Day Weather Forecast:
${JSON.stringify(weatherForecast, null, 2)}

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Generate a 7-day sales forecast with:
- Predicted daily sales
- Confidence level
- Key factors influencing each day
- Recommendations for staffing and prep

Return as JSON array of forecast points.`;

  const result = await client.generateJSON(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 7. POST /api/getMarketingIdeas
 * Marketing recommendations (will be enhanced in Phase 9 for multi-generational)
 */
router.post('/getMarketingIdeas', asyncHandler(async (req: Request, res: Response) => {
  const { locationName, userLocation }: types.GetMarketingIdeasRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are a creative marketing strategist for ${locationName}.

Generate 10-15 actionable, locally-tailored marketing ideas that:

## 1. Target Multiple Generations
- Gen Z (1997-2012): TikTok, Instagram Reels, viral challenges
- Millennials (1981-1996): Instagram, experiences, sustainability
- Gen X (1965-1980): Facebook, email, value + quality
- Boomers (1946-1964): Facebook, traditional media, loyalty programs
- Gen Alpha (2013+): YouTube, family-friendly, visual content

## 2. Address Different Financial Classes
- Budget-conscious: Value deals, happy hour, lunch specials
- Mid-market: Quality-to-price ratio, experiences
- Premium: Exclusive offerings, VIP experiences

## 3. Easy for Managers to Execute (CRITICAL)
- Store-level initiatives (not just corporate)
- Minimal budget required, can be implemented within 1-2 weeks

## 4. Locally-Tailored
- Leverage local culture and identity
- Partner with nearby businesses

## 5. Seasonal & Timely
- Current season opportunities, upcoming holidays

FORMAT FOR EACH IDEA:
- Idea title
- Target demographic
- Budget level ($ low, $$ medium, $$$ high)
- Implementation difficulty (Easy/Medium/Hard)
- Expected ROI
- Step-by-step execution plan

Location: ${locationName}
User Location: ${JSON.stringify(userLocation)}`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 8. POST /api/getNoteTrends
 * Analyze note trends - CRITICAL for Notes feature
 */
router.post('/getNoteTrends', asyncHandler(async (req: Request, res: Response) => {
  const { notes }: types.GetNoteTrendsRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are analyzing operational notes from restaurant managers.

Notes:
${JSON.stringify(notes, null, 2)}

Analyze these notes and identify:
1. Recurring themes and patterns
2. Emerging issues that need attention
3. Positive trends worth celebrating
4. Recommended action items for leadership

Be specific and prioritize by impact.`;

  const result = await client.generateFromData(prompt, notes);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 9. POST /api/getAnomalyDetections
 * Detect anomalies in data (placeholder - to be fully implemented later)
 */
router.post('/getAnomalyDetections', asyncHandler(async (req: Request, res: Response) => {
  const { allStoresData, periodLabel }: types.GetAnomalyDetectionsRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are analyzing KPI data for ${periodLabel} across all stores to detect anomalies.

Identify stores with unusual performance (outliers) for any KPI.

Return a JSON array of anomalies with format:
[
  {
    "store": "Store Name",
    "kpi": "KPI Name",
    "value": actual_value,
    "expected": expected_value,
    "variance": percentage,
    "severity": "high" | "medium" | "low"
  }
]`;

  const result = await client.generateJSON(prompt, allStoresData);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 10. POST /api/getAnomalyInsights
 * Explain detected anomalies (placeholder - to be fully implemented later)
 */
router.post('/getAnomalyInsights', asyncHandler(async (req: Request, res: Response) => {
  const { anomaly, data }: types.GetAnomalyInsightsRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are explaining why this anomaly occurred:

Anomaly: ${JSON.stringify(anomaly)}

Full Context: ${JSON.stringify(data)}

Provide:
1. Why this anomaly likely occurred (root causes)
2. Whether it's concerning or expected
3. Recommended actions
4. Similar patterns to watch for`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 11. POST /api/getVarianceAnalysis
 * Variance analysis for KPI
 */
router.post('/getVarianceAnalysis', asyncHandler(async (req: Request, res: Response) => {
  const { location, kpi, variance, allKpis }: types.GetVarianceAnalysisRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are analyzing variance for ${kpi} at ${location}.

Variance: ${variance}%
All KPIs: ${JSON.stringify(allKpis)}

Explain:
1. Why this variance occurred
2. Related KPIs that may explain it
3. Whether it's positive or concerning
4. Recommended actions to address it

Be specific and data-driven.`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 12. POST /api/runWhatIfScenario
 * What-if scenario modeling (placeholder - to be fully implemented later)
 */
router.post('/runWhatIfScenario', asyncHandler(async (req: Request, res: Response) => {
  const { data, prompt }: types.RunWhatIfScenarioRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const fullPrompt = `You are running a what-if scenario analysis.

Scenario: ${prompt}

Current Data: ${JSON.stringify(data)}

Model the impact of this scenario and return:
{
  "analysis": "Detailed analysis of the scenario",
  "projectedImpact": {
    "sales": number,
    "labor": number,
    "profitability": number
  },
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Action 1", "Action 2"]
}`;

  const result = await client.generateJSON(fullPrompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 13. POST /api/getStrategicExecutiveAnalysis
 * Strategic executive KPI deep-dive
 */
router.post('/getStrategicExecutiveAnalysis', asyncHandler(async (req: Request, res: Response) => {
  const {
    kpi,
    period,
    companyTotal,
    directorPerformance,
    anchorStores,
  }: types.GetStrategicExecutiveAnalysisRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are the CEO reviewing ${kpi} performance for ${period}.

Company Total: ${companyTotal}

Director Performance:
${JSON.stringify(directorPerformance, null, 2)}

Anchor Stores (Best/Worst):
${JSON.stringify(anchorStores, null, 2)}

Provide a strategic executive analysis covering:
1. Overall company performance on this KPI
2. Director-level insights (who's excelling, who needs support)
3. What the best stores are doing right
4. Root causes for underperformance
5. Strategic recommendations for improvement

Be specific, data-driven, and actionable.`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 14. POST /api/getDirectorPerformanceSnapshot
 * Director performance summary
 */
router.post('/getDirectorPerformanceSnapshot', asyncHandler(async (req: Request, res: Response) => {
  const { directorId, period }: types.GetDirectorPerformanceSnapshotRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are creating a performance snapshot for Director ID: ${directorId} for ${JSON.stringify(period)}.

Provide a concise summary covering:
1. Overall performance rating
2. Key achievements this period
3. Areas for improvement
4. Comparison to other directors
5. Recommended focus areas

Be constructive and specific.`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

// ============================================================================
// STRATEGIC PLANNING ENDPOINTS (2 total)
// ============================================================================

/**
 * 15. POST /api/startStrategicAnalysisJob
 * Long-running strategic analysis
 */
router.post('/startStrategicAnalysisJob', asyncHandler(async (req: Request, res: Response) => {
  const { mode, period, view }: types.StartStrategicAnalysisJobRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  // Generate a job ID
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const prompt = `You are conducting a strategic analysis.

Mode: ${mode}
Period: ${JSON.stringify(period)}
View: ${view}

Begin comprehensive strategic analysis covering all aspects of operations, performance, and opportunities.`;

  // In a real implementation, this would be asynchronous with job tracking
  // For now, return the job ID immediately
  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: {
      jobId,
      status: 'processing',
      result, // In production, this would be retrieved via getTaskStatus
    },
  });
}));

/**
 * 16. POST /api/chatWithStrategy
 * Chat with strategic AI
 */
router.post('/chatWithStrategy', asyncHandler(async (req: Request, res: Response) => {
  const { context, userQuery, mode }: types.ChatWithStrategyRequest = req.body;
  const client = getClient(process.env.GEMINI_API_KEY);

  const prompt = `You are a strategic business advisor with deep knowledge of restaurant operations.

Context from previous analysis:
${context}

Analysis Mode: ${mode}

User Question: ${userQuery}

Provide a thoughtful, strategic response that:
1. Directly answers the question
2. References relevant context from the analysis
3. Offers actionable recommendations
4. Suggests follow-up considerations`;

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

// ============================================================================
// DATA IMPORT ENDPOINTS (2 total) - Will be fully implemented in Phase 8
// ============================================================================

/**
 * 17. POST /api/startTask
 * Process uploaded Excel/CSV/image with AI extraction
 * Placeholder - will be fully implemented in Phase 8
 */
router.post('/startTask', asyncHandler(async (req: Request, res: Response) => {
  // Placeholder implementation - Phase 8 will add full file processing
  // const { model, prompt, files, taskType }: types.StartTaskRequest = req.body;
  const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    success: true,
    data: {
      id: jobId,
      status: 'processing',
      message: 'Import job started (placeholder - will be implemented in Phase 8)',
    },
  });
}));

/**
 * 18. GET /api/getTaskStatus/:jobId
 * Poll import job status
 * Placeholder - will be fully implemented in Phase 8
 */
router.get('/getTaskStatus/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  // Placeholder implementation - Phase 8 will add real job tracking
  res.json({
    success: true,
    data: {
      jobId,
      status: 'completed',
      message: 'Task status endpoint (placeholder - will be implemented in Phase 8)',
    },
  });
}));

export default router;
