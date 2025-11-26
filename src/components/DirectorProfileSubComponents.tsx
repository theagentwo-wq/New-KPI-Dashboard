
import React from 'react';
import { DirectorProfile, Store, Goal } from '../types';
import { Trophy, TrendingUp } from 'lucide-react';

// Re-exporting DirectorProfileModalProps to avoid circular dependencies
// A better long-term solution would be to define this in a shared types file.
interface DirectorProfileModalProps {
    director: DirectorProfile | null;
    topStore: Store | null;
    directorGoals: Goal[];
    kpiData: any;
}

export const DirectorInfo: React.FC<{ director: DirectorProfile }> = ({ director }) => (
    <div className="flex flex-col items-center text-center mb-6">
        <img src={director.photo} alt={director.name} className="w-28 h-28 rounded-full border-4 border-cyan-400 object-cover shadow-lg mb-4"/>
        <h2 className="text-2xl font-bold text-white">{director.name}</h2>
        <p className="text-md text-cyan-300">{director.title}</p>
        <div className="mt-4 text-left bg-slate-900/50 p-4 rounded-lg w-full text-sm">
            <h3 className="font-semibold text-slate-300 text-base mb-3 border-b border-slate-700 pb-2">Details</h3>
            <p className="text-slate-400 mb-1"><strong className="font-medium text-slate-300">Email:</strong> <a href={`mailto:${director.email}`} className='text-cyan-400 hover:underline'>{director.email}</a></p>
            <p className="text-slate-400 mb-1"><strong className="font-medium text-slate-300">Phone:</strong> {director.phone}</p>
            <p className="text-slate-400"><strong className="font-medium text-slate-300">Home:</strong> {director.homeLocation}</p>
        </div>
    </div>
);

export const RegionStores: React.FC<{ stores: {id: string, name: string}[] }> = ({ stores }) => (
    <div className="mb-6 bg-slate-900/50 p-4 rounded-lg w-full text-sm">
        <h3 className="font-semibold text-slate-300 text-base mb-3 border-b border-slate-700 pb-2">Region Stores</h3>
        <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2">
            {stores.map(store => (
                <p key={store.id} className="text-slate-400 py-1">{store.name}</p>
            ))}
        </div>
    </div>
);

export const GoalsAndPerformance: React.FC<DirectorProfileModalProps> = ({ topStore, directorGoals }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg w-full text-sm flex-grow">
        <h3 className="font-semibold text-slate-300 text-base mb-3 border-b border-slate-700 pb-2">Goals & Performance</h3>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-slate-400 mb-2 flex items-center"><Trophy size={16} className="mr-2 text-yellow-400"/>Top Performing Store (by Sales)</h4>
                <div className="bg-slate-800 p-3 rounded-md">
                    {topStore ? (
                        <p className='font-bold text-cyan-400 text-center text-lg'>{topStore.name}</p>
                    ) : (
                        <p className='text-slate-500 text-center text-xs'>Data unavailable</p>
                    )}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-slate-400 mb-2">Active Q4 Goals</h4>
                <div className="space-y-2">
                    {directorGoals.length > 0 ? directorGoals.map(goal => (
                       <div key={goal.id} className="text-xs text-slate-400">- {goal.kpi}: {goal.targetValue}</div>
                    )) : (
                       <div className="text-xs text-slate-500 p-3 bg-slate-800 rounded-md text-center">No goals set.</div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export const AIPerformanceSnapshot: React.FC<DirectorProfileModalProps> = (props) => (
    <div className="bg-slate-900/50 p-4 rounded-lg w-full h-full flex flex-col justify-center items-center">
        <h3 className="font-semibold text-slate-300 text-base mb-3">AI Performance Snapshot</h3>
        <p className="text-slate-400 text-center mb-4 max-w-sm">
            Get an AI-powered summary of this director's performance for W48 FY2025 (Nov 24).
        </p>
        <button className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center transition-colors"><TrendingUp size={16} className="mr-2"/> Generate Snapshot</button>
    </div>
);
