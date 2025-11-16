import { addDays, addWeeks, format, getWeek } from 'date-fns';
import { Period } from '../types';

const FY2026_START_DATE = new Date('2025-12-29T00:00:00');
const WEEKS_IN_YEAR = 52;

const getFiscalYearStartDate = (year: number): Date => {
  const yearDiff = year - 2026;
  return addWeeks(FY2026_START_DATE, yearDiff * WEEKS_IN_YEAR);
};

export const generateFiscalPeriods = (startYear: number, endYear: number): Period[] => {
  const periods: Period[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const yearStartDate = getFiscalYearStartDate(year);
    const yearEndDate = addDays(addWeeks(yearStartDate, 52), -1);

    periods.push({
      type: 'Year',
      label: `FY${year}`,
      startDate: yearStartDate,
      endDate: yearEndDate,
    });

    let currentWeekStart = yearStartDate;
    const monthLengths = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
    let monthCounter = 1;
    let quarterCounter = 1;

    for (let q = 0; q < 4; q++) {
        const quarterStartDate = currentWeekStart;
        const quarterWeeks = monthLengths[q*3] + monthLengths[q*3+1] + monthLengths[q*3+2];
        const quarterEndDate = addDays(addWeeks(quarterStartDate, quarterWeeks), -1);
         periods.push({
            type: 'Quarter',
            label: `Q${quarterCounter} FY${year}`,
            startDate: quarterStartDate,
            endDate: quarterEndDate,
        });

        for (let m = 0; m < 3; m++) {
            const monthStartDate = currentWeekStart;
            const monthWeeks = monthLengths[q*3+m];
            const monthEndDate = addDays(addWeeks(monthStartDate, monthWeeks), -1);
            periods.push({
                type: 'Month',
                label: `P${monthCounter} FY${year}`,
                startDate: monthStartDate,
                endDate: monthEndDate,
            });

            for(let w = 0; w < monthWeeks; w++){
                const weekStartDate = currentWeekStart;
                const weekEndDate = addDays(addWeeks(weekStartDate, 1), -1);
                 periods.push({
                    type: 'Week',
                    label: `Week of ${format(weekStartDate, 'MMM d, yyyy')}`,
                    startDate: weekStartDate,
                    endDate: weekEndDate,
                });
                currentWeekStart = addWeeks(currentWeekStart, 1);
            }
            monthCounter++;
        }
        quarterCounter++;
    }
  }
  return periods;
};

export const ALL_PERIODS = generateFiscalPeriods(2025, 2028);

export const getPreviousPeriod = (currentPeriod: Period): Period | undefined => {
    const periodsOfType = ALL_PERIODS.filter(p => p.type === currentPeriod.type);
    const currentIndex = periodsOfType.findIndex(p => p.label === currentPeriod.label);
    return currentIndex > 0 ? periodsOfType[currentIndex - 1] : undefined;
};

export const getYoYPeriod = (currentPeriod: Period): Period | undefined => {
    const yearMatch = currentPeriod.label.match(/FY(\d{4})/);
    if (!yearMatch) return undefined;

    const currentYear = parseInt(yearMatch[1], 10);
    const prevYear = currentYear - 1;
    const prevYearLabel = currentPeriod.label.replace(`FY${currentYear}`, `FY${prevYear}`);
    
    return ALL_PERIODS.find(p => p.label === prevYearLabel);
};

export const getInitialPeriod = (): Period => {
    const today = new Date();
    return ALL_PERIODS.find(p => p.type === 'Week' && today >= p.startDate && today <= p.endDate) 
        || ALL_PERIODS.find(p => p.type === 'Week')!;
};