
import React, { useState } from 'react';
import { Kpi, Period, DirectorProfile, Goal } from '../types';
import { KPI_CONFIG } from '../constants';
import { X, Target } from 'lucide-react';

interface GoalSetterProps {
  director: DirectorProfile;
  activePeriod: Period;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ director, activePeriod, onClose, onSave }) => {
    const kpiKeys = Object.keys(Kpi) as Kpi[];
    const [selectedKpi, setSelectedKpi] = useState<Kpi>(kpiKeys[0]);
    const [targetValue, setTargetValue] = useState('');

    const handleSave = () => {
        if (!targetValue) return; // Basic validation

        const [quarterString, yearString] = activePeriod.label.split(' ');
        const quarter = parseInt(quarterString.replace('Q', ''));
        const year = parseInt(yearString);

        const goal: Omit<Goal, 'id'> = {
            directorId: director.id,
            kpi: selectedKpi,
            target: Number(targetValue),
            quarter,
            year,
        };
        onSave(goal);
        onClose();
    };

    const kpiConfig = KPI_CONFIG[selectedKpi];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-sm border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center"><Target size={18} className="mr-2"/>Set New Goal</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-400">Setting goal for {director.name} for the period {activePeriod.label}.</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Select KPI</label>
                        <select value={selectedKpi} onChange={e => setSelectedKpi(e.target.value as Kpi)} className="w-full bg-slate-800 border-slate-700 rounded-md p-2">
                            {kpiKeys.map(kpi => (
                                <option key={kpi} value={kpi}>{kpi}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-300 mb-1">
                            Target Value ({kpiConfig.format})
                        </label>
                        <input 
                            type="number" 
                            value={targetValue}
                            onChange={e => setTargetValue(e.target.value)}
                            className="w-full bg-slate-800 border-slate-700 rounded-md p-2"
                            placeholder={kpiConfig.format === 'percent' ? 'e.g., 0.25 for 25%' : 'e.g., 85000'}
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
