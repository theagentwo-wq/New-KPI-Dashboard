import { addDays, addWeeks, format, getYear } from 'date-fns';
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
    periods.push({ type: 'Year', label: `FY${year}`, startDate: yearStartDate, endDate: yearEndDate });
    let currentWeekStart = yearStartDate;
    const monthLengths = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
    let monthCounter = 1;
    let quarterCounter = 1;
    for (let q = 0; q < 4; q++) {
        const quarterStartDate = currentWeekStart;
        const quarterWeeks = monthLengths[q*3] + monthLengths[q*3+1] + monthLengths[q*3+2];
        const quarterEndDate = addDays(addWeeks(quarterStartDate, quarterWeeks), -1);
        periods.push({ type: 'Quarter', label: `Q${quarterCounter} FY${year}`, startDate: quarterStartDate, endDate: quarterEndDate });
        for (let m = 0; m < 3; m++) {
            const monthStartDate = currentWeekStart;
            const monthWeeks = monthLengths[q*3+m];
            const monthEndDate = addDays(addWeeks(monthStartDate, monthWeeks), -1);
            periods.push({ type: 'Month', label: `P${monthCounter} FY${year}`, startDate: monthStartDate, endDate: monthEndDate });
            for(let w = 0; w < monthWeeks; w++){
                const weekStartDate = currentWeekStart;
                const weekEndDate = addDays(addWeeks(weekStartDate, 1), -1);
                 periods.push({ type: 'Week', label: `Week of ${format(weekStartDate, 'MMM d, yyyy')}`, startDate: weekStartDate, endDate: weekEndDate });
                currentWeekStart = addWeeks(currentWeekStart, 1);
            }
            monthCounter++;
        }
        quarterCounter++;
    }
  }
  return periods;
};

export const ALL_PERIODS = generateFiscalPeriods(2023, 2028);

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

export const getMonthlyPeriodForDate = (date: Date): Period | undefined => {
    return ALL_PERIODS.find(p => p.type === 'Month' && date >= p.startDate && date <= p.endDate);
};

// --- NEW Holiday Awareness Logic ---

// Function to get the Nth day of a specific week in a month
// dayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
// week: 1=1st, 2=2nd, ..., 4=4th, 5=last
const getNthDayOfWeek = (year: number, month: number, dayOfWeek: number, week: number): Date => {
  const date = new Date(year, month, 1);
  const firstDay = date.getDay();
  let dayOffset = (dayOfWeek + 7 - firstDay) % 7 + 1;
  let day = dayOffset + (week - 1) * 7;

  if (week === 5) { // Last week of the month
      date.setMonth(date.getMonth() + 1);
      date.setDate(0); // Last day of previous month
      while (date.getDay() !== dayOfWeek) {
          date.setDate(date.getDate() - 1);
      }
      return date;
  }
  
  date.setDate(day);
  return date;
};

const getHolidaysForYear = (year: number): Map<string, string> => {
    const holidays = new Map<string, string>();

    // Fixed Date Holidays
    holidays.set(`${year}-01-01`, "New Year's Day");
    holidays.set(`${year}-07-04`, "Independence Day");
    holidays.set(`${year}-11-11`, "Veterans Day");
    holidays.set(`${year}-12-25`, "Christmas Day");

    // Floating Holidays
    // Martin Luther King, Jr. Day (Third Monday in January)
    holidays.set(format(getNthDayOfWeek(year, 0, 1, 3), 'yyyy-MM-dd'), "Martin Luther King, Jr. Day");
    // Presidents' Day (Third Monday in February)
    holidays.set(format(getNthDayOfWeek(year, 1, 1, 3), 'yyyy-MM-dd'), "Presidents' Day");
    // Memorial Day (Last Monday in May)
    holidays.set(format(getNthDayOfWeek(year, 4, 1, 5), 'yyyy-MM-dd'), "Memorial Day");
    // Juneteenth
    if (year >= 2021) holidays.set(`${year}-06-19`, "Juneteenth");
    // Labor Day (First Monday in September)
    holidays.set(format(getNthDayOfWeek(year, 8, 1, 1), 'yyyy-MM-dd'), "Labor Day");
    // Thanksgiving Day (Fourth Thursday in November)
    holidays.set(format(getNthDayOfWeek(year, 10, 4, 4), 'yyyy-MM-dd'), "Thanksgiving Day");

    return holidays;
};

// Cache holidays by year to avoid recalculating
const holidayCache: { [year: number]: Map<string, string> } = {};

export const isHoliday = (date: Date): string | null => {
    const year = getYear(date);
    if (!holidayCache[year]) {
        holidayCache[year] = getHolidaysForYear(year);
    }
    const dateString = format(date, 'yyyy-MM-dd');
    return holidayCache[year].get(dateString) || null;
};