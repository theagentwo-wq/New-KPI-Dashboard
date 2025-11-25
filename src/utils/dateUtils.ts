is taking a long time
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
    endDate: new Date(currentYear, currentQuarter * 3, 0)
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
    endDate: new Date(prevQuarterYear, prevQuarter * 3, 0)
  });

  // Year-to-Date
  periods.push({
    label: `YTD ${currentYear}`,
    startDate: new Date(currentYear, 0, 1),
    endDate: today
  });

  // Last 90 Days
  const last90 = new Date();
  last90.setDate(today.getDate() - 90);
  periods.push({
    label: 'Last 90 Days',
    startDate: last90,
    endDate: today
  });

  return periods;
};
