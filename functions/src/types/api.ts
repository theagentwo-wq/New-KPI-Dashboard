/**
 * API Request/Response Types
 * TypeScript definitions for all API endpoints
 */

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Request payloads for each endpoint
export interface GetInsightsRequest {
  data: Record<string, any>;
  view: string;
  period: string;
  prompt: string;
}

export interface GetExecutiveSummaryRequest {
  data: Record<string, any>;
  view: string;
  period: any;
}

export interface GetReviewSummaryRequest {
  locationName: string;
  reviews: any[];
}

export interface GetLocationMarketAnalysisRequest {
  locationName: string;
}

export interface GenerateHuddleBriefRequest {
  locationName: string;
  performanceData: Record<string, any>;
  audience: 'FOH' | 'BOH' | 'Manager';
  weather: any;
}

export interface GetSalesForecastRequest {
  locationName: string;
  weatherForecast: any[];
  historicalData: any;
}

export interface GetMarketingIdeasRequest {
  locationName: string;
  userLocation: { latitude: number; longitude: number } | null;
}

export interface GetNoteTrendsRequest {
  notes: any[];
}

export interface GetAnomalyDetectionsRequest {
  allStoresData: Record<string, any>;
  periodLabel: string;
}

export interface GetAnomalyInsightsRequest {
  anomaly: any;
  data: Record<string, any>;
}

export interface GetVarianceAnalysisRequest {
  location: string;
  kpi: string;
  variance: number;
  allKpis: Record<string, any>;
}

export interface RunWhatIfScenarioRequest {
  data: any;
  prompt: string;
}

export interface GetStrategicExecutiveAnalysisRequest {
  kpi: string;
  period: string;
  companyTotal: string;
  directorPerformance: { name: string; value: string }[];
  anchorStores: { store: string; value: string }[];
}

export interface GetDirectorPerformanceSnapshotRequest {
  directorId: string;
  period: any;
}

export interface StartStrategicAnalysisJobRequest {
  mode: string;
  period: any;
  view: string;
  [key: string]: any;
}

export interface ChatWithStrategyRequest {
  context: string;
  userQuery: string;
  mode: string;
}

export interface StartTaskRequest {
  model?: string;
  prompt: string;
  files?: Array<{
    filePath: string;
    mimeType: string;
    displayName: string;
  }>;
  taskType?: string;
}
