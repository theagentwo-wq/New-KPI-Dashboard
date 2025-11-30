import React, { useState, useEffect } from 'react';
import { GoalSetter } from '../components/GoalSetter';
import { Goal, DirectorProfile, Period, Kpi } from '../types';
import { DIRECTORS } from '../constants';
import { getDefaultPeriod } from '../utils/dateUtils';
import { addGoal, getGoals } from '../services/firebaseService';
import { Target, Trash2 } from 'lucide-react';
import { KPI_CONFIG } from '../constants';

export const GoalSetterPage: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
    const [activePeriod] = useState<Period>(getDefaultPeriod());
    const [isLoading, setIsLoading] = useState(true);
    const [filterDirector, setFilterDirector] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        loadAllGoals();
    }, []);

    const loadAllGoals = async () => {
        setIsLoading(true);
        try {
            const allGoals: Goal[] = [];
            for (const director of DIRECTORS) {
                const directorGoals = await getGoals(director.id);
                allGoals.push(...directorGoals);
            }
            setGoals(allGoals);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveGoal = async (goal: Omit<Goal, 'id'>) => {
        try {
            const newGoal = await addGoal(
                goal.directorId,
                goal.quarter,
                goal.year,
                goal.kpi,
                goal.target
            );
            setGoals(prev => [newGoal, ...prev]);
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleOpenGoalSetter = (director: DirectorProfile) => {
        setSelectedDirector(director);
        setIsGoalSetterOpen(true);
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        // Note: Delete function needs to be added to firebaseService
        // For now, just remove from local state
        setGoals(prev => prev.filter(g => g.id !== goalId));
    };

    const filteredGoals = goals.filter(goal => {
        if (filterDirector !== 'all' && goal.directorId !== filterDirector) return false;
        if (goal.year !== filterYear) return false;
        return true;
    });

    const getDirectorName = (directorId: string) => {
        const director = DIRECTORS.find(d => d.id === directorId);
        return director?.name || directorId;
    };

    const formatValue = (kpi: Kpi, value: number) => {
        const config = KPI_CONFIG[kpi];
        if (config.format === 'percent') {
            return `${(value * 100).toFixed(1)}%`;
        } else if (config.format === 'currency') {
            return `$${(value / 1000).toFixed(0)}k`;
        } else {
            return value.toFixed(1);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Target className="text-cyan-400" size={32} />
                        Goal Setter
                    </h1>
                    <p className="text-slate-400 mt-1">Set and track quarterly KPI goals for directors</p>
                </div>
            </div>

            {/* Director Cards - Quick Create Goal */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Set New Goal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DIRECTORS.map(director => (
                        <button
                            key={director.id}
                            onClick={() => handleOpenGoalSetter(director)}
                            className="bg-slate-900 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 text-left transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {director.photo && (
                                    <img
                                        src={director.photo}
                                        alt={director.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <div className="font-bold text-white">{director.name}</div>
                                    <div className="text-sm text-slate-400">{director.title}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Director</label>
                    <select
                        value={filterDirector}
                        onChange={e => setFilterDirector(e.target.value)}
                        className="w-full bg-slate-900 border-slate-600 rounded-md p-2 text-white"
                    >
                        <option value="all">All Directors</option>
                        {DIRECTORS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Year</label>
                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(Number(e.target.value))}
                        className="w-full bg-slate-900 border-slate-600 rounded-md p-2 text-white"
                    >
                        {[2024, 2025, 2026, 2027, 2028].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Goals List */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Goals Overview</h2>

                {isLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading goals...</div>
                ) : filteredGoals.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No goals set for the selected filters. Click a director above to create one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Director</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Period</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">KPI</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Target</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGoals.map(goal => (
                                    <tr key={goal.id} className="border-b border-slate-700 hover:bg-slate-750">
                                        <td className="py-3 px-4 text-white">{getDirectorName(goal.directorId)}</td>
                                        <td className="py-3 px-4 text-slate-300">Q{goal.quarter} {goal.year}</td>
                                        <td className="py-3 px-4 text-white">{goal.kpi}</td>
                                        <td className="py-3 px-4 text-cyan-400 font-semibold">
                                            {formatValue(goal.kpi, goal.target)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900 text-blue-300">
                                                In Progress
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                                title="Delete goal"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Goal Setter Modal */}
            {isGoalSetterOpen && selectedDirector && (
                <GoalSetter
                    director={selectedDirector}
                    activePeriod={activePeriod}
                    onClose={() => setIsGoalSetterOpen(false)}
                    onSave={handleSaveGoal}
                />
            )}
        </div>
    );
};
