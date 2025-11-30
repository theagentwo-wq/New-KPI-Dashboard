
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { View, Period, Note, NoteCategory, StorePerformanceData, Budget, DirectorProfile, FirebaseStatus, PerformanceData, ActiveJob } from './types';
import { DIRECTORS } from './constants';
import { getDefaultPeriod } from './utils/dateUtils';
import { 
    initializeFirebaseService, 
    getNotes, 
    addNote as fbAddNote,
    updateNoteContent,
    deleteNoteById,
    savePerformanceDataForPeriod,
    getDirectorProfiles,
    getPerformanceData,
    getBudgets,
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
  const [directors] = useState<DirectorProfile[]>(DIRECTORS);
  
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);
  const [isDirectorProfileOpen, setIsDirectorProfileOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [isStrategyHubOpen, setStrategyHubOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] Starting Firebase initialization...');
        const status = await initializeFirebaseService();
        console.log('[App] Firebase status:', status);
        setDbStatus(status);
        if (status.status === 'connected') {
          console.log('[App] Fetching initial data...');
          const [initialNotes] = await Promise.all([
            getNotes(),
            getDirectorProfiles(),
          ]);
          setNotes(initialNotes);
          console.log('[App] Initial data loaded successfully');
          // We use the initial directors from constants.ts, but in a real app this would be fetched
        } else {
          console.warn('[App] Firebase not connected:', status);
        }
      } catch (error) {
        console.error('[App] ❌ ERROR during initialization:', error);
        setDbStatus({ status: 'error', message: (error as Error).message, error: (error as Error).message });
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        if (dbStatus.status !== 'connected') return;

        try {
          console.log('[App] Fetching performance data and budgets...');
          const startYear = activePeriod.startDate.getFullYear();
          const endYear = activePeriod.endDate.getFullYear();
          const yearsToFetch = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

          const promises: Promise<any>[] = [
              getPerformanceData()
          ];

          yearsToFetch.forEach(year => {
              promises.push(getBudgets(year));
          });

          const results = await Promise.all(promises);
          const performanceData = results[0];
          const allFetchedBudgets = results.slice(1).flat();

          setLoadedData(performanceData);
          setBudgets(allFetchedBudgets);
          console.log('[App] Performance data and budgets loaded successfully');
        } catch (error) {
          console.error('[App] ❌ ERROR fetching data:', error);
        }
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
        await getDeploymentsForDirector(director.id);
    }
    setIsDirectorProfileOpen(true);
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
