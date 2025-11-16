import React, { useState, useMemo } from 'react';
import { Budget, Kpi } from '../types';
import { ALL_STORES, ALL_KPIS, KPI_CONFIG } from '../constants';

interface BudgetPlannerProps {
    allBudgets: Budget[];
    onUpdateBudget: (storeId: string, year: number, month: number, kpi: Kpi, target: number) => void;
}

const fiscalYears = [2025, 2026, 2027, 2028];
const fiscalMonths = Array.from({ length: 12 }, (_, i) => i + 1);

const calculateTotals = (monthlyData: { [month: number]: number }, kpi: Kpi) => {
    const isPercent = KPI_CONFIG[kpi].format === 'percent';
    const isAverage = KPI_CONFIG[kpi].format === 'number'; // Avg Reviews should be averaged
    const totals = { q1: 0, q2: 0, q3: 0, q4: 0, year: 0 };
    let monthCounts = { q1: 0, q2: 0, q3: 0, q4: 0, year: 0 };

    fiscalMonths.forEach(m => {
        const value = monthlyData[m] || 0;
        if (value > 0) {
            if (m <= 3) { totals.q1 += value; monthCounts.q1++; }
            else if (m <= 6) { totals.q2 += value; monthCounts.q2++; }
            else if (m <= 9) { totals.q3 += value; monthCounts.q3++; }
            else { totals.q4 += value; monthCounts.q4++; }
            totals.year += value;
            monthCounts.year++;
        }
    });

    if (isPercent || isAverage) {
        totals.q1 = monthCounts.q1 > 0 ? totals.q1 / monthCounts.q1 : 0;
        totals.q2 = monthCounts.q2 > 0 ? totals.q2 / monthCounts.q2 : 0;
        totals.q3 = monthCounts.q3 > 0 ? totals.q3 / monthCounts.q3 : 0;
        totals.q4 = monthCounts.q4 > 0 ? totals.q4 / monthCounts.q4 : 0;
        totals.year = monthCounts.year > 0 ? totals.year / monthCounts.year : 0;
    }
    return totals;
};

const formatValueForDisplay = (value: number | undefined, kpi: Kpi) => {
    if (value === undefined || value === null || isNaN(value)) return '-';
    const config = KPI_CONFIG[kpi];
    switch (config.format) {
        case 'currency': return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
        case 'percent': return `${(value * 100).toFixed(1)}%`;
        case 'number': return value.toFixed(2);
        default: return value.toString();
    }
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ allBudgets, onUpdateBudget }) => {
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedStore, setSelectedStore] = useState('Total Company');

    const budgetsForStoreAndYear = useMemo(() => {
        const budgetsMap: { [kpi in Kpi]?: { [month: number]: number } } = {};
        allBudgets
            .filter(b => b.storeId === selectedStore && b.year === selectedYear)
            .forEach(b => {
                Object.entries(b.targets).forEach(([kpi, value]) => {
                    if (!budgetsMap[kpi as Kpi]) {
                        budgetsMap[kpi as Kpi] = {};
                    }
                    budgetsMap[kpi as Kpi]![b.month] = value as number;
                });
            });
        return budgetsMap;
    }, [allBudgets, selectedStore, selectedYear]);

    const handleInputChange = (kpi: Kpi, month: number, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            onUpdateBudget(selectedStore, selectedYear, month, kpi, 0);
            return;
        }

        const isPercent = KPI_CONFIG[kpi].format === 'percent';
        const storedValue = isPercent ? numValue / 100 : numValue;
        onUpdateBudget(selectedStore, selectedYear, month, kpi, storedValue);
    };
    
    const getDisplayValue = (kpi: Kpi, month: number) => {
        const value = budgetsForStoreAndYear[kpi]?.[month];
        if(value === undefined || value === null || isNaN(value)) return '';
        if (KPI_CONFIG[kpi].format === 'percent') {
            return (value * 100).toString();
        }
        return value.toString();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h1 className="text-2xl font-bold text-cyan-400 mb-4">Budget Planner</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                        {fiscalYears.map(year => <option key={year} value={year}>FY{year}</option>)}
                    </select>
                    <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="Total Company">Total Company</option>
                        {ALL_STORES.map(store => <option key={store} value={store}>{store}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400 border-collapse">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-900">
                            <tr>
                                <th className="p-3 sticky left-0 bg-slate-900 z-10">KPI</th>
                                {fiscalMonths.map(m => <th key={m} className="p-3 text-center">P{m}</th>)}
                                <th className="p-3 text-center font-bold bg-slate-700">Q1</th>
                                <th className="p-3 text-center font-bold bg-slate-700">Q2</th>
                                <th className="p-3 text-center font-bold bg-slate-700">Q3</th>
                                <th className="p-3 text-center font-bold bg-slate-700">Q4</th>
                                <th className="p-3 text-center font-extrabold bg-slate-600">Year</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {ALL_KPIS.map(kpi => {
                                const monthlyData = budgetsForStoreAndYear[kpi] || {};
                                const totals = calculateTotals(monthlyData, kpi);
                                return (
                                    <tr key={kpi} className="hover:bg-slate-700">
                                        <td className="p-2 font-semibold text-slate-200 sticky left-0 bg-slate-800 hover:bg-slate-700">{kpi}</td>
                                        {fiscalMonths.map(m => (
                                            <td key={m} className="p-0">
                                                <input
                                                    type="number"
                                                    value={getDisplayValue(kpi, m)}
                                                    onChange={e => handleInputChange(kpi, m, e.target.value)}
                                                    className="w-24 bg-transparent text-center p-2 rounded-md focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                    placeholder={KPI_CONFIG[kpi].format === 'percent' ? '%' : '$'}
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 text-center font-bold text-slate-200 bg-slate-700">{formatValueForDisplay(totals.q1, kpi)}</td>
                                        <td className="p-3 text-center font-bold text-slate-200 bg-slate-700">{formatValueForDisplay(totals.q2, kpi)}</td>
                                        <td className="p-3 text-center font-bold text-slate-200 bg-slate-700">{formatValueForDisplay(totals.q3, kpi)}</td>
                                        <td className="p-3 text-center font-bold text-slate-200 bg-slate-700">{formatValueForDisplay(totals.q4, kpi)}</td>
                                        <td className="p-3 text-center font-extrabold text-white bg-slate-600">{formatValueForDisplay(totals.year, kpi)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};