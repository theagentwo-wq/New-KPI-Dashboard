export enum Kpi {
  Sales = 'Sales',
  Guests = 'Guests',
  Labor = 'Labor%',
  SOP = 'SOP%',
  AvgTicket = 'Avg Ticket',
  PrimeCost = 'Prime Cost',
  AvgReviews = 'Avg Reviews',
}

export enum View {
  TotalCompany = 'Total Company',
  RegionA = 'Region A',
  RegionB = 'Region B',
  RegionC = 'Region C',
}

export enum NoteCategory {
  General = 'General',
  Operations = 'Operations',
  Marketing = 'Marketing',
  HR = 'HR',
  GuestFeedback = 'Guest Feedback',
}

export interface Period {
  startDate: Date;
  endDate: Date;
}

export interface PerformanceData {
  [Kpi.Sales]?: number;
  [Kpi.Guests]?: number;
  [Kpi.Labor]?: number;
  [Kpi.SOP]?: number;
  [Kpi.AvgTicket]?: number;
  [Kpi.PrimeCost]?: number;
  [Kpi.AvgReviews]?: number;
}

export interface StorePerformanceData {
  storeId: string;
  data: PerformanceData;
}

export interface HistoricalData {
  date: string;
  [Kpi.Sales]: number;
}

export interface Weather {
  temp: number;
  description: string;
  icon: string;
}

export type Audience = 'FOH' | 'BOH' | 'Managers';

export interface Note {
  id: string;
  monthlyPeriodLabel: string;
  timestamp: number;
  category: NoteCategory;
  content: string;
  scope: {
    view: View;
    storeId?: string;
  };
  imageDataUrl?: string;
}

export interface Anomaly {
  id: string;
  storeId: string;
  kpi: Kpi;
  value: number;
  expected: number;
  variance: number;
  periodLabel: string;
  significance: 'High' | 'Medium' | 'Low';
}

export type AnalysisMode = 'Financial' | 'Operational' | 'Marketing' | 'HR';

export interface DailyForecast {
  day: string;
  temp: number;
  icon: string;
  description: string;
}

export interface ForecastDataPoint {
    name: string;
    predictedSales: number;
    weatherIcon: string;
    weatherDescription: string;
}

export interface WeatherInfo {
    temperature: number;
    description: string;
    icon: string;
}

export interface Budget {
  storeId: string;
  year: number;
  month: number;
  targets: Partial<PerformanceData>;
}

export interface Goal {
  directorId: View; 
  quarter: number;
  year: number;
  kpi: Kpi;
  target: number;
}

export interface DirectorProfile {
    id: string;
    name: string;
    lastName: string;
    title: string;
    photo: string;
    stores: string[];
    email: string;
    phone: string;
}

export interface Deployment {
    id: string;
    directorId: string;
    type: 'Training' | 'Mentorship' | 'Performance Turnaround' | 'New Store Opening';
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    stores: string[];
    description: string;
    createdAt: number; // Timestamp
}
