/**
 * Gemini AI Routes
 * All 18 API endpoints for AI-powered analysis
 */

import { Router, Request, Response } from 'express';
import { getGeminiClient } from '../services/gemini-client';
import { asyncHandler } from '../middleware/error-handler';
import * as types from '../types/api';
import axios from 'axios';
import { parse } from 'csv-parse/sync';

const router = Router();

// In-memory job store for import tasks (Phase 1 implementation)
// In production, this should be replaced with Firestore or Redis
interface JobStatus {
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  results?: any;
  error?: string;
  startedAt: number;
}

const jobStore = new Map<string, JobStatus>();

/**
 * Helper: Get Gemini client with API key from secret
 */
const getClient = (apiKey: string | undefined) => {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return getGeminiClient(apiKey);
};

/**
 * Helper: Parse P&L CSV directly without AI
 * CSV Format:
 * - Row 1: "completed weeks/#weeks:" header
 * - Row 2: Store numbers
 * - Row 3: Store names with prefixes (e.g., "01 - Columbia")
 * - Row 4+: Line items with values for each store
 * - "BUDGET:" row separates actuals from budget data
 */
const parsePnLCsv = (csvContent: string, weekStartDate: string, periodType: 'weekly' | 'monthly' = 'weekly'): any => {
  // Parse CSV into 2D array
  const records: string[][] = parse(csvContent, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  console.log(`[parsePnLCsv] Parsed ${records.length} rows`);

  if (records.length < 4) {
    throw new Error('CSV does not have enough rows (expected at least 4)');
  }

  // Row 3 (index 2) contains store names
  const storeRow = records[2];
  const storeNames = storeRow.slice(1).map((name: string) => {
    // Remove prefix like "01 - " or "27 - "
    const cleaned = name.replace(/^\d+\s*-\s*/, '').trim();
    // Return store name as-is (state should already be in CSV if needed)
    return cleaned;
  }).filter((name: string) => name.length > 2); // Filter out empty or invalid names

  console.log(`[parsePnLCsv] Found ${storeNames.length} stores:`, storeNames);

  // Find where budget data starts
  let budgetStartRow = -1;
  for (let i = 3; i < records.length; i++) {
    if (records[i][0]?.toLowerCase().includes('budget')) {
      budgetStartRow = i;
      break;
    }
  }

  console.log(`[parsePnLCsv] Budget starts at row ${budgetStartRow}`);

  // Extract actual line items (from row 4 to budget row)
  const actualEndRow = budgetStartRow > 0 ? budgetStartRow : records.length;
  const lineItemRows = records.slice(3, actualEndRow);

  // Extract budget line items (after budget row)
  const budgetRows = budgetStartRow > 0 ? records.slice(budgetStartRow + 1) : [];

  // Build line item lookup
  interface LineItemData {
    name: string;
    values: (number | null)[];
    budgetValues: (number | null)[];
  }

  const lineItems: LineItemData[] = [];
  const percentageRows: { [key: string]: (number | null)[] } = {};

  // Process actual values
  for (const row of lineItemRows) {
    const itemName = row[0]?.trim();
    if (!itemName || itemName.length === 0) continue;

    const values = row.slice(1).map((val: string) => {
      if (!val || val.trim() === '' || val.trim() === '-') return null;
      // Remove $ , % and parse as number
      const cleaned = val.replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    });

    lineItems.push({
      name: itemName,
      values,
      budgetValues: new Array(values.length).fill(null),
    });
  }

  // Process budget values
  for (const row of budgetRows) {
    const itemName = row[0]?.trim();
    if (!itemName || itemName.length === 0) continue;

    // Check if this is a percentage row by examining the values
    // Percentage rows have values with "%" or small numbers (< 100 typically)
    const firstFewValues = row.slice(1, 4).filter((v: string) => v && v.trim() !== '' && v.trim() !== '-');
    const hasPercentSymbol = firstFewValues.some((v: string) => v.includes('%'));
    const hasSmallNumbers = firstFewValues.length > 0 && firstFewValues.every((v: string) => {
      const cleaned = v.replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleaned);
      return !isNaN(num) && num < 100; // Percentages are typically < 100
    });
    const isPercentageRow = hasPercentSymbol || (hasSmallNumbers && firstFewValues.length > 0);

    if (isPercentageRow) {
      // Store percentage row values
      const percentValues = row.slice(1).map((val: string) => {
        if (!val || val.trim() === '' || val.trim() === '-') return null;
        const cleaned = val.replace(/[$,%]/g, '').trim();
        const num = parseFloat(cleaned);
        // If value has %, it's already a percentage like 32.5% → 32.5
        // We need to convert to decimal: 32.5 → 0.325
        return isNaN(num) ? null : (num > 1 ? num / 100 : num);
      });

      // Clean the name (remove % suffix)
      const cleanName = itemName.replace(/\s*%\s*$/, '').trim().toLowerCase();
      percentageRows[cleanName] = percentValues;
      continue;
    }

    // Find matching line item
    const lineItem = lineItems.find((item) => item.name === itemName);
    if (!lineItem) continue;

    const budgetValues = row.slice(1).map((val: string) => {
      if (!val || val.trim() === '' || val.trim() === '-') return null;
      const cleaned = val.replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    });

    lineItem.budgetValues = budgetValues;
  }

  console.log(`[parsePnLCsv] Extracted ${lineItems.length} line items and ${Object.keys(percentageRows).length} percentage rows`);

  // Helper: Categorize line item by name
  const categorizeLineItem = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('sales') || lower.includes('revenue') || lower.includes('gross')) return 'Revenue';
    if (lower.includes('cogs') || lower.includes('food') || lower.includes('beverage') || lower.includes('wine') || lower.includes('liquor') || lower.includes('beer') || lower.includes('merchandise')) return 'COGS';
    if (lower.includes('labor') || lower.includes('foh') || lower.includes('boh') || lower.includes('salary') || lower.includes('hourly') || lower.includes('payroll') || lower.includes('benefit')) return 'Labor';
    if (lower.includes('prime cost')) return 'Prime Cost';
    if (lower.includes('supplies') || lower.includes('small wares') || lower.includes('equipment') || lower.includes('facility') || lower.includes('utility') || lower.includes('marketing') || lower.includes('technology') || lower.includes('rent') || lower.includes('cam') || lower.includes('property tax') || lower.includes('fee') || lower.includes('administration') || lower.includes('merchant')) return 'Operating Expenses';
    return 'Other';
  };

  // Helper: Determine indent level by name pattern
  const getIndentLevel = (name: string): number => {
    const lower = name.toLowerCase();
    // Indent 0: Total, Month To Date, Prime Cost, Operating Profit
    if (lower.includes('total') || lower.includes('month to date') || lower.includes('prime cost') || lower.includes('operating profit')) return 0;
    // Indent 2: FOH, BOH, specific subcategories
    if (lower.includes('foh ') || lower.includes('boh ') || lower.includes('dairy') || lower.includes('protein') || lower.includes('produce')) return 2;
    // Indent 1: Everything else (Variable Labor, Food COGS, etc.)
    return 1;
  };

  // Build results for each store
  const results: any[] = [];

  for (let storeIdx = 0; storeIdx < storeNames.length; storeIdx++) {
    const storeName = storeNames[storeIdx];

    // Build pnl array
    const pnl: any[] = [];
    for (const lineItem of lineItems) {
      const actual = lineItem.values[storeIdx] ?? 0;
      const budget = lineItem.budgetValues[storeIdx] ?? 0;

      pnl.push({
        name: lineItem.name,
        category: categorizeLineItem(lineItem.name),
        actual,
        budget,
        indent: getIndentLevel(lineItem.name),
      });
    }

    // Extract summary KPIs
    const salesItem = lineItems.find((item) => item.name.toLowerCase().includes('month to date') && item.name.toLowerCase().includes('net sales'));
    const primeCostItem = lineItems.find((item) => item.name.toLowerCase().includes('prime cost'));
    const totalLaborItem = lineItems.find((item) => item.name.toLowerCase().includes('total labor'));
    const sopItem = lineItems.find((item) => item.name.toLowerCase().includes('store operating profit'));
    const foodCostItem = lineItems.find((item) => item.name.toLowerCase().includes('food') && item.name.toLowerCase().includes('cogs'));
    const variableLaborItem = lineItems.find((item) => item.name.toLowerCase().includes('variable labor'));

    const sales = salesItem?.values[storeIdx] ?? 0;
    const primeCost = primeCostItem?.values[storeIdx] ?? 0;
    const totalLabor = totalLaborItem?.values[storeIdx] ?? 0;
    const sop = sopItem?.values[storeIdx] ?? 0;

    // Use percentage rows from CSV if available, otherwise calculate
    let laborPercent = 0;
    let sopPercent = 0;

    // Try to find Labor% from percentage rows
    const laborPercentRow = percentageRows['total labor'] || percentageRows['labor'];
    if (laborPercentRow && laborPercentRow[storeIdx] !== null) {
      laborPercent = laborPercentRow[storeIdx] ?? 0;
    } else if (sales > 0) {
      laborPercent = totalLabor / sales;
    }

    // Try to find SOP% from percentage rows
    const sopPercentRow = percentageRows['sop'] || percentageRows['store operating profit'];
    if (sopPercentRow && sopPercentRow[storeIdx] !== null) {
      sopPercent = sopPercentRow[storeIdx] ?? 0;
    } else if (sales > 0 && sop > 0) {
      sopPercent = sop / sales;
    }

    results.push({
      'Store Name': storeName,
      'Week Start Date': weekStartDate,
      Sales: sales,
      'Prime Cost': primeCost,
      'Labor%': Math.round(laborPercent * 10000) / 10000, // Round to 4 decimals
      SOP: Math.round(sopPercent * 10000) / 10000,
      'Food Cost': foodCostItem?.values[storeIdx] ?? 0,
      'Variable Labor': variableLaborItem?.values[storeIdx] ?? 0,
      pnl,
    });
  }

  return {
    results: [
      {
        dataType: 'Actuals',
        sourceName: `${periodType === 'monthly' ? 'Monthly' : 'Weekly'} Financial Tracker`,
        data: results,
      },
    ],
  };
};

