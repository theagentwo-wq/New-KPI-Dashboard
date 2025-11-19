import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Kpi, Period, View, StorePerformanceData, Budget, Goal, DirectorProfile, Note, NoteCategory, PerformanceData } from './types';
import { getInitialPeriod } from './utils/dateUtils';
import { ScenarioModeler } from './components/ScenarioModeler';
import { DirectorProfileModal } from './components/DirectorProfileModal';
import { BudgetPlanner } from './components/BudgetPlanner';
import { GoalSetter } from './components/GoalSetter';
import { getNotes, addNote as addNoteToDb, updateNoteContent, deleteNoteById, initializeFirebaseService, FirebaseStatus, getDirectorProfiles, uploadDirectorPhoto, updateDirectorPhotoUrl, getPerformanceData, getBudgets, getGoals, addGoal, updateBudget, savePerformanceDataForPeriod, updateDirectorContactInfo, batchImportActualsData, batchImportBudgetData, listenToImportJob } from './services/firebaseService';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewsFeedPage } from './pages/NewsFeedPage';
import { ImportDataModal } from './components/ImportDataModal';
import { DataEntryPage } from './pages/DataEntryPage';
import { StrategyHubModal } from './components/StrategyHubModal';
import { ImportStatusIndicator } from './components/importStatusIndicator';

