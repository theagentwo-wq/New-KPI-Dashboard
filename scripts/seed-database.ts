// This script is designed to be run from the command line to seed the database with historical data.
// Usage: npm run seed:db (or 'netlify env:exec npm run seed:db' for cloud keys)

import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from 'dotenv';
import process from 'node:process';
import { addDays, addWeeks, format, isBefore, parseISO } from 'date-fns';

console.log(`\n--- Environment Setup ---`);

// 1. Check if already loaded (e.g. via 'netlify env:exec')
if (process.env.FIREBASE_CLIENT_CONFIG) {
    console.log(`✅ FIREBASE_CLIENT_CONFIG detected in environment.`);
} else {
    // 2. If not, try to find .env.local
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log(`Environment variable not found. Looking for config at: ${envPath}`);

    if (fs.existsSync(envPath)) {
        console.log(`✅ Found .env.local`);
        config({ path: envPath });
    } else {
        console.warn(`⚠️  .env.local NOT found. Trying default .env...`);
        config(); 
    }
}

// 3. Final Verification
if (!process.env.FIREBASE_CLIENT_CONFIG) {
    console.error(`❌ FIREBASE_CLIENT_CONFIG is MISSING.`);
    console.error(`   If running locally without a file, use: netlify env:exec npm run seed:db`);
    process.exit(1);
}
console.log(`-------------------------\n`);

import { initializeFirebaseService } from '../services/firebaseService';
import { Kpi, PerformanceData, Period } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// --- CONFIGURATION ---
// If this array is empty, ALL years found in the CSV will be processed.
// To prevent timeouts with large datasets, add specific years here (e.g., [2023]) 
// and run the script multiple times.
const YEARS_TO_SEED: number[] = [2023, 2024, 2025]; 
// Example: const YEARS_TO_SEED = [2023];

// --- SEASONALITY WEIGHTS ---
// Index 0 = Jan, 11 = Dec.
// 1.0 is average. >1 is busy, <1 is slow.
const MONTHLY_SEASONALITY = [
    0.85, // Jan: Slow post-holiday
    0.90, // Feb: Still slow
    1.00, // Mar: Picking up
    1.05, // Apr: Spring
    1.10, // May: Mothers day / Grad
    1.15, // Jun: Summer peak start
    1.20, // Jul: Summer peak
    1.15, // Aug: Summer winding down
    1.05, // Sep: Back to school
    1.00, // Oct: Steady
    0.95, // Nov: Pre-holiday lull
    1.25  // Dec: Holiday parties
];

// --- STORE OPENING DATES ---
// ISO Format YYYY-MM-DD
const STORE_OPENING_DATES: { [key: string]: string } = {
    'Huntsville, AL': '2024-11-08',
    'Columbia, SC': '2025-02-14',
    'Gainesville, GA': '2025-05-16',
    'Lenexa, KS': '2025-07-25',
    'Farragut, TN': '2025-10-03'
};

// --- INLINED DATE LOGIC (To prevent import issues) ---
const FY2026_START_DATE = new Date('2025-12-29T00:00:00');
const WEEKS_IN_YEAR = 52;

const getFiscalYearStartDate = (year: number): Date => {
  const yearDiff = year - 2026;
  return addWeeks(FY2026_START_DATE, yearDiff * WEEKS_IN_YEAR);
};

const generateFiscalPeriodsLocal = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];
  console.log(`DEBUG: Generating periods from ${startYear} to ${endYear}...`);
  
  for (let year = startYear; year <= endYear; year++) {
    let currentWeekStart = getFiscalYearStartDate(year);
    const yearEndDate = addDays(addWeeks(currentWeekStart, 52), -1);
    
    periods.push({ type: 'Year', label: `FY${year}`, startDate: currentWeekStart, endDate: yearEndDate });
    
    const monthLengths = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
    let weekInYearCounter = 1;

    for (let q = 0; q < 4; q++) {
        for (let m = 0; m < 3; m++) {
            const monthWeeks = monthLengths[q*3+m];
            for(let w = 0; w < monthWeeks; w++){
                const weekStartDate = currentWeekStart;
                const weekEndDate = addDays(addWeeks(weekStartDate, 1), -1);
                 periods.push({ 
                     type: 'Week', 
                     label: `W${weekInYearCounter} FY${year} (${format(weekStartDate, 'MMM d')})`, 
                     startDate: weekStartDate, 
                     endDate: weekEndDate 
                 });
                currentWeekStart = addWeeks(currentWeekStart, 1);
                weekInYearCounter++;
            }
        }
    }
  }
  return periods;
};
// ----------------------------------------------------

