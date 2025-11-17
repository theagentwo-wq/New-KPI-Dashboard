import React, { useState, useMemo, useEffect } from 'react';
import { Kpi, PerformanceData, WeatherInfo, View, Period, ComparisonMode } from '../types';
import { KPI_CONFIG, ALL_KPIS } from '../constants';
import { Icon } from './Icon';
import { getWeatherForLocation } from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { VarianceExplainer } from './VarianceExplainer';

interface CompanySnapshotProps {
  data: {
    [storeId: string]: {
      actual: PerformanceData;
      comparison?: PerformanceData;
      variance: PerformanceData;
    }
  };
  currentView: View;
  period: Period;
  periodType: 'Week' | 'Month' | 'Quarter' | 'Year';
  setPeriodType: (type: 'Week' | 'Month' | 'Quarter' | 'Year') => void;
  onPrev: () => void;
  onNext: () => void;
  comparisonMode: ComparisonMode;
  setComparisonMode: (mode: ComparisonMode) => void;
  onLocationSelect: (location: string) => void;
  onReviewClick: (location: string) => void;
}

type SortConfig = {
    key: Kpi;
    direction: 'ascending' | 'descending';
} | null;

const formatValue = (value: number | undefined, kpi: Kpi) => {
    if (value == null || isNaN(value)) return '-';
    const config = KPI_CONFIG[kpi];
    switch (config.format) {
        case 'currency':
             if (Math.abs(value) >= 1000) {
                return `${(value / 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
            }
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        case 'percent':
            return `${(value * 100).toFixed(1)}%`;
        case 'number':
            return value.toFixed(2);
        default:
            return value.toString();
    }
};

const getAbbreviatedLabel = (comparisonMode: ComparisonMode) => {
    if (comparisonMode === 'vs. Prior Period') return 'vs. PP';
    if (comparisonMode === 'vs. Last Year') return 'vs. LY';
    if (comparisonMode === 'vs. Budget') return 'vs. Bud';
    return comparisonMode;
};

const getVarianceColor = (variance: number, kpi: Kpi) => {
    if (isNaN(variance) || variance === 0) return 'text-slate-400';
    const { higherIsBetter } = KPI_CONFIG[kpi];
    const isGood = higherIsBetter ? variance > 0 : variance < 0;
    return isGood ? 'text-green-400' : 'text-red-400';
};

const getValueColor = (value: number | undefined, kpi: Kpi) => {
    if (value === undefined) return 'text-slate-200';
    const { baseline } = KPI_CONFIG[kpi];
    if (baseline === undefined || isNaN(value)) return 'text-slate-200';
    return value >= baseline ? 'text-green-400' : 'text-red-400';
}

const getRankIndicator = (rank: number) => {
    switch (rank) {
        case 1: return <div className="flex items-center justify-center gap-1 text-yellow-400"><Icon name="trophy" className="w-5 h-5" /> <span>1st</span></div>;
        case 2: return <div className="flex items-center justify-center gap-1 text-slate-300"><Icon name="trophy" className="w-5 h-5" /> <span>2nd</span></div>;
        case 3: return <div className="flex items-center justify-center gap-1 text-orange-400"><Icon name="trophy" className="w-5 h-5" /> <span>3rd</span></div>;
        default: return <span className="text-slate-400">{rank}th</span>;
    }
};

const defaultVisibleKPIs = [Kpi.Sales, Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews];

export const CompanyStoreRankings: React.FC<CompanySnapshotProps> = ({ 
    data, currentView, period, periodType, setPeriodType, onPrev, onNext, comparisonMode, setComparisonMode, onLocationSelect, onReviewClick 
}) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: Kpi.Sales, direction: 'descending' });
    const [visibleKPIs, setVisibleKPIs] = useState<Kpi[]>(defaultVisibleKPIs);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherInfo | null }>({});
    const storeIds = useMemo(() => Object.keys(data), [data]);

    const periodTypes: ('Week' | 'Month' | 'Quarter' | 'Year')[] = ['Week', 'Month', 'Quarter', 'Year'];
    const comparisonModes: ComparisonMode[] = ['vs. Budget', 'vs. Prior Period', 'vs. Last Year'];

     useEffect(() => {
        const fetchAllWeather = async () => {
            const weatherPromises = storeIds.map(id => getWeatherForLocation(id));
            const weatherResults = await Promise.all(weatherPromises);
            const newWeatherData: { [key: string]: WeatherInfo | null } = {};
            storeIds.forEach((id, index) => {
                newWeatherData[id] = weatherResults[index];
            });
            setWeatherData(newWeatherData);
        };

        if (storeIds.length > 0) {
            fetchAllWeather();
        }
    }, [storeIds]);

    const sortedStores = useMemo(() => {
        const storeArray: [string, typeof data[string]][] = Object.entries(data);
        if (sortConfig !== null) {
            storeArray.sort(([, a], [, b]) => {
                const aValue = a.actual[sortConfig.key] || 0;
                const bValue = b.actual[sortConfig.key] || 0;
                
                const higherIsBetter = KPI_CONFIG[sortConfig.key].higherIsBetter;
                
                let comparison = 0;
                if (aValue > bValue) {
                    comparison = 1;
                } else if (aValue < bValue) {
                    comparison = -1;
                }

                if (!higherIsBetter) {
                    comparison *= -1;
                }

                if (sortConfig.direction === 'descending') {
                    comparison *= -1;
                }

                return comparison;
            });
        }
        return storeArray;
    }, [data, sortConfig]);

    const requestSort = (key: Kpi) => {
        let direction: 'ascending' | 'descending' = 'descending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (kpi: Kpi) => {
        if (!sortConfig || sortConfig.key !== kpi) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }

    const toggleKPI = (kpi: Kpi) => {
        setVisibleKPIs(prev => prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]);
    };

    const title = useMemo(() => {
        if (currentView === 'Total Company') return 'Total Company Snapshot';
        return `${currentView}'s Area Snapshot`;
    }, [currentView]);

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">{title}</h3>
                     <div className="flex items-center bg-slate-900 rounded-md p-1">
                        {periodTypes.map(type => (
                            <button key={type} onClick={() => setPeriodType(type)} className={`px-3 py-1 text-sm font-semibold rounded ${periodType === type ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={onPrev} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronLeft" className="w-5 h-5" /></button>
                        <div className="text-center font-semibold text-cyan-400 w-48">{period.label}</div>
                        <button onClick={onNext} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronRight" className="w-5 h-5" /></button>
                    </div>
                     <div className="flex items-center gap-4">
                        <select value={comparisonMode} onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                            {comparisonModes.map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">
                                <Icon name="filter" className="w-5 h-5" />
                                <span>Filter KPIs</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20">
                                    {ALL_KPIS.map(kpi => (
                                        <label key={kpi} className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer">
                                            <input type="checkbox" checked={visibleKPIs.includes(kpi)} onChange={() => toggleKPI(kpi)} className="mr-2 h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500" />
                                            {kpi}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>
                 </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-cyan-400 uppercase bg-slate-900 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-2 py-3 sticky left-0 bg-slate-900 z-30 text-center">Rank</th>
                            <th scope="col" className="px-2 py-3 sticky left-16 bg-slate-900 z-20">Location</th>
                            {visibleKPIs.map(kpi => (
                                <React.Fragment key={kpi}>
                                    <th scope="col" className="px-2 py-3 text-center cursor-pointer hover:bg-slate-700" onClick={() => requestSort(kpi)}>
                                        {kpi} Act. {getSortIndicator(kpi)}
                                    </th>
                                    <th scope="col" className="px-2 py-3 text-center">{getAbbreviatedLabel(comparisonMode)}</th>
                                    <th scope="col" className="px-2 py-3 text-center">Var.</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStores.map(([storeId, storeData], index) => (
                            <tr key={storeId} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                                <td className="px-2 py-3 font-bold text-center sticky left-0 bg-slate-800 hover:bg-slate-700 z-10">
                                    {getRankIndicator(index + 1)}
                                </td>
                                <th scope="row" className="px-2 py-3 font-medium text-slate-200 whitespace-nowrap sticky left-16 bg-slate-800 hover:bg-slate-700 z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="group relative flex items-center">
                                            <WeatherIcon condition={weatherData[storeId]?.condition || 'loading'} />
                                            {weatherData[storeId] && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-slate-900 border border-slate-700 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                                                    <p className="font-bold text-white">{weatherData[storeId]?.temperature}°F - {weatherData[storeId]?.shortForecast}</p>
                                                    <p className="text-slate-400 font-normal">{weatherData[storeId]?.detailedForecast}</p>
                                                </div>
                                            )}
                                        </div>
                                        <span>{storeId}</span>
                                        <button onClick={() => onLocationSelect(storeId)} className="text-slate-500 hover:text-cyan-400">
                                            <Icon name="ellipsis" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </th>
                                {visibleKPIs.map(kpi => (
                                    <React.Fragment key={`${storeId}-${kpi}`}>
                                        <td className={`px-2 py-3 text-center font-semibold ${getValueColor(storeData.actual[kpi], kpi)}`}>
                                            {kpi === Kpi.AvgReviews ? (
                                                <button onClick={() => onReviewClick(storeId)} className="hover:underline hover:text-cyan-400">
                                                    {formatValue(storeData.actual[kpi], kpi)}
                                                </button>
                                            ) : (
                                                formatValue(storeData.actual[kpi], kpi)
                                            )}
                                        </td>
                                        <td className="px-2 py-3 text-center">{formatValue(storeData.comparison?.[kpi], kpi)}</td>
                                        <td className={`px-2 py-3 text-center font-bold ${getVarianceColor(storeData.variance[kpi], kpi)}`}>
                                            <div className="flex items-center justify-center">
                                                <span>{formatValue(storeData.variance[kpi], kpi)}</span>
                                                <VarianceExplainer 
                                                    storeId={storeId}
                                                    kpi={kpi}
                                                    variance={storeData.variance[kpi]}
                                                    allKpis={storeData.actual}
                                                />
                                            </div>
                                        </td>
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};