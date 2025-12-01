# Data Import & Entry System Overhaul - Development Plan

**Project Goal**: Transform the KPI Dashboard data entry system from broken/manual to a powerhouse automated import system with multiple entry methods.

**Status**: In Progress
**Start Date**: 2025-11-30
**Target Completion**: TBD

---

## Executive Summary

The current system has two data entry methods:
1. **Manual Data Entry** (✅ Working) - Functional but tedious for weekly data across multiple stores
2. **Import Report** (❌ Broken) - AI-powered import that doesn't actually save data

This plan will fix the broken AI import, add multiple new entry methods, and create a comprehensive data import system that handles:
- Weekly financial tracker uploads (Excel/CSV)
- Screenshot/image imports with OCR
- Quick paste from Excel
- Bulk entry grids
- Template validation
- Duplicate detection
- Smart column mapping

---

## Current System Analysis

### Data Storage Structure
**Firestore Collection**: `performance_actuals`

**Document ID Format**: `{StoreId}_{YYYY-MM-DD}`
Example: `"Columbia, SC_2025-01-06"`

**Document Structure**:
```json
{
  "storeId": "Columbia, SC",
  "workStartDate": "2025-01-06T00:00:00.000Z",
  "data": {
    "Sales": 45000,
    "COGS": 12500,
    "LaborPercentage": 0.285,
    "PrimeCost": 27000,
    "SOP": 8500,
    "GuestCount": 850,
    "CheckAverage": 52.94,
    "SalesPerLaborHour": 65.50
  }
}
```

### KPI Fields
All KPIs from `constants.ts`:
- Sales (currency)
- COGS (currency)
- Labor % (percentage)
- Prime Cost (currency)
- SOP (currency)
- Guest Count (number)
- Check Average (currency)
- Sales per Labor Hour (currency)

### Store Names
Must match exactly from `ALL_STORES` constant.

---

## Phase 1: Fix Broken Import Report (Priority: CRITICAL)

### Issues Identified

#### 1.1 No Data Persistence ❌
**File**: `src/App.tsx:141-144`
**Problem**: `handleConfirmImport` only logs data and closes modal - never saves to Firestore

**Current Code**:
```typescript
const handleConfirmImport = (job: ActiveJob) => {
  console.log('Confirmed import:', job); // Just logs!
  setImportModalOpen(false);             // Just closes!
  // ❌ NO ACTUAL SAVING!
}
```

**Fix**: Implement actual data saving logic with proper parsing and validation

#### 1.2 No Job Polling ❌
**File**: `src/components/ImportDataModal.tsx`
**Problem**: AI job is submitted but never checked for completion

**Fix**: Add `useEffect` to poll job status every 3 seconds until complete/failed

#### 1.3 Vague AI Prompt ❌
**File**: `src/services/geminiService.ts:86-95`
**Problem**: AI doesn't know which columns to extract or what format to use

**Fix**: Detailed prompt specifying exact column names, formats, and data structure

### Implementation Tasks

#### Task 1.1: Add Job Polling Mechanism
**File**: `src/components/ImportDataModal.tsx`

```typescript
useEffect(() => {
  if (!activeJob || activeJob.step !== 'pending') return;

  const pollInterval = setInterval(async () => {
    try {
      const status = await callGeminiAPI('checkTaskStatus', {
        jobId: activeJob.id
      });

      if (status.status === 'completed') {
        setActiveJob({
          ...activeJob,
          step: 'verify',
          extractedData: status.results,
          statusLog: [...activeJob.statusLog, 'SUCCESS: Analysis complete']
        });
        clearInterval(pollInterval);
      } else if (status.status === 'failed') {
        setActiveJob({
          ...activeJob,
          step: 'error',
          errors: [status.error || 'Job failed']
        });
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 3000);

  return () => clearInterval(pollInterval);
}, [activeJob]);
```

**Success Criteria**: Job status updates from "pending" → "verify" when AI completes

---

#### Task 1.2: Implement Data Saving Logic
**File**: `src/App.tsx`

