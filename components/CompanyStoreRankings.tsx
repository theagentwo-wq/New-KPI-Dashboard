import React, { useState, useMemo } from 'react';
import { Kpi, PerformanceData } from '../types';
import { KPI_CONFIG, ALL_KPIS } from '../constants';
import { Icon } from './Icon';
import { getMockWeather, Weather } from '../utils/weatherUtils';

interface CompanySnapshotProps {
  data: {
    [storeId: string]: {
      actual: PerformanceData;
      comparison?: PerformanceData;
      variance: PerformanceData;
    }
  };
  comparisonLabel: string;
  onLocationSelect: (location: string) => void;
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
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
        case 'percent':
            return `${(value * 100).toFixed(1)}%`;
        case 'number':
            return value.toFixed(2);
        default:
            return value.toString();
    }
};

const getVarianceColor = (variance: number, kpi: Kpi) => {
    if (isNaN(variance) || variance === 0) return 'text-slate-400';
    const { higherIsBetter } = KPI_CONFIG[kpi];
    const isGood = higherIsBetter ? variance > 0 : variance < 0;
    return isGood ? 'text-green-400' : 'text-red-400';
};

export const CompanyStoreRankings: React.FC<CompanySnapshotProps> = ({ data, comparisonLabel, onLocationSelect }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: Kpi.Sales, direction: 'descending' });

    const sortedStores = useMemo(() => {
        // FIX: Explicitly type storeArray to ensure correct type inference for sorting and mapping.
        const storeArray: [string, typeof data[string]][] = Object.entries(data);
        if (sortConfig !== null) {
            storeArray.sort(([, a], [, b]) => {
                const aValue = a.actual[sortConfig.key] || 0;
                const bValue = b.actual[sortConfig.key] || 0;
                
                let order = 1;
                if (sortConfig.direction === 'descending') {
                    order = KPI_CONFIG[sortConfig.key].higherIsBetter ? 1 : -1;
                } else {
                    order = KPI_CONFIG[sortConfig.key].higherIsBetter ? -1 : 1;
                }

                if (aValue < bValue) return -1 * order;
                if (aValue > bValue) return 1 * order;
                return 0;
            });
        }
        return storeArray;
    }, [data, sortConfig]);

    const requestSort = (key: Kpi) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (kpi: Kpi) => {
        if (!sortConfig || sortConfig.key !== kpi) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    
    const weatherData = useMemo(() => {
        const weather: { [key: string]: Weather } = {};
        Object.keys(data).forEach(id => {
            weather[id] = getMockWeather(id);
        });
        return weather;
    }, [data]);

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4">
                <h3 className="text-lg font-bold text-cyan-400">Company Snapshot</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-cyan-400 uppercase bg-slate-900 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-slate-900 z-20">Location</th>
                            {ALL_KPIS.map(kpi => (
                                <React.Fragment key={kpi}>
                                    <th scope="col" className="px-6 py-3 text-center cursor-pointer hover:bg-slate-700" onClick={() => requestSort(kpi)}>
                                        {kpi} Actual {getSortIndicator(kpi)}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center">{comparisonLabel}</th>
                                    <th scope="col" className="px-6 py-3 text-center">Variance</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStores.map(([storeId, storeData]) => (
                            <tr key={storeId} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap sticky left-0 bg-slate-800 hover:bg-slate-700 z-10">
                                    <div className="flex items-center gap-2">
                                        <span>{weatherData[storeId]?.icon}</span>
                                        <span>{storeId}</span>
                                        <button onClick={() => onLocationSelect(storeId)} className="text-slate-500 hover:text-cyan-400">
                                            <Icon name="ellipsis" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </th>
                                {ALL_KPIS.map(kpi => (
                                    <React.Fragment key={`${storeId}-${kpi}`}>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-200">
                                            {formatValue(storeData.actual[kpi], kpi)}
                                        </td>
                                        <td className="px-6 py-4 text-center">{formatValue(storeData.comparison?.[kpi], kpi)}</td>
                                        <td className={`px-6 py-4 text-center font-bold ${getVarianceColor(storeData.variance[kpi], kpi)}`}>
                                            {formatValue(storeData.variance[kpi], kpi)}
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