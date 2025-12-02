
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { GoalSetterPage } from './pages/GoalSetterPage';
import { IndustryNewsPage } from './pages/IndustryNewsPage';
import { View, Period, Note, NoteCategory, StorePerformanceData, Budget, DirectorProfile, FirebaseStatus, PerformanceData, ActiveJob } from './types';
import { getDefaultPeriod } from './utils/dateUtils';
import {
    initializeFirebaseService,
    getNotes,
    addNote as fbAddNote,
    updateNoteContent,
    deleteNoteById,
    savePerformanceDataForPeriod,
    checkExistingData,
    getDirectorProfiles,
    getPerformanceData,
    getBudgets,
    getDeploymentsForDirector,
} from './services/firebaseService';
import { DirectorProfileModal } from './components/DirectorProfileModal';
import { ImportDataModal } from './components/ImportDataModal';
import { StrategyHubModal } from './components/StrategyHubModal';
import { Modal } from './components/Modal';

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState<'Dashboard' | 'Financials' | 'Data Entry' | 'Budget Planner' | 'Goal Setter' | 'News'>('Dashboard');
  
  const [activeView, setActiveView] = useState<View>(View.TotalCompany);
  const [activePeriod, setActivePeriod] = useState<Period>(getDefaultPeriod());

  const [dbStatus, setDbStatus] = useState<FirebaseStatus>({ status: 'initializing' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadedData, setLoadedData] = useState<StorePerformanceData[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [directors, setDirectors] = useState<DirectorProfile[]>([]);
  
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(false);
  const [isDirectorProfileOpen, setIsDirectorProfileOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [isStrategyHubOpen, setStrategyHubOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    duplicates: Array<{ store: string; date: string; existingKpis: string[] }>;
    jobData: ActiveJob;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[App] Starting Firebase initialization...');
        const status = await initializeFirebaseService();
        console.log('[App] Firebase status:', status);
        setDbStatus(status);
        if (status.status === 'connected') {
          console.log('[App] Fetching initial data...');
          const [initialNotes, initialDirectors] = await Promise.all([
            getNotes(),
            getDirectorProfiles(),
          ]);
          console.log('[App] Received', initialNotes.length, 'notes from getNotes()');
          console.log('[App] Received', initialDirectors.length, 'directors from getDirectorProfiles()');
          console.log('[App] Notes data:', initialNotes);
          console.log('[App] Directors data:', initialDirectors);
          setNotes(initialNotes);
          setDirectors(initialDirectors);
          console.log('[App] Initial data loaded successfully, notes and directors state updated')
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
    
  const handleConfirmImport = async (job: ActiveJob) => {
    try {
      // Step 1: Check for duplicates
      const duplicates: Array<{ store: string; date: string; existingKpis: string[] }> = [];

      const { findFiscalMonthForDate } = await import('./utils/dateUtils');

      for (const source of job.extractedData) {
        for (const row of source.data) {
          const storeName = row['Store Name'];
          const weekStartDate = row['Week Start Date'];

          if (!storeName || !weekStartDate) continue;

          // Parse the date and find matching fiscal month (P1-P12)
          const dateObj = new Date(weekStartDate);
          const matchingPeriod = findFiscalMonthForDate(dateObj);

          if (matchingPeriod) {
            const existingData = await checkExistingData(storeName, matchingPeriod);
            if (existingData && Object.keys(existingData).length > 0) {
              duplicates.push({
                store: storeName,
                date: weekStartDate,
                existingKpis: Object.keys(existingData)
              });
            }
          }
        }
      }

      // Step 2: If duplicates found, show warning
      if (duplicates.length > 0) {
        setDuplicateWarning({ duplicates, jobData: job });
        return;
      }

      // Step 3: No duplicates, proceed with import
      await performImport(job);
    } catch (error) {
      console.error('[App] Error in handleConfirmImport:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const performImport = async (job: ActiveJob, skipDuplicates = false, clearFirst = false) => {
    try {
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;
      let clearedCount = 0;
      const errors: string[] = [];

      const { findFiscalMonthForDate } = await import('./utils/dateUtils');
      const { Kpi } = await import('./types');
      const { clearPeriodData } = await import('./services/firebaseService');

      // Step 1: Clear existing data for the period if requested
      if (clearFirst && job.extractedData.length > 0 && job.extractedData[0].data.length > 0) {
        const firstRow = job.extractedData[0].data[0];
        const weekStartDate = firstRow['Week Start Date'];
        if (weekStartDate) {
          const dateObj = new Date(weekStartDate);
          const matchingPeriod = findFiscalMonthForDate(dateObj);
          if (matchingPeriod) {
            console.log(`[App] Clearing all data for period: ${matchingPeriod.label}`);
            clearedCount = await clearPeriodData(matchingPeriod);
            console.log(`[App] Cleared ${clearedCount} existing records`);
          }
        }
      }

      for (const source of job.extractedData) {
        for (const row of source.data) {
          try {
            const storeName = row['Store Name'];
            const weekStartDate = row['Week Start Date'];

            if (!storeName || !weekStartDate) {
              errors.push(`Missing store name or date in row`);
              errorCount++;
              continue;
            }

            // Parse date and find matching fiscal month (P1-P12)
            const dateObj = new Date(weekStartDate);
            const matchingPeriod = findFiscalMonthForDate(dateObj);

            if (!matchingPeriod) {
              errors.push(`No matching period for ${storeName} on ${weekStartDate}`);
              errorCount++;
              continue;
            }

            // Check if should skip duplicate
            if (skipDuplicates) {
              const existingData = await checkExistingData(storeName, matchingPeriod);
              if (existingData && Object.keys(existingData).length > 0) {
                skipCount++;
                continue;
              }
            }

            // Extract KPI data
            const kpiData: PerformanceData = {};
            const kpiMapping: Record<string, typeof Kpi[keyof typeof Kpi]> = {
              'Sales': Kpi.Sales,
              'Guests': Kpi.Guests,
              'Labor%': Kpi.TotalLabor, // AI extracts "Labor%" but it's actually Total Labor data
              'SOP': Kpi.SOP,
              'Avg Ticket': Kpi.AvgTicket,
              'Prime Cost': Kpi.PrimeCost,
              'Avg. Reviews': Kpi.AvgReviews,
              'COGS': Kpi.COGS,
              'Variable Labor': Kpi.VariableLabor,
              'Total Labor': Kpi.TotalLabor, // Keep this in case AI extracts it correctly
              'Culinary Audit Score': Kpi.CulinaryAuditScore,
              'Reviews': Kpi.AvgReviews
            };

            for (const [columnName, kpi] of Object.entries(kpiMapping)) {
              const value = row[columnName];
              if (value !== undefined && value !== null && value !== '') {
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                if (!isNaN(numValue)) {
                  // Convert ALL percentage KPIs from percentage form (28.5) to decimal (0.285)
                  const { KPI_CONFIG } = await import('./constants');
                  const kpiConfig = KPI_CONFIG[kpi];
                  if (kpiConfig && kpiConfig.format === 'percent') {
                    kpiData[kpi] = numValue / 100;
                  } else {
                    kpiData[kpi] = numValue;
                  }
                }
              }
            }

            // Extract P&L data if present
            const pnlData = row['pnl'] || [];

            // Save to Firestore
            if (Object.keys(kpiData).length > 0) {
              await savePerformanceDataForPeriod(storeName, matchingPeriod, kpiData, pnlData);
              successCount++;
            } else {
              errors.push(`No valid KPI data for ${storeName} on ${weekStartDate}`);
              errorCount++;
            }
          } catch (rowError) {
            const msg = rowError instanceof Error ? rowError.message : 'Unknown error';
            errors.push(`Error processing row: ${msg}`);
            errorCount++;
          }
        }
      }

      // Show results
      let message = `Import complete!`;
      if (clearedCount > 0) message += `\n🗑️ ${clearedCount} old records cleared`;
      message += `\n✓ ${successCount} records saved`;
      if (skipCount > 0) message += `\n⊘ ${skipCount} duplicates skipped`;
      if (errorCount > 0) message += `\n✗ ${errorCount} errors`;
      if (errors.length > 0) {
        message += `\n\nErrors:\n${errors.slice(0, 5).join('\n')}`;
        if (errors.length > 5) message += `\n... and ${errors.length - 5} more`;
      }

      alert(message);
      setImportModalOpen(false);
      setActiveJob(null);
      setDuplicateWarning(null);

      // Reload data to show new imports
      if (successCount > 0) {
        const performanceData = await getPerformanceData();
        setLoadedData(performanceData);
      }
    } catch (error) {
      console.error('[App] Error in performImport:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
      case 'Goal Setter':
        return <GoalSetterPage />;
      case 'News':
        return <IndustryNewsPage />;
      default:
        return <div className="p-6 text-white"><h1 className="text-2xl font-bold">{activePage}</h1><p>This page is under construction.</p></div>;
    }
  };

  // Show loading screen while Firebase is initializing
  if (dbStatus.status === 'initializing') {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading KPI Dashboard...</div>
          <div className="text-slate-400">Connecting to database...</div>
        </div>
      </div>
    );
  }

  // Show error screen if Firebase failed to initialize
  if (dbStatus.status === 'error') {
    return (
      <div className="flex h-screen bg-slate-900 text-red-400 items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <div className="text-2xl font-bold mb-4">❌ Database Connection Error</div>
          <div className="text-slate-300 mb-4">{dbStatus.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <Modal
          isOpen={true}
          onClose={() => setDuplicateWarning(null)}
          title="⚠️ Duplicate Data Detected"
          size="large"
        >
          <div className="space-y-4">
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4">
              <p className="text-yellow-300 font-semibold mb-2">
                The following records already have data in the system:
              </p>
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                {duplicateWarning.duplicates.map((dup, idx) => (
                  <div key={idx} className="bg-slate-800 rounded p-3 text-sm">
                    <div className="text-cyan-400 font-semibold">{dup.store}</div>
                    <div className="text-slate-400">Week: {dup.date}</div>
                    <div className="text-slate-500 text-xs mt-1">
                      Existing KPIs: {dup.existingKpis.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-md p-4">
              <p className="text-slate-300 text-sm mb-3">
                <strong>Choose how to proceed:</strong>
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• <strong className="text-cyan-400">Skip Duplicates:</strong> Only import new records, preserve existing data</p>
                <p>• <strong className="text-red-400">Clear Period & Replace:</strong> Delete ALL data for this fiscal period (including weekly data), then import fresh data</p>
                <p>• <strong className="text-slate-400">Cancel:</strong> Go back and review the data</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performImport(duplicateWarning.jobData, true, false);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-lg shadow-cyan-900/20"
              >
                Skip Duplicates
              </button>
              <button
                onClick={() => {
                  if (confirm('⚠️ This will DELETE ALL data for this fiscal period before importing.\n\nThis includes weekly data that may exist.\n\nAre you sure?')) {
                    performImport(duplicateWarning.jobData, false, true);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-lg shadow-red-900/20"
              >
                🗑️ Clear Period & Replace
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default App;
