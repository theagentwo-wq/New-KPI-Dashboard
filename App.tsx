import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Goal, SavedView, DirectorProfile, Note, NoteCategory, Anomaly } from './types';
import { KPI_CONFIG, DIRECTORS, ALL_KPIS, KPI_ICON_MAP, ALL_STORES } from './constants';
import { getInitialPeriod, ALL_PERIODS, getPreviousPeriod, getYoYPeriod } from './utils/dateUtils';
import { generateDataForPeriod, generateMockBudgets, generateMockGoals } from './data/mockData';
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
import { AIAlerts } from './components/AIAlerts';
import { AnomalyDetailModal } from './components/AnomalyDetailModal';
import { getAnomalyDetections } from './services/geminiService';
import { ReviewAnalysisModal } from './components/ReviewAnalysisModal';
import { PerformanceMatrix } from './components/PerformanceMatrix';
import { NewsFeed } from './components/NewsFeed';

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
        <motion.div 
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between"
            whileHover={{ scale: 1.03, borderColor: '#22d3ee' }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
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
        </motion.div>
    );
};


// Main App Component
const App: React.FC = () => {
    // State
    const [loadedData, setLoadedData] = useState<StorePerformanceData[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>(generateMockBudgets());
    const [goals, setGoals] = useState<Goal[]>(generateMockGoals());
    const [notes, setNotes] = useState<Note[]>([]);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    
    const [currentPage, setCurrentPage] = useState<'Dashboard' | 'Budget Planner' | 'Goal Setter'>('Dashboard');
    const [currentView, setCurrentView] = useState<View>('Total Company');
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [savedViews, setSavedViews] = useState<SavedView[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    
    // Modal States
    const [isDataEntryOpen, setDataEntryOpen] = useState(false);
    const [isScenarioModelerOpen, setScenarioModelerOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [isAnomalyDetailOpen, setAnomalyDetailOpen] = useState(false);
    const [isReviewAnalysisOpen, setReviewAnalysisOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | undefined>(undefined);
    const [selectedLocationForReview, setSelectedLocationForReview] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        }

        const fetchNotes = async () => {
            try {
                const response = await fetch('/.netlify/functions/notes-proxy', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'getNotes' })
                });
                if (!response.ok) throw new Error('Failed to fetch notes');
                const fetchedNotes = await response.json();
                setNotes(fetchedNotes);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };
        fetchNotes();
    }, []);
    
    useEffect(() => {
        const comparisonPeriod = comparisonMode === 'vs. Prior Period'
            ? getPreviousPeriod(currentPeriod)
            : (comparisonMode === 'vs. Last Year' ? getYoYPeriod(currentPeriod) : undefined);

        const currentData = generateDataForPeriod(currentPeriod);
        const comparisonData = comparisonPeriod ? generateDataForPeriod(comparisonPeriod) : [];

        setLoadedData([...currentData, ...comparisonData]);
    }, [currentPeriod, comparisonMode]);

    const getPeriodData = useCallback((period: Period | undefined) => {
        if (!period) return [];
        return loadedData.filter(d => d.weekStartDate >= period.startDate && d.weekStartDate <= period.endDate);
    }, [loadedData]);

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

    }, [loadedData, budgets, currentPeriod, comparisonMode, currentView, getPeriodData, aggregate]);
    
    const allStoresBreakdownData = useMemo(() => {
        const currentPeriodData = getPeriodData(currentPeriod);
        let comparisonPeriodData: StorePerformanceData[] = [];
        if (comparisonMode === 'vs. Prior Period') {
            comparisonPeriodData = getPeriodData(getPreviousPeriod(currentPeriod));
        } else if (comparisonMode === 'vs. Last Year') {
            comparisonPeriodData = getPeriodData(getYoYPeriod(currentPeriod));
        }
    
        const results: { [storeId: string]: { actual: PerformanceData; comparison?: PerformanceData; variance: PerformanceData; } } = {};
    
        ALL_STORES.forEach(storeId => {
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
        return results;
    }, [currentPeriod, comparisonMode, getPeriodData, aggregate, budgets, loadedData]);

    useEffect(() => {
        const fetchAnomalies = async () => {
            if (Object.keys(allStoresBreakdownData).length > 0) {
                const detectedAnomalies = await getAnomalyDetections(allStoresBreakdownData, currentPeriod.label);
                setAnomalies(detectedAnomalies);
            }
        };
        fetchAnomalies();
    }, [allStoresBreakdownData, currentPeriod]);

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
        
        const relevantPeriods = periodsOfType.slice(Math.max(0, currentIndex - 3), currentIndex + 1);

        const storesForView = currentView === 'Total Company'
            ? ALL_STORES
            : DIRECTORS.find(d => d.id === currentView)?.stores || [];

        return relevantPeriods.map(period => {
            const periodData = generateDataForPeriod(period);
            const aggregated = aggregate(periodData, storesForView);
            return {
                periodLabel: period.label,
                data: aggregated
            };
        }).filter(p => Object.keys(p.data).length > 0);

    }, [currentPeriod, periodType, currentView, aggregate]);
    
    const directorModalData = useMemo(() => {
        if (!selectedDirector) return null;

        const currentPeriodData = getPeriodData(currentPeriod);
        const directorAggregate = aggregate(currentPeriodData, selectedDirector.stores);

        const directorStoreData: { [storeId: string]: any } = {};
        selectedDirector.stores.forEach(storeId => {
            if (allStoresBreakdownData[storeId]) {
                directorStoreData[storeId] = allStoresBreakdownData[storeId];
            }
        });

        return {
            aggregate: directorAggregate,
            stores: directorStoreData
        };
    }, [selectedDirector, getPeriodData, currentPeriod, aggregate, allStoresBreakdownData]);

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
    
    const addNote = useCallback(async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string) => {
        try {
            const response = await fetch('/.netlify/functions/notes-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addNote',
                    payload: { monthlyPeriodLabel, category, content, view: scope.view, storeId: scope.storeId, imageUrl }
                })
            });
            if (!response.ok) throw new Error('Failed to add note');
            const newNote = await response.json();
            setNotes(prev => [newNote, ...prev]);
        } catch (error) {
            console.error("Error adding note:", error);
        }
    }, []);
    
    const updateNote = useCallback(async (noteId: string, newContent: string, newCategory: NoteCategory) => {
        try {
            const response = await fetch('/.netlify/functions/notes-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateNote',
                    payload: { noteId, newContent, newCategory }
                })
            });
            if (!response.ok) throw new Error('Failed to update note');
            setNotes(prev => prev.map(note => note.id === noteId ? { ...note, content: newContent, category: newCategory } : note));
        } catch (error) {
            console.error("Error updating note:", error);
        }
    }, []);

    const deleteNote = useCallback(async (noteId: string) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                const response = await fetch('/.netlify/functions/notes-proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'deleteNote',
                        payload: { noteId }
                    })
                });
                if (!response.ok) throw new Error('Failed to delete note');
                setNotes(prev => prev.filter(note => note.id !== noteId));
            } catch (error) {
                console.error("Error deleting note:", error);
            }
        }
    }, []);

    const handleSaveData = (storeId: string, weekStartDate: Date, data: PerformanceData) => {
        const newDataEntry: StorePerformanceData = { storeId, weekStartDate, data };
        setLoadedData(prev => [...prev.filter(d => !(d.storeId === storeId && d.weekStartDate.getTime() === weekStartDate.getTime())), newDataEntry]);
    };

    const handleUpdateBudget = useCallback((storeId: string, year: number, month: number, kpi: Kpi, target: number) => {
      setBudgets(prevBudgets => {
        const newBudgets = [...prevBudgets];
        const budgetIndex = newBudgets.findIndex(b => b.storeId === storeId && b.year === year && b.month === month);
        
        if (budgetIndex > -1) {
          newBudgets[budgetIndex] = {
            ...newBudgets[budgetIndex],
            targets: {
              ...newBudgets[budgetIndex].targets,
              [kpi]: target,
            }
          };
        } else {
          const newBudget: Budget = {
            storeId,
            year,
            month,
            targets: { [kpi]: target } as PerformanceData
          };
          newBudgets.push(newBudget);
        }
        return newBudgets;
      });
    }, []);

     const handleSetGoal = (directorId: View, quarter: number, year: number, kpi: Kpi, target: number) => {
        setGoals(prevGoals => {
            const newGoals = [...prevGoals];
            const goalIndex = newGoals.findIndex(g => g.directorId === directorId && g.quarter === quarter && g.year === year && g.kpi === kpi);

            if (goalIndex > -1) {
                newGoals[goalIndex] = { ...newGoals[goalIndex], target };
            } else {
                newGoals.push({ directorId, quarter, year, kpi, target });
            }
            return newGoals;
        });
    };

    const handleShowAnomalyDetail = (anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setAnomalyDetailOpen(true);
    };

    const handleOpenReviewAnalysis = (location: string) => {
        setSelectedLocationForReview(location);
        setReviewAnalysisOpen(true);
    };

    const renderDashboard = () => (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <TimeSelector period={currentPeriod} comparisonMode={comparisonMode} setComparisonMode={setComparisonMode} periodType={periodType} setPeriodType={handlePeriodTypeChange} onPrev={handlePrev} onNext={handleNext} savedViews={savedViews} saveCurrentView={saveCurrentView} loadView={loadView} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExecutiveSummary data={aggregatedData} view={currentView} period={currentPeriod} />
                </div>
                <AIAlerts anomalies={anomalies} onSelectAnomaly={handleShowAnomalyDetail} />
            </div>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     {currentView !== 'Total Company' 
                        ? (
                            <>
                                <KPITable data={aggregatedData} comparisonLabel={comparisonMode} onLocationSelect={handleLocationSelect} onReviewClick={handleOpenReviewAnalysis} />
                                <NotesPanel allNotes={notes} addNote={addNote} updateNote={updateNote} deleteNote={deleteNote} currentView={currentView} mainDashboardPeriod={currentPeriod} heightClass="h-[500px]" />
                            </>
                        )
                        : (
                            <>
                                <CompanyStoreRankings data={allStoresBreakdownData} comparisonLabel={comparisonMode} onLocationSelect={handleLocationSelect} onReviewClick={handleOpenReviewAnalysis} />
                                <NotesPanel allNotes={notes} addNote={addNote} updateNote={updateNote} deleteNote={deleteNote} currentView={currentView} mainDashboardPeriod={currentPeriod} />
                            </>
                        )
                    }
                </div>
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                     <PerformanceMatrix
                        periodLabel={currentPeriod.label}
                        currentView={currentView}
                        allStoresData={allStoresBreakdownData}
                        directorAggregates={aggregatedData}
                    />
                    <AIAssistant data={aggregatedData} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} userLocation={userLocation} />
                </div>
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
              <div className="mt-8 pt-4 border-t border-slate-700 flex-1 overflow-y-auto custom-scrollbar">
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
                                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(dir.id); }} className={`flex items-center gap-3 flex-1 p-2 rounded-md text-sm ${currentView === dir.id ? 'bg-slate-700 text-cyan-400' : 'hover:bg-slate-700'}`}>
                                      <img src={dir.photo} alt={dir.name} className="w-6 h-6 rounded-full object-cover" />
                                      <span>{dir.name}</span>
                                  </a>
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
                  <NewsFeed />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-700 space-y-2">
                  <button onClick={() => setScenarioModelerOpen(true)} className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm hover:bg-slate-700">Run What-If Scenario</button>
                  <button onClick={() => setDataEntryOpen(true)} className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm hover:bg-slate-700">Data Entry</button>
              </div>
          </aside>
          <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                  <motion.div key={currentPage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} >
                      {currentPage === 'Dashboard' && renderDashboard()}
                      {currentPage === 'Budget Planner' && <BudgetPlanner allBudgets={budgets} onUpdateBudget={handleUpdateBudget} />}
                      {currentPage === 'Goal Setter' && <GoalSetter goals={goals} onSetGoal={handleSetGoal} />}
                  </motion.div>
              </AnimatePresence>
          </main>
          
          <DataEntryModal isOpen={isDataEntryOpen} onClose={() => setDataEntryOpen(false)} onSave={handleSaveData} />
          <ScenarioModeler isOpen={isScenarioModelerOpen} onClose={() => setScenarioModelerOpen(false)} data={aggregatedData} />
          <DirectorProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setProfileOpen(false)} 
            director={selectedDirector} 
            directorAggregateData={directorModalData?.aggregate}
            directorStoreData={directorModalData?.stores}
            selectedKpi={Kpi.SOP} 
            period={currentPeriod} 
          />
          <LocationInsightsModal isOpen={isLocationInsightsOpen} onClose={() => setLocationInsightsOpen(false)} location={selectedLocation} performanceData={selectedLocation ? allStoresBreakdownData[selectedLocation]?.actual : undefined} userLocation={userLocation} />
          <AnomalyDetailModal isOpen={isAnomalyDetailOpen} onClose={() => setAnomalyDetailOpen(false)} anomaly={selectedAnomaly} />
          <ReviewAnalysisModal isOpen={isReviewAnalysisOpen} onClose={() => setReviewAnalysisOpen(false)} location={selectedLocationForReview} />
      </div>
    );
};

export default App;