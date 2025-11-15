

import React from 'react';
import { Period, ComparisonMode, SavedView, View } from '../types';
import { Icon } from './Icon';

interface TimeSelectorProps {
  period: Period;
  setPeriod: (period: Period) => void;
  comparisonMode: ComparisonMode;
  setComparisonMode: (mode: ComparisonMode) => void;
  periodType: 'Week' | 'Month' | 'Quarter' | 'Year';
  setPeriodType: (type: 'Week' | 'Month' | 'Quarter' | 'Year') => void;
  onPrev: () => void;
  onNext: () => void;
  savedViews: SavedView[];
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedView) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  period,
  setPeriod,
  comparisonMode,
  setComparisonMode,
  periodType,
  setPeriodType,
  onPrev,
  onNext,
  savedViews,
  saveCurrentView,
  loadView
}) => {
    const periodTypes: ('Week' | 'Month' | 'Quarter' | 'Year')[] = ['Week', 'Month', 'Quarter', 'Year'];
    const comparisonModes: ComparisonMode[] = ['vs. Budget', 'vs. Prior Period', 'vs. Last Year'];

    const handleSaveView = () => {
        const name = prompt("Enter a name for this view:");
        if (name) {
            saveCurrentView(name);
        }
    };

    return (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            {/* Period Type Selector */}
            <div className="flex items-center bg-slate-900 rounded-md p-1">
                {periodTypes.map(type => (
                    <button key={type} onClick={() => setPeriodType(type)} className={`px-3 py-1 text-sm font-semibold rounded ${periodType === type ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {type}
                    </button>
                ))}
            </div>

            {/* Period Navigation */}
            <div className="flex items-center gap-2">
                <button onClick={onPrev} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronLeft" className="w-5 h-5" /></button>
                <div className="text-center font-semibold text-cyan-400 w-48">{period.label}</div>
                <button onClick={onNext} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronRight" className="w-5 h-5" /></button>
            </div>

            {/* Comparison Mode Selector */}
            <div>
                 <select value={comparisonMode} onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                    {comparisonModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                    ))}
                </select>
            </div>
            
            {/* Saved Views */}
            <div className="flex items-center gap-2">
                 <button onClick={handleSaveView} className="flex items-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">
                     <Icon name="bookmark" className="w-5 h-5" />
                     <span>Save View</span>
                 </button>
                 {savedViews.length > 0 && (
                     <select onChange={(e) => loadView(JSON.parse(e.target.value))} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                         <option>Load View...</option>
                         {savedViews.map(sv => (
                             <option key={sv.name} value={JSON.stringify(sv)}>{sv.name}</option>
                         ))}
                     </select>
                 )}
            </div>
        </div>
    );
};