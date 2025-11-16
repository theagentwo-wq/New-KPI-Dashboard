import { StorePerformanceData, Kpi, Budget, Goal } from '../types';
import { ALL_STORES, DIRECTORS } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';
import { addDays } from 'date-fns';

const getRandomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateMockPerformanceData = (): StorePerformanceData[] => {
  const data: StorePerformanceData[] = [];
  const weeklyPeriods = ALL_PERIODS.filter(p => p.type === 'Week');

  for (const storeId of ALL_STORES) {
    for (const period of weeklyPeriods) {
      const foodCost = getRandomInRange(0.28, 0.34);
      const laborCost = getRandomInRange(0.25, 0.32);
      data.push({
        storeId,
        weekStartDate: period.startDate,
        data: {
          [Kpi.Sales]: getRandomInRange(25000, 75000),
          [Kpi.SOP]: getRandomInRange(0.1, 0.25),
          [Kpi.PrimeCost]: foodCost + laborCost + getRandomInRange(-0.02, 0.02),
          [Kpi.AvgReviews]: getRandomInRange(3.8, 4.9),
          [Kpi.FoodCost]: foodCost,
          [Kpi.LaborCost]: laborCost,
          [Kpi.VariableLabor]: getRandomInRange(0.14, 0.20),
          [Kpi.CulinaryAuditScore]: getRandomInRange(0.85, 0.98),
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
          [Kpi.Sales]: getRandomInRange(120000, 300000),
          [Kpi.SOP]: getRandomInRange(0.12, 0.22),
          [Kpi.PrimeCost]: getRandomInRange(0.58, 0.65),
          [Kpi.AvgReviews]: 4.5,
          [Kpi.FoodCost]: getRandomInRange(0.29, 0.32),
          [Kpi.LaborCost]: getRandomInRange(0.26, 0.30),
          [Kpi.VariableLabor]: getRandomInRange(0.15, 0.18),
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
            target: getRandomInRange(0.18, 0.23),
        });
    }
  }
  return goals;
};