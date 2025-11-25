export enum Kpi {
  Sales = 'Sales',
  Guests = 'Guests',
  Labor = 'Labor%',
  SOP = 'SOP%',
  AvgTicket = 'Avg Ticket',
  PrimeCost = 'Prime Cost',
  AvgReviews = 'Avg Reviews',
  FoodCost = 'Food Cost',
  VariableLabor = 'Variable Labor',
  CulinaryAuditScore = 'Culinary Audit Score',
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
  Staffing = 'Staffing',
  Facilities = 'Facilities',
  Reviews = 'Reviews',
}

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type PeriodOption = 'Day' | 'Week' | 'Month' | 'Quarter' | 'Year';

export interface Period {
  startDate: Date;
  endDate: Date;
  label: string;
  type: PeriodType;
}

export interface PerformanceData {
  [key: string]: number | undefined;
}

export interface StorePerformanceData {
  storeId: string;
  data: PerformanceData;
  pnl?: FinancialLineItem[];
  weekStartDate?: string; // Added for firebaseService compatibility
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
  imageUrl?: string;
  createdAt: number;
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
  summary: string;
  deviation: number;
  location: string;
  analysis?: string;
}

export type AnalysisMode = 'Financial' | 'Operational' | 'Marketing' | 'HR' | 'General';

export interface DailyForecast {
  day: string;
  temp: number;
  icon: string;
  description: string;
  date: string;
  condition: WeatherCondition; // Added for weatherService compatibility
}

export interface ForecastDataPoint {
  name: string;
  predictedSales: number;
  weatherIcon: string;
  weatherDescription: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'windy' | 'thunderstorm' | 'loading';

export interface WeatherInfo {
  temperature: number;
  description: string;
  condition: WeatherCondition;
  shortForecast: string;
  detailedForecast: string;
}

export interface Budget {
  storeId: string;
  year: number;
  month: number;
  targets: Partial<PerformanceData>;
}

export interface Goal {
  id: string;
  directorId: View;
  quarter: number;
  year: number;
  kpi: Kpi;
  target: number; 
  targetValue?: number; // Added for compatibility
  endDate?: string; // Added for compatibility
}

export interface DirectorProfile {
  id: string;
  name: string;       // Changed from firstName
  lastName: string;
  title: string;
  photo: string;
  stores: string[];
  email: string;
  phone: string;
  homeLocation: string;
  yearlyTravelBudget: number;
  bio: string;
}

export enum DeploymentType {
  Training = 'Training',
  Mentorship = 'Mentorship',
  PerformanceTurnaround = 'Performance Turnaround',
  NewStoreOpening = 'New Store Opening',
}

export interface Deployment {
  id: string;
  directorId: string;
  type: DeploymentType;
  startDate: string;
  endDate: string;
  stores: string[];
  description: string;
  createdAt: number;
  deployedPerson: string;
  destination: string;
  purpose: string;
  estimatedBudget: number;
  status?: string; // Added for compatibility
}

export interface DataItem {
  id: string;
  value: number;
  name: string;
  actual?: PerformanceData | number;      // Added for compatibility
  aggregated?: PerformanceData | number; // Added for compatibility
}

export interface StoreDetails {
  address: string;
  lat: number;
  lon: number;
}

export interface FinancialLineItem {
  name: string;
  actual: number;
  budget: number;
  variance: number; // Added missing property
  category: string;
  indent?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  kpis: Kpi[];
}

export interface FileUploadResult {
  filePath: string;
  uploadId: string;
  mimeType: string;
  fileName: string;
  fileUrl: string;
}

export type ComparisonMode = 'vs. Prior Period' | 'vs. Last Year' | 'vs. Budget';

export interface DataMappingTemplate {
  id: string;
  name: string;
  mapping: { [key: string]: string };
}

export interface FirebaseStatus {
  status: 'initializing' | 'connected' | 'error';
  error?: string;
}

export interface User {
    // Define user properties if needed, left empty as it's unused for now
    id: string;
    name: string;
}
