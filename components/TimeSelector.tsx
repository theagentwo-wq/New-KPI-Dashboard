import React from 'react';
import { ComparisonMode, SavedView } from '../types';
import { Icon } from './Icon';

interface TimeSelectorProps {
  savedViews: SavedView[];
  saveCurrentView: (name: string) => void;
  loadView: (view: SavedView) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  savedViews,
  saveCurrentView,
  loadView
}) => {

    const handleSaveView = () => {
        const name = prompt("Enter a name for this view:");
        if (name) {
            saveCurrentView(name);
        }
    };

    return (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-wrap items-center justify-end gap-4">
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