const HISTORICAL_DATA_CSV = `
,L001-DT Asheville,,,L002-South Asheville,,,L003-Knoxville,,,"L004-Greenville, SC",,,L005-Chattanooga,,,L008-Raleigh,,,L009-Myrtle Beach,,,L010-Arlington,,,L011-Virginia Beach,,,L012-Franklin,,,L014-Denver,,,L015-Frisco,,,L016-Boise,,,L017-Charlotte,,,L018-Grand Rapids,,,L019-Milwaukee,,,L020-Pittsburgh,,,L021-Des Moines,,,"L022-Columbus, OH",,,L023-Indianapolis,,,L024-Las Colinas,,,L025-Omaha,,,L026-Huntsville,,,"L027-Columbia, SC",,,"L028-Gainesville, GA",,,L029-Lenexa,,,L030-Farragut,,,Total,,
,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025
Total Revenue," $7,459,341 "," $4,916,701 "," $3,430,083 "," $3,144,505 "," $2,378,389 "," $1,877,568 "," $5,307,075 "," $4,785,389 "," $3,710,144 "," $4,512,693 "," $4,154,925 "," $3,239,420 "," $3,159,856 "," $2,802,417 "," $2,149,483 "," $3,922,264 "," $3,404,057 "," $2,306,700 "," $3,471,154 "," $2,886,923 "," $2,233,585 "," $3,269,234 "," $2,638,155 "," $1,833,387 "," $3,715,781 "," $3,220,792 "," $2,385,040 "," $3,915,780 "," $3,304,177 "," $2,384,000 "," $4,220,654 "," $3,274,169 "," $2,298,461 "," $4,804,833 "," $3,471,371 "," $2,481,927 "," $3,375,863 "," $2,764,041 "," $2,117,067 "," $4,928,559 "," $3,840,446 "," $2,717,029 "," $5,178,389 "," $4,449,967 "," $3,337,603 "," $4,642,775 "," $3,850,128 "," $2,903,050 "," $3,447,736 "," $2,379,365 "," $1,743,647 "," $2,674,641 "," $1,799,721 "," $1,477,975 "," $3,960,671 "," $2,729,773 "," $1,890,548 "," $2,990,612 "," $2,704,450 "," $1,822,481 "," $1,509,621 "," $2,182,935 "," $1,782,569 "," $543,885 "," $2,665,923 "," $1,830,780 ", $-   ," $748,421 "," $3,549,155 ", $-   , $-   ," $3,722,613 ", $-   , $-   ," $1,640,033 ", $-   , $-   ," $1,598,514 ", $-   , $-   ," $354,010 "," $84,155,920 "," $71,352,630 "," $62,816,871 "
Food COGS,22.8%,22.5%,24.1%,23.2%,24.0%,26.6%,22.1%,22.4%,25.5%,21.9%,22.0%,24.0%,22.9%,23.6%,25.5%,21.7%,22.2%,24.5%,24.8%,24.3%,26.0%,22.8%,22.2%,24.1%,23.8%,24.0%,25.4%,23.1%,22.5%,24.5%,21.4%,21.3%,24.1%,23.4%,23.1%,23.8%,23.7%,23.7%,24.9%,23.8%,23.7%,25.1%,22.7%,22.9%,24.2%,23.5%,23.1%,25.0%,25.2%,24.8%,27.4%,24.2%,24.9%,24.1%,25.1%,24.0%,24.9%,24.1%,23.4%,25.5%,26.7%,23.0%,24.5%,26.9%,24.1%,25.3%,0.0%,29.4%,25.4%,0.0%,0.0%,27.2%,0.0%,0.0%,29.5%,0.0%,0.0%,29.0%,0.0%,0.0%,29.3%,23.3%,23.3%,25.3%
Total Variable Labor,26.1%,25.8%,23.7%,23.7%,26.2%,28.3%,21.3%,22.2%,21.9%,23.2%,23.1%,22.5%,23.4%,23.8%,23.9%,22.9%,22.9%,23.6%,27.5%,26.5%,25.8%,26.5%,25.9%,24.2%,26.1%,24.8%,24.5%,24.4%,24.7%,23.9%,32.0%,34.4%,36.0%,22.7%,23.5%,24.6%,26.3%,26.9%,25.2%,29.1%,27.1%,25.9%,24.7%,23.7%,23.4%,25.2%,24.5%,23.8%,27.2%,26.8%,28.5%,27.5%,32.7%,28.1%,26.5%,25.6%,27.6%,31.0%,27.4%,27.1%,37.9%,28.1%,27.6%,36.9%,28.6%,30.0%,0.0%,37.5%,25.3%,0.0%,0.0%,26.1%,0.0%,0.0%,34.0%,0.0%,0.0%,27.1%,0.0%,0.0%,25.9%,26.0%,25.9%,25.8%
Prime Cost,56.7%,57.7%,56.7%,59.1%,64.6%,67.2%,51.8%,53.7%,56.9%,55.1%,55.7%,57.4%,57.9%,60.3%,61.7%,53.0%,55.2%,59.7%,60.0%,59.1%,60.9%,60.1%,60.4%,63.2%,57.5%,59.1%,58.8%,57.8%,58.6%,60.4%,61.6%,65.9%,69.8%,57.0%,58.5%,59.8%,59.8%,61.7%,61.8%,60.7%,59.3%,62.0%,54.9%,55.4%,57.5%,57.0%,56.9%,58.7%,60.8%,63.1%,70.4%,63.4%,70.3%,66.1%,60.8%,61.2%,66.3%,63.3%,60.7%,66.4%,76.4%,64.8%,66.7%,78.8%,63.7%,66.4%,0.0%,78.0%,62.7%,0.0%,0.0%,61.4%,0.0%,0.0%,74.1%,0.0%,0.0%,63.7%,0.0%,0.0%,64.4%,58.5%,59.7%,62.1%
Store Operating Profit,27.3%,22.1%,22.3%,20.0%,10.6%,5.3%,23.2%,17.8%,17.0%,25.0%,22.9%,20.0%,21.1%,15.4%,13.4%,26.2%,22.2%,10.7%,19.5%,19.0%,11.0%,13.0%,7.8%,1.6%,20.8%,15.5%,11.2%,20.3%,16.9%,11.4%,15.3%,5.3%,-0.4%,19.0%,9.9%,3.1%,16.9%,12.4%,11.3%,19.2%,16.9%,10.4%,28.1%,25.9%,22.8%,23.2%,21.6%,16.1%,16.2%,6.9%,2.2%,6.4%,-10.3%,-2.8%,16.2%,7.9%,-1.5%,16.1%,10.6%,1.6%,-8.8%,-1.4%,-5.0%,-9.6%,10.6%,7.0%,0.0%,-9.8%,6.0%,0.0%,0.0%,15.7%,0.0%,0.0%,-1.1%,0.0%,0.0%,15.8%,0.0%,0.0%,15.8%,19.7%,13.8%,10.3%
Steritech, 92.03 , 94.13 , 91.73 , 94.13 , 92.73 , 94.07 , 93.95 , 97.80 , 95.18 , 91.15 , 96.05 , 94.77 , 94.13 , 93.60 , 93.13 , 89.63 , 90.10 , 89.75 , 91.50 , 95.53 , 88.70 , 93.95 , 90.80 , 96.40 , 94.30 , 91.33 , 91.85 , 94.83 , 97.30 , 97.80 , 93.95 , 89.40 , 90.10 , 93.60 , 92.55 , 94.53 , 89.63 , 91.50 , 94.30 , 93.78 , 91.73 , -   , 95.00 , 94.50 , 92.43 , 95.18 , 91.15 , 93.13 , 91.50 , 87.25 , 96.40 , 90.63 , 95.35 , 96.93 , 95.35 , 94.48 , 94.77 , 91.73 , 91.03 , 95.03 , 92.55 , 89.05 , 90.80 , 94.30 , 93.25 , 93.78 , -   , -   , 92.20 , -   , -   , 95.00 , -   , -   , 96.05 , -   , -   , -   , -   , -   , -   , 93.10 , 93.29 , 94.02 
Reviews, 4.54 , 4.49 , 4.45 , 4.47 , 4.49 , 4.44 , 4.62 , 4.58 , 4.65 , 4.51 , 4.51 , 4.54 , 4.43 , 4.38 , 4.56 , 4.41 , 4.38 , 4.37 , 4.43 , 4.58 , 4.60 , 4.27 , 4.37 , 4.45 , 4.36 , 4.34 , 4.34 , 4.51 , 4.36 , 4.19 , 4.48 , 4.43 , 4.52 , 4.41 , 4.34 , 4.39 , 4.49 , 4.44 , 4.48 , 4.13 , 4.18 , 4.17 , 4.58 , 4.48 , 4.42 , 4.48 , 4.53 , 4.53 , 4.25 , 4.17 , 4.29 , 4.21 , 3.93 , 4.08 , 4.36 , 4.38 , 4.36 , 4.32 , 4.38 , 4.20 , 4.39 , 4.34 , 4.29 , 4.63 , 4.33 , 4.28 , -   , -   , 4.53 , -   , -   , 4.40 , -   , -   , 4.59 , -   , -   , 4.27 , -   , -   , 4.51 , 4.42 , 4.40 , 4.42 
`;

