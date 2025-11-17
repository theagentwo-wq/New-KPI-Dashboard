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
import { getNotes, addNote as addNoteToDb, updateNoteContent, deleteNoteById, initializeFirebaseService } from './services/firebaseService';

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
    const [dbStatus, setDbStatus] = useState<'initializing' | 'connected' | 'error'>('initializing');
    
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
        // Initialize Firebase on component mount
        const initDb = async () => {
            const success = await initializeFirebaseService();
            setDbStatus(success ? 'connected' : 'error');
        };
        initDb();

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
    }, []);
    
    // Fetch notes once the DB is connected
    useEffect(() => {
        const fetchNotes = async () => {
            if (dbStatus === 'connected') {
                try {
                    const fetchedNotes = await getNotes();
                    setNotes(fetchedNotes);
                } catch (error) {
                    console.error("Error fetching notes from Firebase:", error);
                    setDbStatus('error');
                }
            }
        };
        fetchNotes();
    }, [dbStatus]);
    
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
        if (firstPeriodOfType) {
            setCurrentPeriod(firstPeriodOfType);
        }
    };

    const handlePeriodChange = (direction: 'prev' | 'next') => {
        const periodsOfType = ALL_PERIODS.filter(p => p.type === periodType);
        const currentIndex = periodsOfType.findIndex(p => p.label === currentPeriod.label);
        
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentPeriod(periodsOfType[currentIndex - 1]);
        } else if (direction === 'next' && currentIndex < periodsOfType.length - 1) {
            setCurrentPeriod(periodsOfType[currentIndex + 1]);
        }
    };

    const handleSaveView = (name: string) => {
        const newView: SavedView = { name, period: currentPeriod, view: currentView, comparisonMode };
        setSavedViews(prev => [...prev, newView]);
    };

    const handleLoadView = (view: SavedView) => {
        setPeriodType(view.period.type);
        setCurrentPeriod(view.period);
        setCurrentView(view.view);
        setComparisonMode(view.comparisonMode);
    };

    const openProfileModal = (director: DirectorProfile) => {
        setSelectedDirector(director);
        setProfileOpen(true);
    };
    
    const openLocationInsights = (location: string) => {
        setSelectedLocation(location);
        setLocationInsightsOpen(true);
    };
    
    const openAnomalyDetail = (anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setAnomalyDetailOpen(true);
    }
    
    const openReviewAnalysis = (location: string) => {
        setSelectedLocationForReview(location);
        setReviewAnalysisOpen(true);
    };

    const addNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string) => {
        if (dbStatus !== 'connected') return;
        try {
            const newNote = await addNoteToDb(monthlyPeriodLabel, category, content, scope, imageUrl);
            setNotes(prev => [newNote, ...prev]);
        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };
    
    const updateNote = async (noteId: string, newContent: string, newCategory: NoteCategory) => {
        if (dbStatus !== 'connected') return;
        try {
            await updateNoteContent(noteId, newContent, newCategory);
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: newContent, category: newCategory } : n));
        } catch (error) {
            console.error("Failed to update note:", error);
        }
    };

    const deleteNote = async (noteId: string) => {
        if (dbStatus !== 'connected') return;
        try {
            await deleteNoteById(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };
    
    const handleUpdateBudget = (storeId: string, year: number, month: number, kpi: Kpi, target: number) => {
        setBudgets(prevBudgets => {
            const newBudgets = [...prevBudgets];
            const budgetIndex = newBudgets.findIndex(b => b.storeId === storeId && b.year === year && b.month === month);

            if (budgetIndex > -1) {
                // Update existing budget
                newBudgets[budgetIndex] = { 
                    ...newBudgets[budgetIndex], 
                    targets: { 
                        ...newBudgets[budgetIndex].targets, 
                        [kpi]: target 
                    } 
                };
            } else {
                // Create new budget if it doesn't exist
                 const newBudget: Budget = {
                    storeId,
                    year,
                    month,
                    targets: {
                        [Kpi.Sales]: 0, [Kpi.SOP]: 0, [Kpi.PrimeCost]: 0, [Kpi.AvgReviews]: 0,
                        [Kpi.FoodCost]: 0, [Kpi.LaborCost]: 0, [Kpi.VariableLabor]: 0, [Kpi.CulinaryAuditScore]: 0,
                        [kpi]: target
                    }
                };
                newBudgets.push(newBudget);
            }
            return newBudgets;
        });
    };

    const handleSetGoal = (directorId: View, quarter: number, year: number, kpi: Kpi, target: number) => {
        setGoals(prevGoals => {
            const newGoals = [...prevGoals];
            const goalIndex = newGoals.findIndex(g => g.directorId === directorId && g.quarter === quarter && g.year === year && g.kpi === kpi);
            
            if (goalIndex > -1) {
                // Update existing goal
                newGoals[goalIndex] = { ...newGoals[goalIndex], target };
            } else {
                // Add new goal
                newGoals.push({ directorId, quarter, year, kpi, target });
            }
            return newGoals.sort((a,b) => a.year - b.year || a.quarter - b.quarter);
        });
    };

    const mainKpis = [Kpi.Sales, Kpi.SOP, Kpi.PrimeCost, Kpi.AvgReviews];
    const comparisonLabel = comparisonMode === 'vs. Budget' ? 'Budget' : (comparisonMode === 'vs. Prior Period' ? 'Prior Period' : 'Last Year');

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-700 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <img src="https://i.postimg.cc/k43r5bZ0/tupelo-honey-logo.png" alt="Tupelo Honey Logo" className="h-10"/>
                    <h1 className="text-xl font-bold text-white hidden sm:block">Operations KPI Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentPage('Dashboard')} className={`px-3 py-1 text-sm font-semibold rounded ${currentPage === 'Dashboard' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Dashboard</button>
                    <button onClick={() => setCurrentPage('Budget Planner')} className={`px-3 py-1 text-sm font-semibold rounded ${currentPage === 'Budget Planner' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Budgets</button>
                    <button onClick={() => setCurrentPage('Goal Setter')} className={`px-3 py-1 text-sm font-semibold rounded ${currentPage === 'Goal Setter' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>Goals</button>
                    <button onClick={() => setDataEntryOpen(true)} className="p-2 bg-slate-700 hover:bg-cyan-600 rounded-md"><Icon name="plus" className="w-5 h-5"/></button>
                    <button onClick={() => setScenarioModelerOpen(true)} className="p-2 bg-slate-700 hover:bg-cyan-600 rounded-md"><Icon name="sparkles" className="w-5 h-5"/></button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.main
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentPage === 'Dashboard' && (
                        <div className="p-4 sm:p-6 lg:p-8">
                            <TimeSelector
                                period={currentPeriod}
                                comparisonMode={comparisonMode}
                                setComparisonMode={setComparisonMode}
                                periodType={periodType}
                                setPeriodType={handlePeriodTypeChange}
                                onPrev={() => handlePeriodChange('prev')}
                                onNext={() => handlePeriodChange('next')}
                                savedViews={savedViews}
                                saveCurrentView={handleSaveView}
                                loadView={handleLoadView}
                            />

                            <div className="mt-6">
                                <select value={currentView} onChange={(e) => setCurrentView(e.target.value as View)} className="w-full sm:w-auto bg-slate-700 text-white border border-slate-600 rounded-md p-2 mb-6 focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="Total Company">Total Company</option>
                                    {DIRECTORS.map(d => <option key={d.id} value={d.id}>{d.name}'s Region</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {mainKpis.map(kpi => (
                                    <KPICard key={kpi} title={kpi} value={summaryData[kpi]} variance={summaryVariance[kpi]} />
                                ))}
                            </div>

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <ExecutiveSummary data={aggregatedData} view={currentView} period={currentPeriod} />
                                     {currentView === 'Total Company' ? (
                                        <CompanyStoreRankings 
                                            data={allStoresBreakdownData} 
                                            comparisonLabel={comparisonLabel} 
                                            onLocationSelect={openLocationInsights}
                                            onReviewClick={openReviewAnalysis}
                                        />
                                     ) : (
                                        <KPITable 
                                            data={aggregatedData} 
                                            comparisonLabel={comparisonLabel} 
                                            onLocationSelect={openLocationInsights}
                                            onReviewClick={openReviewAnalysis}
                                        />
                                     )}
                                     <PerformanceMatrix 
                                        periodLabel={currentPeriod.label}
                                        currentView={currentView}
                                        allStoresData={allStoresBreakdownData}
                                        directorAggregates={Object.fromEntries(
                                            Object.entries(aggregatedData).map(([name, data]) => [name, data as any])
                                        )}
                                     />
                                </div>
                                <div className="space-y-6">
                                    {currentView !== 'Total Company' && (
                                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-4">
                                            <img src={DIRECTORS.find(d => d.id === currentView)?.photo} alt={currentView} className="w-20 h-20 rounded-full object-cover"/>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{DIRECTORS.find(d => d.id === currentView)?.name} {DIRECTORS.find(d => d.id === currentView)?.lastName}</h3>
                                                <p className="text-sm text-cyan-400">{DIRECTORS.find(d => d.id === currentView)?.title}</p>
                                                <button onClick={() => openProfileModal(DIRECTORS.find(d => d.id === currentView)!)} className="text-sm text-slate-300 hover:text-cyan-400 mt-1">
                                                    View Profile &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <AIAssistant data={aggregatedData} historicalData={historicalDataForAI} view={currentView} period={currentPeriod} userLocation={userLocation} />
                                    <AIAlerts anomalies={anomalies} onSelectAnomaly={openAnomalyDetail} />
                                    <NotesPanel 
                                        allNotes={notes} 
                                        addNote={addNote}
                                        updateNote={updateNote}
                                        deleteNote={deleteNote}
                                        currentView={currentView}
                                        mainDashboardPeriod={currentPeriod}
                                        heightClass="max-h-[600px]"
                                        dbStatus={dbStatus}
                                    />
                                    <NewsFeed />
                                </div>
                            </div>
                        </div>
                    )}
                     {currentPage === 'Budget Planner' && <BudgetPlanner allBudgets={budgets} onUpdateBudget={handleUpdateBudget} />}
                    {currentPage === 'Goal Setter' && <GoalSetter goals={goals} onSetGoal={handleSetGoal} />}
                </motion.main>
            </AnimatePresence>

            {/* Modals */}
            <DataEntryModal isOpen={isDataEntryOpen} onClose={() => setDataEntryOpen(false)} onSave={() => {}} />
            <ScenarioModeler isOpen={isScenarioModelerOpen} onClose={() => setScenarioModelerOpen(false)} data={summaryData} />
            <DirectorProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setProfileOpen(false)} 
                director={selectedDirector} 
                directorAggregateData={directorModalData?.aggregate}
                directorStoreData={directorModalData?.stores}
                selectedKpi={Kpi.Sales} // Example KPI
                period={currentPeriod}
            />
            <LocationInsightsModal 
                isOpen={isLocationInsightsOpen}
                onClose={() => setLocationInsightsOpen(false)}
                location={selectedLocation}
                performanceData={selectedLocation ? allStoresBreakdownData[selectedLocation]?.actual : undefined}
                userLocation={userLocation}
            />
             <AnomalyDetailModal 
                isOpen={isAnomalyDetailOpen}
                onClose={() => setAnomalyDetailOpen(false)}
                anomaly={selectedAnomaly}
             />
             <ReviewAnalysisModal
                isOpen={isReviewAnalysisOpen}
                onClose={() => setReviewAnalysisOpen(false)}
                location={selectedLocationForReview}
             />

        </div>
    );
};

export default App;