import React, { useState, useMemo } from 'react';
import { Kpi, PerformanceData } from '../types';
import { KPI_CONFIG, ALL_KPIS } from '../constants';
import { Icon } from './Icon';
import { getMockWeather, Weather } from '../utils/weatherUtils';

interface KPITableProps {
  data: {
    [storeId: string]: {
      actual: PerformanceData;
      comparison?: PerformanceData; // Made optional to prevent crashes
      variance: PerformanceData;
    }
  };
  comparisonLabel: string;
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

const getVarianceColor = (variance: number, kpi: Kpi) => {
    if (isNaN(variance) || variance === 0) return 'text-slate-400';
    const { higherIsBetter } = KPI_CONFIG[kpi];
    const isGood = higherIsBetter ? variance > 0 : variance < 0;
    return isGood ? 'text-green-400' : 'text-red-400';
};

const getValueColor = (value: number, kpi: Kpi) => {
    const { baseline } = KPI_CONFIG[kpi];
    if (baseline === undefined || isNaN(value)) return 'text-slate-200';
    return value >= baseline ? 'text-green-400' : 'text-red-400';
}

export const KPITable: React.FC<KPITableProps> = ({ data, comparisonLabel, onLocationSelect }) => {
    const [visibleKPIs, setVisibleKPIs] = useState<Kpi[]>(ALL_KPIS);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const storeIds = useMemo(() => Object.keys(data), [data]);
    const weatherData = useMemo(() => {
        const weather: { [key: string]: Weather } = {};
        storeIds.forEach(id => {
            weather[id] = getMockWeather(id);
        });
        return weather;
    }, [storeIds]);

    const toggleKPI = (kpi: Kpi) => {
        setVisibleKPIs(prev => prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]);
    };

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-400">Store Breakdown</h3>
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">
                        <Icon name="filter" className="w-5 h-5" />
                        <span>Filter KPIs</span>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-10">
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-cyan-400 uppercase bg-slate-900">
                        <tr>
                            <th scope="col" className="px-6 py-3 sticky left-0 bg-slate-900">Location</th>
                            {visibleKPIs.map(kpi => (
                                <React.Fragment key={kpi}>
                                    <th scope="col" className="px-6 py-3 text-center">{kpi} Actual</th>
                                    <th scope="col" className="px-6 py-3 text-center">{comparisonLabel}</th>
                                    <th scope="col" className="px-6 py-3 text-center">Variance</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {storeIds.map(storeId => (
                            <tr key={storeId} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap sticky left-0 bg-slate-800 hover:bg-slate-700">
                                    <div className="flex items-center gap-2">
                                        <span>{weatherData[storeId]?.icon}</span>
                                        <span>{storeId}</span>
                                        <button onClick={() => onLocationSelect(storeId)} className="text-slate-500 hover:text-cyan-400">
                                            <Icon name="ellipsis" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </th>
                                {visibleKPIs.map(kpi => (
                                    <React.Fragment key={`${storeId}-${kpi}`}>
                                        <td className={`px-6 py-4 text-center font-semibold ${getValueColor(data[storeId].actual[kpi], kpi)}`}>
                                            {formatValue(data[storeId].actual[kpi], kpi)}
                                        </td>
                                        <td className="px-6 py-4 text-center">{formatValue(data[storeId].comparison?.[kpi], kpi)}</td>
                                        <td className={`px-6 py-4 text-center font-bold ${getVarianceColor(data[storeId].variance[kpi], kpi)}`}>
                                            {formatValue(data[storeId].variance[kpi], kpi)}
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