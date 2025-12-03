
import React, { useState } from 'react';
import { Kpi, DirectorProfile, Goal } from '../types';
import { KPI_CONFIG, DASHBOARD_KPIS } from '../constants';
import { X, Target } from 'lucide-react';

interface GoalSetterProps {
  director: DirectorProfile;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ director, onClose, onSave }) => {
    // Use only the KPIs that are displayed on the dashboard
    const availableKpis = DASHBOARD_KPIS;
    const currentYear = new Date().getFullYear();

    const [selectedKpi, setSelectedKpi] = useState<Kpi>(availableKpis[0]);
    const [targetValue, setTargetValue] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const handleSave = () => {
        if (!targetValue) return; // Basic validation

        const goal: Omit<Goal, 'id'> = {
            directorId: director.id,
            kpi: selectedKpi,
            target: Number(targetValue),
            quarter: selectedQuarter,
            year: selectedYear,
        };
        onSave(goal);
        onClose();
    };

    const kpiConfig = KPI_CONFIG[selectedKpi];

    // Safety check - if config doesn't exist, use defaults
    const formatType = kpiConfig?.format || 'number';
    const placeholder = formatType === 'percent' ? 'e.g., 0.25 for 25%' : 'e.g., 85000';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-md border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center"><Target size={18} className="mr-2"/>Set New Goal</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-400">Setting quarterly goal for <span className="text-white font-semibold">{director.name}</span></p>

                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Quarter</label>
                            <select
                                value={selectedQuarter}
                                onChange={e => setSelectedQuarter(Number(e.target.value))}
                                className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-white"
                            >
                                <option value={1}>Q1</option>
                                <option value={2}>Q2</option>
                                <option value={3}>Q3</option>
                                <option value={4}>Q4</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(Number(e.target.value))}
                                className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-white"
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* KPI Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Select KPI</label>
                        <select value={selectedKpi} onChange={e => setSelectedKpi(e.target.value as Kpi)} className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-white">
                            {availableKpis.map(kpi => (
                                <option key={kpi} value={kpi}>{kpi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Value */}
                    <div>
                         <label className="block text-sm font-medium text-slate-300 mb-1">
                            Target Value ({formatType})
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={targetValue}
                            onChange={e => setTargetValue(e.target.value)}
                            className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-white"
                            placeholder={placeholder}
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                    <button onClick={onClose} className="mr-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded">
                        Set Goal
                    </button>
                </div>
            </div>
        </div>
    );
};
