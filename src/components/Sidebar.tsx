import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { DirectorProfile, View } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: 'Dashboard' | 'Goal Setter' | 'News' | 'Data Entry') => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  directors: DirectorProfile[];
  onOpenProfile: (director: DirectorProfile) => void;
  onOpenDataEntry: () => void;
  onOpenExecutiveSummary: () => void;
  onOpenStrategyHub: () => void;
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
    {...({ whileHover: { backgroundColor: 'rgba(51, 65, 85, 0.7)', scale: 1.02 }, transition: { duration: 0.2 } } as any)}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-900/20' : 'text-slate-300 hover:shadow-md'
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
        className={`w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md transition-all duration-200 text-sm ${ isActive ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50 hover:shadow-sm' } ${isCollapsed ? 'pl-2' : ''}`}
        title={isCollapsed ? label : ''}
        {...({ whileHover: { backgroundColor: 'rgba(51, 65, 85, 0.9)', scale: 1.02 }, transition: { duration: 0.2 } } as any)}
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


export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, currentPage, setCurrentPage, currentView, setCurrentView, directors, onOpenProfile, onOpenDataEntry, onOpenExecutiveSummary, onOpenStrategyHub }) => {
  return (
    <motion.aside 
      {...({
        animate: { width: isCollapsed ? '5rem' : '16rem' },
        transition: { duration: 0.3, ease: 'easeInOut' }
      } as any)}
      className="bg-slate-800 border-r border-slate-700 flex flex-col p-4 space-y-6"
    >
      <div className={`flex items-center gap-3 h-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-white">Ops KPI Dashboard</h1>}
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-md"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {/* Main Navigation & Actions */}
        <div className="space-y-1">
            <NavLink icon="dashboard" label="Dashboard" isActive={currentPage === 'Dashboard'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Dashboard')} />
            <NavLink icon="goal" label="Goal Setter" isActive={currentPage === 'Goal Setter'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Goal Setter')} />
            <NavLink icon="edit" label="Data Entry" isActive={currentPage === 'Data Entry'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('Data Entry')} />
            <NavLink icon="news" label="Industry News" isActive={currentPage === 'News'} isCollapsed={isCollapsed} onClick={() => setCurrentPage('News')} />

            <div className="pt-2 mt-2 border-t border-slate-700" />

            <NavLink icon="sparkles" label="Executive Summary" isActive={false} isCollapsed={isCollapsed} onClick={onOpenExecutiveSummary} />
            <NavLink icon="plus" label="Import Report" isActive={false} isCollapsed={isCollapsed} onClick={onOpenDataEntry} />
            <NavLink icon="brain" label="Strategy Hub" isActive={false} isCollapsed={isCollapsed} onClick={onOpenStrategyHub} />
        </div>
        
        {/* Director Navigation */}
        <div className="pt-4">
            {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Directors</h3>}
            <div className="space-y-1">
                 <DirectorLink 
                    label="Total Company"
                    isActive={currentView === View.TotalCompany}
                    isCollapsed={isCollapsed}
                    onClick={() => setCurrentView(View.TotalCompany)}
                    onInfoClick={() => {}}
                />
                {directors.map(dir => (
                    <DirectorLink 
                        key={dir.id}
                        director={dir}
                        label={dir.name}
                        isActive={currentView === dir.id}
                        isCollapsed={isCollapsed}
                        onClick={() => setCurrentView(dir.id as View)}
                        onInfoClick={(e) => {
                            e.stopPropagation();
                            onOpenProfile(dir);
                        }}
                    />
                ))}
            </div>
        </div>
      </nav>

    </motion.aside>
  );
};