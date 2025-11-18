export enum Kpi {
  Sales = 'Sales',
  SOP = 'SOP', // Store Operating Profit
  PrimeCost = 'Prime Cost',
  AvgReviews = 'Avg. Reviews',
  FoodCost = 'Food Cost',
  VariableLabor = 'Variable Labor',
  CulinaryAuditScore = 'Culinary Audit Score'
}

export type PerformanceData = {
  [key in Kpi]?: number; // Make properties optional
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
  lastName: string;
  email: string;
  phone: string;
  title: string;
  stores: string[];
  photo: string;
  bio: string;
  homeLocation: string;
}

export interface Goal {
  directorId: View;
  quarter: number; // 1-4
  year: number;
  kpi: Kpi;
  target: number;
}

export type NoteCategory = 'Marketing' | 'Staffing' | 'Reviews' | 'Facilities' | 'General';

export interface Note {
  id: string;
  monthlyPeriodLabel: string;
  view: View;
  storeId?: string; // Optional: for store-specific notes
  category: NoteCategory;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Anomaly {
  id: string;
  location: string;
  kpi: Kpi;
  deviation: number;
  periodLabel: string;
  summary: string;
  analysis: string;
}

export interface ForecastDataPoint {
    date: string;
    predictedSales: number;
    weatherIcon?: string;
    weatherDescription?: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy' | 'thunderstorm' | 'loading';

export interface WeatherInfo {
  condition: WeatherCondition;
  temperature: number;
  shortForecast: string;
  detailedForecast: string;
}

export interface DailyForecast {
    date: string;
    condition: WeatherCondition;
    temperature: number;
    shortForecast: string;
}

export interface StoreDetails {
  address: string;
  lat: number;
  lon: number;
}

export interface SavedView {
  name: string;
  period: Period;
  view: View;
  comparisonMode: ComparisonMode;
  periodType: 'Week' | 'Month' | 'Quarter' | 'Year';
}

export interface DataMappingTemplate {
  id: string;
  name: string;
  headers: string[]; // The headers from the original file
  mappings: { [header: string]: Kpi | 'Store Name' | 'Week Start Date' | 'Year' | 'Month' | 'ignore' };
}