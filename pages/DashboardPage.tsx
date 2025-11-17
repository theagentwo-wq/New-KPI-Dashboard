import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, SavedView, DirectorProfile, Note, NoteCategory, Anomaly } from '../types';
import { KPI_CONFIG, DIRECTORS, ALL_KPIS, KPI_ICON_MAP, ALL_STORES } from '../constants';
import { getInitialPeriod, ALL_PERIODS, getPreviousPeriod, getYoYPeriod } from '../utils/dateUtils';
import { generateDataForPeriod } from '../data/mockData';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { Icon } from '../components/Icon';
import { TimeSelector } from '../components/TimeSelector';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { KPITable } from '../components/KPITable';
import { AIAssistant } from '../components/AIAssistant';
import { NotesPanel } from '../components/NotesPanel';
import { LocationInsightsModal } from '../components/LocationInsightsModal';
import { CompanyStoreRankings } from '../components/CompanyStoreRankings';
import { AnimatedNumberDisplay } from '../components/AnimatedNumberDisplay';
import { AIAlerts } from '../components/AIAlerts';
import { AnomalyDetailModal } from '../components/AnomalyDetailModal';
import { getAnomalyDetections } from '../services/geminiService';
import { ReviewAnalysisModal } from '../components/ReviewAnalysisModal';
import { PerformanceMatrix } from '../components/PerformanceMatrix';

// Helper to format values for display
const formatDisplayValue = (value: number, kpi: Kpi) => {
    if (isNaN(value)) return 'N/A';
    const config = KPI_CONFIG[kpi];
    switch(config.format) {
        case 'currency': return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        case 'percent': return `${(value * 100).toFixed(1)}%`;
        case 'number': return value.toFixed(2);
        default: return value.toString();
    }
};

// KPICard Component
interface KPICardProps {
  title: Kpi;
  value: number;
  variance: number;
}
const KPICard: React.FC<KPICardProps> = ({ title, value, variance }) => {
    const animatedValue = useAnimatedNumber(value || 0);
    const kpiConfig = KPI_CONFIG[title];
    const iconName = KPI_ICON_MAP[title];

    const getVarianceColor = (v: number) => {
        if (isNaN(v) || v === 0) return 'text-slate-400';
        const isGood = kpiConfig.higherIsBetter ? v > 0 : v < 0;
        return isGood ? 'text-green-400' : 'text-red-400';
    };

    const formatter = useCallback((v: number) => {
        return formatDisplayValue(v, title)
    }, [title]);

    return (
        <div className