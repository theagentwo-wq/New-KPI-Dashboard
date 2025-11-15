import React from 'react';
import { Kpi, PerformanceData } from '../types';
import { KPI_CONFIG } from '../constants';
import { Icon } from './Icon';
import { getMockWeather, Weather } from '../utils/weatherUtils';

interface CompanyStoreRankingsProps {
  data: { [storeId: string]: PerformanceData };
  selectedKpi: Kpi;
  onLocationSelect: (location: string) => void;
}

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

export const CompanyStoreRankings: React.FC<CompanyStoreRankingsProps> = ({ data, selectedKpi, onLocationSelect }) => {
    const higherIsBetter = KPI_CONFIG[selectedKpi].higherIsBetter;

    const rankedStores = React.useMemo(() => {
        return Object.entries(data)
            .filter(([, storeData]) => storeData && storeData[selectedKpi] !== undefined)
            .sort(([, a], [, b]) => {
                const valA = a[selectedKpi];
                const valB = b[selectedKpi];
                return higherIsBetter ? valB - valA : valA - valB;
            });
    }, [data, selectedKpi, higherIsBetter]);
    
    const weatherData = React.useMemo(() => {
        const weather: { [key: string]: Weather } = {};
        rankedStores.forEach(([id]) => {
            weather[id] = getMockWeather(id);
        });
        return weather;
    }, [rankedStores]);

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4">
                <h3 className="text-lg font-bold text-cyan-400">All Stores Ranked by {selectedKpi}</h3>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-cyan-400 uppercase bg-slate-900 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Rank</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3 text-right">{selectedKpi}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedStores.map(([storeId, storeData], index) => (
                            <tr key={storeId} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                                <td className="px-6 py-4 font-bold text-slate-200">{index + 1}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-2 font-medium text-slate-200">
                                        <span>{weatherData[storeId]?.icon}</span>
                                        <span>{storeId}</span>
                                        <button onClick={() => onLocationSelect(storeId)} className="text-slate-500 hover:text-cyan-400">
                                            <Icon name="ellipsis" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-200">
                                    {formatValue(storeData[selectedKpi], selectedKpi)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};