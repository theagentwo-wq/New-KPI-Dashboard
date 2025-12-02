import { Period } from '../types';

// 4-4-5 Fiscal Calendar Configuration
// FY2025: Dec 30, 2024 - Dec 28, 2025
// FY2026: Dec 29, 2025 - Dec 27, 2026
const FISCAL_YEAR_STARTS: { [year: number]: Date } = {
  2024: new Date(2023, 11, 31), // Dec 31, 2023
  2025: new Date(2024, 11, 30), // Dec 30, 2024
  2026: new Date(2025, 11, 29), // Dec 29, 2025
  2027: new Date(2026, 11, 28), // Dec 28, 2026
};

// Generate 4-4-5 fiscal periods for a range of fiscal years
export const generate445FiscalPeriods = (startFiscalYear: number, endFiscalYear: number): Period[] => {
  const periods: Period[] = [];

  // 4-4-5 pattern: each quarter has 4 weeks, 4 weeks, 5 weeks
  const periodWeekPattern = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];

  for (let fiscalYear = startFiscalYear; fiscalYear <= endFiscalYear; fiscalYear++) {
    const fyStart = FISCAL_YEAR_STARTS[fiscalYear];
    if (!fyStart) continue;

    let currentPeriodStart = new Date(fyStart);

    for (let periodNum = 1; periodNum <= 12; periodNum++) {
      const weeksInPeriod = periodWeekPattern[periodNum - 1];
      const periodEnd = new Date(currentPeriodStart);
      periodEnd.setDate(periodEnd.getDate() + (weeksInPeriod * 7) - 1);

      const quarter = Math.ceil(periodNum / 3);

      const period = {
        label: `FY${fiscalYear} P${periodNum}`,
        startDate: new Date(currentPeriodStart),
        endDate: new Date(periodEnd), // Create NEW Date object to avoid mutation
        type: 'monthly' as const, // Using monthly type for fiscal periods
        year: fiscalYear,
        quarter
      };

      // Log P11 specifically to debug
      if (fiscalYear === 2025 && periodNum === 11) {
        console.log(`[dateUtils] Creating FY2025 P11:`);
        console.log(`  Start: ${period.startDate.toISOString()} (${period.startDate.getTime()})`);
        console.log(`  End: ${period.endDate.toISOString()} (${period.endDate.getTime()})`);
      }

      periods.push(period);

      // Move to next period
      currentPeriodStart = new Date(periodEnd);
      currentPeriodStart.setDate(currentPeriodStart.getDate() + 1);
    }
  }

  return periods;
};

// Generate weekly periods within 4-4-5 fiscal structure
export const generateWeeklyPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const fyStart = FISCAL_YEAR_STARTS[year];
    if (!fyStart) continue;

    let currentWeekStart = new Date(fyStart);
    let weekNumber = 1;

    // Generate 52 weeks (4-4-5 calendar always has 52 weeks, except leap years with 53)
    const totalWeeks = 52;

    for (let w = 0; w < totalWeeks; w++) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // 7-day week (Mon-Sun)

      const quarter = Math.ceil(weekNumber / 13); // 13 weeks per quarter

      periods.push({
        label: `FY${year} W${weekNumber}`,
        startDate: new Date(currentWeekStart),
        endDate: weekEnd,
        type: 'weekly',
        year,
        quarter
      });

      // Move to next week
      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      weekNumber++;
    }
  }

  return periods;
};

