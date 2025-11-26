
import React, { useState, useMemo } from 'react';
import {
    DirectorProfile, 
    Deployment, 
    Goal, 
    Period
} from '../types';
import { X, Briefcase, Target, User, MapPin, Edit, BarChart, DollarSign } from 'lucide-react';
import { DeploymentMap } from './DeploymentMap';
import { GoalSetter } from './GoalSetter';
import { KPI_CONFIG } from '../constants';

interface DirectorProfileModalProps {
  isOpen: boolean;
  director: DirectorProfile | null;
  onClose: () => void;
  onSaveGoal: (goal: Omit<Goal, 'id'>) => void;
  directorGoals: Goal[];
  directorDeployments: Deployment[];
  activePeriod: Period;
}

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-colors ${active ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
        {children}
    </button>
)

export const DirectorProfileModal: React.FC<DirectorProfileModalProps> = ({ isOpen, director, onClose, onSaveGoal, directorGoals, directorDeployments, activePeriod }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalSetter, setShowGoalSetter] = useState(false);

  const travelBudgetUsed = useMemo(() => {
    if (!directorDeployments) return 0;
    return directorDeployments.reduce((acc, dep) => acc + (dep.estimatedBudget || 0), 0);
  }, [directorDeployments]);

  if (!isOpen || !director) return null;

  const travelBudgetProgress = director.yearlyTravelBudget > 0 ? (travelBudgetUsed / director.yearlyTravelBudget) * 100 : 0;

  const handleSaveGoal = (goal: Omit<Goal, 'id'>) => {
    onSaveGoal(goal);
    setShowGoalSetter(false);
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'goals':
              return <GoalsTab directorGoals={directorGoals} onSetGoal={() => setShowGoalSetter(true)} />;
          case 'deployments':
              return <DeploymentsTab directorDeployments={directorDeployments} />;
          case 'performance':
              return <PerformanceTab />;
          default:
            return <OverviewTab director={director} travelBudgetUsed={travelBudgetUsed} travelBudgetProgress={travelBudgetProgress} />;
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl border border-slate-700 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-start">
          <div className="flex items-center">
            <img src={director.photo} alt={`${director.firstName} ${director.lastName}`} className="w-20 h-20 rounded-full border-2 border-cyan-400 object-cover"/>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">{director.firstName} {director.lastName}</h2>
              <p className="text-md text-slate-400">{director.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="border-b border-slate-700">
            <nav className="flex px-4">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                <TabButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')}>Goals</TabButton>
                <TabButton active={activeTab === 'deployments'} onClick={() => setActiveTab('deployments')}>Deployments</TabButton>
                <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')}>Performance</TabButton>
            </nav>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
            {renderContent()}
        </div>

        {showGoalSetter && 
            <GoalSetter 
                director={director}
                onClose={() => setShowGoalSetter(false)} 
                onSave={handleSaveGoal}
                activePeriod={activePeriod}
            />
        }

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right rounded-b-lg">
            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components for Tabs

const OverviewTab = ({ director, travelBudgetUsed, travelBudgetProgress }: { director: DirectorProfile, travelBudgetUsed: number, travelBudgetProgress: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="font-semibold text-cyan-400 mb-3 flex items-center"><User size={18} className="mr-2"/> About</h3>
            <p className="text-sm text-slate-300 italic leading-relaxed">{director.bio}</p>
        </div>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-cyan-400 mb-2 flex items-center"><MapPin size={18} className="mr-2"/> Details</h3>
                <div className="text-sm text-slate-300 grid grid-cols-2 gap-2">
                    <span><strong>Home Base:</strong> {director.homeLocation}</span>
                    <span><strong>Email:</strong> <a href={`mailto:${director.email}`} className="text-cyan-400 hover:underline">{director.email}</a></span>
                    <span><strong>Phone:</strong> {director.phone}</span>
                    <span><strong>Manages:</strong> {director.stores.length} stores</span>
                </div>
            </div>
             <div>
              <h3 className="font-semibold text-cyan-400 mb-2 flex items-center"><DollarSign size={18} className="mr-2"/> Travel Budget Utilization</h3>
                <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${travelBudgetProgress}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 text-right">${travelBudgetUsed.toLocaleString()} / ${director.yearlyTravelBudget.toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const GoalsTab = ({ directorGoals, onSetGoal }: { directorGoals: Goal[], onSetGoal: () => void}) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-cyan-400 text-lg flex items-center"><Target size={20} className="mr-2"/> Quarterly Goals</h3>
            <button onClick={onSetGoal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-3 rounded-md text-sm flex items-center transition-colors"><Edit size={14} className="mr-2"/> Set New Goal</button>
        </div>
        <div className="space-y-3">
        {directorGoals.length === 0 ? (
            <p className='text-sm text-slate-500 text-center p-8'>No goals set for this quarter.</p>
        ) : (
            directorGoals.map(goal => {
                const kpiConfig = KPI_CONFIG[goal.kpi];
                return (
                    <div key={goal.id} className="bg-slate-900/70 p-4 rounded-lg">
                        <div className="flex flex-wrap justify-between items-center">
                            <p className="text-slate-300 font-medium">Target for <span className="font-bold text-white">{kpiConfig.label}</span></p>
                            <div className="text-right">
                                <p className={`font-bold text-xl ${kpiConfig.higherIsBetter ? 'text-green-400' : 'text-red-400'}`}>{kpiConfig.format === 'currency' ? '$' : ''}{(goal.targetValue ?? goal.target).toLocaleString()}{kpiConfig.format === 'percent' ? '%' : ''}</p>
                                <p className="text-xs text-slate-400">by {goal.endDate}</p>
                            </div>
                        </div>
                    </div>
                )
            })
        )}
        </div>
    </div>
);

const DeploymentsTab = ({ directorDeployments }: { directorDeployments: Deployment[] }) => (
    <div>
        <h3 className="font-semibold text-cyan-400 mb-4 text-lg flex items-center"><Briefcase size={20} className="mr-2"/> Deployments</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div className="h-64 lg:h-auto w-full rounded-lg overflow-hidden border border-slate-700 min-h-[250px]">
                <DeploymentMap deployments={directorDeployments} />
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {directorDeployments.length === 0 ? (
                     <p className='text-sm text-slate-500 text-center p-8'>No active deployments.</p>
                ) : (
                    directorDeployments.map(dep => (
                        <div key={dep.id} className="bg-slate-900/70 p-3 rounded-lg text-sm">
                             <p className="font-bold text-slate-200">{dep.type}</p>
                             <p className="text-slate-400 text-xs">{dep.startDate} to {dep.endDate}</p>
                             <p className="text-slate-300 mt-2">Stores: {dep.stores.join(', ')}</p>
                             <p className="text-slate-400 mt-1 italic">- {dep.description}</p>
                             <p className="text-right text-xs font-mono text-cyan-400 mt-2">Est. Budget: ${dep.estimatedBudget.toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

const PerformanceTab = () => (
    <div>
        <h3 className="font-semibold text-cyan-400 mb-4 text-lg"><BarChart size={20} className="mr-2 inline-block"/> Performance Metrics</h3>
        <div className="text-center p-8 text-slate-500">
            <p>Performance charts and data will be displayed here.</p>
            <p className="text-sm">(This feature is under construction)</p>
        </div>
    </div>
);