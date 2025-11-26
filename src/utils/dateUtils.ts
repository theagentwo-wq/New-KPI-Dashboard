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

export const ALL_PERIODS = getPeriodOptions();

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
