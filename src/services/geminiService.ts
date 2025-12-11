
import { callGeminiAPI } from '../lib/ai-client';
import { Period, View, PerformanceData, Note, Anomaly, AnalysisMode, FileUploadResult, Audience, Weather, Kpi, ForecastDataPoint, DailyForecast, DataItem } from '../types';

export const getInsights = (data: Record<string, DataItem>, view: View, period: string, prompt: string): Promise<any> => {
  return callGeminiAPI('getInsights', { data, view, period, prompt });
};

export const getExecutiveSummary = (data: { [key: string]: DataItem }, view: View, period: Period): Promise<string> => {
  return callGeminiAPI('getExecutiveSummary', { data, view, period });
};

export const getReviewSummary = (locationName: string): Promise<any> => {
  return callGeminiAPI('getReviewSummary', { location: locationName });
};

export const getLocationMarketAnalysis = (locationName: string): Promise<any> => {
  return callGeminiAPI('getLocationMarketAnalysis', { location: locationName });
};

export const generateHuddleBrief = (locationName: string, performanceData: PerformanceData, audience: Audience, weather: Weather | null): Promise<string> => {
  return callGeminiAPI('generateHuddleBrief', { location: locationName, storeData: performanceData, audience, weather });
};

export const getSalesForecast = (locationName: string, weatherForecast: DailyForecast[] | null, historicalData: any): Promise<ForecastDataPoint[]> => {
    return callGeminiAPI('getSalesForecast', { location: locationName, weatherForecast, historicalData });
};

export const getMarketingIdeas = (locationName: string, userLocation: { latitude: number, longitude: number } | null): Promise<any> => {
    return callGeminiAPI('getMarketingIdeas', { location: locationName, userLocation });
};

export const getNoteTrends = (notes: Note[]): Promise<string> => {
  return callGeminiAPI('getNoteTrends', { notes });
};

export const getAnomalyDetections = (allStoresData: Record<string, DataItem>, periodLabel: string): Promise<Anomaly[]> => {
    return callGeminiAPI('getAnomalyDetections', { allStoresData, periodLabel });
};

export const getAnomalyInsights = (anomaly: Anomaly, data: Record<string, DataItem>): Promise<string> => {
    return callGeminiAPI('getAnomalyInsights', { anomaly, data });
};

export const getVarianceAnalysis = (location: string, kpi: Kpi, variance: number, allKpis: PerformanceData): Promise<string> => {
    return callGeminiAPI('getVarianceAnalysis', { location, kpi, variance, allKpis });
};

export const runWhatIfScenario = (data: any, prompt: string): Promise<{ analysis: string, args?: any } | null> => {
  return callGeminiAPI('runWhatIfScenario', { data, prompt });
};

export const startStrategicAnalysisJob = (files: FileUploadResult[], mode: AnalysisMode, period: Period, view: View): Promise<{ jobId: string }> => {
    return callGeminiAPI('startStrategicAnalysisJob', { files, mode, period, view });
};

export const chatWithStrategy = (context: string, userQuery: string, mode: AnalysisMode): Promise<string> => {
    return callGeminiAPI('chatWithStrategy', { context, userQuery, mode });
};

export const getStrategicExecutiveAnalysis = (
    kpi: Kpi,
    period: string,
    companyTotal: string,
    directorPerformance: { name: string, value: string }[],
    anchorStores: { store: string, value: string }[]
): Promise<string> => {
    return callGeminiAPI('getStrategicExecutiveAnalysis', {
        kpi,
        period,
        companyTotal,
        directorPerformance,
        anchorStores
    });
};

export const getDirectorPerformanceSnapshot = (directorId: string, period: Period): Promise<any> => {
    return callGeminiAPI('getDirectorPerformanceSnapshot', { directorId, period });
};

