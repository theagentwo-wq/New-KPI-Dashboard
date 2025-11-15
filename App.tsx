import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Goal, SavedView, DirectorProfile, Note, NoteCategory } from './types';
import { KPI_CONFIG, DIRECTORS, ALL_KPIS, KPI_ICON_MAP, ALL_STORES } from './constants';
import { getInitialPeriod, ALL_PERIODS, getPreviousPeriod, getYoYPeriod } from './utils/dateUtils';
import { generateMockPerformanceData, generateMockBudgets, generateMockGoals } from './data/mockData';
import { useAnimatedNumber } from './hooks/useAnimatedNumber';
import { Icon } from './components/Icon';
import { TimeSelector } from './components/TimeSelector';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { KPITable } from './components/KPITable';
import { AIAssistant } from './components/AIAssistant';
import { NotesPanel } from './components/NotesPanel';
import { DataEntryModal } from './components/DataEntryModal';
import { ScenarioModeler } from './components/ScenarioModeler';
import { DirectorProfileModal } from './components/DirectorProfileModal';
import { BudgetPlanner } from './components/BudgetPlanner';
import { GoalSetter } from './components/GoalSetter';
import { LocationInsightsModal } from './components/LocationInsightsModal';
import { CompanyStoreRankings } from './components/CompanyStoreRankings';
import { AnimatedNumberDisplay } from './components/AnimatedNumberDisplay';

// Helper to format values for display
const formatDisplayValue = (value: number, kpi: Kpi) => {
    if (isNaN(value)) return 'N/A';
    const config = KPI_CONFIG[kpi];
    switch(config.format) {
        case 'currency': return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        case 'percent': return `${(value * 100).toFixed(1)}%`;
        case 'number': return value.toFixed(2);
        default: return value.toString();
    }
};

// KPICard Component
interface KPICardProps {
  title: Kpi;
  value: number;
  variance: number;
}
const KPICard: React.FC<KPICardProps> = ({ title, value, variance }) => {
    const animatedValue = useAnimatedNumber(value || 0);
    const kpiConfig = KPI_CONFIG[title];
    const iconName = KPI_ICON_MAP[title];

    const getVarianceColor = (v: number) => {
        if (isNaN(v) || v === 0) return 'text-slate-400';
        const isGood = kpiConfig.higherIsBetter ? v > 0 : v < 0;
        return isGood ? 'text-green-400' : 'text-red-400';
    };

    const formatter = useCallback((v: number) => {
        return formatDisplayValue(v, title)
    }, [title]);

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold">{title}</span>
                <Icon name={iconName} className="w-6 h-6" />
            </div>
            <div>
                <p className="text-3xl font-bold text-white">
                   <AnimatedNumberDisplay value={animatedValue} formatter={formatter} />
                </p>
                <p className={`text-sm font-semibold ${getVarianceColor(variance)}`}>
                    {isNaN(variance) ? '' : `${variance > 0 ? '+' : ''}${formatDisplayValue(variance, title)}`}
                </p>
            </div>
        </div>
    );
};


// Custom 3D Bar Shape for Recharts
const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const barWidth = Math.max(width, 0);
  const barHeight = Math.max(height, 0);

  return (
    <g>
      <Rectangle {...props} width={barWidth} height={barHeight} fill={fill} />
      {barHeight > 0 && <path d={`M${x + barWidth},${y} L${x + barWidth + 5},${y - 5} L${x + barWidth + 5},${y + barHeight - 5} L${x + barWidth},${y + barHeight} Z`} fill={fill} fillOpacity="0.5" />}
      {barWidth > 0 && <path d={`M${x},${y + barHeight} L${x + 5},${y + barHeight - 5} L${x + barWidth + 5},${y + barHeight - 5} L${x + barWidth},${y + barHeight} Z`} fill={fill} fillOpacity="0.2" />}
    </g>
  );
};


