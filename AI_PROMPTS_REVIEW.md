# AI / Gemini Prompts - Complete Review

**Purpose:** Review all AI analysis prompts before rebuild to ensure we're aligned on functionality and requirements.

---

## Summary Overview

**Total AI Endpoints:** 18 total endpoints identified
- **Implemented in Backend:** 8 endpoints (in [functions/index.ts:84-161](functions/index.ts#L84-L161))
- **Frontend Ready, Backend Missing:** 10 endpoints (called from frontend but not implemented)

---

## ✅ IMPLEMENTED ENDPOINTS (8 total)

These endpoints are currently implemented in the backend Cloud Functions and have working prompts.

---

### 1. ✅ **getReviewSummary** - Google Reviews Analysis

**Frontend Call:** `geminiService.ts:13-14`
```typescript
getReviewSummary(locationName: string): Promise<any>
```

**Backend Implementation:** `functions/index.ts:94-101`

**Current Prompt:**
```
As a restaurant operations analyst, summarize customer reviews for "{locationName}".
Use Google Search to find recent reviews to supplement the provided data.
Identify themes, positive feedback, and urgent improvement areas.
Use clear headings.

Reviews:
{reviewTexts}
```

**Input:**
- Location name
- Reviews array from Google Places API

**Status:** ✅ Good prompt, works well

**Enhancements Planned (Phase 9):**
Per STORE_HUB_REQUIREMENTS.md, prompt should focus on:
1. **Newest reviews** (prioritize recent feedback)
2. **Themes** - recurring topics across reviews
3. **Positives** - what customers love
4. **Negatives** - pain points and complaints
5. **Actionable insights** for the management team

**Format:**
- Summary paragraph
- Key themes (bullet points)
- Top 3 positives
- Top 3 areas for improvement
- Recommended actions

**Your Approval Needed:** ✅ ⚠️ 🔄
- Current prompt is good, or
- Use enhanced format from STORE_HUB_REQUIREMENTS.md?

---

### 2. ✅ **getLocationMarketAnalysis** - Local Market Intelligence

**Frontend Call:** `geminiService.ts:17-18`
```typescript
getLocationMarketAnalysis(locationName: string): Promise<any>
```

**Backend Implementation:** `functions/index.ts:103-105`

**Current Prompt:**
```
Analyze the local market for the restaurant "{locationName}".
Be detailed and actionable.
Use Google Search to find current information on local events, holidays, news, and consumer trends.

Include:
1. Upcoming Events & Holidays
2. Current Market Trends
3. Competitive Landscape
4. Actionable Opportunities (3-5 specific, creative ideas)
```

**Input:**
- Location name

**Status:** ⚠️ Good foundation, but limited compared to requirements

**Enhancements Planned (Phase 9):**
Per STORE_HUB_REQUIREMENTS.md, prompt should be MUCH more comprehensive:

1. **Local Demographics** - Population trends, age distribution, income levels, tourism
2. **Macro Events (City-Wide)** - Festivals, conventions, sporting events, citywide celebrations
3. **Micro Events (Neighborhood-Level)** - Nearby venues, art galleries, entertainment districts, street fairs
4. **Holiday Impact (CRITICAL)** - Upcoming holidays in next 30 days, historical impact on restaurant traffic, specific opportunities
5. **Local News & Entertainment** - What's trending, new businesses, construction/road closures
6. **Competition Analysis** - Other restaurants, recent reviews of competitors, market gaps
7. **Weather Patterns** - Seasonal trends, how weather affects dining habits

**Web Search Required:**
- "{city} events calendar 2025"
- "{city} entertainment guide"
- "{city} news"
- "restaurants near {location}"

**Your Approval Needed:** ✅ ⚠️ 🔄
- Keep current simple prompt, or
- Expand to comprehensive analysis from STORE_HUB_REQUIREMENTS.md?

---

### 3. ✅ **generateHuddleBrief** - Pre-Shift Briefings (FOH, BOH, Managers)

**Frontend Call:** `geminiService.ts:21-23`
```typescript
generateHuddleBrief(
  locationName: string,
  performanceData: PerformanceData,
  audience: Audience,
  weather: Weather | null
): Promise<string>
```

**Backend Implementation:** `functions/index.ts:107-119`

**Current Prompts (3 different audiences):**

#### FOH (Front of House):
```
Generate a fun, high-energy FOH pre-shift huddle brief for "{locationName}".
Goal is to motivate, drive sales, and ensure an amazing guest experience.

- Location: {locationName}
- Weather: {weather}
- KPIs: {performanceData}
- Promotions: Check company website for latest promotions.

Today's Focus:
1. Sales Contest (e.g., 'Sell the most XYZ to win!')
2. Service Goal (e.g., 'Focus on 5-star reviews; mention review sites')
3. Shift Game (e.g., 'Secret Compliment game is on!')
```

#### BOH (Back of House):
```
Generate a focused, passionate BOH pre-shift brief for "{locationName}" inspired by Anthony Bourdain.
Goal is to culinary excellence and safety.

- Location: {locationName}
- Weather: {weather}
- KPIs: {performanceData}
- Promotions: Check company website for latest promotions.

Today's Focus:
1. Kitchen Safety ('Work clean, work safe.')
2. Health Standards ('If you wouldn't serve it to your family, don't serve it.')
3. Passion & Pride ('Every plate has our signature. Make it count.')
```

#### Managers:
```
Generate a strategic management pre-shift brief for "{locationName}".
Goal is to align the team, drive profit, and foster culture.

- Location: {locationName}
- Weather: {weather}
- KPIs: {performanceData}
- Promotions: Check company website for latest promotions.

Strategic Focus:
1. Floor Leadership ('Connect with 5 tables personally.')
2. Cost Control ('Watch waste on the ABC dish.')
3. Culture Initiative ('Publicly praise 3 team members today.')
```

**Status:** ✅ Good foundation, captures the spirit

**Enhancements Planned (Phase 9):**
Per STORE_HUB_REQUIREMENTS.md, add:

**FOH Enhancements:**
- Incorporate local events happening today (from Local Market analysis)
- Check tupelohoneycafe.com for current promotions (web scraping)
- Create 1-2 **fun, proven sales contests** for servers/bartenders (examples: "Upsell Challenge", "Dessert Derby", "Cocktail Champion")

**BOH Enhancements:**
- Yesterday's ticket times and food cost performance
- Expected covers based on forecast
- **Anthony Bourdain-style passion** (CRITICAL): "We're not just cooking food, we're creating experiences. Respect the ingredients, respect the craft."

**Managers Enhancements:**
- ALL of FOH + BOH elements
- P&L snapshot (sales, labor %, prime cost)
- **Culture Building (CRITICAL):** Reference leading hospitality websites (Toast, Restaurant Business Online, Nation's Restaurant News)
- Inspiring leadership moment

**Your Approval Needed:** ✅ ⚠️ 🔄
- Keep current brief prompts, or
- Expand to comprehensive format from STORE_HUB_REQUIREMENTS.md?
- Do you want tupelohoneycafe.com web scraping for promotions?

---

### 4. ✅ **getSalesForecast** - 7-Day Sales Forecasting

**Frontend Call:** `geminiService.ts:25-27`
```typescript
getSalesForecast(
  locationName: string,
  weatherForecast: DailyForecast[] | null,
  historicalData: any
): Promise<ForecastDataPoint[]>
```

**Backend Implementation:** `functions/index.ts:121-124`

**Current Prompt:**
```
As a data analyst, create a 7-day sales forecast for "{locationName}".
Use Google Search to find major upcoming local events or holidays.
Use this, plus the provided weather, to create the forecast.
Present as a simple, day-by-day list (e.g., "Monday: $XXXX (Sunny) - Increase due to local festival.").

Data:
- Weather: {weatherForecast}
- History: {historicalData || "Use general restaurant sales patterns."}
```

**Input:**
- Location name
- 7-day weather forecast ✅ (already working)
- Historical data ❌ (depends on Phase 8 - performance_actuals loading)

**Status:** ⚠️ Partially working (lacks historical data)

**Enhancements Planned (Phase 9):**
Per STORE_HUB_REQUIREMENTS.md:
- Add historical performance from performance_actuals (same period last year, same day-of-week averages)
- Historical tourist patterns for the city
- Convention calendar impact
- Confidence level for each day
- Recommendations for staffing/prep

**Expected Output Format:**
```json
{
  "summary": "markdown summary",
  "chartData": [
    {
      "name": "Mon",
      "predictedSales": 65000,
      "weatherCondition": "sunny",
      "weatherDescription": "Sunny, 75°F"
    },
    ...
  ]
}
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Current approach is good, or
- Add historical data integration when Phase 8 complete?
- Should it output JSON format or markdown?

---

### 5. ✅ **getMarketingIdeas** - Creative Marketing Campaigns

**Frontend Call:** `geminiService.ts:29-31`
```typescript
getMarketingIdeas(
  locationName: string,
  userLocation: { latitude: number, longitude: number } | null
): Promise<any>
```

**Backend Implementation:** `functions/index.ts:126-128`

**Current Prompt:**
```
Generate creative, actionable, local marketing ideas for the manager of "{locationName}".
Use Google Search for current local trends and events.
Provide ideas for different generations (Gen Z/Millennials, Gen X, Boomers) and budgets (Low/No, Moderate).

Structure:
For [Generation] ([Focus]):
- *Low Budget:* [Idea]
- *Moderate Budget:* [Idea]
```

**Input:**
- Location name
- User location (optional)

**Status:** ✅ Good foundation

**Enhancements Planned (Phase 9):**
Per STORE_HUB_REQUIREMENTS.md - MULTI-GENERATIONAL & MANAGER-EXECUTABLE:

**Target Multiple Generations:**
- **Gen Z (1997-2012)**: TikTok, Instagram Reels, viral challenges
- **Millennials (1981-1996)**: Instagram, experiences, sustainability
- **Gen X (1965-1980)**: Facebook, email, value + quality
- **Boomers (1946-1964)**: Facebook, traditional media, loyalty programs
- **Gen Alpha (2013+)**: YouTube, family-friendly, visual content

**Address Different Financial Classes:**
- Budget-conscious: Value deals, happy hour, lunch specials
- Mid-market: Quality-to-price ratio, experiences
- Premium: Exclusive offerings, VIP experiences

**Easy for Managers to Execute (CRITICAL):**
- Store-level initiatives (not just corporate)
- Minimal budget required
- Can be implemented within 1-2 weeks
- Use local partnerships
- Social media tactics they can do themselves

**Examples of Ideas:**
- "Local Heroes Happy Hour" (partner with police/fire/teachers)
- "Sunny Day Flash Sale" (text club when weather perfect)
- "Neighborhood Passport" (stamp card with nearby businesses)
- "TikTok Recipe Challenge" (user-generated content)
- "Lunch & Learn" series (host local experts)

**Enhanced Format:**
- Idea title
- Target demographic
- Budget level ($ low, $$ medium, $$$ high)
- Implementation difficulty (Easy/Medium/Hard)
- Expected ROI
- Step-by-step execution plan

**Your Approval Needed:** ✅ ⚠️ 🔄
- Keep current simple format, or
- Expand to comprehensive multi-generational format?

---

### 6. ✅ **getDirectorPerformanceSnapshot** - Director Performance Summary

**Frontend Call:** Not directly called (likely used in Strategic Analysis or Director views)

**Backend Implementation:** `functions/index.ts:130-133`

**Current Prompt:**
```
As a senior business analyst, provide a concise performance snapshot for the director, "{directorName}", for the period of {periodLabel}.

The director's region has the following aggregated performance data:
{aggregateData}

Your snapshot should be in markdown format.
Start with a headline.
Then, provide a 2-3 sentence executive summary.
Follow with a bulleted list of 3-4 key insights, highlighting both strengths and areas for improvement.
Use Google Search to provide context on regional performance if relevant.
Conclude with a single, actionable recommendation.
```

**Input:**
- Director name
- Period label
- Aggregate data

**Status:** ✅ Good prompt

**Your Approval Needed:** ✅ ⚠️ 🔄
- Looks good as-is?
- Any changes needed?

---

### 7. ✅ **startStrategicAnalysis** (Long-running job) - Comprehensive Strategic Brief

**Frontend Call:** Via `startStrategicAnalysisJob` in `geminiService.ts:53-55`

**Backend Implementation:** `functions/index.ts:135-138`

**Current Prompt:**
```
You are a world-class business strategist.
Analyze the provided document, named '{fileName}', through a {mode} lens.

Your response must be a comprehensive, actionable strategic brief in markdown format.

It should include:
1. **Executive Summary:** A concise overview of the key findings
2. **SWOT Analysis:** Strengths, Weaknesses, Opportunities, and Threats
3. **Key Insights:** 3-5 deep, non-obvious insights derived from the data
4. **Actionable Recommendations:** A numbered list of specific, measurable, and impactful recommendations

Use Google Search to enrich your analysis with current market data and trends.
```

**Input:**
- File upload (PDF, Excel, images)
- Analysis mode (e.g., "financial", "operational", "strategic")
- Period
- View

**Status:** ✅ Excellent comprehensive prompt

**Your Approval Needed:** ✅ ⚠️ 🔄
- Looks good as-is?

---

### 8. ✅ **chatWithStrategy** - Interactive Q&A with Strategic Analysis

**Frontend Call:** `geminiService.ts:57-59`

**Backend Implementation:** `functions/index.ts:140-143`

**Current Prompt:**
```
You are a business strategist continuing a conversation.

The user has provided the following context from the initial analysis:

<context>
{context}
</context>

Now, answer the user's follow-up question, using a {mode} lens: "{userQuery}".
Use Google Search to find any new information required.

Your answer should be concise and directly address the question.
```

**Input:**
- Context (from previous strategic analysis)
- User query
- Analysis mode

**Status:** ✅ Good prompt

**Your Approval Needed:** ✅ ⚠️ 🔄
- Looks good as-is?

---

### 9. ✅ **getExecutiveSummary** - High-Level Period Summary

**Frontend Call:** `geminiService.ts:9-11`

**Backend Implementation:** `functions/index.ts:145-148`

**Current Prompt:**
```
Provide a high-level executive summary for a restaurant company based on the following data.

The view is currently focused on '{view}' for the period '{period}'.
The data is: {data}

Your summary should be in markdown format.
Start with a headline.
Identify the most significant trend, the biggest risk, and the top opportunity.
Use Google Search to find any relevant external factors.

Keep it concise and impactful.
```

**Input:**
- Data (KPI performance data)
- View (All Stores, Director, Single Store)
- Period (e.g., "P12 FY2025")

**Status:** ✅ Good prompt

**Your Approval Needed:** ✅ ⚠️ 🔄
- Looks good as-is?

---

## ❌ MISSING BACKEND IMPLEMENTATIONS (9 total)

These endpoints are called from the frontend but NOT implemented in the backend Cloud Functions. They will return 501 errors ("not implemented").

---

### 10. ❌ **getInsights** - Custom KPI Insights

**Frontend Call:** `geminiService.ts:5-7`
```typescript
getInsights(
  data: Record<string, DataItem>,
  view: View,
  period: string,
  prompt: string
): Promise<any>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Generate custom insights based on user-provided prompt

**Required Prompt Template:**
```
As a restaurant performance analyst, analyze the following KPI data:

View: {view}
Period: {period}
Data: {data}

User Question: {prompt}

Provide actionable insights that directly answer the user's question.
Use Google Search to provide relevant industry context or benchmarks.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?

---

### 11. ❌ **getNoteTrends** - Director Notes Analysis

**Frontend Call:** `geminiService.ts:33-35`
```typescript
getNoteTrends(notes: Note[]): Promise<string>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Analyze director notes to identify trends, themes, and patterns

**Required Prompt Template:**
```
As a business intelligence analyst, analyze the following director notes from a restaurant operations dashboard:

{notes formatted with: content, category, date, author}

Identify:
1. **Recurring Themes** - What topics appear most frequently?
2. **Sentiment Trends** - Are notes becoming more positive, negative, or neutral over time?
3. **Urgent Items** - What issues require immediate attention?
4. **Category Breakdown** - Which categories (Operations, Marketing, HR, etc.) dominate?
5. **Actionable Insights** - What patterns suggest specific actions?

Present findings in clear markdown format with headings and bullet points.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?

---

### 12. ❌ **getAnomalyDetections** - Statistical Anomaly Detection

**Frontend Call:** `geminiService.ts:37-39`
```typescript
getAnomalyDetections(
  allStoresData: Record<string, DataItem>,
  periodLabel: string
): Promise<Anomaly[]>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Detect statistical anomalies in KPI data across stores

**Required Prompt Template:**
```
As a data scientist specializing in anomaly detection, analyze the following restaurant KPI data for {periodLabel}:

{allStoresData formatted with store name, KPIs, and values}

Detect anomalies using these criteria:
1. **Statistical Outliers** - Values significantly outside normal range (>2 standard deviations)
2. **Trend Breaks** - Sudden changes from historical patterns
3. **Cross-Store Comparisons** - Stores performing very differently from peers
4. **Correlated Anomalies** - Multiple KPIs declining together (red flag)

For each anomaly detected, return:
- Store name
- KPI affected
- Actual value
- Expected value
- Severity (Low, Medium, High, Critical)
- Brief description

Return as JSON array of anomaly objects.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Should AI handle anomaly detection, or use statistical algorithms?
- Is this prompt template correct?

---

### 13. ❌ **getAnomalyInsights** - Explain Detected Anomalies

**Frontend Call:** `geminiService.ts:41-43`
```typescript
getAnomalyInsights(
  anomaly: Anomaly,
  data: Record<string, DataItem>
): Promise<string>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Explain why an anomaly occurred and suggest root causes

**Required Prompt Template:**
```
As a restaurant operations consultant, investigate the following anomaly:

**Anomaly:**
- Store: {anomaly.store}
- KPI: {anomaly.kpi}
- Actual Value: {anomaly.actual}
- Expected Value: {anomaly.expected}
- Severity: {anomaly.severity}

**Context Data:**
{data - all KPIs for this store and peer stores}

Provide:
1. **Likely Root Causes** (3-5 possible explanations)
2. **Correlated Factors** (are other KPIs also affected?)
3. **Recommended Actions** (what should the director do?)
4. **Urgency Level** (immediate, this week, this period)

Use Google Search to find external factors (local events, holidays, weather) that might explain the anomaly.

Present in clear markdown format.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?

---

### 14. ❌ **getVarianceAnalysis** - Explain KPI Variances

**Frontend Call:** `geminiService.ts:45-47`
```typescript
getVarianceAnalysis(
  location: string,
  kpi: Kpi,
  variance: number,
  allKpis: PerformanceData
): Promise<string>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Explain why a specific KPI has variance from goal/budget

**Required Prompt Template:**
```
As a financial analyst, explain the variance for {location}:

**KPI:** {kpi}
**Variance:** {variance}% (from goal/budget)

**All KPIs for this location:**
{allKpis}

Analyze:
1. **Primary Drivers** - What caused this variance?
2. **Interconnected KPIs** - Are other KPIs contributing? (e.g., high labor % might explain low sales)
3. **External Factors** - Could weather, events, or market conditions be involved?
4. **Actionable Recommendations** - How can the director course-correct?

Use Google Search to find relevant industry benchmarks or external factors.

Present in markdown format with clear headings.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?

---

### 15. ❌ **runWhatIfScenario** - Scenario Modeling

**Frontend Call:** `geminiService.ts:49-51`
```typescript
runWhatIfScenario(
  data: any,
  prompt: string
): Promise<{ analysis: string, args?: any } | null>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Run "what-if" scenarios (e.g., "What if sales increase 10%?")

**Required Prompt Template:**
```
As a financial modeling expert, run the following scenario analysis:

**Current Data:**
{data}

**Scenario Question:**
{prompt}

Analyze the impact of this scenario on:
1. **Direct Impact** - What changes immediately?
2. **Cascading Effects** - What other KPIs are affected?
3. **Financial Implications** - Impact on profit, costs, etc.
4. **Feasibility** - Is this scenario realistic? What would it require?

Provide a clear, quantified analysis in markdown format.
If applicable, return calculated values in a structured format.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?
- Should AI handle this, or use JavaScript calculations?

---

### 16. ❌ **getStrategicExecutiveAnalysis** - Executive-Level KPI Analysis

**Frontend Call:** `geminiService.ts:61-76`
```typescript
getStrategicExecutiveAnalysis(
  kpi: Kpi,
  period: string,
  companyTotal: string,
  directorPerformance: { name: string, value: string }[],
  anchorStores: { store: string, value: string }[]
): Promise<string>
```

**Current Status:** NOT IMPLEMENTED in backend

**Purpose:** Deep-dive analysis of a single KPI across the entire company

**Required Prompt Template:**
```
As a senior business strategist, provide an executive-level analysis of {kpi} for {period}:

**Company Performance:**
- Total: {companyTotal}

**Director Performance:**
{directorPerformance formatted}

**Top/Bottom Anchor Stores:**
{anchorStores formatted}

Provide:
1. **Executive Summary** - One headline insight
2. **Performance Gaps** - Why are some directors/stores outperforming others?
3. **Best Practices** - What are top performers doing differently?
4. **Strategic Recommendations** - Company-wide actions to improve this KPI
5. **External Context** - Use Google Search to find industry benchmarks and trends

Present in markdown format optimized for C-suite presentation.
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?

---

### 17. ❌ **startImportJob** (File Upload Analysis) - Extract Data from Files

**Frontend Call:** `geminiService.ts:77-109`

**Current Status:** PARTIALLY IMPLEMENTED
- Has prompt template in frontend (lines 81-92)
- Calls `callGeminiAPI('startTask', ...)` which is NOT a backend endpoint

**Purpose:** Upload Excel/PDF/images and extract financial data via AI

**Current Prompt Template (in frontend):**
```
Analyze the provided {importType} and extract financial data.
- You are a financial analyst reviewing a document.
- Your task is to extract all relevant information and structure it as JSON.
- The output should be a JSON object with a single key: "results".
- The "results" key should contain an array of objects, where each object represents a distinct data set (e.g., "Actuals" or "Budgets").
- Each data set object must have the following properties:
  - "dataType": "Actuals" | "Budget"
  - "sourceName": string (e.g., the original file name or sheet)
  - "data": an array of objects, where each object is a row from the source.
- If you cannot determine the data type, classify it as "Actuals".
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- Is this prompt template correct?
- Should it use Google's "File API" for uploads?

---

### 18. ❌ **getTaskStatus** (Poll Import Job) - Check Long-Running Job Status

**Frontend Call:** Not in geminiService.ts, likely in another file

**Current Status:** NOT IMPLEMENTED

**Purpose:** Poll status of long-running AI jobs (like file imports)

**Required Implementation:**
This is typically a status check endpoint, not an AI prompt. Should return:
```json
{
  "status": "pending" | "running" | "completed" | "failed",
  "progress": 0-100,
  "result": null | { data },
  "error": null | "error message"
}
```

**Your Approval Needed:** ✅ ⚠️ 🔄
- Implement this endpoint in rebuild?
- How should we handle long-running jobs? (Cloud Functions have 540s timeout)

---

## Summary Table

| # | Endpoint | Status | Phase | Decision |
|---|----------|--------|-------|----------|
| 1 | getReviewSummary | ✅ Implemented | Working | ✅ **APPROVED AS-IS** |
| 2 | getLocationMarketAnalysis | ✅ Implemented | Needs Enhancement (Phase 9) | ⚠️ **ENHANCE** (comprehensive) |
| 3 | generateHuddleBrief (FOH/BOH/Mgr) | ✅ Implemented | Needs Enhancement (Phase 9) | ⚠️ **ENHANCE** (comprehensive) |
| 4 | getSalesForecast | ✅ Implemented | Auto-improves (Phase 8) | ✅ **APPROVED** (auto-improve) |
| 5 | getMarketingIdeas | ✅ Implemented | Needs Enhancement (Phase 9) | ⚠️ **ENHANCE** (multi-gen) |
| 6 | getDirectorPerformanceSnapshot | ✅ Implemented | Working | ✅ **APPROVED AS-IS** |
| 7 | startStrategicAnalysis | ✅ Implemented | Working | ✅ **APPROVED AS-IS** |
| 8 | chatWithStrategy | ✅ Implemented | Working | ✅ **APPROVED AS-IS** |
| 9 | getExecutiveSummary | ✅ Implemented | Working | ✅ **APPROVED AS-IS** |
| 10 | getInsights | ❌ NOT Implemented | Phase 13+ | 🔄 **DEFER** (future) |
| 11 | getNoteTrends | ❌ NOT Implemented | **IMPLEMENT IN REBUILD** | ✅ **IMPLEMENT** (Phase 2) |
| 12 | getAnomalyDetections | ❌ NOT Implemented | Phase 13+ | 🔄 **DEFER** (future) |
| 13 | getAnomalyInsights | ❌ NOT Implemented | Phase 13+ | 🔄 **DEFER** (future) |
| 14 | getVarianceAnalysis | ❌ NOT Implemented | **IMPLEMENT IN REBUILD** | ✅ **IMPLEMENT** (Phase 2) |
| 15 | runWhatIfScenario | ❌ NOT Implemented | Phase 13+ | 🔄 **DEFER** (future) |
| 16 | getStrategicExecutiveAnalysis | ❌ NOT Implemented | **IMPLEMENT IN REBUILD** | ✅ **IMPLEMENT** (Phase 2) |
| 17 | startImportJob | ❌ NOT Implemented | Future | 🔄 **DEFER** (complex) |
| 18 | getTaskStatus | ❌ NOT Implemented | Future | 🔄 **DEFER** (complex) |

---

## Key Questions for Your Review

### 1. **Implemented Endpoints (1-9)** - Enhancement Level?
For endpoints that are already working, should we:
- **Option A:** Keep current simple prompts (faster, less tokens, cheaper)
- **Option B:** Enhance to comprehensive prompts from STORE_HUB_REQUIREMENTS.md (more detailed, higher quality)

**My Recommendation:** Option B for Store Hub tabs (2, 3, 4, 5), Option A for others

---

### 2. **Missing Endpoints (10-18)** - Priority Level?
For endpoints that aren't implemented, should we:
- **Option A:** Implement all 9 endpoints (comprehensive, but adds ~3-4 hours to rebuild)
- **Option B:** Implement only critical ones (which are critical to you?)
- **Option C:** Skip for now, add later as needed

**My Recommendation:**
- **Critical (implement in rebuild):** #11 getNoteTrends, #14 getVarianceAnalysis, #16 getStrategicExecutiveAnalysis
- **Nice to have (Phase 13+):** #10 getInsights, #12-13 Anomaly Detection, #15 WhatIf Scenarios
- **Complex (defer):** #17-18 File uploads (requires Cloud Storage integration)

---

### 3. **Web Scraping** - Should we add it?
Several prompts reference:
- tupelohoneycafe.com for promotions
- Local news sites
- Event calendars

Should we add web scraping capability, or rely on Gemini's Google Search grounding tool?

**My Recommendation:** Use Gemini's built-in Google Search grounding (already enabled with `tools: [{'googleSearchRetrieval': {}}]`)

---

### 4. **Output Formats** - JSON vs. Markdown?
Some endpoints should return structured data (JSON) vs. formatted text (Markdown).

Current approach: Most return markdown text.

Should any return JSON instead? (e.g., getSalesForecast, getAnomalyDetections)

**My Recommendation:**
- Keep markdown for display in modals (easier to render)
- Use JSON only if frontend needs to process/chart the data

---

## Next Steps

**Please review this document and indicate for each endpoint:**
- ✅ **Approve as-is** (no changes needed)
- ⚠️ **Enhance** (use comprehensive version from STORE_HUB_REQUIREMENTS.md)
- 🔄 **Modify** (provide specific changes you want)
- ❌ **Skip** (don't implement, not needed)

Once you've reviewed, I'll update the rebuild plan with the approved prompts and proceed with Session 1 of the rebuild.

---

## ✅ FINAL APPROVED PLAN

### Implemented Endpoints - Keep As-Is (5 total):
- ✅ #1 getReviewSummary
- ✅ #6 getDirectorPerformanceSnapshot
- ✅ #7 startStrategicAnalysis
- ✅ #8 chatWithStrategy
- ✅ #9 getExecutiveSummary

### Implemented Endpoints - Enhance in Phase 9 (3 total):
- ⚠️ #2 getLocationMarketAnalysis → Use comprehensive prompt from STORE_HUB_REQUIREMENTS.md
- ⚠️ #3 generateHuddleBrief → Use comprehensive FOH/BOH/Manager prompts
- ⚠️ #5 getMarketingIdeas → Use multi-generational format

### Implemented Endpoint - Auto-Improves (1 total):
- ✅ #4 getSalesForecast → Will improve when Phase 8 adds historical data

### Missing Endpoints - Implement in Rebuild Phase 2 (3 total):
- ✅ #11 getNoteTrends (Notes feature needs this)
- ✅ #14 getVarianceAnalysis (variance explanation)
- ✅ #16 getStrategicExecutiveAnalysis (executive deep-dives)

### Missing Endpoints - Defer to Future (6 total):
- 🔄 #10 getInsights (Phase 13+)
- 🔄 #12 getAnomalyDetections (Phase 13+)
- 🔄 #13 getAnomalyInsights (Phase 13+)
- 🔄 #15 runWhatIfScenario (Phase 13+)
- 🔄 #17 startImportJob (Future - complex)
- 🔄 #18 getTaskStatus (Future - complex)

---

## Impact on Rebuild Timeline

**Phase 2 (Backend Scaffold):**
- Original: 9 endpoints (15 minutes)
- **New: 12 endpoints** (add #11, #14, #16) → **20 minutes** (+5 min)

**Phase 9 (Store Hub Prompts):**
- Original: 1.5 hours
- **New: 1.5 hours** (same - enhancements already planned)

**Total Rebuild Time Change:**
- Original: 9.5 hours
- **New: 9.6 hours** (+0.1 hours)

---

**Status:** ✅ **APPROVED & READY TO IMPLEMENT** 🚀
