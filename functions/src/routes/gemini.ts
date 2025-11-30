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
  const today = new Date();
  const currentDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a local market analyst for ${locationName}.

TODAY'S DATE: ${currentDate}

CRITICAL INSTRUCTIONS:
- Provide SPECIFIC information from your knowledge, not generic advice
- If you don't have specific data, provide links to relevant sources
- DO NOT tell users to "check local listings" - either provide info or provide links
- Focus on the NEXT 30 DAYS from today's date

## 1. LOCAL DEMOGRAPHICS

Provide SPECIFIC data you know about this city:
- Population size, growth trends
- Age distribution and income levels
- Tourism statistics and seasonal patterns
- Key demographic facts relevant to restaurants

## 2. UPCOMING EVENTS - NEXT 30 DAYS (CRITICAL)

List TOP 3 SPECIFIC EVENTS you know about in each category:

**Major Sporting Events:**
- List specific games/matches if you know them (college football, basketball, etc.)
- If unknown, provide link: "Check [University of South Carolina Athletics](https://gamecocksonline.com/) or [Colonial Life Arena](https://www.coloniallifearena.com/events)"

**Concerts & Music:**
- List specific concerts/shows if you know them
- If unknown, provide links: "Check [Colonial Life Arena events](https://www.coloniallifearena.com/events), [Trustus Theatre](https://trustus.org/), [Koger Center](https://www.kogercenterforthearts.com/events)"

**Arts & Cultural Events:**
- List specific exhibitions/shows if you know them
- If unknown, provide links: "Check [Columbia Museum of Art](https://www.columbiamuseum.org/), Vista galleries, local theaters"

**Citywide Celebrations:**
- List specific parades, festivals, holiday events
- Include dates if known

**Conventions & Conferences:**
- List specific conventions if you know them
- If unknown: "Check [Columbia Metropolitan Convention Center](https://www.columbiaconventioncenter.com/)"

## 3. NEIGHBORHOOD EVENTS (The Vista)

**Specific to The Vista district where Tupelo Honey is located:**
- Gallery crawls, art walks (usually first Thursdays)
- Nearby venue events
- Neighborhood-specific happenings

## 4. HOLIDAY IMPACT (CRITICAL)

Which holidays fall in the next 30 days from ${currentDate}?
- List each holiday with date
- Expected impact on restaurant traffic (high/medium/low)
- Seasonal dining trends for this time of year

## 5. LOCAL NEWS & COMPETITION

**New Restaurants:**
- List any new openings you know about
- Otherwise: "Monitor local food blogs and Columbia Free Times"

**Similar Restaurants in the area:**
- List 3-5 direct competitors with their strengths
- Market positioning vs. Tupelo Honey

**Construction/Road Work:**
- Any major projects affecting Vista access
- Otherwise: "Check SCDOT traffic advisories"

## 6. WEATHER IMPACT

Expected weather for this time of year in Columbia, SC:
- Typical temperature range
- Precipitation patterns
- Impact on patio dining and guest traffic

---

## FINAL DELIVERABLES:

**Executive Summary (2-3 paragraphs):**
Current market conditions and key opportunities

**Top 5 Opportunities for Next 30 Days:**
With specific dates/timeframes where applicable

**Actionable Tactics:**
3-5 specific things the restaurant can do to capitalize`;

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

  // Get current date for event context
  const today = new Date();
  const currentDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Audience-specific prompts (enhanced in Phase 9)
  let prompt = '';

  if (audience === 'FOH') {
    prompt = `You are the General Manager of ${locationName} preparing hot topics ONLY for the FRONT OF HOUSE team.

⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:
- Write ONE brief for FOH (Front of House) ONLY
- Do NOT write a BOH (Back of House) brief
- Do NOT write a Manager brief
- Do NOT include "Hot Topics for BOH" or "Hot Topics for Managers" sections
- STOP after completing the FOH brief

TODAY'S DATE: ${currentDate}
Performance data: ${JSON.stringify(performanceData)}
Weather: ${JSON.stringify(weather)}

## 1. Sales Focus & Contests (CRITICAL)

**Company Promotions:**
Check https://www.tupelohoneycafe.com for current company-wide promotions or specials that are live
- Highlight any active promotions to guests
- Train servers on promotion details and upselling points

**Daily Sales Contests:**
Create 1-2 fun, proven sales contests for servers/bartenders today:
- Examples: "Upsell Challenge", "Dessert Derby", "Cocktail Champion"
- Clear rules, friendly competition, prizes/recognition
- What menu items to push today

## 2. Guest Experience Goals

- Table turnover goals and efficiency
- Guest check-in frequency (2-minute rule, 2-bite rule)
- Upselling techniques for today
- Handling special requests or dietary needs

## 3. Teamwork & Communication

- Server sections and station assignments
- Communication with BOH (timing, special orders)
- Supporting each other during peak times
- Potential challenges for today's shift

## 4. Weather, Events & Traffic Impact (CRITICAL)

Weather: ${JSON.stringify(weather)}

