
export enum Kpi {
  Sales = 'Sales',
  Guests = 'Guests',
  Labor = 'Labor%',
  SOP = 'SOP',  // Changed from 'SOP%' to match Firebase
  AvgTicket = 'Avg Ticket',
  PrimeCost = 'Prime Cost',
  AvgReviews = 'Avg. Reviews',  // Changed from 'Avg Reviews' to match Firebase (with dot)
  COGS = 'COGS',  // Changed from 'Food Cost' to match horizontal CSV parser
  VariableLabor = 'Variable Labor',
  TotalLabor = 'Total Labor',  // New KPI for Total Labor percentage
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
  GuestFeedback = 'Culinary',
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
  year: number;
  quarter: number;
  weekNumber?: number;        // Week number within fiscal period (1-5)
  periodLabel?: string;       // Parent fiscal period label (e.g., 'FY2026 P12')
}

export type PerformanceData = {
    [key in Kpi]?: number;
};

export interface StorePerformanceData {
  storeId: string;
  year: number;
  month: number;
  day: number;
  data: PerformanceData;
  pnl?: FinancialLineItem[];
  weekStartDate?: string;
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
  category: NoteCategory;
  content: string;
  scope: {
    view: View;
    storeId?: string;
  };
  imageUrl?: string;
  createdAt: string;
  pinned?: boolean;  // Phase 2: Pin important notes
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

export enum AnalysisMode {
    General = 'General',
    Financial = 'Financial',
    Operational = 'Operational',
    Marketing = 'Marketing',
    HR = 'HR',
}

export interface DailyForecast {
  day: string;
  temp: number;
  icon: string;
  description: string;
  date: string;
  condition: WeatherCondition;
  temperature: number;
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
  directorId: string;
  quarter: number;
  year: number;
  kpi: Kpi;
  target: number; 
  targetValue?: number;
  endDate?: string;
}

export interface DirectorProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  photo: string;
  stores: string[];
  email: string;
  phone: string;
  homeLocation: string;
  homeLat: number;
  homeLon: number;
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
  createdAt: string;
  deployedPerson: string;
  destination: string;
  purpose: string;
  estimatedBudget: number;
  status?: string;
}

export interface DataItem {
  id: string;
  value: number;
  name: string;
  actual: any;
  comparison?: any;
  variance: any;
  [key: string]: any;
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
  variance?: number;
  category: string;
  indent?: number;
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

export type FirebaseStatus = 
  | { status: 'initializing'; error?: null; message?: string; }
  | { status: 'connected'; error?: null; message?: string; }
  | { status: 'error'; error: string; message?: string; };

export interface User {
    id: string;
    name: string;
}

export interface KpiConfig {
    label: string;
    format: 'currency' | 'number' | 'percent';
    higherIsBetter: boolean;
    baseline?: number;
    aggregation: 'sum' | 'avg';
}

export interface KPISummaryCardsProps {
    data: PerformanceData;
    selectedKpi: Kpi;
    onKpiSelect: (kpi: Kpi) => void;
    period: Period;
    view: View;
}


export interface AnomalyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    anomaly: Anomaly | undefined;
    data: { [storeId: string]: DataItem };
}

type ImportStep = 'upload' | 'guided-paste' | 'pending' | 'processing' | 'verify' | 'finished' | 'error';

interface ExtractedData {
    dataType: 'Actuals' | 'Budget';
    data: any[];
    sourceName: string;
    isDynamicSheet?: boolean;
}

export interface ActiveJob {
    id: string;
    step: ImportStep;
    statusLog: string[];
    progress: { current: number; total: number };
    errors: string[];
    extractedData: ExtractedData[];
}

export interface Store {
    id: string;
    name: string;
}