const LOCATION_CODE_MAP: { [key: string]: string } = {
    'L001-DT Asheville': 'Downtown Asheville, NC',
    'L002-South Asheville': 'South Asheville, NC',
    'L003-Knoxville': 'Knoxville, TN',
    'L004-Greenville, SC': 'Greenville, SC',
    'L005-Chattanooga': 'Chattanooga, TN',
    'L008-Raleigh': 'Raleigh, NC',
    'L009-Myrtle Beach': 'Myrtle Beach, SC',
    'L010-Arlington': 'Arlington, VA',
    'L011-Virginia Beach': 'Virginia Beach, VA',
    'L012-Franklin': 'Franklin, TN',
    'L014-Denver': 'Denver, CO',
    'L015-Frisco': 'Frisco, TX',
    'L016-Boise': 'Boise, ID',
    'L017-Charlotte': 'Charlotte, NC',
    'L018-Grand Rapids': 'Grand Rapids, MI',
    'L019-Milwaukee': 'Milwaukee, WI',
    'L020-Pittsburgh': 'Pittsburgh, PA',
    'L021-Des Moines': 'Des Moines, IA',
    'L022-Columbus, OH': 'Columbus, OH',
    'L023-Indianapolis': 'Indianapolis, IN',
    'L024-Las Colinas': 'Las Colinas, TX',
    'L025-Omaha': 'Omaha, NB',
    'L026-Huntsville': 'Huntsville, AL',
    'L027-Columbia, SC': 'Columbia, SC',
    'L028-Gainesville, GA': 'Gainesville, GA',
    'L029-Lenexa': 'Lenexa, KS',
    'L030-Farragut': 'Farragut, TN'
};