**New Function**:
```typescript
const handleConfirmImport = async (job: ActiveJob) => {
  try {
    let savedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const source of job.extractedData) {
      for (const row of source.data) {
        try {
          // Extract store name
          const storeId = row['Store Name'] || row['Store'] || row['Location'];
          if (!storeId || !ALL_STORES.includes(storeId)) {
            errors.push(`Invalid store: ${storeId}`);
            errorCount++;
            continue;
          }

          // Parse date
          const weekStr = row['Week'] || row['Date'] || row['Period'];
          const weekDate = parseWeekDate(weekStr);
          if (!weekDate) {
            errors.push(`Invalid date for ${storeId}: ${weekStr}`);
            errorCount++;
            continue;
          }

          // Find matching period
          const period = findPeriodByDate(weekDate);
          if (!period) {
            errors.push(`No period found for ${storeId} on ${weekDate}`);
            errorCount++;
            continue;
          }

          // Build KPI data object
          const kpiData: PerformanceData = {};

          // Sales
          if (row['Sales'] || row['Net Sales']) {
            kpiData.Sales = parseFloat(row['Sales'] || row['Net Sales']);
          }

          // COGS
          if (row['COGS'] || row['Cost of Goods']) {
            kpiData.COGS = parseFloat(row['COGS'] || row['Cost of Goods']);
          }

          // Labor %
          if (row['Labor %'] || row['Labor Percentage']) {
            const laborVal = parseFloat(row['Labor %'] || row['Labor Percentage']);
            kpiData.LaborPercentage = laborVal > 1 ? laborVal / 100 : laborVal;
          }

          // Prime Cost
          if (row['Prime Cost']) {
            kpiData.PrimeCost = parseFloat(row['Prime Cost']);
          }

          // SOP
          if (row['SOP']) {
            kpiData.SOP = parseFloat(row['SOP']);
          }

          // Guest Count
          if (row['Guest Count'] || row['Covers']) {
            kpiData.GuestCount = parseFloat(row['Guest Count'] || row['Covers']);
          }

          // Check Average
          if (row['Check Average'] || row['Avg Check']) {
            kpiData.CheckAverage = parseFloat(row['Check Average'] || row['Avg Check']);
          }

          // Sales per Labor Hour
          if (row['Sales per Labor Hour'] || row['SPLH']) {
            kpiData.SalesPerLaborHour = parseFloat(row['Sales per Labor Hour'] || row['SPLH']);
          }

          // Validate at least one KPI
          if (Object.keys(kpiData).length === 0) {
            errors.push(`No KPI data for ${storeId} on ${weekStr}`);
            errorCount++;
            continue;
          }

          // Save to Firestore
          await savePerformanceDataForPeriod(storeId, period, kpiData);
          savedCount++;

        } catch (rowError) {
          errors.push(`Error processing row: ${rowError.message}`);
          errorCount++;
        }
      }
    }

    // Close modal and show results
    setImportModalOpen(false);

    if (savedCount > 0) {
      alert(`Import successful!\n\nSaved: ${savedCount} records\nErrors: ${errorCount}\n\n${errors.slice(0, 5).join('\n')}`);
    } else {
      alert(`Import failed!\n\nNo records saved.\n\n${errors.slice(0, 10).join('\n')}`);
    }

  } catch (error) {
    alert(`Import failed: ${error.message}`);
  }
};
```

**Helper Functions Needed**:
```typescript
// Parse various date formats
const parseWeekDate = (dateStr: string): Date | null => {
  // Try format: "Week 1/6/25"
  if (dateStr.startsWith('Week')) {
    const match = dateStr.match(/Week (\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (match) {
      const [, month, day, year] = match;
      const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }
  }

  // Try ISO format: "2025-01-06"
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(dateStr);
  }

  // Try standard format: "01/06/2025"
  const standardMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (standardMatch) {
    const [, month, day, year] = standardMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
};

// Find period that contains this date
const findPeriodByDate = (date: Date): Period | null => {
  return ALL_PERIODS.find(period => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return date >= start && date <= end;
  });
};
```

