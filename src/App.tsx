
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { View, Period } from './types';
import { VIEWS } from './constants';
import { getDefaultPeriod } from './utils/dateUtils';

const App = () => {
  const [activeView, setActiveView] = useState<View>(View.TotalCompany);
  const [activePage, setActivePage] = useState('dashboard');
  const [activePeriod, setActivePeriod] = useState<Period>(getDefaultPeriod());

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage activeView={activeView} activePeriod={activePeriod} />;
      case 'data-entry':
        return <DataEntryPage activeView={activeView} activePeriod={activePeriod} />;
      case 'financials':
        return <FinancialsPage activeView={activeView} activePeriod={activePeriod} />;
      default:
        return <DashboardPage activeView={activeView} activePeriod={activePeriod} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        views={VIEWS}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeView={activeView} 
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
