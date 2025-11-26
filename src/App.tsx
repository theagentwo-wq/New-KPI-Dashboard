
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { View, Period, Note, NoteCategory, StorePerformanceData, Budget, DirectorProfile, Goal, Deployment, FirebaseStatus, PerformanceData, ActiveJob } from './types';
import { DIRECTORS, ALL_STORES } from './constants';
import { getDefaultPeriod } from './utils/dateUtils';
import { 
    initializeFirebaseService, 
    getNotes, 
    addNote as fbAddNote,
    updateNoteContent,
    deleteNoteById,
    savePerformanceDataForPeriod,
    getDirectorProfiles,
    addGoal as fbAddGoal,
    getPerformanceData,
    getBudgets,
    getGoalsForDirector,
    getDeploymentsForDirector,
} from './services/firebaseService';
import { DirectorProfileModal } from './components/DirectorProfileModal';
import { ImportDataModal } from './components/ImportDataModal';
import { StrategyHubModal } from './components/StrategyHubModal';

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState<'Dashboard' | 'Financials' | 'Data Entry' | 'Budget Planner' | 'Goal Setter' | 'News'>('Dashboard');
  
  const [activeView, setActiveView] = useState<View>(View.TotalCompany);
  const [activePeriod, setActivePeriod] = useState<Period>(getDefaultPeriod());

  const [dbStatus, setDbStatus] = useState<FirebaseStatus>({ status: 'initializing' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadedData, setLoadedData] = useState<StorePerformanceData[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [directors, setDirectors] = useState<DirectorProfile[]>(DIRECTORS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);
  const [isDirectorProfileOpen, setIsDirectorProfileOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [isStrategyHubOpen, setStrategyHubOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const status = await initializeFirebaseService();
      setDbStatus(status);
      if (status.status === 'connected') {
        const [initialNotes, initialDirectors] = await Promise.all([
          getNotes(),
          getDirectorProfiles(),
        ]);
        setNotes(initialNotes);
        // We use the initial directors from constants.ts, but in a real app this would be fetched
        // setDirectors(initialDirectors);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        if (dbStatus.status !== 'connected') return;

        const startYear = activePeriod.startDate.getFullYear();
        const endYear = activePeriod.endDate.getFullYear();
        const yearsToFetch = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

        const promises: Promise<any>[] = [
            getPerformanceData(activePeriod.startDate, activePeriod.endDate)
        ];

        yearsToFetch.forEach(year => {
            promises.push(getBudgets(year));
        });

        const results = await Promise.all(promises);
        const performanceData = results[0];
        const allFetchedBudgets = results.slice(1).flat();

        setLoadedData(performanceData);
        setBudgets(allFetchedBudgets);
    };

    fetchData();
  }, [activePeriod, dbStatus.status]);

  const handleAddNote = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string): Promise<void> => {
    const newNote = await fbAddNote(monthlyPeriodLabel, category, content, scope, imageDataUrl);
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = async (noteId: string, newContent: string, newCategory: NoteCategory) => {
    await updateNoteContent(noteId, newContent, newCategory);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: newContent, category: newCategory } : n));
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNoteById(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };
    
  const handleSaveData = async (storeId: string, period: Period, data: PerformanceData) => {
      await savePerformanceDataForPeriod(storeId, period, data);
  };

  const handleOpenProfile = async (director: DirectorProfile) => {
    setSelectedDirector(director);
    if (dbStatus.status === 'connected') {
        // Fetching deployments for the director. Goals could be handled similarly.
        const directorDeployments = await getDeploymentsForDirector(director.id);
        setDeployments(directorDeployments);
    }
    setIsDirectorProfileOpen(true);
  };
    
  const handleSaveGoal = async (goal: Omit<Goal, 'id'>) => {
      const newGoal = await fbAddGoal(goal.directorId, goal.quarter, goal.year, goal.kpi, goal.target);
      setGoals(prev => [...prev, newGoal]);
  };
  
  const handleConfirmImport = (job: ActiveJob) => {
    console.log('Confirmed import:', job);
    setImportModalOpen(false);
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage 
                    activeView={activeView}
                    activePeriod={activePeriod}
                    setActivePeriod={setActivePeriod}
                    notes={notes}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    loadedData={loadedData}
                    budgets={budgets}
                    isAlertsModalOpen={isAlertsModalOpen}
                    setIsAlertsModalOpen={setIsAlertsModalOpen}
                    isExecutiveSummaryOpen={isExecutiveSummaryOpen}
                    setIsExecutiveSummaryOpen={setIsExecutiveSummaryOpen}
                    dbStatus={dbStatus}
                />;
      case 'Data Entry':
        return <DataEntryPage onSave={handleSaveData} />;
      case 'Financials':
        return <FinancialsPage />;
      default:
        return <div className="p-6 text-white"><h1 className="text-2xl font-bold">{activePage}</h1><p>This page is under construction.</p></div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentPage={activePage}
        setCurrentPage={setActivePage}
        currentView={activeView}
        setCurrentView={setActiveView}
        directors={directors}
        onOpenProfile={handleOpenProfile}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenDataEntry={() => setImportModalOpen(true)}
        onOpenScenarioModeler={() => {}}
        onOpenExecutiveSummary={() => setIsExecutiveSummaryOpen(true)}
        onOpenStrategyHub={() => setStrategyHubOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeView={activeView} 
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
      
      {selectedDirector && <DirectorProfileModal
        isOpen={isDirectorProfileOpen}
        onClose={() => setIsDirectorProfileOpen(false)}
        director={selectedDirector}
        stores={ALL_STORES} // Pass all stores
      />}

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        activeJob={activeJob}
        setActiveJob={setActiveJob}
        onConfirmImport={handleConfirmImport}
      />
      
      <StrategyHubModal
        isOpen={isStrategyHubOpen}
        onClose={() => setStrategyHubOpen(false)}
        activePeriod={activePeriod}
        activeView={activeView}
      />
    </div>
  );
};

export default App;