**Local Events Happening Today/Tonight:**
List any specific events in Columbia, SC that could impact our traffic TODAY or TONIGHT:
- USC Gamecocks games (football, basketball) - include specific time if known (e.g., "USC vs Clemson at 4:00 PM")
- Concerts at Colonial Life Arena, Trustus Theatre, Koger Center - include time if known
- Vista Art Walks or Gallery Crawls
- Conventions at Columbia Metropolitan Convention Center
- Any other events that would bring guests to downtown/Vista area

**Traffic Predictions:**
- How do weather and events affect expected covers?
- Patio seating adjustments if needed
- Pre-event rush timing (e.g., "Expect concert crowd 5-7 PM before 8 PM showtime")
- Guest flow predictions throughout the shift

## 5. Energy & Motivation

- One inspiring message for the team
- What makes great service today
- Let's make this shift amazing!

TONE: Energetic, motivating, team-oriented
FORMAT: FOH-focused brief (2-3 minutes to read aloud)`;
  } else if (audience === 'BOH') {
    prompt = `You are the Executive Chef of ${locationName} preparing hot topics ONLY for the BACK OF HOUSE team.

⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:
- Write ONE brief for BOH (Back of House) ONLY
- Do NOT write a FOH (Front of House) brief
- Do NOT write a Manager brief
- Do NOT include "Hot Topics for FOH" or "Hot Topics for Managers" sections
- STOP after completing the BOH brief

TODAY'S DATE: ${currentDate}
Performance data: ${JSON.stringify(performanceData)}
Weather: ${JSON.stringify(weather)}

## 1. Kitchen Safety & Food Standards (CRITICAL)

- Today's safety focus (knife handling, slip prevention, hot surfaces)
- Food safety reminder (temps, cross-contamination, date labeling)
- Health code compliance for today's inspection readiness

## 2. The Pride of Our Craft (Anthony Bourdain-Style Passion)

- We're not just cooking food, we're creating experiences
- The pride and honor of working in kitchens
- Craftsmanship and excellence - every plate matters
- Respect the ingredients, respect the craft, respect each other
- Team camaraderie - we're in this together

## 3. Today's Execution Plan & Traffic Drivers (CRITICAL)

**Company Promotions:**
Check https://www.tupelohoneycafe.com for current company-wide promotions or specials that are live
- Identify promoted menu items that may require extra prep
- Ensure ingredients are stocked for promoted dishes
- Communicate any special preparation needs to the team

**Local Events Happening Today/Tonight:**
List any specific events in Columbia, SC that could impact our covers TODAY or TONIGHT:
- USC Gamecocks games (football, basketball) - include specific time (e.g., "USC vs Clemson at 4:00 PM")
- Concerts at Colonial Life Arena, Trustus Theatre, Koger Center - include time if known
- Vista events, conventions, or other traffic drivers
- Pre-event rush timing (e.g., "Expect concert crowd 5-7 PM, we'll be slammed")

**Execution Planning:**
Based on performance data, weather, events, and promotions above:
- Expected covers for today's shift
- Key menu items to prioritize and prep (especially for high-volume periods and promoted items)
- Timing goals for ticket times
- Quality standards - consistency is everything
- Prep priorities based on expected traffic and active promotions

## 4. Kitchen Teamwork

- Station assignments and coordination
- Communication with FOH (timing, special requests)
- Supporting each other during the rush
- What we need to execute perfectly today

## 5. Let's Make It Happen

- One motivating message for the team
- What makes us a great kitchen
- Today's focus: Excellence in every dish

TONE: Passionate, professional, pride in craft
FORMAT: BOH-focused brief (2-3 minutes to read aloud)`;
  } else {
    // Managers - completely rewritten to avoid duplication
    prompt = `You are preparing hot topics and talking points ONLY for MANAGERS at ${locationName} for their pre-shift leadership meeting.

⚠️ CRITICAL: Write ONE manager-focused brief. Do NOT write separate FOH or BOH sections. Do NOT duplicate content.

TODAY'S DATE: ${currentDate}

## 1. Performance Review & Financial Goals

Review today's key numbers from our performance data:
${JSON.stringify(performanceData)}

- What are our sales, labor %, prime cost, and SOP goals for today?
- Based on the numbers above, what's our profitability target?
- Which metrics need the most attention?

## 2. Team Leadership & Communication

**Company Promotions (CRITICAL):**
Check https://www.tupelohoneycafe.com for current company-wide promotions or specials that are live
- Ensure all teams are aware of active promotions
- Communicate promotion details, upselling points, and execution requirements
- Verify FOH knows how to present promotions to guests
- Verify BOH has ingredients and knows preparation requirements

**Team Communication Points:**
What should managers communicate to their teams today?

For FOH: Suggest 1-2 specific sales contests or guest service focuses to announce
For BOH: Highlight safety focus and quality standards to emphasize

