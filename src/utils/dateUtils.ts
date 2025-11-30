import { Period } from '../types';

export const getPeriodOptions = (): Period[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  const periods: Period[] = [];

  // Current Quarter
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  periods.push({ 
    label: `Q${currentQuarter} ${currentYear}`,
    startDate: new Date(currentYear, (currentQuarter-1) * 3, 1),
    endDate: new Date(currentYear, currentQuarter * 3, 0),
    type: 'quarterly',
    year: currentYear,
    quarter: currentQuarter
  });

  // Previous Quarter
  let prevQuarter = currentQuarter - 1;
  let prevQuarterYear = currentYear;
  if (prevQuarter === 0) {
    prevQuarter = 4;
    prevQuarterYear -= 1;
  }
  periods.push({ 
    label: `Q${prevQuarter} ${prevQuarterYear}`,
    startDate: new Date(prevQuarterYear, (prevQuarter-1) * 3, 1),
    endDate: new Date(prevQuarterYear, prevQuarter * 3, 0),
    type: 'quarterly',
    year: prevQuarterYear,
    quarter: prevQuarter
  });

  // Year-to-Date
  periods.push({
    label: `YTD ${currentYear}`,
    startDate: new Date(currentYear, 0, 1),
    endDate: today,
    type: 'yearly',
    year: currentYear,
    quarter: currentQuarter
  });

  // Last 90 Days
  const last90 = new Date();
  last90.setDate(today.getDate() - 90);
  periods.push({
    label: 'Last 90 Days',
    startDate: last90,
    endDate: today,
    type: 'daily',
    year: currentYear,
    quarter: currentQuarter
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
    const allPeriods = getPeriodOptions();
    const currentIndex = allPeriods.findIndex(p => p.label === currentPeriod.label);
    return allPeriods[currentIndex + 1] || allPeriods[allPeriods.length - 1];
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

// Generate weekly periods for a range of years
export const generateWeeklyPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Find the first Monday of the year (or start of year if it's a Monday)
    let currentWeekStart = new Date(startOfYear);
    const dayOfWeek = currentWeekStart.getDay();
    if (dayOfWeek !== 1) { // If not Monday
      const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
      currentWeekStart.setDate(currentWeekStart.getDate() + daysUntilMonday);
    }

    let weekNumber = 1;

    while (currentWeekStart <= endOfYear) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

      // If week extends into next year, cap it at end of year
      const actualWeekEnd = weekEnd > endOfYear ? endOfYear : weekEnd;

      periods.push({
        label: `Week ${weekNumber} ${year}`,
        startDate: new Date(currentWeekStart),
        endDate: actualWeekEnd,
        type: 'weekly',
        year,
        quarter: Math.floor(currentWeekStart.getMonth() / 3) + 1
      });

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;

      // Safety check: don't generate more than 53 weeks
      if (weekNumber > 53) break;
    }
  }

  return periods;
};

export const ALL_PERIODS = [
  ...getPeriodOptions(),
  ...generateMonthlyPeriods(2025, 2028),
  ...generateWeeklyPeriods(2025, 2028)
];