// Main App Component
const App: React.FC = () => {
    // State
    const [allData, setAllData] = useState<StorePerformanceData[]>(generateMockPerformanceData());
    const [budgets] = useState<Budget[]>(generateMockBudgets());
    const [goals] = useState<Goal[]>(generateMockGoals());
    const [notes, setNotes] = useState<Note[]>([]);

    const [currentPage, setCurrentPage] = useState<'Dashboard' | 'Budget Planner' | 'Goal Setter'>('Dashboard');
    const [currentView, setCurrentView] = useState<View>('Total Company');
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [selectedChartKpi, setSelectedChartKpi] = useState<Kpi>(Kpi.Sales);
    
    // Modal States
    const [isDataEntryOpen, setDataEntryOpen] = useState(false);
    const [isScenarioModelerOpen, setScenarioModelerOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

    const getPeriodData = useCallback((period: Period | undefined) => {
        if (!period) return [];
        return allData.filter(d => d.weekStartDate >= period.startDate && d.weekStartDate <= period.endDate);
    }, [allData]);

    const aggregate = useCallback((data: StorePerformanceData[], stores: string[]) => {
        const filteredData = data.filter(d => stores.includes(d.storeId));
        if (filteredData.length === 0) return {} as PerformanceData;
        
        const totals = filteredData.reduce((acc, curr) => {
            ALL_KPIS.forEach(kpi => {
                acc[kpi] = (acc[kpi] || 0) + curr.data[kpi];
            });
            return acc;
        }, {} as PerformanceData);
        
        const weeklyPeriodsInPeriod = new Set(filteredData.map(d => d.weekStartDate.toISOString())).size || 1;
        const storeCountForAverage = new Set(filteredData.map(d => d.storeId)).size || 1;
        const divisor = weeklyPeriodsInPeriod * storeCountForAverage;

        [Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews, Kpi.FoodCost, Kpi.LaborCost, Kpi.VariableLabor, Kpi.CulinaryAuditScore].forEach(kpi => {
            if (totals[kpi]) totals[kpi] /= divisor;
        });
        return totals;
    }, []);

    // Data Aggregation Logic
    const aggregatedData = useMemo(() => {
        const currentPeriodData = getPeriodData(currentPeriod);
        
        let comparisonPeriodData: StorePerformanceData[] = [];
        if (comparisonMode === 'vs. Prior Period') {
            comparisonPeriodData = getPeriodData(getPreviousPeriod(currentPeriod));
        } else if (comparisonMode === 'vs. Last Year') {
            comparisonPeriodData = getPeriodData(getYoYPeriod(currentPeriod));
        }

        const storesForView = currentView === 'Total Company'
            ? ALL_STORES
            : DIRECTORS.find(d => d.id === currentView)?.stores || [];
        
        const results: any = {};
        
        if (currentView === 'Total Company') {
            DIRECTORS.forEach(dir => {
                const actual = aggregate(currentPeriodData, dir.stores);
                const comparison = aggregate(comparisonPeriodData, dir.stores);
                const variance = ALL_KPIS.reduce((acc, kpi) => {
                    acc[kpi] = (actual[kpi] || 0) - (comparison[kpi] || 0);
                    return acc;
                }, {} as PerformanceData);
                results[dir.name] = { aggregated: actual, comparison, variance };
            });
        } else {
            storesForView.forEach(storeId => {
                const actual = aggregate(currentPeriodData, [storeId]);
                const comparison = comparisonMode === 'vs. Budget'
                    ? budgets.find(b => b.storeId === storeId /* && matches period */)?.targets // Simplified
                    : aggregate(comparisonPeriodData, [storeId]);
                const variance = ALL_KPIS.reduce((acc, kpi) => {
                    acc[kpi] = (actual[kpi] || 0) - (comparison?.[kpi] || 0);
                    return acc;
                }, {} as PerformanceData);
                results[storeId] = { actual, comparison, variance };
            });
        }
        return results;

    }, [allData, budgets, currentPeriod, comparisonMode, currentView, getPeriodData, aggregate]);
    
    const allStoresPeriodData = useMemo(() => {
        const currentPeriodData = getPeriodData(currentPeriod);
        const storesData: { [storeId: string]: PerformanceData } = {};
        ALL_STORES.forEach(storeId => {
            storesData[storeId] = aggregate(currentPeriodData, [storeId]);
        });
        return storesData;
    }, [currentPeriod, getPeriodData, aggregate]);

    const summaryData = useMemo(() => {
        const sourceData = currentView === 'Total Company'
            ? Object.values(aggregatedData).map((d: any) => d.aggregated)
            : Object.values(aggregatedData).map((d: any) => d.actual);
            
        if (sourceData.length === 0 || sourceData.some(d => Object.keys(d).length === 0)) return {} as PerformanceData;

        const totals = sourceData.reduce((acc, curr) => {
            ALL_KPIS.forEach(kpi => { acc[kpi] = (acc[kpi] || 0) + (curr?.[kpi] || 0); });
            return acc;
        }, {} as PerformanceData);
        
        [Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews, Kpi.FoodCost, Kpi.LaborCost, Kpi.VariableLabor, Kpi.CulinaryAuditScore].forEach(kpi => {
            totals[kpi] /= sourceData.length;
        });

        return totals;
    }, [aggregatedData, currentView]);
    
    const summaryComparisonData = useMemo(() => {
        const sourceData = currentView === 'Total Company'
            ? Object.values(aggregatedData).map((d: any) => d.comparison)
            : Object.values(aggregatedData).map((d: any) => d.comparison);
            
        if (sourceData.length === 0 || sourceData.some(d => !d || Object.keys(d).length === 0)) return {} as PerformanceData;

        const totals = sourceData.reduce((acc, curr) => {
            ALL_KPIS.forEach(kpi => { acc[kpi] = (acc[kpi] || 0) + (curr?.[kpi] || 0); });
            return acc;
        }, {} as PerformanceData);
        
        [Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews, Kpi.FoodCost, Kpi.LaborCost, Kpi.VariableLabor, Kpi.CulinaryAuditScore].forEach(kpi => {
            totals[kpi] /= sourceData.length;
        });

        return totals;
    }, [aggregatedData, currentView]);

    const summaryVariance = useMemo(() => {
        return ALL_KPIS.reduce((acc, kpi) => {
            acc[kpi] = (summaryData[kpi] || 0) - (summaryComparisonData[kpi] || 0);
            return acc;
        }, {} as PerformanceData);
    }, [summaryData, summaryComparisonData]);

    const historicalDataForAI = useMemo(() => {
        const periodsOfType = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periodsOfType.findIndex(p => p.label === currentPeriod.label);
        
        // Get the current period and up to 3 previous periods
        const relevantPeriods = periodsOfType.slice(Math.max(0, currentIndex - 3), currentIndex + 1);

        const storesForView = currentView === 'Total Company'
            ? ALL_STORES
            : DIRECTORS.find(d => d.id === currentView)?.stores || [];

        return relevantPeriods.map(period => {
            const periodData = getPeriodData(period);
            const aggregated = aggregate(periodData, storesForView);
            return {
                periodLabel: period.label,
                data: aggregated
            };
        }).filter(p => Object.keys(p.data).length > 0); // Filter out periods with no data

    }, [currentPeriod, periodType, currentView, getPeriodData, aggregate]);


    const chartData = useMemo(() => {
        if (currentView === 'Total Company') {
            return Object.entries(aggregatedData).map(([name, data]: [string, any]) => ({
                name,
                Actual: data.aggregated?.[selectedChartKpi] || 0,
                Comparison: data.comparison?.[selectedChartKpi] || 0,
            }));
        }
        return Object.entries(aggregatedData).map(([name, data]: [string, any]) => ({
            name,
            Actual: data.actual?.[selectedChartKpi] || 0,
            Comparison: data.comparison?.[selectedChartKpi] || 0,
        }));
    }, [aggregatedData, selectedChartKpi, currentView]);

    // Handlers
    const handlePeriodTypeChange = (type: 'Week' | 'Month' | 'Quarter' | 'Year') => {
        setPeriodType(type);
        const firstPeriodOfType = ALL_PERIODS.find(p => p.type === type);
        if (firstPeriodOfType) setCurrentPeriod(firstPeriodOfType);
    };

    const handlePrev = () => {
        const periodsOfType = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periodsOfType.findIndex(p => p.label === currentPeriod.label);
        if (currentIndex > 0) setCurrentPeriod(periodsOfType[currentIndex - 1]);
    };
    
    const handleNext = () => {
        const periodsOfType = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periodsOfType.findIndex(p => p.label === currentPeriod.label);
        if (currentIndex < periodsOfType.length - 1) setCurrentPeriod(periodsOfType[currentIndex + 1]);
    };

    const saveCurrentView = (name: string) => {
        const newSavedView: SavedView = { name, period: currentPeriod, view: currentView, comparisonMode };
        setSavedViews([...savedViews, newSavedView]);
    };
    
    const loadView = (view: SavedView) => {
        setCurrentPeriod(view.period);
        setCurrentView(view.view);
        setComparisonMode(view.comparisonMode);
        setPeriodType(view.period.type);
    };

    const handleDirectorProfileOpen = (director: DirectorProfile) => {
        setSelectedDirector(director);
        setProfileOpen(true);
    };

    const handleLocationSelect = (location: string) => {
        setSelectedLocation(location);
        setLocationInsightsOpen(true);
    };
    
    const addNote = useCallback((periodLabel: string, category: NoteCategory, content: string, storeId?: string) => {
        const newNote: Note = { 
            id: new Date().toISOString(), 
            periodLabel, 
            view: currentView, 
            category, 
            content, 
            storeId 
        };
        setNotes(prev => [...prev, newNote]);
    }, [currentView]);

    const handleSaveData = (storeId: string, weekStartDate: Date, data: PerformanceData) => {
        const newDataEntry: StorePerformanceData = { storeId, weekStartDate, data };
        setAllData(prev => [...prev.filter(d => !(d.storeId === storeId && d.weekStartDate.getTime() === weekStartDate.getTime())), newDataEntry]);
    };

    const renderDashboard = () => (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <TimeSelector period={currentPeriod} setPeriod={setCurrentPeriod} comparisonMode={comparisonMode} setComparisonMode={setComparisonMode} periodType={periodType} setPeriodType={handlePeriodTypeChange} onPrev={handlePrev} onNext={handleNext} savedViews={savedViews} saveCurrentView={saveCurrentView} loadView={loadView} />
            <ExecutiveSummary data={aggregatedData} view={currentView} period={currentPeriod} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <KPICard title={Kpi.Sales} value={summaryData[Kpi.Sales] || 0} variance={summaryVariance[Kpi.Sales] || 0} />
                <KPICard title={Kpi.SOP} value={summaryData[Kpi.SOP] || 0} variance={summaryVariance[Kpi.SOP] || 0} />
                <KPICard title={Kpi.PrimeCost} value={summaryData[Kpi.PrimeCost] || 0} variance={summaryVariance[Kpi.PrimeCost] || 0} />
                <KPICard title={Kpi.AvgReviews} value={summaryData[Kpi.AvgReviews] || 0} variance={summaryVariance[Kpi.AvgReviews] || 0} />
                <KPICard title={Kpi.FoodCost} value={summaryData[Kpi.FoodCost] || 0} variance={summaryVariance[Kpi.FoodCost] || 0} />
                <KPICard title={Kpi.LaborCost} value={summaryData[Kpi.LaborCost] || 0} variance={summaryVariance[Kpi.LaborCost] || 0} />
                <KPICard title={Kpi.VariableLabor} value={summaryData[Kpi.VariableLabor] || 0} variance={summaryVariance[Kpi.VariableLabor] || 0} />
                <KPICard title={Kpi.CulinaryAuditScore} value={summaryData[Kpi.CulinaryAuditScore] || 0} variance={summaryVariance[Kpi.CulinaryAuditScore] || 0} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-cyan-400">Performance Chart</h3>
                         <select value={selectedChartKpi} onChange={(e) => setSelectedChartKpi(e.target.value as Kpi)} className="bg-slate-700 text-white border border-slate-600 rounded-md p-1 text-sm focus:ring-cyan-500 focus:border-cyan-500">
                             {ALL_KPIS.map(kpi => <option key={kpi} value={kpi}>{kpi}</option>)}
                         </select>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                             <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0891b2" stopOpacity={0.9}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" tickFormatter={(val) => formatDisplayValue(val, selectedChartKpi)} />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }} formatter={(value: number) => formatDisplayValue(value, selectedChartKpi)} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                            <Legend />
                            <Bar dataKey="Actual" fill="url(#barGradient)" shape={<CustomBar />} />
                            <Bar dataKey="Comparison" fill="#64748b" shape={<CustomBar />} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <AIAssistant data={aggregatedData} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} />
            </div>
            {currentView !== 'Total Company' 
                ? <KPITable data={aggregatedData} comparisonLabel={comparisonMode} onLocationSelect={handleLocationSelect} />
                : <CompanyStoreRankings data={allStoresPeriodData} selectedKpi={selectedChartKpi} onLocationSelect={handleLocationSelect} />
            }
            <NotesPanel allNotes={notes} addNote={addNote} currentView={currentView} mainDashboardPeriod={currentPeriod} />
            <div className="flex gap-4">
                <button onClick={() => setScenarioModelerOpen(true)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">Run What-If Scenario</button>
                <button onClick={() => setDataEntryOpen(true)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md">Data Entry</button>
            </div>
        </div>
    );

    return (
      <div className="flex h-full bg-slate-900 text-slate-200 font-sans">
          <aside className="w-64 bg-slate-800 p-6 flex-shrink-0 flex flex-col">
              <h1 className="text-2xl font-bold text-cyan-400 mb-8">Operations KPI</h1>
              <nav className="space-y-2">
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Dashboard'); }} className={`flex items-center gap-3 p-2 rounded-md ${currentPage === 'Dashboard' ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>
                      <Icon name="dashboard" className="w-6 h-6" /><span>Dashboard</span>
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Budget Planner'); }} className={`flex items-center gap-3 p-2 rounded-md ${currentPage === 'Budget Planner' ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>
                      <Icon name="budget" className="w-6 h-6" /><span>Budget Planner</span>
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Goal Setter'); }} className={`flex items-center gap-3 p-2 rounded-md ${currentPage === 'Goal Setter' ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>
                       <Icon name="goal" className="w-6 h-6" /><span>Goal Setter</span>
                  </a>
              </nav>
              <div className="mt-8 pt-4 border-t border-slate-700 flex-1 overflow-y-auto">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase mb-2">Views</h2>
                  <div className="space-y-1">
                      <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('Total Company'); }} className={`block p-2 rounded-md text-sm ${currentView === 'Total Company' ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>Total Company</a>
                      {DIRECTORS.map(dir => {
                          const directorData = aggregatedData[dir.name]?.aggregated;
                          const quarterMatch = currentPeriod.label.match(/Q(\d).*FY(\d{4})/);
                          let goalProgress = -1;
                          if (directorData && quarterMatch) {
                              const quarter = parseInt(quarterMatch[1], 10);
                              const year = parseInt(quarterMatch[2], 10);
                              const goal = goals.find(g => g.directorId === dir.id && g.quarter === quarter && g.year === year);
                              if (goal && directorData[goal.kpi]) {
                                  goalProgress = directorData[goal.kpi] / goal.target;
                              }
                          }
                          return (
                            <div key={dir.id}>
                                <div className="flex items-center justify-between">
                                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(dir.id); }} className={`flex-1 p-2 rounded-md text-sm ${currentView === dir.id ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>{dir.name}</a>
                                  <button onClick={() => handleDirectorProfileOpen(dir)} className="p-1 rounded-full hover:bg-slate-700 text-slate-400">
                                      <Icon name="info" className="w-4 h-4" />
                                  </button>
                                  {goalProgress >= 1 && <Icon name="trophy" className="w-4 h-4 text-yellow-400" />}
                                </div>
                                {goalProgress >= 0 && (
                                    <div className="px-2 pb-1">
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${Math.min(goalProgress * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                          )
                      })}
                  </div>
              </div>
          </aside>
          <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                  <motion.div key={currentPage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} >
                      {currentPage === 'Dashboard' && renderDashboard()}
                      {currentPage === 'Budget Planner' && <BudgetPlanner />}
                      {currentPage === 'Goal Setter' && <GoalSetter />}
                  </motion.div>
              </AnimatePresence>
          </main>
          
          <DataEntryModal isOpen={isDataEntryOpen} onClose={() => setDataEntryOpen(false)} onSave={handleSaveData} />
          <ScenarioModeler isOpen={isScenarioModelerOpen} onClose={() => setScenarioModelerOpen(false)} data={aggregatedData} />
          <DirectorProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} director={selectedDirector} performanceData={aggregatedData} selectedKpi={selectedChartKpi} />
          <LocationInsightsModal isOpen={isLocationInsightsOpen} onClose={() => setLocationInsightsOpen(false)} location={selectedLocation} />
      </div>
    );
};

export default App;