/**
 * Helper: Parse Horizontal P&L CSV (stores as rows, metrics as columns)
 * CSV Format:
 * - Row 1: Title row
 * - Row 2: Column headers (YOY Comp Sales, COGS, Variable Labor, Total Labor, Prime Cost, SOP, etc.)
 * - Row 3+: Store data rows
 *   - Column 1: Store name (e.g., "01 - Asheville Downtown")
 *   - Remaining columns: Metric values (Week 1, Week 2, MTD Actual, Plan, O/U, etc.)
 */
const parsePnLCsvHorizontal = (csvContent: string, weekStartDate: string, periodType: 'weekly' | 'monthly' = 'weekly'): any => {
  const records: string[][] = parse(csvContent, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  console.log(`[parsePnLCsvHorizontal] Parsed ${records.length} rows`);

  if (records.length < 3) {
    throw new Error('Horizontal CSV does not have enough rows (expected at least 3)');
  }

  // Row 2 (index 1) contains column headers
  const headerRow = records[1];
  console.log(`[parsePnLCsvHorizontal] Headers:`, headerRow.slice(0, 10));

  // Find column indices for key metrics
  // Look for "MTD Actual" or "Plan" or "O/U" columns for each metric
  interface MetricColumns {
    mtdActual?: number;
    plan?: number;
  }

  const metrics: { [key: string]: MetricColumns } = {};

  // Scan headers to find metric columns
  let currentMetric = '';
  for (let i = 1; i < headerRow.length; i++) {
    const header = headerRow[i]?.trim().toLowerCase();

    // Detect metric name (headers like "COGS", "Variable Labor", "Total Labor", etc.)
    if (header && !header.includes('week') && !header.includes('mtd') && !header.includes('plan') && !header.includes('o/u') && header.length > 2) {
      currentMetric = header;
      if (!metrics[currentMetric]) {
        metrics[currentMetric] = {};
      }
    }

    // Detect MTD Actual column
    if (header && header.includes('mtd') && currentMetric) {
      metrics[currentMetric].mtdActual = i;
    }

    // Detect Plan column
    if (header && header.includes('plan') && currentMetric) {
      metrics[currentMetric].plan = i;
    }
  }

  console.log(`[parsePnLCsvHorizontal] Found metrics:`, Object.keys(metrics));

  // Process each store row (starting from row 3)
  const results: any[] = [];

  for (let rowIdx = 2; rowIdx < records.length; rowIdx++) {
    const row = records[rowIdx];
    const storeName = row[0]?.trim();

    if (!storeName || storeName.length < 2) continue;

    // Clean store name (remove prefix like "01 - ")
    const cleanStoreName = storeName.replace(/^\d+\s*-\s*/, '').trim();

    // Extract metric values
    const extractValue = (metricKey: string, colType: 'mtdActual' | 'plan'): number => {
      const metric = metrics[metricKey];
      if (!metric || !metric[colType]) return 0;

      const colIdx = metric[colType]!;
      const val = row[colIdx]?.trim();

      if (!val || val === '' || val === '-') return 0;

      // Remove $ , % and parse
      const cleaned = val.replace(/[$,%]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    // Extract values for key metrics
    // Note: Sales is NOT in this CSV, will be set to 0 for manual entry
    const sales = 0; // Will be filled manually

    const cogs = extractValue('cogs', 'mtdActual');
    const variableLabor = extractValue('variable labor', 'mtdActual');
    const totalLabor = extractValue('total labor', 'mtdActual');
    const primeCost = extractValue('prime cost', 'mtdActual');

    // Extract percentages (already in percentage form like 32.5)
    const totalLaborPercent = extractValue('total labor %', 'mtdActual');
    const sopPercent = extractValue('sop %', 'mtdActual') || extractValue('sop', 'mtdActual');

    // Build minimal pnl array (since we don't have full line item breakdown)
    const pnl: any[] = [
      { name: 'Total COGS', category: 'COGS', actual: cogs, budget: extractValue('cogs', 'plan'), indent: 0 },
      { name: 'Variable Labor', category: 'Labor', actual: variableLabor, budget: extractValue('variable labor', 'plan'), indent: 1 },
      { name: 'Total Labor', category: 'Labor', actual: totalLabor, budget: extractValue('total labor', 'plan'), indent: 0 },
      { name: 'Prime Cost', category: 'Prime Cost', actual: primeCost, budget: extractValue('prime cost', 'plan'), indent: 0 },
    ];

    // Convert percentages to decimals if they're > 1
    const laborPercent = totalLaborPercent > 1 ? totalLaborPercent / 100 : totalLaborPercent;
    const sopPercentDecimal = sopPercent > 1 ? sopPercent / 100 : sopPercent;

    results.push({
      'Store Name': cleanStoreName,
      'Week Start Date': weekStartDate,
      Sales: sales, // Will be 0, needs manual entry
      'Prime Cost': primeCost,
      'Labor%': Math.round(laborPercent * 10000) / 10000,
      SOP: Math.round(sopPercentDecimal * 10000) / 10000,
      'Food Cost': cogs, // Using total COGS as proxy
      'Variable Labor': variableLabor,
      pnl,
    });
  }

  console.log(`[parsePnLCsvHorizontal] Extracted data for ${results.length} stores`);

  return {
    results: [
      {
        dataType: 'Actuals',
        sourceName: `${periodType === 'monthly' ? 'Monthly' : 'Weekly'} Financial Tracker (Horizontal Format)`,
        data: results,
      },
    ],
  };
};

/**
 * Helper: Detect CSV format (vertical vs horizontal)
 * Vertical: Stores as columns, line items as rows (Row 3 has store names)
 * Horizontal: Stores as rows, metrics as columns (Row 2 has metric names)
 */
const detectCsvFormat = (csvContent: string): 'vertical' | 'horizontal' => {
  const records: string[][] = parse(csvContent, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  if (records.length < 3) return 'vertical'; // Default to vertical

  // Check row 2 for metric-like headers (horizontal format)
  const row2 = records[1];
  const hasMetricHeaders = row2.some((cell: string) => {
    const lower = cell.toLowerCase().trim();
    return lower.includes('cogs') || lower.includes('labor') || lower.includes('prime cost') || lower.includes('sop');
  });

  if (hasMetricHeaders) {
    console.log('[detectCsvFormat] Detected HORIZONTAL format (metrics in headers)');
    return 'horizontal';
  }

  // Check row 3 for store names with prefixes (vertical format)
  const row3 = records[2];
  const hasStoreNames = row3.slice(1, 5).some((cell: string) => {
    const cleaned = cell.trim();
    return /^\d+\s*-\s*/.test(cleaned); // Matches "01 - Asheville"
  });

  if (hasStoreNames) {
    console.log('[detectCsvFormat] Detected VERTICAL format (store names in row 3)');
    return 'vertical';
  }

  // Default to vertical
  console.log('[detectCsvFormat] Defaulting to VERTICAL format');
  return 'vertical';
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

## HISTORICAL SALES DATA

${historicalData}

## FORECAST METHODOLOGY

Use this hybrid approach combining actual historical data with forecasting factors:

**Baseline Calculation:**
- IF historical data is available above:
  - Use the "recentWeeklyAverage" as your baseline (this is ACTUAL recent performance)
  - Compare to "yoyWeeklyAverage" to understand trends (growth or decline)
  - Use "yoyChange" percentage to inform your forecast direction
  - Reference "recentWeeklySales" array to see actual week-to-week variation
- IF historical data shows "N/A":
  - Fall back to industry baseline: $70,000-$85,000 weekly sales
  - Daily baseline = Weekly avg ÷ 7 = ~$10,000-$12,000
- Apply day-of-week multipliers to daily baseline:
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
- IF using actual historical data: mention YOY performance trend (growth/decline %)
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
  const { notes }: types.GetNoteTrendsRequest = req.body.data;
  const client = getClient(process.env.GEMINI_API_KEY);

  // Extract metadata from notes for context
  const timePeriods = [...new Set(notes.map(n => n.monthlyPeriodLabel))];
  const scopeInfo = notes[0]?.scope;
  const scopeDescription = scopeInfo?.storeId
    ? `Location: ${scopeInfo.storeId}`
    : scopeInfo?.view === 'totalCompany'
      ? 'Scope: Total Company'
      : `Region: ${scopeInfo?.view}`;
  const categoryCounts = notes.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `You are analyzing operational notes from restaurant director calls and management meetings.

## CONTEXT

${scopeDescription}
Time Period(s): ${timePeriods.join(', ')}
Total Notes: ${notes.length}
Categories: ${Object.entries(categoryCounts).map(([cat, count]) => `${cat} (${count})`).join(', ')}

## NOTES DATA

${JSON.stringify(notes.map(n => ({
  week: n.monthlyPeriodLabel,
  category: n.category,
  content: n.content,
  date: n.createdAt
})), null, 2)}

## YOUR TASK

Analyze these notes as if you're preparing a **weekly summary for a director**. Focus on actionable insights for leadership.

### 1. Executive Summary (2-3 sentences)
What's the overall story these notes tell? What should leadership know?

### 2. Recurring Themes & Patterns (Prioritized by Impact)

For each theme:
- **Theme**: [Name of the pattern]
- **Frequency**: How often it appears across weeks
- **Impact**: HIGH / MEDIUM / LOW (on business operations)
- **Evidence**: Specific quotes/examples from notes
- **Trend Direction**: ↑ Increasing / → Stable / ↓ Decreasing

### 3. Critical Action Items

List 3-5 **specific, actionable** tasks for leadership:
- What needs to be done
- Why it's important (tie to business impact)
- Suggested owner or team (FOH/BOH/Operations/HR)
- Priority level (URGENT / HIGH / MEDIUM)

### 4. Wins & Positive Trends

Celebrate what's going well:
- Operational improvements
- Team achievements
- Guest feedback highlights

### 5. Early Warning Signals

Issues that aren't critical yet but need monitoring:
- What to watch for in next week's notes
- Potential risks if unaddressed

## OUTPUT FORMAT

Use markdown formatting with clear headers and bullet points. Be concise but specific. Use actual quotes from notes as evidence.`;

  const result = await client.generateContent(prompt);

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
 * Phase 1 implementation with actual file processing
 */
router.post('/startTask', asyncHandler(async (req: Request, res: Response) => {
  const { weekStartDate, periodType, files } = req.body.data;
  const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[startTask] Job ${jobId} started with:`, { weekStartDate, periodType });

  // Store initial job status
  jobStore.set(jobId, {
    jobId,
    status: 'running',
    startedAt: Date.now()
  });

  // Process file asynchronously (don't await)
  (async () => {
    try {
      // Fetch file content from Firebase Storage URL
      const file = files[0];
      console.log(`[startTask] File object:`, JSON.stringify(file, null, 2));

      // Validate fileUrl
      if (!file || !file.fileUrl || file.fileUrl.trim() === '') {
        throw new Error(`Invalid file URL. Received: ${JSON.stringify(file)}`);
      }

      console.log(`[startTask] Downloading file from URL:`, file.fileUrl);
      console.log(`[startTask] File details:`, { fileName: file.fileName, mimeType: file.mimeType });

      const fileResponse = await axios.get(file.fileUrl, {
        responseType: file.mimeType.includes('text') ? 'text' : 'arraybuffer'
      });

      console.log(`[startTask] File downloaded successfully, size:`, fileResponse.data.length);

      let fileContent = '';
      if (file.mimeType.includes('text') || file.mimeType.includes('csv')) {
        fileContent = typeof fileResponse.data === 'string'
          ? fileResponse.data
          : Buffer.from(fileResponse.data).toString('utf-8');
      } else {
        throw new Error('Only CSV/text files are supported for P&L import');
      }

      // Detect CSV format and parse accordingly
      const format = detectCsvFormat(fileContent);
      console.log(`[startTask] Detected format: ${format}, parsing with date: ${weekStartDate}, period: ${periodType}`);

      const result = format === 'horizontal'
        ? parsePnLCsvHorizontal(fileContent, weekStartDate || '2025-01-06', periodType || 'weekly')
        : parsePnLCsv(fileContent, weekStartDate || '2025-01-06', periodType || 'weekly');

      // Update job status with results
      jobStore.set(jobId, {
        jobId,
        status: 'completed',
        results: result.results || [],
        startedAt: jobStore.get(jobId)?.startedAt || Date.now()
      });
    } catch (error) {
      console.error(`[startTask] Job ${jobId} failed:`, error);

      // Enhanced error logging
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = `Axios error: ${error.message}`;
        if (error.response) {
          errorMessage += ` (Status: ${error.response.status})`;
        }
        console.error(`[startTask] Axios error details:`, {
          message: error.message,
          code: error.code,
          response: error.response?.status
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      jobStore.set(jobId, {
        jobId,
        status: 'failed',
        error: errorMessage,
        startedAt: jobStore.get(jobId)?.startedAt || Date.now()
      });
    }
  })();

  // Return immediately with job ID
  res.json({
    success: true,
    data: {
      id: jobId,
      status: 'running',
      message: 'Import job started and processing in background',
    },
  });
}));

/**
 * 18. POST /api/checkTaskStatus
 * Check status of an import job
 * Phase 1 implementation with actual job tracking
 */
router.post('/checkTaskStatus', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.body.data;

  const job = jobStore.get(jobId);

  if (!job) {
    res.status(404).json({
      success: false,
      error: `Job ${jobId} not found`
    });
    return;
  }

  res.json({
    success: true,
    data: {
      jobId: job.jobId,
      status: job.status,
      results: job.results,
      error: job.error,
    },
  });
}));

/**
 * 19. GET /api/getTaskStatus/:jobId
 * Poll import job status (legacy GET endpoint)
 * Kept for backward compatibility
 */
router.get('/getTaskStatus/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = jobStore.get(jobId);

  if (!job) {
    res.status(404).json({
      success: false,
      error: `Job ${jobId} not found`
    });
    return;
  }

  res.json({
    success: true,
    data: {
      jobId: job.jobId,
      status: job.status,
      results: job.results,
      error: job.error,
    },
  });
}));

export default router;
