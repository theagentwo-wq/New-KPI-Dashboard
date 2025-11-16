import { StorePerformanceData, Kpi, Budget, Goal, Period } from '../types';
import { ALL_STORES, DIRECTORS } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';

// A simple deterministic random number generator based on a seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateDataForPeriod = (period: Period): StorePerformanceData[] => {
  const data: StorePerformanceData[] = [];
  // Find all weekly periods that are fully contained within the given period
  const weeklyPeriodsInPeriod = ALL_PERIODS.filter(p => p.type === 'Week' && p.startDate >= period.startDate && p.endDate <= period.endDate);

  for (const storeId of ALL_STORES) {
    for (const week of weeklyPeriodsInPeriod) {
      // Create a unique, deterministic seed for each store and week
      const seed = storeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + week.startDate.getTime();
      
      const getRandomInRange = (min: number, max: number, offset: number = 0) => {
        return seededRandom(seed + offset) * (max - min) + min;
      };

      const foodCost = getRandomInRange(0.28, 0.34, 1);
      const laborCost = getRandomInRange(0.25, 0.32, 2);
      
      data.push({
        storeId,
        weekStartDate: week.startDate,
        data: {
          [Kpi.Sales]: getRandomInRange(25000, 75000, 3),
          [Kpi.SOP]: getRandomInRange(0.1, 0.25, 4),
          [Kpi.PrimeCost]: foodCost + laborCost + getRandomInRange(-0.02, 0.02, 5),
          [Kpi.AvgReviews]: getRandomInRange(3.8, 4.9, 6),
          [Kpi.FoodCost]: foodCost,
          [Kpi.LaborCost]: laborCost,
          [Kpi.VariableLabor]: getRandomInRange(0.14, 0.20, 7),
          [Kpi.CulinaryAuditScore]: getRandomInRange(0.85, 0.98, 8),
        },
      });
    }
  }
  return data;
};

export const generateMockBudgets = (): Budget[] => {
  const budgets: Budget[] = [];
  const monthlyPeriods = ALL_PERIODS.filter(p => p.type === 'Month');

  for (const storeId of ALL_STORES) {
    for (const period of monthlyPeriods) {
        const yearMatch = period.label.match(/FY(\d{4})/);
        const periodMatch = period.label.match(/P(\d+)/);
        if(!yearMatch || !periodMatch) continue;

      budgets.push({
        storeId,
        year: parseInt(yearMatch[1], 10),
        month: parseInt(periodMatch[1], 10),
        targets: {
          [Kpi.Sales]: seededRandom(1) * (300000 - 120000) + 120000,
          [Kpi.SOP]: seededRandom(2) * (0.22 - 0.12) + 0.12,
          [Kpi.PrimeCost]: seededRandom(3) * (0.65 - 0.58) + 0.58,
          [Kpi.AvgReviews]: 4.5,
          [Kpi.FoodCost]: seededRandom(4) * (0.32 - 0.29) + 0.29,
          [Kpi.LaborCost]: seededRandom(5) * (0.30 - 0.26) + 0.26,
          [Kpi.VariableLabor]: seededRandom(6) * (0.18 - 0.15) + 0.15,
          [Kpi.CulinaryAuditScore]: 0.92,
        },
      });
    }
  }
  return budgets;
};

export const generateMockGoals = (): Goal[] => {
  const goals: Goal[] = [];
  const quarterlyPeriods = ALL_PERIODS.filter(p => p.type === 'Quarter');

  for (const director of DIRECTORS) {
    for (const period of quarterlyPeriods) {
        const yearMatch = period.label.match(/FY(\d{4})/);
        const quarterMatch = period.label.match(/Q(\d)/);
        if(!yearMatch || !quarterMatch) continue;
      
        goals.push({
            directorId: director.id,
            year: parseInt(yearMatch[1], 10),
            quarter: parseInt(quarterMatch[1], 10),
            kpi: Kpi.SOP,
            target: seededRandom(10) * (0.23 - 0.18) + 0.18,
        });
    }
  }
  return goals;
};