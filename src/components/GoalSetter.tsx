import React, { useState, useMemo } from 'react';
import { Goal, Kpi, View } from '../types';
import { DIRECTORS, ALL_KPIS } from '../constants';

interface GoalSetterProps {
    goals: Goal[];
    onSetGoal: (directorId: View, quarter: number, year: number, kpi: Kpi, target: number) => void;
}

const fiscalYears = [2025, 2026, 2027, 2028];
const quarters = [1, 2, 3, 4];

export const GoalSetter: React.FC<GoalSetterProps> = ({ goals, onSetGoal }) => {
    const [selectedDirector, setSelectedDirector] = useState<View>(DIRECTORS[0].id);
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedQuarter, setSelectedQuarter] = useState(1);
    const [selectedKpi, setSelectedKpi] = useState<Kpi>(Kpi.SOP);
    const [targetValue, setTargetValue] = useState('');

    const handleSetGoal = () => {
        const target = parseFloat(targetValue);
        if (isNaN(target)) {
            alert("Please enter a valid target value.");
            return;
        }
        onSetGoal(selectedDirector, selectedQuarter, selectedYear, selectedKpi, target);
        setTargetValue('');
    };
    
    const filteredGoals = useMemo(() => {
        return goals.filter(g => g.year === selectedYear);
    }, [goals, selectedYear]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
                <h1 className="text-2xl font-bold text-cyan-400 mb-4">Set New Goal</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Director</label>
                        <select value={selectedDirector} onChange={e => setSelectedDirector(e.target.value as View)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                            {DIRECTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Quarter</label>
                        <select value={selectedQuarter} onChange={e => setSelectedQuarter(parseInt(e.target.value))} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                            {quarters.map(q => <option key={q} value={q}>Q{q} {selectedYear}</option>)}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">KPI</label>
                        <select value={selectedKpi} onChange={e => setSelectedKpi(e.target.value as Kpi)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                            {ALL_KPIS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                     <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Target Value</label>
                        <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 0.18 for 18%" />
                    </div>
                    <div className="lg:col-span-1">
                        <button onClick={handleSetGoal} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
                            Set Goal
                        </button>
                    </div>
                </div>
            </div>
            
             <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-cyan-400">Existing Goals</h2>
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                        {fiscalYears.map(year => <option key={year} value={year}>FY{year}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-900">
                            <tr>
                                <th className="p-3">Director</th>
                                <th className="p-3">Quarter</th>
                                <th className="p-3">KPI</th>
                                <th className="p-3">Target</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredGoals.map((goal, index) => (
                                <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700">
                                    <td className="p-3 font-medium text-slate-200">{goal.directorId}</td>
                                    <td className="p-3">Q{goal.quarter} {goal.year}</td>
                                    <td className="p-3">{goal.kpi}</td>
                                    <td className="p-3 font-semibold text-white">{goal.target}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredGoals.length === 0 && <p className="text-center p-4 text-slate-500">No goals set for FY{selectedYear}.</p>}
                </div>
            </div>
        </div>
    );
};