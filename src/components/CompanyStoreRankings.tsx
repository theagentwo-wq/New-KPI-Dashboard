
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Kpi, View, Period, WeatherInfo } from '../types';
import { KPI_CONFIG } from '../constants';
import { ChevronsLeft, ChevronsRight, RotateCcw, Filter } from 'lucide-react';
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
}

// Available KPIs to display - all KPIs from the dashboard
const AVAILABLE_KPIS: Kpi[] = [
    Kpi.Sales,
    Kpi.SOP,
    Kpi.PrimeCost,
    Kpi.COGS,
    Kpi.VariableLabor,
    Kpi.TotalLabor,
    Kpi.AvgReviews,
    Kpi.CulinaryAuditScore
];

// Helper function to abbreviate large numbers
const abbreviateNumber = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
};

// Format value based on KPI type
const formatKpiValue = (kpi: Kpi, value: number | null | undefined, abbreviated: boolean = false): string => {
    if (value === null || value === undefined) return '-';
    const config = KPI_CONFIG[kpi];
    if (!config) return '-';

    if (config.format === 'currency') {
        return abbreviated ? abbreviateNumber(value) : `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (config.format === 'percent') {
        return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
};

// Medal icons for top 3
const getMedalIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
};

const RankingRow = React.memo(({
    rank, storeId, allData, visibleKpis, weather, onLocationSelect, index
}: {
    rank: number;
    storeId: string;
    allData: { actual: any; comparison?: any; variance: any; };
    visibleKpis: Kpi[];
    weather?: WeatherInfo;
    onLocationSelect?: (location: string) => void;
    index: number;
}) => {
    const medal = getMedalIcon(rank);

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
                scale: 1.01,
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                transition: { duration: 0.2 }
            }}
            className="border-b border-slate-700 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group relative"
        >
            {/* Rank */}
            <td className="py-3 px-4 text-white relative">
                {/* Animated left border accent on hover */}
                <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500"
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileHover={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                />
                <div className="flex items-center gap-2 relative z-10">
                    {medal ? (
                        <>
                            <motion.span
                                className="text-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: index * 0.03 + 0.2
                                }}
                            >
                                {medal}
                            </motion.span>
                            <span className="text-sm font-semibold">{rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}</span>
                        </>
                    ) : (
                        <span className="text-sm">{rank}th</span>
                    )}
                </div>
            </td>

            {/* Location with weather icon */}
            <td className="py-3 px-4 text-white">
                <div className="flex items-center gap-2">
                    {weather && (
                        <div className="relative group">
                            <WeatherIcon condition={weather.condition} className="w-5 h-5" />
                            {/* Weather tooltip */}
                            <div className="absolute left-0 top-full mt-1 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                <div className="font-semibold">{weather.temperature}°F</div>
                                <div>{weather.description}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => onLocationSelect?.(storeId)}
                        className="font-medium hover:text-cyan-400 transition-colors cursor-pointer text-left"
                    >
                        {storeId}
                    </button>
                </div>
            </td>

            {/* KPI Columns */}
            {visibleKpis.map(kpi => {
                const config = KPI_CONFIG[kpi];
                if (!config) return null;

                const actualValue = allData?.actual?.[kpi];
                const comparisonValue = allData?.comparison?.[kpi];
                const varianceValue = allData?.variance?.[kpi];

                const hasVariance = varianceValue !== undefined && varianceValue !== null;
                const variancePercent = hasVariance && comparisonValue !== 0
                    ? ((varianceValue / comparisonValue) * 100).toFixed(1)
                    : '0.0';

                return (
                    <React.Fragment key={kpi}>
                        {/* Actual */}
                        <td className="py-3 px-4 text-white font-semibold text-sm">
                            {formatKpiValue(kpi, actualValue, true)}
                        </td>
                        {/* vs. PP */}
                        <td className="py-3 px-4 text-slate-400 text-sm">
                            {formatKpiValue(kpi, comparisonValue, true)}
                        </td>
                        {/* Variance */}
                        <td className="py-3 px-4 text-slate-400 text-sm">
                            {hasVariance ? `${variancePercent}%` : '0.0%'}
                        </td>
                    </React.Fragment>
                );
            })}
        </motion.tr>
    );
});

export const CompanyStoreRankings: React.FC<CompanyStoreRankingsProps> = ({
    data, period, periodType, setPeriodType, comparisonMode, setComparisonMode,
    onPrevPeriod, onNextPeriod, isPrevPeriodDisabled,
    isNextPeriodDisabled, onResetView, weatherData, onLocationSelect
}) => {
    const [visibleKpis, setVisibleKpis] = useState<Kpi[]>(AVAILABLE_KPIS);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const sortedStoreIds = useMemo(() => {
        // Sort by Sales (primary ranking KPI)
        return Object.keys(data).sort((a, b) => {
            const valA = data[a]?.actual?.[Kpi.Sales] ?? -Infinity;
            const valB = data[b]?.actual?.[Kpi.Sales] ?? -Infinity;
            return valB - valA; // Higher sales = better rank
        });
    }, [data]);

    const toggleKpiVisibility = (kpi: Kpi) => {
        setVisibleKpis(prev =>
            prev.includes(kpi)
                ? prev.filter(k => k !== kpi)
                : [...prev, kpi]
        );
    };

    // Format period label (e.g., "W48 FY2025 (Nov 24)")
    const formatPeriodLabel = (): string => {
        const date = period.startDate;
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();

        if (periodType === 'Week') {
            // Calculate week number
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
            const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
            return `W${weekNum} FY${period.year} (${month} ${day})`;
        }

        return period.label;
    };

    return (
        <div className="bg-slate-800/50 rounded-lg">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-xl">Store Rankings</h3>

                    <div className="flex items-center gap-3">
                        {/* Period Type Tabs */}
                        <div className="flex bg-slate-900/70 rounded-lg overflow-hidden border border-slate-700">
                            {['Week', 'Month', 'Quarter', 'Year'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setPeriodType(type)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        periodType === type
                                            ? 'bg-cyan-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Period Selector */}
                    <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg">
                        <button
                            onClick={onPrevPeriod}
                            disabled={isPrevPeriodDisabled}
                            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <div className="px-4 py-2 min-w-[200px] text-center">
                            <p className="font-bold text-white text-sm whitespace-nowrap">{formatPeriodLabel()}</p>
                        </div>
                        <button
                            onClick={onNextPeriod}
                            disabled={isNextPeriodDisabled}
                            className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Comparison Mode */}
                        <select
                            value={comparisonMode}
                            onChange={(e) => setComparisonMode(e.target.value)}
                            className="bg-slate-700 text-white text-sm rounded-md px-3 py-2 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="vs. Prior Period">vs. Prior Period</option>
                            <option value="vs. Last Year">vs. Last Year</option>
                            <option value="vs. Budget">vs. Budget</option>
                        </select>

                        {/* KPI Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md border border-slate-600 transition-colors"
                            >
                                <Filter size={16} />
                                <span className="text-sm">Filter KPIs</span>
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[200px] max-h-[400px] overflow-y-auto">
                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Select KPIs</p>
                                        {AVAILABLE_KPIS.map(kpi => (
                                            <label key={kpi} className="flex items-center gap-2 py-2 hover:bg-slate-700/50 px-2 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleKpis.includes(kpi)}
                                                    onChange={() => toggleKpiVisibility(kpi)}
                                                    className="w-4 h-4 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <span className="text-sm text-white">{KPI_CONFIG[kpi]?.label || kpi}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={onResetView}
                            className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                            title="Reset View"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(8 * 56px + 48px)' }}>
                <table className="w-full">
                    <thead className="bg-slate-900 sticky top-0 z-10">
                        <tr className="border-b border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-left uppercase">Rank</th>
                            <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-left uppercase">Location</th>
                            {visibleKpis.map(kpi => (
                                <React.Fragment key={kpi}>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-left uppercase">{KPI_CONFIG[kpi]?.label || kpi} Act.</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-left uppercase">vs. PP</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-left uppercase">Var.</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStoreIds.map((storeId, index) => {
                            const storeData = data[storeId];
                            return (
                                <RankingRow
                                    key={storeId}
                                    rank={index + 1}
                                    storeId={storeId}
                                    allData={storeData}
                                    visibleKpis={visibleKpis}
                                    weather={weatherData?.[storeId]}
                                    onLocationSelect={onLocationSelect}
                                    index={index}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