// Main App Component
const App: React.FC = () => {
    const [performanceData, setPerformanceData] = useState<StorePerformanceData[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [dbStatus, setDbStatus] = useState<FirebaseStatus>({ status: 'initializing' });
    const [directors, setDirectors] = useState<DirectorProfile[]>([]);
    
    const [currentPage, setCurrentPage] = useState<'Dashboard' | 'Budget Planner' | 'Goal Setter' | 'News' | 'Data Entry'>('Dashboard');
    const [currentView, setCurrentView] = useState<View>('Total Company');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    const [isImportDataOpen, setImportDataOpen] = useState(false);
    const [isStrategyHubOpen, setStrategyHubOpen] = useState(false);
    const [isScenarioModelerOpen, setScenarioModelerOpen] = useState(false);
    const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isExecutiveSummaryOpen, setExecutiveSummaryOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | undefined>(undefined);

    const [activeImportJob, setActiveImportJob] = useState<{
        id: string;
        // FIX: Add 'pending' to the step type to match the job lifecycle and resolve TS error.
        step: 'upload' | 'guided-paste' | 'pending' | 'processing' | 'verify' | 'finished' | 'error';
        statusLog: string[];
        progress: { current: number; total: number };
        errors: string[];
        extractedData: any[];
    } | null>(null);

    const fetchData = useCallback(async (period: Period) => {
        if (dbStatus.status === 'connected') {
            try {
                const [pData, bData, nData, dData, gData] = await Promise.all([
                    getPerformanceData(period.startDate, period.endDate),
                    getBudgets(period.startDate.getFullYear()),
                    getNotes(),
                    getDirectorProfiles(),
                    getGoals(),
                ]);
                setPerformanceData(pData);
                setBudgets(bData);
                setNotes(nData);
                setDirectors(dData);
                setGoals(gData);
            } catch (error) {
                 console.error("Error fetching initial data from Firebase:", error);
                 const errorMessage = error instanceof Error ? error.message : String(error);
                 setDbStatus({ status: 'error', message: `Successfully connected, but failed to fetch data.\n\nError: ${errorMessage}` });
            }
        }
    }, [dbStatus.status]);

    useEffect(() => {
        const initDb = async () => {
            const result = await initializeFirebaseService();
            setDbStatus(result);
        };
        initDb();
    }, []);
    
    useEffect(() => {
        if (dbStatus.status === 'connected') {
            fetchData(getInitialPeriod());
        }
    }, [dbStatus.status, fetchData]);

    useEffect(() => {
        if (!activeImportJob?.id || (activeImportJob.step !== 'processing' && activeImportJob.step !== 'pending')) return;

        const unsubscribe = listenToImportJob(activeImportJob.id, (jobData) => {
            if (!jobData) return;

            setActiveImportJob(prev => {
                if (!prev) return null;
                // Avoid log duplication, but allow status updates
                const newLog = [...prev.statusLog];
                const newStatus = `  -> Job status updated: ${jobData.status}`;
                if (!newLog.includes(newStatus)) {
                    newLog.push(newStatus);
                }

                if (jobData.status === 'complete' || jobData.status === 'error') {
                    const finalStep = jobData.status === 'complete' ? (jobData.result?.isDynamicSheet ? 'guided-paste' : 'verify') : 'error';
                    
                    if (finalStep === 'guided-paste') {
                         newLog.push("\nDynamic sheet detected! AI requires separate data for each store. Please use the Guided Paste workflow.");
                         setImportDataOpen(true); // Re-open modal for guided paste
                    }
                    
                    return {
                        ...prev,
                        step: finalStep,
                        statusLog: newLog,
                        progress: { ...prev.progress, current: prev.progress.total }, // Mark progress as complete
                        extractedData: jobData.result?.isDynamicSheet ? [] : [jobData.result],
                        errors: jobData.error ? [...prev.errors, jobData.error] : prev.errors,
                    };
                }
                // For intermediate processing steps, just update the log
                return { ...prev, statusLog: newLog };
            });
        });

        return () => unsubscribe();
    }, [activeImportJob?.id, activeImportJob?.step]);


    const addNoteHandler = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => {
        const newNote = await addNoteToDb(monthlyPeriodLabel, category, content, scope, imageDataUrl);
        setNotes(prevNotes => [newNote, ...prevNotes]);
    };
    const updateNoteHandler = async (noteId: string, newContent: string, newCategory: NoteCategory) => {
        await updateNoteContent(noteId, newContent, newCategory);
        setNotes(prevNotes => prevNotes.map(n => n.id === noteId ? { ...n, content: newContent, category: newCategory } : n));
    };
    const deleteNoteHandler = async (noteId: string) => {
        await deleteNoteById(noteId);
        setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
    };
    
    const handleUpdateDirectorPhoto = async (directorId: string, file: File): Promise<string> => {
        const photoUrl = await uploadDirectorPhoto(directorId, file);
        await updateDirectorPhotoUrl(directorId, photoUrl);
        setDirectors(prev => prev.map(d => d.id === directorId ? { ...d, photo: photoUrl } : d));
        return photoUrl;
    };

    const handleUpdateDirectorContactInfo = async (directorId: string, contactInfo: { email: string; phone: string }) => {
        await updateDirectorContactInfo(directorId, contactInfo);
        setDirectors(prev => prev.map(d => d.id === directorId ? { ...d, ...contactInfo } : d));
    };

    const handleUpdateBudget = async (storeId: string, year: number, month: number, kpi: Kpi, target: number) => {
        await updateBudget(storeId, year, month, kpi, target);
        setBudgets(prevBudgets => {
            const existingBudgetIndex = prevBudgets.findIndex(b => b.storeId === storeId && b.year === year && b.month === month);
            if (existingBudgetIndex > -1) {
                const updatedBudgets = [...prevBudgets];
                updatedBudgets[existingBudgetIndex] = {
                    ...updatedBudgets[existingBudgetIndex],
                    targets: {
                        ...updatedBudgets[existingBudgetIndex].targets,
                        [kpi]: target
                    }
                };
                return updatedBudgets;
            } else {
                return [...prevBudgets, { storeId, year, month, targets: { [kpi]: target } }];
            }
        });
    };

    const handleSetGoal = async (directorId: View, quarter: number, year: number, kpi: Kpi, target: number) => {
        const newGoal = await addGoal(directorId, quarter, year, kpi, target);
        setGoals(prevGoals => [...prevGoals, newGoal]);
    };

    const handleSaveDataForPeriod = async (storeId: string, period: Period, data: PerformanceData) => {
        await savePerformanceDataForPeriod(storeId, period, data);
        await fetchData(getInitialPeriod());
    };

    const handleImportJobUpdate = useCallback((jobId: string, updates: Partial<typeof activeImportJob>) => {
        setActiveImportJob(prev => prev && prev.id === jobId ? { ...prev, ...updates } as typeof activeImportJob : prev);
    }, []);

    const handleConfirmImport = async (verifiedData: any[]) => {
        if (!activeImportJob) return;

        handleImportJobUpdate(activeImportJob.id, { step: 'processing', statusLog: [...activeImportJob.statusLog, 'Beginning final import...'] });
        
        let hasErrors = false;
        const newLogs = [...activeImportJob.statusLog];

        for (const item of verifiedData) {
            newLogs.push(`Importing '${item.dataType}' from '${item.sourceName}'...`);
            try {
                if (item.dataType === 'Actuals') await batchImportActualsData(item.data);
                else if (item.dataType === 'Budget') await batchImportBudgetData(item.data);
                newLogs.push(`  -> SUCCESS: Imported ${item.data.length} rows.`);
            } catch (err) {
                hasErrors = true;
                const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
                newLogs.push(`  -> ERROR: ${errorMsg}`);
                handleImportJobUpdate(activeImportJob.id, { errors: [...activeImportJob.errors, `IMPORT FAILED: ${item.sourceName} - ${errorMsg}`] });
            }
        }
        
        newLogs.push('\nImport Complete.');
        handleImportJobUpdate(activeImportJob.id, { step: 'finished', statusLog: newLogs });
        fetchData(getInitialPeriod()); // Refresh dashboard data
    };

    const openProfileModal = (director: DirectorProfile) => {
        setSelectedDirector(director);
        setProfileOpen(true);
    };

    const openImportModal = () => {
        if (activeImportJob) {
            setImportDataOpen(true);
        } else {
            setActiveImportJob(null);
            setImportDataOpen(true);
        }
    }

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 flex">
            <Sidebar 
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentView={currentView}
                setCurrentView={setCurrentView}
                directors={directors}
                onOpenProfile={openProfileModal}
                onOpenAlerts={() => setIsAlertsModalOpen(true)}
                onOpenDataEntry={openImportModal}
                onOpenStrategyHub={() => setStrategyHubOpen(true)}
                onOpenScenarioModeler={() => setScenarioModelerOpen(true)}
                onOpenExecutiveSummary={() => setExecutiveSummaryOpen(true)}
            />
            
            <div className="flex-1 overflow-y-auto transition-all duration-300">
                <AnimatePresence mode="wait">
                    <motion.main
                        key={currentPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {currentPage === 'Dashboard' && (
                            <DashboardPage 
                                currentView={currentView}
                                notes={notes}
                                onAddNote={addNoteHandler}
                                onUpdateNote={updateNoteHandler}
                                onDeleteNote={deleteNoteHandler}
                                dbStatus={dbStatus}
                                loadedData={performanceData}
                                setLoadedData={setPerformanceData}
                                budgets={budgets}
                                isAlertsModalOpen={isAlertsModalOpen}
                                setIsAlertsModalOpen={setIsAlertsModalOpen}
                                isExecutiveSummaryOpen={isExecutiveSummaryOpen}
                                // FIX: Corrected the prop value to match the state setter function name.
                                setIsExecutiveSummaryOpen={setExecutiveSummaryOpen}
                            />
                        )}
                        {currentPage === 'Budget Planner' && <BudgetPlanner allBudgets={budgets} onUpdateBudget={handleUpdateBudget} />}
                        {currentPage === 'Goal Setter' && <GoalSetter goals={goals} onSetGoal={handleSetGoal} />}
                        {currentPage === 'News' && <NewsFeedPage />}
                        {currentPage === 'Data Entry' && <DataEntryPage onSave={handleSaveDataForPeriod} />}
                    </motion.main>
                </AnimatePresence>
            </div>


            {/* Modals & Indicators */}
             <ImportDataModal 
                isOpen={isImportDataOpen}
                onClose={() => setImportDataOpen(false)}
                activeJob={activeImportJob}
                setActiveJob={setActiveImportJob}
                onConfirmImport={handleConfirmImport}
            />
             {activeImportJob && !isImportDataOpen && (
                <ImportStatusIndicator
                    job={activeImportJob}
                    onExpand={() => setImportDataOpen(true)}
                    onDismiss={() => setActiveImportJob(null)}
                />
            )}
            <StrategyHubModal
                isOpen={isStrategyHubOpen}
                onClose={() => setStrategyHubOpen(false)}
            />
            <ScenarioModeler isOpen={isScenarioModelerOpen} onClose={() => setScenarioModelerOpen(false)} data={{}} />
            <DirectorProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setProfileOpen(false)} 
                director={selectedDirector} 
                selectedKpi={Kpi.Sales} 
                period={getInitialPeriod()}
                onUpdatePhoto={handleUpdateDirectorPhoto}
                onUpdateContactInfo={handleUpdateDirectorContactInfo}
            />

        </div>
    );
};

export default App;
