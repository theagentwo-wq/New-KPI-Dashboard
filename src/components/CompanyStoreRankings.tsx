
import React, { useMemo, useCallback } from 'react';
import { Kpi, View, Period, WeatherInfo } from '../types';
import { KPI_CONFIG } from '../constants';
import { ChevronsLeft, ChevronsRight, RotateCcw, BarChart, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

interface CompanyStoreRankingsProps {
    data: { [storeId: string]: { actual: any; comparison?: any; variance: any; } };
    selectedKpi: Kpi;
    currentView: View;
    period: Period;
    periodType: string;
    setPeriodType: (type: string) => void;
    comparisonMode: string;
    setComparisonMode: (mode: string) => void;
    onLocationSelect: (location: string) => void;
    onReviewClick: (location: string) => void;
    onPrevPeriod: () => void;
    onNextPeriod: () => void;
    isPrevPeriodDisabled: boolean;
    isNextPeriodDisabled: boolean;
    onResetView: () => void;
    weatherData?: { [storeId: string]: WeatherInfo };
    onFetchWeather?: (storeId: string) => void;
}

const RankingRow = React.memo(({
    rank, storeId, kpi, actualValue, varianceValue, onLocationSelect, onReviewClick, onFetchWeather, weather
}: {
    rank: number;
    storeId: string;
    kpi: Kpi;
    actualValue: number;
    varianceValue?: number;
    onLocationSelect: (loc: string) => void;
    onReviewClick: (loc: string) => void;
    onFetchWeather?: (storeId: string) => void;
    weather?: WeatherInfo;
}) => {
    const kpiConfig = KPI_CONFIG[kpi];
    if (!kpiConfig) return null;

    const formatValue = (value: number) => {
        if (kpiConfig.format === 'currency') return `$${(value / 1).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        if (kpiConfig.format === 'percent') return `${(value * 100).toFixed(1)}%`;
        return value.toFixed(2);
    };

    const hasVariance = varianceValue !== undefined && varianceValue !== null;
    const isPositiveVariance = hasVariance && varianceValue! > 0;
    const isNegativeVariance = hasVariance && varianceValue! < 0;

    const varianceColor = () => {
        if (!hasVariance) return 'text-slate-500';
        const positiveIsGood = kpiConfig.higherIsBetter;
        if ((positiveIsGood && isPositiveVariance) || (!positiveIsGood && isNegativeVariance)) return 'text-green-400';
        return 'text-red-400';
    };

    return (
        <tr 
            className="bg-slate-800 hover:bg-slate-700/50 transition-colors duration-150 group"
            onMouseEnter={() => onFetchWeather?.(storeId)}
        >
            <td className="p-3 text-sm text-slate-400 font-medium whitespace-nowrap">#{rank}</td>
            <td className="p-3 text-sm font-semibold text-white whitespace-nowrap">{storeId}</td>
            <td className="p-3 text-sm text-right font-mono text-cyan-300 whitespace-nowrap">{formatValue(actualValue)}</td>
            <td className={`p-3 text-sm text-right font-mono whitespace-nowrap flex items-center justify-end ${varianceColor()}`}>
                {hasVariance ? (
                    <>
                        {isPositiveVariance ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                        {formatValue(varianceValue!)}
                    </>
                ) : (
                    <span className="text-slate-600">-</span>
                )}
            </td>
            <td className="p-3 text-center">
                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     {weather && <WeatherIcon condition={weather.condition} className="w-5 h-5" />}
                </div>
            </td>
            <td className="p-3 text-right">
                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onLocationSelect(storeId)} className="p-1.5 rounded-md bg-slate-600/50 hover:bg-slate-600 text-white" title="View Location Insights">
                        <BarChart size={16}/>
                    </button>
                    <button onClick={() => onReviewClick(storeId)} className="p-1.5 rounded-md bg-slate-600/50 hover:bg-slate-600 text-white" title="Analyze Customer Reviews">
                        <Zap size={16}/>
                    </button>
                </div>
            </td>
        </tr>
    )
});

export const CompanyStoreRankings: React.FC<CompanyStoreRankingsProps> = ({ 
    data, selectedKpi, period, periodType, setPeriodType, comparisonMode, setComparisonMode,
    onLocationSelect, onReviewClick, onPrevPeriod, onNextPeriod, isPrevPeriodDisabled,
    isNextPeriodDisabled, onResetView, weatherData, onFetchWeather
}) => {

    const sortedStoreIds = useMemo(() => {
        const kpiConfig = KPI_CONFIG[selectedKpi];
        if (!kpiConfig) return [];
        return Object.keys(data).sort((a, b) => {
            const valA = data[a]?.actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
            const valB = data[b]?.actual[selectedKpi] ?? (kpiConfig.higherIsBetter ? -Infinity : Infinity);
            return kpiConfig.higherIsBetter ? valB - valA : valA - valB;
        });
    }, [data, selectedKpi]);
    
    const kpiConfig = KPI_CONFIG[selectedKpi];
    if (!kpiConfig) return null;

    const handleFetchWeather = useCallback((storeId: string) => {
        if (onFetchWeather) {
            onFetchWeather(storeId);
        }
    }, [onFetchWeather]);

    return (
        <div className="bg-slate-800/50 rounded-lg">
            <div className="p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white text-lg">{kpiConfig.label} Rankings</h3>
                    <p className="text-sm text-slate-400">Comparing performance across all locations.</p>
                </div>
                 <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg p-1">
                    <button onClick={onPrevPeriod} disabled={isPrevPeriodDisabled} className="px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"><ChevronsLeft size={18} /></button>
                    <div className="text-center px-4">
                        <p className="font-bold text-white text-sm whitespace-nowrap">{period.label}</p>
                        <p className="text-xs text-slate-400">{periodType}</p>
                    </div>
                    <button onClick={onNextPeriod} disabled={isNextPeriodDisabled} className="px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"><ChevronsRight size={18} /></button>
                </div>
            </div>

            <div className="p-4 bg-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300">Compare:</span>
                     <select value={comparisonMode} onChange={(e) => setComparisonMode(e.target.value)} className="bg-slate-700 text-white text-sm rounded-md p-2 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="vs. Prior Period">vs. Prior Period</option>
                        <option value="vs. Last Year">vs. Last Year</option>
                        <option value="vs. Budget">vs. Budget</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-slate-300">Period Type:</span>
                     <select value={periodType} onChange={e => setPeriodType(e.target.value)} className="bg-slate-700 text-white text-sm rounded-md p-2 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500">
                        <option>Week</option>
                        <option>Month</option>
                        <option>Quarter</option>
                        <option>Year</option>
                    </select>
                </div>
                <button onClick={onResetView} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors flex items-center gap-2" title="Reset to default view">
                    <RotateCcw size={16} />
                    <span className="text-sm">Reset View</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-left whitespace-nowrap">Rank</th>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-left whitespace-nowrap">Location</th>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-right whitespace-nowrap">Actual</th>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-right whitespace-nowrap">{comparisonMode.replace('vs. ', '')} Var.</th>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-center whitespace-nowrap">Weather</th>
                            <th className="p-3 text-xs font-semibold text-slate-400 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStoreIds.map((storeId, index) => {
                            const storeData = data[storeId];
                            const actualValue = storeData?.actual?.[selectedKpi];
                            
                            if (actualValue === undefined || actualValue === null) return null;

                            return (
                                <RankingRow 
                                    key={storeId} 
                                    rank={index + 1}
                                    storeId={storeId}
                                    kpi={selectedKpi}
                                    actualValue={actualValue}
                                    varianceValue={storeData?.variance?.[selectedKpi]}
                                    onLocationSelect={onLocationSelect}
                                    onReviewClick={onReviewClick}
                                    onFetchWeather={handleFetchWeather}
                                    weather={weatherData?.[storeId]}
                                />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};