(Note: These are talking points for MANAGERS to use - don't write separate team briefs)

## 3. Operations Strategy & Traffic Drivers

**Local Events Happening Today/Tonight:**
List any specific events in Columbia, SC that could impact our traffic TODAY or TONIGHT:
- USC Gamecocks games (football, basketball) - include specific time (e.g., "USC vs Clemson at 4:00 PM")
- Concerts at Colonial Life Arena, Trustus Theatre, Koger Center - include time if known
- Vista events, conventions, or other traffic drivers
- Expected traffic patterns based on these events

**Weather:** ${JSON.stringify(weather)}

**Operations Planning:**
- How do weather and events affect our expected traffic?
- Floor management: staffing deployment, section assignments based on expected volume
- Peak period preparation (pre-event rush timing)
- Guest recovery protocols to review

## 4. Culture & Leadership Moment

- One inspiring message about hospitality excellence
- Team recognition or shout-outs
- "How do we make today exceptional?"

## 5. Action Plan & Metrics

- 3-4 specific measurable goals for this shift
- Key metrics to track throughout the day
- What success looks like today

TONE: Strategic, leadership-focused, action-oriented
FORMAT: Manager talking points (5 minutes to discuss)`;
  }

  const result = await client.generateContent(prompt);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * 6. POST /api/getSalesForecast
 * Sales forecasting with daily breakdowns, ranges, and operational recommendations
 */
router.post('/getSalesForecast', asyncHandler(async (req: Request, res: Response) => {
  const { locationName, weatherForecast, historicalData }: types.GetSalesForecastRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  // Get current date
  const today = new Date();
  const currentDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a restaurant operations analyst forecasting sales for ${locationName}.

TODAY'S DATE: ${currentDate}

7-Day Weather Forecast:
${JSON.stringify(weatherForecast, null, 2)}

Historical Data Available: ${historicalData}

## FORECAST METHODOLOGY

Since detailed daily historical data is limited, use this hybrid approach:

**Baseline Calculation:**
- Assume a typical week for this restaurant category averages $70,000-$85,000 in weekly sales
- Daily baseline = Weekly avg ÷ 7 = ~$10,000-$12,000
- Apply day-of-week multipliers:
  - Monday/Tuesday: 0.7-0.8x baseline (slower)
  - Wednesday/Thursday: 0.9-1.0x baseline (moderate)
  - Friday/Saturday: 1.3-1.5x baseline (peak)
  - Sunday: 1.1-1.2x baseline (brunch/dinner)

**Weather Impact Factors:**
- Sunny/Clear, 60-75°F: +10-15% (ideal patio weather)
- Rainy/Storm: -15-25% (reduced foot traffic)
- Very Hot (85°F+): -5-10% (people avoid going out)
- Very Cold (<40°F): -10-15% (reduced foot traffic)

**Event Impact Factors:**
For Columbia, SC, consider typical events:
- USC Gamecocks home games (football/basketball): +30-50% on game days
- Colonial Life Arena concerts: +20-35% pre-show (5-7 PM)
- Vista Art Walks (First Thursday): +15-25%
- Major conventions: +10-20%

## YOUR TASK

Generate a 7-day sales forecast with TWO components:

### 1. OVERVIEW SUMMARY (Markdown format)

Brief paragraph covering:
- Expected weekly sales range
- Overall trend for the week (up/down/stable vs typical)
- Major opportunities or challenges
- Key recommendation for the week

### 2. DAILY BREAKDOWN (For each of the 7 days)

For each day, provide:

**Date & Day**: (e.g., "Monday, December 4, 2025")

**Projected Sales Range**: $XX,XXX - $XX,XXX
- Show as range, not exact number
- Include variance percentage vs Monday baseline

**Traffic Level**: LOW / MEDIUM / HIGH / VERY HIGH

**Weather Impact**:
- Temperature and conditions
- How it affects sales (positive/negative/neutral)
- Patio seating viability

**Local Events**:
- List any typical events for that day of week in Columbia, SC
- Specific timing if relevant (e.g., "USC Basketball at 2 PM")
- Event impact on traffic patterns

**Expected Rush Periods**:
- When to expect peak traffic
- Pre-event/post-event crowds if applicable

**Operational Recommendations**:
- Staffing suggestions (e.g., "+2 servers, +1 line cook")
- Prep priorities
- Special considerations

## OUTPUT FORMAT

Return a JSON object with this structure:
{
  "summary": "markdown-formatted overview summary",
  "chartData": [
    {
      "date": "Mon 12/4",
      "salesLow": 8500,
      "salesHigh": 9200,
      "salesMid": 8850
    },
    // ... 7 days total
  ],
  "dailyBreakdown": [
    {
      "fullDate": "Monday, December 4, 2025",
      "salesRange": "$8,500 - $9,200",
      "variance": "Baseline",
      "trafficLevel": "MEDIUM",
      "weatherImpact": "Clear, 65°F - Ideal patio weather (+10%)",
      "events": ["Standard Monday - No major events"],
      "rushPeriods": ["Lunch: 11:30 AM - 1:30 PM", "Dinner: 6:00 - 8:30 PM"],
      "recommendations": ["Standard staffing", "Focus on lunch specials", "Patio prep"]
    },
    // ... 7 days total
  ]
}

CRITICAL: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

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