**Success Criteria**:
- Data successfully saved to Firestore
- User sees confirmation with count of saved records
- Errors are displayed if any rows fail

---

#### Task 1.3: Enhanced AI Prompt
**File**: `src/services/geminiService.ts:81-113`

**Replace Existing Prompt With**:
```typescript
export const startImportJob = async (file: FileUploadResult, importType: 'document' | 'text'): Promise<{ jobId: string }> => {
  try {
    const result = await callGeminiAPI('startTask', {
      model: 'gemini-1.5-pro-latest',
      prompt: `You are a financial data extraction specialist analyzing a weekly financial tracker for restaurant performance data.

EXPECTED DATA STRUCTURE:
The document contains restaurant financial data with these EXACT columns:
- Store Name/Location: Text (must be one of: ${ALL_STORES.join(', ')})
- Week/Period/Date: Date in format "Week MM/DD/YY" or "YYYY-MM-DD"
- Sales/Net Sales: Currency ($) - extract number only, no $ sign
- COGS (Cost of Goods Sold): Currency ($) - extract number only
- Labor %: Percentage - extract as NUMBER (e.g., "28.5" not "0.285" or "28.5%")
- Prime Cost: Currency ($) - extract number only
- SOP (Standard Operating Procedures): Currency ($) - extract number only
- Guest Count/Covers: Whole number
- Check Average/Avg Check: Currency ($) - extract number only
- Sales per Labor Hour/SPLH: Currency ($) - extract number only

CRITICAL INSTRUCTIONS:
1. Extract data row by row - each row represents ONE store for ONE week
2. Column names in output MUST match EXACTLY as shown above
3. For percentages: Extract as NUMBER without % sign (e.g., "28.5" not "0.285")
4. For currency: Extract NUMBER only, no $ sign or commas
5. For dates: Convert to ISO format "YYYY-MM-DD" (e.g., "2025-01-06")
6. Store names MUST match exactly: ${ALL_STORES.join(', ')}
7. If a cell is empty/missing, use empty string ""
8. Extract ALL data from document, even if it spans multiple weeks or stores

OUTPUT FORMAT (CRITICAL - FOLLOW EXACTLY):
{
  "results": [{
    "dataType": "Actuals",
    "sourceName": "Weekly Financial Tracker",
    "data": [
      {
        "Store Name": "Columbia, SC",
        "Week": "2025-01-06",
        "Sales": "45000",
        "COGS": "12500",
        "Labor %": "28.5",
        "Prime Cost": "27000",
        "SOP": "8500",
        "Guest Count": "850",
        "Check Average": "52.94",
        "Sales per Labor Hour": "65.50"
      },
      {
        "Store Name": "Nashville, TN",
        "Week": "2025-01-06",
        ...
      }
    ]
  }]
}

VALIDATION CHECKLIST:
✓ All store names match the allowed list exactly
✓ All dates are in YYYY-MM-DD format
✓ All numbers have NO $ signs or % signs
✓ Labor % is a number (28.5 not 0.285)
✓ Each row has at least Store Name, Week, and one KPI value
✓ Column names match exactly as specified above

Extract ALL data rows from the document. Do not skip any rows.`,
      files: [{
        filePath: file.filePath,
        mimeType: file.mimeType,
        displayName: file.fileName,
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
```

**Success Criteria**:
- AI extracts data in correct format with exact column names
- Store names match ALL_STORES list
- Dates in ISO format
- Numbers without symbols

---

## Phase 2: Enhanced Data Entry Features

### Feature 2.1: Quick Paste from Excel
**Priority**: HIGH
**Effort**: Medium
**Impact**: Massive time savings for weekly data entry

#### Implementation
**New Component**: `src/components/QuickPasteModal.tsx`

**User Flow**:
1. User clicks "Quick Paste" button in Data Entry page
2. Modal opens with large textarea
3. User copies entire week's data from Excel (Ctrl+C)
4. Pastes into textarea (Ctrl+V)
5. System auto-detects columns and parses data
6. Shows preview table with all detected rows
7. User clicks "Import All" → saves to Firestore

