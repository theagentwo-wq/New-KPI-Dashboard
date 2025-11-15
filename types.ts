export enum Kpi {
  Sales = 'Sales',
  SOP = 'SOP', // Store Operating Profit
  PrimeCost = 'Prime Cost',
  AvgReviews = 'Avg. Reviews',
  FoodCost = 'Food Cost',
  LaborCost = 'Labor Cost',
  VariableLabor = 'Variable Labor',
  CulinaryAuditScore = 'Culinary Audit Score'
}

export type PerformanceData = {
  [key in Kpi]: number;
};

export interface StorePerformanceData {
  storeId: string;
  weekStartDate: Date;
  data: PerformanceData;
}

export interface Period {
  type: 'Week' | 'Month' | 'Quarter' | 'Year';
  label: string;
  startDate: Date;
  endDate: Date;
}

export type ComparisonMode = 'vs. Budget' | 'vs. Prior Period' | 'vs. Last Year';

export type View = 'Total Company' | 'Danny' | 'Heather' | 'Ryan' | 'Robert';

export interface Budget {
  storeId: string;
  month: number; // 1-12
  year: number;
  targets: PerformanceData;
}

export interface DirectorProfile {
  id: View;
  name: string;
  title: string;
  stores: string[];
  photo: string;
  bio: string;
}

export interface Goal {
  directorId: View;
  quarter: number; // 1-4
  year: number;
  kpi: Kpi;
  target: number;
}

export interface SavedView {
  name: string;
  period: Period;
  view: View;
  comparisonMode: ComparisonMode;
}

export type NoteCategory = 'Marketing' | 'Staffing' | 'Reviews' | 'Facilities' | 'General';

export interface Note {
  id: string;
  periodLabel: string;
  view: View;
  storeId?: string; // Optional: for store-specific notes
  category: NoteCategory;
  content: string;
}