// Generate monthly periods for a range of years
export const generateMonthlyPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      periods.push({
        label: `${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
        startDate,
        endDate,
        type: 'monthly',
        year,
        quarter: Math.floor(month / 3) + 1
      });
    }
  }

  return periods;
};

// Generate quarterly periods for a range of years
export const generateQuarterlyPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const startDate = new Date(year, (quarter - 1) * 3, 1);
      const endDate = new Date(year, quarter * 3, 0);

      periods.push({
        label: `Q${quarter} ${year}`,
        startDate,
        endDate,
        type: 'quarterly',
        year,
        quarter
      });
    }
  }

  return periods;
};

// Generate yearly periods
export const generateYearlyPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    periods.push({
      label: `${year}`,
      startDate,
      endDate,
      type: 'yearly',
      year,
      quarter: 4
    });
  }

  return periods;
};

// Find the fiscal period for a given date (searches both monthly and weekly)
export const findFiscalPeriodForDate = (date: Date): Period | null => {
  const allPeriods = [
    ...generate445FiscalPeriods(2024, 2026),
    ...generateWeeklyPeriods(2024, 2026)
  ];

  return allPeriods.find(period =>
    date >= period.startDate && date <= period.endDate
  ) || null;
};

// Find the fiscal MONTH (P1-P12) for a given date - use this for monthly CSV imports
export const findFiscalMonthForDate = (date: Date): Period | null => {
  const fiscalPeriods = generate445FiscalPeriods(2024, 2026);

  return fiscalPeriods.find(period =>
    date >= period.startDate && date <= period.endDate
  ) || null;
};

export const ALL_PERIODS = [
  ...generateWeeklyPeriods(2024, 2026),
  ...generate445FiscalPeriods(2024, 2026),
  ...generateQuarterlyPeriods(2023, 2025),
  ...generateYearlyPeriods(2023, 2025)
];

// Get current fiscal period for today's date
export const getPeriodOptions = (): Period[] => {
  const today = new Date();
  const currentPeriod = findFiscalPeriodForDate(today);

  if (!currentPeriod) {
    // Fallback if no period found
    return generate445FiscalPeriods(2024, 2026).slice(0, 3);
  }

  const periods: Period[] = [];
  const allFiscalPeriods = generate445FiscalPeriods(2024, 2026);
  const currentIndex = allFiscalPeriods.findIndex(p => p.label === currentPeriod.label);

  // Current Period - clone the dates to avoid mutation
  periods.push({
    ...currentPeriod,
    startDate: new Date(currentPeriod.startDate),
    endDate: new Date(currentPeriod.endDate)
  });

  // Previous Period (if exists) - clone the dates
  if (currentIndex > 0) {
    const prevPeriod = allFiscalPeriods[currentIndex - 1];
    periods.push({
      ...prevPeriod,
      startDate: new Date(prevPeriod.startDate),
      endDate: new Date(prevPeriod.endDate)
    });
  }

  // Fiscal Year-to-Date (from fiscal year start to today)
  const fiscalYearStart = FISCAL_YEAR_STARTS[currentPeriod.year];
  if (fiscalYearStart) {
    periods.push({
      label: `FY${currentPeriod.year} YTD`,
      startDate: new Date(fiscalYearStart),
      endDate: new Date(today),
      type: 'yearly',
      year: currentPeriod.year,
      quarter: currentPeriod.quarter
    });
  }

  // Last 90 Days
  const last90 = new Date();
  last90.setDate(today.getDate() - 90);
  periods.push({
    label: 'Last 90 Days',
    startDate: new Date(last90),
    endDate: new Date(today),
    type: 'daily',
    year: currentPeriod.year,
    quarter: currentPeriod.quarter
  });

  return periods;
};

export const getDefaultPeriod = (): Period => {
    return getPeriodOptions()[0];
}

export const getInitialPeriod = (): Period => {
    return getPeriodOptions()[0];
}

export const getPreviousPeriod = (currentPeriod: Period): Period => {
    // Get all fiscal periods (P1-P12 for all years)
    const allFiscalPeriods = generate445FiscalPeriods(2024, 2026);
    const currentIndex = allFiscalPeriods.findIndex(p => p.label === currentPeriod.label);

    // If found and not the first period, return the previous one
    if (currentIndex > 0) {
        return allFiscalPeriods[currentIndex - 1];
    }

    // Fallback: return current period if it's the first one or not found
    return currentPeriod;
}

export const getYoYPeriod = (currentPeriod: Period): Period => {
    const previousYear = currentPeriod.startDate.getFullYear() - 1;
    const previousYearStartDate = new Date(currentPeriod.startDate);
    previousYearStartDate.setFullYear(previousYear);
    const previousYearEndDate = new Date(currentPeriod.endDate);
    previousYearEndDate.setFullYear(previousYear);

    return {
        ...currentPeriod,
        label: `${currentPeriod.label} (YoY)`,
        startDate: previousYearStartDate,
        endDate: previousYearEndDate,
        year: previousYear
    };
}

export const getMonthlyPeriodForDate = (date: Date): Period => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    label: `${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
    startDate,
    endDate,
    type: 'monthly',
    year,
    quarter: Math.floor(month / 3) + 1
  };
};