**Parsing Logic**:
```typescript
interface ParsedRow {
  storeId: string;
  week: Date;
  kpiData: PerformanceData;
}

const parsePastedData = (text: string): ParsedRow[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('No data found');

  // First line is headers
  const headers = lines[0].split('\t').map(h => h.trim());

  // Find column indices
  const storeIdx = headers.findIndex(h =>
    h.toLowerCase().includes('store') || h.toLowerCase().includes('location')
  );
  const dateIdx = headers.findIndex(h =>
    h.toLowerCase().includes('week') || h.toLowerCase().includes('date')
  );

  // Map KPI columns
  const kpiColumns = new Map<number, Kpi>();
  headers.forEach((header, idx) => {
    const kpi = mapHeaderToKPI(header);
    if (kpi) kpiColumns.set(idx, kpi);
  });

  // Parse data rows
  const results: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t');

    const storeId = cells[storeIdx]?.trim();
    if (!storeId) continue;

    const weekDate = parseWeekDate(cells[dateIdx]?.trim());
    if (!weekDate) continue;

    const kpiData: PerformanceData = {};
    kpiColumns.forEach((kpi, idx) => {
      const value = parseFloat(cells[idx]?.replace(/[$,%]/g, '').trim());
      if (!isNaN(value)) {
        if (KPI_CONFIG[kpi].format === 'percent' && value > 1) {
          kpiData[kpi] = value / 100;
        } else {
          kpiData[kpi] = value;
        }
      }
    });

    if (Object.keys(kpiData).length > 0) {
      results.push({ storeId, week: weekDate, kpiData });
    }
  }

  return results;
};

const mapHeaderToKPI = (header: string): Kpi | null => {
  const lower = header.toLowerCase();
  if (lower.includes('sales') && !lower.includes('per')) return 'Sales';
  if (lower.includes('cogs')) return 'COGS';
  if (lower.includes('labor')) return 'LaborPercentage';
  if (lower.includes('prime')) return 'PrimeCost';
  if (lower.includes('sop')) return 'SOP';
  if (lower.includes('guest') || lower.includes('covers')) return 'GuestCount';
  if (lower.includes('check avg') || lower.includes('average check')) return 'CheckAverage';
  if (lower.includes('splh') || lower.includes('sales per labor')) return 'SalesPerLaborHour';
  return null;
};
```

