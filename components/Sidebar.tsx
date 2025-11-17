import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { DirectorProfile, View } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
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
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.7)' }}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300'
    } ${isCollapsed ? 'justify-center' : ''}`}
    title={isCollapsed ? label : ''}
  >
    <Icon name={icon} className="w-5 h-5 flex-shrink-0" />
    {!isCollapsed && <span>{label}</span>}
  </motion.button>
);

const DirectorLink: React.FC<{
    director?: DirectorProfile;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    onInfoClick: (e: React.MouseEvent) => void;
}> = ({ director, label, isActive, isCollapsed, onClick, onInfoClick }) => (
    <motion.div 
        className={`w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md transition-colors text-sm ${ isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50' } ${isCollapsed ? 'pl-2' : ''}`}
        title={isCollapsed ? label : ''}
        whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.9)' }}
    >
        <button onClick={onClick} className={`flex items-center gap-3 flex-1 ${isCollapsed ? 'justify-center' : ''}`}>
            {director && <img src={director.photo} alt={director.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />}
            {!director && isCollapsed && <div className="w-6 h-6 rounded-full bg-slate-600 flex-shrink-0" />}
            {!isCollapsed && <span>{label}</span>}
        </button>
        {director && !isCollapsed && (
             <button onClick={onInfoClick} className="p-1 rounded-full hover:bg-slate-600 text-slate-500 hover:text-white">
                <Icon name="info" className="w-4 h-4" />
            </button>
        )}
    </motion.div>
);


export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, currentPage, setCurrentPage, currentView, setCurrentView, directors, onOpenProfile, onOpenDataEntry, onOpenScenarioModeler, onOpenImageUploader }) => {
  return (
    <motion.aside 
      animate={{ width: isCollapsed ? '5rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-slate-800 border-r border-slate-700 flex flex-col p-4 space-y-6 flex-shrink-0 relative"
    >
      <div className={`flex items-center gap-3 h-10 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-white">Ops KPI Dashboard</h1>}
      </div>

      <nav className="flex-1 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
            <NavLink icon="dashboard" label="Dashboard" isActive={currentPage === 'Dashboard'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Dashboard')} />
            <NavLink icon="budget" label="Budget Planner" isActive={currentPage === 'Budget Planner'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Budget Planner')} />
            <NavLink icon="goal" label="Goal Setter" isActive={currentPage === 'Goal Setter'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Goal Setter')} />
            <NavLink icon="news" label="Industry News" isActive={currentPage === 'News'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('News')} />
        </div>
        
        {/* Director Navigation */}
        <div className="pt-4">
            {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Directors</h3>}
            <div className="space-y-1">
                 <DirectorLink 
                    label="Total Company"
                    isActive={currentView === 'Total Company'}
                    isCollapsed={isCollapsed}
                    onClick={() => setCurrentView('Total Company')}
                    onInfoClick={() => {}}
                />
                {directors.map(dir => (
                    <DirectorLink 
                        key={dir.id}
                        director={dir}
                        label={dir.name}
                        isActive={currentView === dir.id}
                        isCollapsed={isCollapsed}
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
         <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenDataEntry} title="Data Entry" className={`w-full flex items-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm ${isCollapsed ? 'justify-center' : ''}`}>
            <Icon name="plus" className="w-4 h-4 flex-shrink-0"/>
            {!isCollapsed && 'Data Entry'}
        </motion.button>
         <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenScenarioModeler} title="Scenario Modeler" className={`w-full flex items-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm ${isCollapsed ? 'justify-center' : ''}`}>
            <Icon name="sparkles" className="w-4 h-4 flex-shrink-0"/>
             {!isCollapsed && 'Scenario Modeler'}
        </motion.button>
         <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenImageUploader} title="Manage Photos" className={`w-full flex items-center gap-2 p-2 bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-md transition-colors text-sm ${isCollapsed ? 'justify-center' : ''}`}>
            <Icon name="photo" className="w-4 h-4 flex-shrink-0"/>
             {!isCollapsed && 'Manage Photos'}
        </motion.button>
      </div>

      {/* Collapse Toggle */}
       <div className={`absolute top-1/2 -right-3 transform -translate-y-1/2`}>
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-6 h-12 bg-slate-700 hover:bg-cyan-600 text-white rounded-r-md flex items-center justify-center"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} className="w-4 h-4" />
            </button>
        </div>
    </motion.aside>
  );
};