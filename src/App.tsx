
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
      const status = await initializeFirebaseService();
      setDbStatus(status);
      if (status.status === 'connected') {
        const [initialNotes] = await Promise.all([
          getNotes(),
          getDirectorProfiles(),
        ]);
        setNotes(initialNotes);
        // We use the initial directors from constants.ts, but in a real app this would be fetched
      }
    };
    init();
  }, []);

  useEffect(() => {
    const importData = async () => {
      const dataImported = localStorage.getItem('dataImported');
      if (dataImported) {
        return;
      }
      
      const csvData = `,L001-Downtown Asheville,,,L002-South Asheville,,,L003-Knoxville,,,"L004-Greenville, SC",,,L005-Chattanooga,,,L008-Raleigh,,,L009-Myrtle Beach,,,L010-Arlington,,,L011-Virginia Beach,,,L012-Franklin,,,L014-Denver,,,L015-Frisco,,,L016-Boise,,,L017-Charlotte,,,L018-Grand Rapids,,,L019-Milwaukee,,,L020-Pittsburgh,,,L021-Des Moines,,,"L022-Columbus, OH",,,L023-Indianapolis,,,L024-Las Colinas,,,L025-Omaha,,,L026-Huntsville,,,"L027-Columbia, SC",,,"L028-Gainesville, GA",,,L029-Lenexa,,,L030-Farragut,,,Total Company,,
,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025,2023,2024,2025
Total Revenue/ sales,"$7,459,341 ","$4,916,701 ","$3,430,083 ","$3,144,505 ","$2,378,389 ","$1,877,568 ","$5,307,075 ","$4,785,389 ","$3,710,144 ","$4,512,693 ","$4,154,925 ","$3,239,420 ","$3,159,856 ","$2,802,417 ","$2,149,483 ","$3,922,264 ","$3,404,057 ","$2,306,700 ","$3,471,154 ","$2,886,923 ","$2,233,585 ","$3,269,234 ","$2,638,155 ","$1,833,387 ","$3,715,781 ","$3,220,792 ","$2,385,040 ","$3,915,780 ","$3,304,177 ","$2,384,000 ","$4,220,654 ","$3,274,169 ","$2,298,461 ","$4,804,833 ","$3,471,371 ","$2,481,927 ","$3,375,863 ","$2,764,041 ","$2,117,067 ","$4,928,559 ","$3,840,446 ","$2,717,029 ","$5,178,389 ","$4,449,967 ","$3,337,603 ","$4,642,775 ","$3,850,128 ","$2,903,050 ","$3,447,736 ","$2,379,365 ","$1,743,647 ","$2,674,641 ","$1,799,721 ","$1,477,975 ","$3,960,671 ","$2,729,773 ","$1,890,548 ","$2,990,612 ","$2,704,445 ","$1,822,481 ","$1,509,621 ","$2,182,935 ","$1,782,569 ","$543,885 ","$2,665,923 ","$1,830,780 ", $-   ,"$748,421 ","$3,549,155 ", $-   , $-   ,"$3,722,613 ", $-   , $-   ,"$1,640,033 ", $-   , $-   ,"$1,598,514 ", $-   , $-   ,"$354,010 ","$84,155,920 ","$71,352,630 ","$62,816,871 "
Food COGS,22.80%,22.50%,24.10%,23.20%,24.00%,26.60%,22.10%,22.40%,25.50%,21.90%,22.00%,24.00%,22.90%,23.60%,25.50%,21.70%,22.20%,24.50%,24.80%,24.30%,26.00%,22.80%,22.20%,24.10%,23.80%,24.00%,25.40%,23.10%,22.50%,24.50%,21.40%,21.30%,24.10%,23.40%,23.10%,23.80%,23.70%,23.70%,24.90%,23.80%,23.70%,25.10%,22.70%,22.90%,24.20%,23.50%,23.10%,25.00%,25.20%,24.80%,27.40%,24.20%,24.90%,24.10%,25.10%,24.00%,24.90%,24.10%,23.40%,25.50%,26.70%,23.00%,24.50%,26.90%,24.10%,25.30%,0.00%,29.40%,25.40%,0.00%,0.00%,27.20%,0.00%,0.00%,29.50%,0.00%,0.00%,29.00%,0.00%,0.00%,29.30%,23.30%,23.30%,25.30%
Variable Labor,26.10%,25.80%,23.70%,23.70%,26.20%,28.30%,21.30%,22.20%,21.90%,23.20%,23.10%,22.50%,23.40%,23.80%,23.90%,22.90%,22.90%,23.60%,27.50%,26.50%,25.80%,26.50%,25.90%,24.20%,26.10%,24.80%,24.50%,24.40%,24.70%,23.90%,32.00%,34.40%,36.00%,22.70%,23.50%,24.60%,26.30%,26.90%,25.20%,29.10%,27.10%,25.90%,24.70%,23.70%,23.40%,25.20%,24.50%,23.80%,27.20%,26.80%,28.50%,27.50%,32.70%,28.10%,26.50%,25.60%,27.60%,31.00%,27.40%,27.10%,37.90%,28.10%,27.60%,36.90%,28.60%,30.00%,0.00%,37.50%,25.30%,0.00%,0.00%,26.10%,0.00%,0.00%,34.00%,0.00%,0.00%,27.10%,0.00%,0.00%,25.90%,26.00%,25.90%,25.80%
Prime Cost,56.70%,57.70%,56.70%,59.10%,64.60%,67.20%,51.80%,53.70%,56.90%,55.10%,55.70%,57.40%,57.90%,60.30%,61.70%,53.00%,55.20%,59.70%,60.00%,59.10%,60.90%,60.10%,60.40%,63.20%,57.50%,59.10%,58.80%,57.80%,58.60%,60.40%,61.60%,65.90%,69.80%,57.00%,58.50%,59.80%,59.80%,61.70%,61.80%,60.70%,59.30%,62.00%,54.90%,55.40%,57.50%,57.00%,56.90%,58.70%,60.80%,63.10%,70.40%,63.40%,70.30%,66.10%,60.80%,61.20%,66.30%,63.30%,60.70%,66.40%,76.40%,64.80%,66.70%,78.80%,63.70%,66.40%,0.00%,78.00%,62.70%,0.00%,0.00%,61.40%,0.00%,0.00%,74.10%,0.00%,0.00%,63.70%,0.00%,0.00%,64.40%,58.50%,59.70%,62.10%
Store Operating Profit,27.30%,22.10%,22.30%,20.00%,10.60%,5.30%,23.20%,17.80%,17.00%,25.00%,22.90%,20.00%,21.10%,15.40%,13.40%,26.20%,22.20%,10.70%,19.50%,19.00%,11.00%,13.00%,7.80%,1.60%,20.80%,15.50%,11.20%,20.30%,16.90%,11.40%,15.30%,5.30%,-0.40%,19.00%,9.90%,3.10%,16.90%,12.40%,11.30%,19.20%,16.90%,10.40%,28.10%,25.90%,22.80%,23.20%,21.60%,16.10%,16.20%,6.90%,2.20%,6.40%,-10.30%,-2.80%,16.20%,7.90%,-1.50%,16.10%,10.60%,1.60%,-8.80%,-1.40%,-5.00%,-9.60%,10.60%,7.00%,0.00%,-9.80%,6.00%,0.00%,0.00%,15.70%,0.00%,0.00%,-1.10%,0.00%,0.00%,15.80%,0.00%,0.00%,15.80%,19.70%,13.80%,10.30%
Culinary Audit,92.03,94.13,91.73,94.13,92.73,94.07,93.95,97.8,95.18,91.15,96.05,94.77,94.13,93.6,93.13,89.63,90.1,89.75,91.5,95.53,88.7,93.95,90.8,96.4,94.3,91.33,91.85,94.83,97.3,97.8,93.95,89.4,90.1,93.6,92.55,94.53,89.63,91.5,94.3,93.78,91.73, -   ,95,94.5,92.43,95.18,91.15,93.13,91.5,87.25,96.4,90.63,95.35,96.93,95.35,94.48,94.77,91.73,91.03,95.03,92.55,89.05,90.8,94.3,93.25,93.78, -   , -   ,92.2, -   , -   ,95, -   , -   ,96.05, -   , -   , -   , -   , -   , -   ,93.1,93.29,94.02
Reviews,4.54,4.49,4.45,4.47,4.49,4.44,4.62,4.58,4.65,4.51,4.51,4.54,4.43,4.38,4.56,4.41,4.38,4.37,4.43,4.58,4.6,4.27,4.37,4.45,4.36,4.34,4.34,4.51,4.36,4.19,4.48,4.43,4.52,4.41,4.34,4.39,4.49,4.44,4.48,4.13,4.18,4.17,4.58,4.48,4.42,4.48,4.53,4.53,4.25,4.17,4.29,4.21,3.93,4.08,4.36,4.38,4.36,4.32,4.38,4.2,4.39,4.34,4.29,4.63,4.33,4.28, -   , -   ,4.53, -   , -   ,4.4, -   , -   ,4.59, -   , -   ,4.27, -   , -   ,4.51,4.42,4.4,4.42`;

      const storeNameMapping = {
        'L001-Downtown Asheville': 'Downtown Asheville, NC',
        'L002-South Asheville': 'South Asheville, NC',
        'L003-Knoxville': 'Knoxville, TN',
        'L004-Greenville, SC': 'Greenville, SC',
        'L005-Chattanooga': 'Chattanooga, TN',
        'L008-Raleigh': 'Raleigh, NC',
        'L009-Myrtle Beach': 'Myrtle Beach, SC',
        'L010-Arlington': 'Arlington, VA',
        'L011-Virginia Beach': 'Virginia Beach, VA',
        'L012-Franklin': 'Franklin, TN',
        'L014-Denver': 'Denver, CO',
        'L015-Frisco': 'Frisco, TX',
        'L016-Boise': 'Boise, ID',
        'L017-Charlotte': 'Charlotte, NC',
        'L018-Grand Rapids': 'Grand Rapids, MI',
        'L019-Milwaukee': 'Milwaukee, WI',
        'L020-Pittsburgh': 'Pittsburgh, PA',
        'L021-Des Moines': 'Des Moines, IA',
        'L022-Columbus, OH': 'Columbus, OH',
        'L023-Indianapolis': 'Indianapolis, IN',
        'L024-Las Colinas': 'Las Colinas, TX',
        'L025-Omaha': 'Omaha, NE',
        'L026-Huntsville': 'Huntsville, AL',
        'L027-Columbia, SC': 'Columbia, SC',
        'L028-Gainesville, GA': 'Gainesville, GA',
        'L029-Lenexa': 'Lenexa, KS',
        'L030-Farragut': 'Farragut, TN',
      };

      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const years = lines[1].split(',');
      const dataRows = lines.slice(2);

      const kpiMapping = {
        'Total Revenue/ sales': 'totalRevenue',
        'Food COGS': 'foodCOGS',
        'Variable Labor': 'variableLabor',
        'Prime Cost': 'primeCost',
        'Store Operating Profit': 'storeOperatingProfit',
        'Culinary Audit': 'culinaryAudit',
        'Reviews': 'reviews'
      };

      for (let i = 1; i < headers.length; i += 3) {
        const storeId = headers[i].replace(/"/g, '');
        const storeName = storeNameMapping[storeId];
        if (!storeName) continue;

        for (let j = 0; j < 3; j++) {
          const year = parseInt(years[i + j], 10);
          if (isNaN(year)) continue;

          const yearData = {};
          dataRows.forEach(row => {
            const rowData = row.split(',');
            const kpiName = rowData[0];
            const kpiKey = kpiMapping[kpiName];
            const valueStr = rowData[i + j];
            if (kpiKey && valueStr && valueStr.trim() !== '$-' && valueStr.trim() !== '-') {
                if (valueStr.includes('%')) {
                    yearData[kpiKey] = parseFloat(valueStr.replace('%', '')) / 100;
                } else if (kpiName === 'Total Revenue/ sales') {
                    yearData[kpiKey] = parseFloat(valueStr.replace(/\$|,"/g, '').replace(/,/g, ''));
                } else {
                    yearData[kpiKey] = parseFloat(valueStr);
                }
            }
          });

          if (Object.keys(yearData).length > 0) {
            for (let month = 0; month < 12; month++) {
              const monthData: PerformanceData = {};
              if (yearData['totalRevenue']) {
                  monthData['totalRevenue'] = yearData['totalRevenue'] / 12;
              }
              Object.keys(yearData).forEach(key => {
                  if (key !== 'totalRevenue') {
                      monthData[key] = yearData[key];
                  }
              });

              const period: Period = {
                startDate: new Date(year, month, 1),
                endDate: new Date(year, month + 1, 0)
              };
              await savePerformanceDataForPeriod(storeName, period, monthData);
            }
          }
        }
      }
      localStorage.setItem('dataImported', 'true');
      console.log('Data import complete.');
    };

    if (dbStatus.status === 'connected') {
      importData();
    }
  }, [dbStatus.status]);

  useEffect(() => {
    const fetchData = async () => {
        if (dbStatus.status !== 'connected') return;

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