const KPI_NAME_MAP: { [key: string]: Kpi } = {
    'Total Revenue': Kpi.Sales,
    'Food COGS': Kpi.FoodCost,
    'Total Variable Labor': Kpi.VariableLabor,
    'Prime Cost': Kpi.PrimeCost,
    'Store Operating Profit': Kpi.SOP,
    'Steritech': Kpi.CulinaryAuditScore,
    'Reviews': Kpi.AvgReviews,
};

// Robust CSV splitter that respects quoted fields
const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};

const parseAndTransformData = () => {
    console.log("Parsing and transforming historical data...");
    const lines = HISTORICAL_DATA_CSV.trim().split('\n');
    
    // Use robust splitter
    const locationLine = splitCSVLine(lines[0]).map(s => s.replace(/^"|"$/g, ''));
    const yearLine = splitCSVLine(lines[1]);

    // Map flattened columns to location/year
    const columnMapping: { [colIndex: number]: { location: string, year: number } } = {};
    
    let locColIndex = 1;
    while (locColIndex < locationLine.length) {
        const rawLoc = locationLine[locColIndex];
        if (rawLoc) {
             const mappedLocation = LOCATION_CODE_MAP[rawLoc] || LOCATION_CODE_MAP[rawLoc.replace(/^"|"$/g, '')];
             if (mappedLocation) {
                 // Map the next 3 columns
                 columnMapping[locColIndex] = { location: mappedLocation, year: parseInt(yearLine[locColIndex]) };
                 columnMapping[locColIndex + 1] = { location: mappedLocation, year: parseInt(yearLine[locColIndex + 1]) };
                 columnMapping[locColIndex + 2] = { location: mappedLocation, year: parseInt(yearLine[locColIndex + 2]) };
                 locColIndex += 3;
             } else {
                 locColIndex++;
             }
        } else {
            locColIndex++;
        }
    }

    const yearlyData: { [year: number]: { [location: string]: PerformanceData } } = {};
    
    // Now iterate data
    for (let i = 2; i < lines.length; i++) {
        const dataLine = splitCSVLine(lines[i]);
        const kpiName = dataLine[0].replace(/^"|"$/g, '');
        const kpi = KPI_NAME_MAP[kpiName];
        if (!kpi) continue;
        
        for (let c = 1; c < dataLine.length; c++) {
            const mapping = columnMapping[c];
            if (!mapping) continue; // Skip columns that aren't mapped to a store/year
            
            const valueStr = dataLine[c];
            if (!valueStr || valueStr === '-' || valueStr.trim() === '$-') continue;
            
            let value = parseFloat(valueStr.replace(/[\s$,%"]/g, ''));
            if (isNaN(value)) continue;

            if (valueStr.includes('%') || kpi === Kpi.CulinaryAuditScore) {
                value /= 100;
            }
            
            // Assign
            if (!yearlyData[mapping.year]) yearlyData[mapping.year] = {};
            if (!yearlyData[mapping.year][mapping.location]) yearlyData[mapping.year][mapping.location] = {};
            yearlyData[mapping.year][mapping.location][kpi] = value;
        }
    }
    
    console.log("Transforming yearly data into weekly format...");
    const weeklyPerformanceData: { storeId: string; weekStartDate: Date; data: PerformanceData }[] = [];
    const allFiscalPeriods = generateFiscalPeriodsLocal(2023, 2026); 

    for (const yearStr in yearlyData) {
        const year = parseInt(yearStr);
        if (isNaN(year)) continue;

        console.log(`DEBUG: Processing Year: ${year} from CSV...`);

        if (YEARS_TO_SEED.length > 0 && !YEARS_TO_SEED.includes(year)) {
            console.log(`DEBUG: Skipping ${year} (not in YEARS_TO_SEED filter)`);
            continue;
        }

        const searchLabel = `FY${year}`;
        const weeksInYear = allFiscalPeriods.filter(p => p.type === 'Week' && p.label.includes(searchLabel));

        if (weeksInYear.length === 0) {
            console.warn(`Could not find any fiscal weeks for ${searchLabel}. Skipping year.`);
            continue;
        }

        const locations = yearlyData[year];
        for (const location in locations) {
            const locationYearlyData = locations[location];
            
            // Check for specific opening date
            const openingDateStr = STORE_OPENING_DATES[location];
            const openingDate = openingDateStr ? parseISO(openingDateStr) : null;

            // --- SEASONALITY WEIGHT CALCULATION ---
            // Calculate total weight specifically for this store's operating weeks in this year
            let totalSeasonalityScore = 0;
            let operatingWeeksCount = 0;

            weeksInYear.forEach(week => {
                if (!openingDate || week.startDate >= openingDate) {
                    totalSeasonalityScore += MONTHLY_SEASONALITY[week.startDate.getMonth()];
                    operatingWeeksCount++;
                }
            });

            // Safeguard against division by zero if store closed all year
            if (totalSeasonalityScore === 0) totalSeasonalityScore = 1;

            weeksInYear.forEach(week => {
                // --- OPENING LOGIC (Zero out before open) ---
                if (openingDate && isBefore(week.startDate, openingDate)) {
                    const zeroData: PerformanceData = {};
                    for(const k in locationYearlyData) zeroData[k as Kpi] = 0;
                    
                    weeklyPerformanceData.push({
                        storeId: location,
                        weekStartDate: week.startDate,
                        data: zeroData
                    });
                    return;
                }
                
                const weeklyData: PerformanceData = {};
                for (const kpiStr in locationYearlyData) {
                    const kpi = kpiStr as Kpi;
                    const yearlyValue = locationYearlyData[kpi]!;
                    
                    if (kpi === Kpi.Sales) {
                        // Apply weighted distribution for Sales based on operating weeks
                        const weekWeight = MONTHLY_SEASONALITY[week.startDate.getMonth()];
                        weeklyData[kpi] = yearlyValue * (weekWeight / totalSeasonalityScore);
                    } else {
                        // Averages/Percentages remain constant
                        weeklyData[kpi] = yearlyValue;
                    }
                }

                weeklyPerformanceData.push({
                    storeId: location,
                    weekStartDate: week.startDate,
                    data: weeklyData,
                });
            });
        }
    }
    console.log(`Generated ${weeklyPerformanceData.length} weekly records.`);
    return weeklyPerformanceData;
};


const seedDatabase = async () => {
    console.log("Connecting to Firebase...");
    const status = await initializeFirebaseService();
    if (status.status === 'error') {
        console.error("Failed to connect to Firebase:", status.message);
        process.exit(1);
    }
    console.log("Firebase connected.");

    const dataToSeed = parseAndTransformData();
    if (dataToSeed.length === 0) {
        if (YEARS_TO_SEED.length > 0) {
             console.error(`No data was parsed for the selected years: ${YEARS_TO_SEED.join(', ')}. Check the CSV and your filter.`);
        } else {
             console.error("No data was parsed. Aborting seed.");
        }
        process.exit(1);
    }

    const db = firebase.firestore();
    const actualsCollection = db.collection('performance_actuals');
    const batchSize = 400;
    let batch = db.batch();
    let writeCount = 0;

    console.log(`Starting to write ${dataToSeed.length} documents to Firestore in batches of ${batchSize}...`);

    for (let i = 0; i < dataToSeed.length; i++) {
        const record = dataToSeed[i];
        const docId = `${record.storeId}_${record.weekStartDate.toISOString().split('T')[0]}`;
        const docRef = actualsCollection.doc(docId);
        
        const data = {
            storeId: record.storeId,
            weekStartDate: firebase.firestore.Timestamp.fromDate(record.weekStartDate),
            data: record.data
        };

        batch.set(docRef, data, { merge: true });
        writeCount++;

        if (writeCount === batchSize || i === dataToSeed.length - 1) {
            console.log(`Committing batch of ${writeCount} documents...`);
            await batch.commit();
            console.log("Batch committed.");
            batch = db.batch(); // Start a new batch
            writeCount = 0;
        }
    }

    console.log("\n\x1b[32m%s\x1b[0m", "✅ Database seeding completed successfully!");
};

seedDatabase().catch(error => {
    console.error("\n\x1b[31m%s\x1b[0m", "❌ An error occurred during database seeding:");
    console.error(error);
    process.exit(1);
});