import React from 'react';
import { Icon } from './Icon';
import { DirectorProfile, View } from '../types';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: 'Dashboard' | 'Budget Planner' | 'Goal Setter' | 'News') => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  directors: DirectorProfile[];
  onOpenProfile: (director: DirectorProfile) => void;
  onOpenDataEntry: () => void;
  onOpenScenarioModeler: () => void;
  onOpenImageUploader: () => void;
}

const NavLink: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-700'
    }`}
  >
    <Icon name={icon} className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const DirectorLink: React.FC<{
    director?: DirectorProfile;
    label: string;
    isActive: boolean;
    onClick: () => void;
    onInfoClick: (e: React.MouseEvent) => void;
}> = ({ director, label, isActive, onClick, onInfoClick }) => (
    <div className={`w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md transition-colors text-sm ${ isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50' }`}>
        <button onClick={onClick} className="flex items-center gap-3 flex-1">
            {director && <img src={director.photo} alt={director.name} className="w-6 h-6 rounded-full object-cover" />}
            <span>{label}</span>
        </button>
        {director && (
             <button onClick={onInfoClick} className="p-1 rounded-full hover:bg-slate-600 text-slate-500 hover:text-white">
                <Icon name="info" className="w-4 h-4" />
            </button>
        )}
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, currentView, setCurrentView, directors, onOpenProfile, onOpenDataEntry, onOpenScenarioModeler, onOpenImageUploader }) => {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col p-4 space-y-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <img src="https://i.postimg.cc/k43r5bZ0/tupelo-honey-logo.png" alt="Tupelo Honey Logo" className="h-10" />
        <h1 className="text-lg font-bold text-white">Ops Dashboard</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
            <NavLink icon="dashboard" label="Dashboard" isActive={currentPage === 'Dashboard'} onClick={() => setCurrentPage('Dashboard')} />
            <NavLink icon="budget" label="Budget Planner" isActive={currentPage === 'Budget Planner'} onClick={() => setCurrentPage('Budget Planner')} />
            <NavLink icon="goal" label="Goal Setter" isActive={currentPage === 'Goal Setter'} onClick={() => setCurrentPage('Goal Setter')} />
            <NavLink icon="news" label="Industry News" isActive={currentPage === 'News'} onClick={() => setCurrentPage('News')} />
        </div>
        
        {/* Director Navigation */}
        <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Directors</h3>
            <div className="space-y-1">
                 <DirectorLink 
                    label="Total Company"
                    isActive={currentView === 'Total Company'}
                    onClick={() => setCurrentView('Total Company')}
                    onInfoClick={() => {}}
                />
                {directors.map(dir => (
                    <DirectorLink 
                        key={dir.id}
                        director={dir}
                        label={dir.name}
                        isActive={currentView === dir.id}
                        onClick={() => setCurrentView(dir.id)}
                        onInfoClick={(e) => {
                            e.stopPropagation();
                            onOpenProfile(dir);
                        }}
                    />
                ))}
            </div>
        </div>
      </nav>

      {/* Action Panel */}
      <div className="space-y-2 pt-4 border-t border-slate-700">
         <button onClick={onOpenDataEntry} className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm">
            <Icon name="plus" className="w-4 h-4"/>
            Data Entry
        </button>
         <button onClick={onOpenScenarioModeler} className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm">
            <Icon name="sparkles" className="w-4 h-4"/>
            Scenario Modeler
        </button>
         <button onClick={onOpenImageUploader} className="w-full flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm">
            <Icon name="photo" className="w-4 h-4"/>
            Manage Photos
        </button>
      </div>
    </aside>
  );
};