export const startImportJob = async (file: FileUploadResult, _importType: 'document' | 'text', weekStartDate?: string, periodType: 'weekly' | 'monthly' = 'weekly'): Promise<{ jobId: string }> => {
  try {
    const result = await callGeminiAPI('startTask', {
      weekStartDate: weekStartDate || '2025-01-06',
      periodType: periodType,
      model: 'gemini-1.5-pro-latest',
      prompt: `
You are a financial analyst extracting detailed P&L data from restaurant financial reports.

## EXPECTED CSV FORMAT
The CSV has this structure:
- Row 1: "completed weeks/#weeks:" header
- Row 2: Store numbers (4, then store count numbers)
- Row 3: Store names with prefixes (e.g., "01 - Asheville Downtown", "02 - Asheville South", "27 - Columbia")
- Row 4+: Line items with values for each store across columns
- A row with "BUDGET:" separates actuals from budget data
- After "BUDGET:" row, budget values appear for the same line items

## YOUR TASK
Extract data for EACH STORE and return in this EXACT JSON format:

{
  "results": [
    {
      "dataType": "Actuals",
      "sourceName": "Weekly Financial Tracker",
      "data": [
        {
          "Store Name": "Columbia, SC",
          "Week Start Date": "2025-01-06",
          "Sales": 342493,
          "Prime Cost": 171851,
          "Labor%": 27.9,
          "SOP": 30.7,
          "pnl": [
            {"name": "Month To Date Total NET Sales", "category": "Revenue", "actual": 342493, "budget": 342460, "indent": 0},
            {"name": "Month To Date Total NET BWL Sales", "category": "Revenue", "actual": 55129, "budget": 79108, "indent": 1},
            {"name": "Total COGS", "category": "COGS", "actual": 76250, "budget": 78379, "indent": 0},
            {"name": "Food & N/A Bev COGS", "category": "COGS", "actual": 68254, "budget": 65380, "indent": 1},
            {"name": "Beverage COGS", "category": "COGS", "actual": 7981, "budget": 13165, "indent": 1},
            {"name": "Total Labor", "category": "Labor", "actual": 95601, "budget": 117064, "indent": 0},
            {"name": "Variable Labor", "category": "Labor", "actual": 65940, "budget": 81349, "indent": 1},
            {"name": "FOH Hourly Labor Expenses", "category": "Labor", "actual": 20764, "budget": 22046, "indent": 2},
            {"name": "BOH Hourly Labor Expenses", "category": "Labor", "actual": 34805, "budget": 46903, "indent": 2},
            {"name": "Salary Labor", "category": "Labor", "actual": 29662, "budget": 35715, "indent": 1},
            {"name": "Prime Cost", "category": "Prime Cost", "actual": 171851, "budget": 195443, "indent": 0},
            {"name": "Supplies Expenses", "category": "Operating Expenses", "actual": 12862, "budget": 0, "indent": 1},
            {"name": "Total Store Operating Profit", "category": "Other", "actual": 83974, "budget": 0, "indent": 0}
          ]
        }
      ]
    }
  ]
}

## EXTRACTION STEPS

### Step 1: Parse Store Names
- Row 3 contains store names with prefixes like "01 - Columbia", "27 - Columbia"
- Extract ONLY the store name WITHOUT prefix (e.g., "Columbia" not "01 - Columbia")
- If store name doesn't include state, add ", SC" or appropriate state

### Step 2: Identify Line Items
Parse each row from Row 4 onward:
- First column is the line item name
- Remaining columns are values for each store
- Stop when you reach "BUDGET:" row

### Step 3: Categorize Line Items
Assign category based on line item name:
- **Revenue**: "NET Sales", "BWL Sales", "Gross Sales"
- **COGS**: "COGS", "Food", "Beverage", "Wine", "Liquor", "Beer", "Merchandise"
- **Labor**: "Labor", "FOH", "BOH", "Salary", "Hourly", "Payroll Tax", "Benefit"
- **Prime Cost**: "Prime Cost"
- **Operating Expenses**: "Supplies", "Small Wares", "Equipment", "Facility", "Utility", "Marketing", "Technology", "Rent", "CAM", "Property Tax", "Fee", "Administration", "Merchant"
- **Other**: "Operating Profit", "SOP", "EBITDA"

### Step 4: Determine Indent Level
- **Indent 0** (Parent): "Total", "Month To Date", "Prime Cost", "Store Operating Profit"
- **Indent 1** (Child): Line items that are components of a parent (e.g., "Food COGS" under "Total COGS", "Variable Labor" under "Total Labor")
- **Indent 2** (Grandchild): Further breakdown (e.g., "FOH Hourly" under "Variable Labor", "Dairy" under "Food COGS")

### Step 5: Extract Budget Data
After the "BUDGET:" row marker:
- Same line items appear with budget values
- Match budget values to actuals by line item name
- If no budget row found, set budget to 0

### Step 6: Calculate Summary KPIs
From the P&L data, extract these top-level KPIs for dashboard:
- **Sales**: "Month To Date Total NET Sales" actual value
- **Prime Cost**: "Prime Cost" actual value
- **Labor%**: "Total Labor" / "Sales" * 100
- **SOP**: "Total Store Operating Profit" / "Sales" * 100
- **COGS**: "Food & N/A Bev COGS" actual value (renamed from Food Cost)
- **Variable Labor**: "Variable Labor" actual value

### Step 7: Use Provided Date and Period Type
Period Type: ${periodType.toUpperCase()}
Date: ${weekStartDate || '2025-01-06'}

${periodType === 'monthly'
  ? `- This is MONTHLY DATA (full month aggregate)
- Use the provided date (1st of the month) for "Week Start Date" field
- The values in the CSV are month-to-date or full month totals
- Create ONE record per store for this month`
  : `- This is WEEKLY DATA (single week)
- Use the provided date (Monday of the week) for "Week Start Date" field
- Create ONE record per store for this week`}

Set "Week Start Date" field to this exact value for every store: ${weekStartDate || '2025-01-06'}

## CRITICAL RULES
1. **Store Names**: Clean prefixes (extract "Columbia, SC" from "27 - Columbia")
2. **Numbers**: Remove $, %, commas (extract 342493 from "$342,493")
3. **Percentages**: Convert to decimal (27.9% → 27.9)
4. **Categories**: Assign based on line item name matching
5. **Indent Levels**: Determine from line item name patterns
6. **Budget Matching**: Match budget to actuals by line item name
7. **All Stores**: Create a data object for EVERY store in row 3

## OUTPUT FORMAT
Return ONLY the JSON object. No markdown, no explanations.

Respond with the complete results object containing data for ALL stores found in the CSV.
      `,
      files: [{
        filePath: file.filePath,
        mimeType: file.mimeType,
        displayName: file.fileName,
        fileUrl: file.fileUrl,
        fileName: file.fileName,
      }],
      taskType: 'batch',
    });

    if (!result || !result.id) {
        throw new Error('Failed to get job ID from AI service.');
    }
    return { jobId: result.id };
  } catch (error) {
    console.error('Error starting Gemini import job:', error);
    throw new Error('Failed to start the AI analysis job.');
  }
};

export const deleteImportFile = async (filePath: string): Promise<void> => {
  console.warn(
    `[INFO] File deletion requested for: ${filePath}. This is a placeholder.`
  );
  return Promise.resolve();
};