**UI Design**:
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Quick Paste from Excel">
  <div className="space-y-4">
    <p className="text-slate-300 text-sm">
      Copy cells from Excel (including headers) and paste below.
      The system will automatically detect columns and parse data.
    </p>

    <textarea
      value={pastedText}
      onChange={e => setPastedText(e.target.value)}
      placeholder="Paste your Excel data here (Ctrl+V)..."
      rows={10}
      className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 font-mono text-xs"
    />

    <button onClick={handleParse} className="bg-cyan-600 px-4 py-2 rounded-md">
      Parse Data
    </button>

    {parsedData.length > 0 && (
      <div className="border border-slate-700 rounded-md overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-2">Store</th>
              <th className="p-2">Week</th>
              <th className="p-2">Sales</th>
              <th className="p-2">COGS</th>
              <th className="p-2">Labor %</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {parsedData.map((row, i) => (
              <tr key={i} className="border-t border-slate-700">
                <td className="p-2">{row.storeId}</td>
                <td className="p-2">{row.week.toLocaleDateString()}</td>
                <td className="p-2">${row.kpiData.Sales || '-'}</td>
                <td className="p-2">${row.kpiData.COGS || '-'}</td>
                <td className="p-2">{row.kpiData.LaborPercentage ? `${(row.kpiData.LaborPercentage * 100).toFixed(1)}%` : '-'}</td>
                <td className="p-2">
                  <span className="text-green-400">✓ Ready</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="bg-slate-600 px-4 py-2 rounded-md">
        Cancel
      </button>
      <button
        onClick={handleImportAll}
        disabled={parsedData.length === 0}
        className="bg-cyan-600 px-6 py-2 rounded-md disabled:opacity-50"
      >
        Import {parsedData.length} Records
      </button>
    </div>
  </div>
</Modal>
```

**Success Criteria**:
- User can paste tab-separated data from Excel
- System auto-detects columns
- Shows preview of all rows
- Imports all records with one click

---

### Feature 2.2: Copy Previous Week
**Priority**: MEDIUM
**Effort**: Low
**Impact**: Fast data entry for stores with stable performance

#### Implementation
**Location**: Add button to DataEntryPage.tsx

**New Function**:
```typescript
const handleCopyPreviousWeek = async () => {
  if (!selectedStore || !selectedPeriodLabel) return;

  const selectedPeriod = ALL_PERIODS.find(p => p.label === selectedPeriodLabel);
  if (!selectedPeriod) return;

  // Find previous week
  const currentIndex = ALL_PERIODS.findIndex(p => p.label === selectedPeriodLabel);
  if (currentIndex <= 0) {
    alert('No previous period available');
    return;
  }

  const previousPeriod = ALL_PERIODS[currentIndex - 1];

  try {
    const previousData = await getAggregatedPerformanceDataForPeriod(
      previousPeriod,
      selectedStore
    );

    if (!previousData || Object.keys(previousData).length === 0) {
      alert('No data found for previous week');
      return;
    }

    // Convert to display format
    const formattedValues: Partial<{ [key in Kpi]: string }> = {};
    for (const key in previousData) {
      const kpi = key as Kpi;
      const value = previousData[kpi];
      if (value !== undefined && !isNaN(value)) {
        if (KPI_CONFIG[kpi].format === 'percent') {
          formattedValues[kpi] = (value * 100).toFixed(2);
        } else {
          formattedValues[kpi] = value.toFixed(2);
        }
      }
    }

    setKpiValues(formattedValues);
    alert(`Copied data from ${previousPeriod.label}. Review and save when ready.`);

  } catch (error) {
    alert(`Error loading previous week: ${error.message}`);
  }
};
```

**UI Addition**:
```tsx
<button
  onClick={handleCopyPreviousWeek}
  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
>
  📋 Copy from Last Week
</button>
```

**Success Criteria**:
- Button loads previous week's data for same store
- Pre-fills all KPI fields
- User can edit and save

---

### Feature 2.3: Bulk Entry Grid
**Priority**: LOW
**Effort**: High
**Impact**: Efficient for entering one week across all stores

#### Implementation
**New Page**: `src/pages/BulkEntryPage.tsx`

**Grid Layout**:
```
Week: Jan 6 - Jan 12, 2025

Store            | Sales    | COGS     | Labor % | Prime Cost | SOP      | ...
----------------|----------|----------|---------|------------|----------|----
Columbia, SC    | [45000]  | [12500]  | [28.5]  | [27000]    | [8500]   | ...
Nashville, TN   | [52000]  | [14000]  | [26.2]  | [30000]    | [9000]   | ...
Asheville, NC   | [38000]  | [10500]  | [30.1]  | [24000]    | [7500]   | ...
...
```

**Features**:
- Excel-like grid with keyboard navigation
- Tab/Enter to move between cells
- Copy/paste support
- "Save All" button at bottom
- Shows validation errors inline

**Success Criteria**:
- Can enter data for all stores in one grid
- Tab key moves to next cell
- Paste works from Excel
- Saves all rows at once

---

## Phase 3: Import Report Enhancements

### Feature 3.1: Template Validation
**Priority**: MEDIUM
**Effort**: Medium
**Impact**: Prevents errors from format changes

#### Concept
User uploads their standard weekly tracker template once. System learns:
- Which columns exist
- Column order
- Header text
- Data types per column

Future uploads validated against this template.

#### Implementation
**New Collection**: `import_templates`

**Document Structure**:
```json
{
  "userId": "user_123",
  "templateName": "Weekly Financial Tracker",
  "createdAt": "2025-01-06T...",
  "columns": [
    { "index": 0, "header": "Store Name", "kpi": null, "type": "text" },
    { "index": 1, "header": "Week", "kpi": null, "type": "date" },
    { "index": 2, "header": "Sales", "kpi": "Sales", "type": "currency" },
    { "index": 3, "header": "COGS", "kpi": "COGS", "type": "currency" },
    ...
  ],
  "sampleData": [...], // First 3 rows for reference
  "isActive": true
}
```

**UI Flow**:
1. Upload file
2. System asks: "Is this a new template or using existing?"
3. If new: "Save as template for future uploads?"
4. If existing: Validates columns match template
5. Shows warnings if columns don't match

**Success Criteria**:
- Template saved with column mapping
- Future uploads validated against template
- User warned if format differs

---

### Feature 3.2: Smart Column Mapping
**Priority**: HIGH
**Effort**: Medium
**Impact**: Handles different Excel formats

#### Implementation
**UI Component**: Column mapping interface

**Flow**:
1. AI makes best guess at column mapping
2. User sees mapping table:
```
Excel Column  →  KPI Field      Confidence
"Store Name"  →  Store          ✓ 100%
"Week Date"   →  Week           ✓ 100%
"Net Sales"   →  Sales          ? 80%
"Cost/Goods"  →  COGS           ? 75%
"Labor"       →  Labor %        ⚠ 60% (Multiple options)
```

3. User can override mappings
4. "Save mapping for future" option

**Success Criteria**:
- User can manually map columns
- Mappings saved for reuse
- Works with different column names

---

### Feature 3.3: Duplicate Detection
**Priority**: HIGH
**Effort**: Low
**Impact**: Prevents accidental overwrites

#### Implementation
**Check Before Save**:
```typescript
const checkForDuplicates = async (
  storeId: string,
  weekDate: Date
): Promise<PerformanceData | null> => {
  const period = findPeriodByDate(weekDate);
  if (!period) return null;

  const existingData = await getAggregatedPerformanceDataForPeriod(
    period,
    storeId
  );

  return existingData && Object.keys(existingData).length > 0
    ? existingData
    : null;
};
```

**UI Prompt**:
```
⚠ Duplicate Data Detected

Store: Columbia, SC
Week: Jan 6 - Jan 12, 2025

Existing Data:
  Sales: $45,000
  COGS: $12,500
  Labor %: 28.5%

New Data:
  Sales: $46,200
  COGS: $12,800
  Labor %: 27.8%

What would you like to do?
[ Override ] [ Skip ] [ Compare Side-by-Side ]
```

**Success Criteria**:
- Detects existing data before saving
- Shows diff of old vs new
- User chooses to override or skip

---

## Phase 4: Additional Enhancements

### Feature 4.1: Import History
Track all imports with ability to rollback

**New Collection**: `import_history`

```json
{
  "userId": "user_123",
  "timestamp": "2025-01-06T10:30:00Z",
  "importType": "AI Upload", // or "Quick Paste", "Manual"
  "fileName": "Weekly_Tracker_Jan_6.xlsx",
  "recordsImported": 12,
  "recordsFailed": 0,
  "affectedStores": ["Columbia, SC", "Nashville, TN", ...],
  "affectedWeeks": ["Week 1/6/25 - 1/12/25"],
  "canRollback": true
}
```

### Feature 4.2: Validation Rules
Pre-save validation:
- Sales must be > $0
- COGS must be < Sales
- Labor % must be between 15% and 45%
- Prime Cost = COGS + Labor Cost
- Check Average = Sales / Guest Count

**UI**: Show warnings but allow override

### Feature 4.3: Batch Operations
- Import multiple weeks at once
- Import for specific director regions only
- Export current data to Excel template

---

## Implementation Order

### Sprint 1: Fix Critical Issues (Week 1)
1. ✅ Task 1.1: Add job polling
2. ✅ Task 1.2: Implement data saving
3. ✅ Task 1.3: Enhanced AI prompt
4. ✅ Test end-to-end Import Report flow

**Deliverable**: Working Import Report that saves data

### Sprint 2: Quick Wins (Week 2)
5. ✅ Feature 2.1: Quick Paste from Excel
6. ✅ Feature 2.2: Copy Previous Week
7. ✅ Feature 3.3: Duplicate Detection

**Deliverable**: Fast manual entry options

### Sprint 3: Advanced Features (Week 3)
8. ✅ Feature 3.2: Smart Column Mapping
9. ✅ Feature 3.1: Template Validation
10. ✅ Feature 4.2: Validation Rules

**Deliverable**: Production-ready import system

### Sprint 4: Polish (Week 4)
11. ✅ Feature 2.3: Bulk Entry Grid
12. ✅ Feature 4.1: Import History
13. ✅ Feature 4.3: Batch Operations
14. ✅ Testing & bug fixes

**Deliverable**: Powerhouse financial dashboard

---

## Testing Plan

### Unit Tests
- Date parsing functions
- Column mapping logic
- KPI value normalization
- Duplicate detection

### Integration Tests
- Full import workflow (upload → AI → verify → save)
- Quick paste parsing
- Copy previous week functionality

### User Acceptance Tests
1. Upload real weekly tracker → verify all data saves correctly
2. Paste from Excel → verify auto-detection works
3. Copy previous week → verify data pre-fills
4. Attempt duplicate import → verify warning shown
5. Test invalid data → verify validation catches errors

---

## Success Metrics

### Before (Current State)
- Manual entry time: ~30 minutes per week (12 stores × 2-3 min each)
- Import Report: Broken (0% success rate)
- User satisfaction: Low (tedious manual work)

### After (Target State)
- Import time: ~2 minutes (upload + verify + import)
- Import success rate: >95%
- Time savings: 28 minutes per week = ~24 hours per year
- User satisfaction: High (automated, reliable)

---

## Technical Requirements

### Frontend Changes
- `src/App.tsx` - Fix handleConfirmImport
- `src/components/ImportDataModal.tsx` - Add job polling
- `src/components/QuickPasteModal.tsx` - NEW component
- `src/pages/DataEntryPage.tsx` - Add "Copy Previous Week" button
- `src/pages/BulkEntryPage.tsx` - NEW page
- `src/services/geminiService.ts` - Enhanced AI prompt

### Backend Changes
- `functions/src/routes/gemini.ts` - Improve import prompt
- `functions/src/types.ts` - Add new request/response types

### New Utilities
- `src/utils/dataParser.ts` - Excel paste parsing
- `src/utils/dateParser.ts` - Multiple date format support
- `src/utils/kpiValidator.ts` - Validation rules

### Dependencies
None needed - all features use existing libraries

---

## Risk Mitigation

### Risk 1: AI Extracts Data Incorrectly
**Mitigation**: Verification step before save + detailed AI prompt with examples

### Risk 2: Date Parsing Fails
**Mitigation**: Support multiple date formats + manual date picker override

### Risk 3: Duplicate Data Overwrites
**Mitigation**: Duplicate detection with user confirmation

### Risk 4: Performance Issues with Large Imports
**Mitigation**: Batch saves in chunks of 10 + progress indicator

---

## Future Enhancements (Post-Launch)

1. **Mobile Support**: Upload photos of printed reports with OCR
2. **Email Import**: Forward weekly tracker email → auto-import
3. **API Integration**: Connect directly to POS/accounting systems
4. **Auto-Import Scheduling**: Automatically fetch data weekly
5. **Multi-User Approval**: Require manager approval before save
6. **Audit Trail**: Track who changed which data when

---

## Conclusion

This plan transforms the KPI Dashboard from a broken/manual system into a **powerhouse automated data import system**. Users will save ~24 hours per year while reducing errors and gaining confidence in their data.

**Phase 1 fixes the critical bugs** (Import Report broken).
**Phase 2 adds fast manual entry** (Quick Paste, Copy Previous Week).
**Phase 3 makes it production-ready** (validation, templates, duplicates).
**Phase 4 makes it excellent** (history, batch operations, advanced features).

---

**Document Version**: 1.0
**Last Updated**: 2025-11-30
**Status**: Ready for Implementation
