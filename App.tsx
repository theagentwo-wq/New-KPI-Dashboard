import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Kpi, PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Goal, SavedView, DirectorProfile, Note, NoteCategory, Anomaly } from './types';
import { DIRECTORS } from './constants';
import { getInitialPeriod, ALL_PERIODS } from './utils/dateUtils';
import { generateDataForPeriod, generateMockBudgets, generateMockGoals } from './data/mockData';
import { DataEntryModal } from './components/DataEntryModal';
import { ScenarioModeler } from './components/ScenarioModeler';
import { DirectorProfileModal } from './components/DirectorProfileModal';
import { BudgetPlanner } from './components/BudgetPlanner';
import { GoalSetter } from './components/GoalSetter';
import { getNotes, addNote as addNoteToDb, updateNoteContent, deleteNoteById, initializeFirebaseService } from './services/firebaseService';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewsFeedPage } from './pages/NewsFeedPage';
import { ImageUploaderModal } from './components/ImageUploaderModal';


// Main App Component
const App: React.FC = () => {
    // State
    const [loadedData, setLoadedData] = useState<StorePerformanceData[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>(generateMockBudgets());
    const [goals, setGoals] = useState<Goal[]>(generateMockGoals());
    const [notes, setNotes] = useState<Note[]>([]);
    const [dbStatus, setDbStatus] = useState<'initializing' | 'connected' | 'error'>('initializing');
    const [directors, setDirectors] = useState<DirectorProfile[]>(DIRECTORS);
    
    const [currentPage, setCurrentPage] = useState<'Dashboard' | 'Budget Planner' | 'Goal Setter' | 'News'>('Dashboard');
    const [currentView, setCurrentView] = useState<View>('Total Company');
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Week');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    
    // Modal States
    const [isDataEntryOpen, setDataEntryOpen] = useState(false);
    const [isScenarioModelerOpen, setScenarioModelerOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isImageUploaderOpen, setImageUploaderOpen] = useState(false);
    const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | undefined>(undefined);

    useEffect(() => {
        const initDb = async () => {
            const success = await initializeFirebaseService();
            setDbStatus(success ? 'connected' : 'error');
        };
        initDb();
    }, []);
    
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
    
    const addNoteHandler = async (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string) => {
        if (dbStatus !== 'connected') return;
        try {
            const newNote = await addNoteToDb(monthlyPeriodLabel, category, content, scope, imageUrl);
            setNotes(prev => [newNote, ...prev]);
        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };
    
    const updateNoteHandler = async (noteId: string, newContent: string, newCategory: NoteCategory) => {
        if (dbStatus !== 'connected') return;
        try {
            await updateNoteContent(noteId, newContent, newCategory);
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: newContent, category: newCategory } : n));
        } catch (error) {
            console.error("Failed to update note:", error);
        }
    };

    const deleteNoteHandler = async (noteId: string) => {
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
                newBudgets[budgetIndex] = { ...newBudgets[budgetIndex], targets: { ...newBudgets[budgetIndex].targets, [kpi]: target } };
            } else {
                 const newBudget: Budget = {
                    storeId, year, month,
                    targets: { [Kpi.Sales]: 0, [Kpi.SOP]: 0, [Kpi.PrimeCost]: 0, [Kpi.AvgReviews]: 0, [Kpi.FoodCost]: 0, [Kpi.LaborCost]: 0, [Kpi.VariableLabor]: 0, [Kpi.CulinaryAuditScore]: 0, [kpi]: target }
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
            
            if (goalIndex > -1) newGoals[goalIndex] = { ...newGoals[goalIndex], target };
            else newGoals.push({ directorId, quarter, year, kpi, target });
            return newGoals.sort((a,b) => a.year - b.year || a.quarter - b.quarter);
        });
    };

    const openProfileModal = (director: DirectorProfile) => {
        setSelectedDirector(director);
        setProfileOpen(true);
    };

    const handleUpdateDirectorPhotos = (photoData: { directorId: string; base64Image: string }[]) => {
        setDirectors(prevDirectors => {
            const newDirectors = [...prevDirectors];
            photoData.forEach(update => {
                const directorIndex = newDirectors.findIndex(d => d.id === update.directorId);
                if (directorIndex > -1) {
                    newDirectors[directorIndex] = { ...newDirectors[directorIndex], photo: update.base64Image };
                }
            });
            return newDirectors;
        });
    };

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 flex">
            <Sidebar 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                currentView={currentView}
                setCurrentView={setCurrentView}
                directors={directors}
                onOpenProfile={openProfileModal}
                onOpenDataEntry={() => setDataEntryOpen(true)}
                onOpenScenarioModeler={() => setScenarioModelerOpen(true)}
                onOpenImageUploader={() => setImageUploaderOpen(true)}
            />
            
            <div className="flex-1 overflow-y-auto">
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
                                loadedData={loadedData}
                                setLoadedData={setLoadedData}
                                budgets={budgets}
                            />
                        )}
                        {currentPage === 'Budget Planner' && <BudgetPlanner allBudgets={budgets} onUpdateBudget={handleUpdateBudget} />}
                        {currentPage === 'Goal Setter' && <GoalSetter goals={goals} onSetGoal={handleSetGoal} />}
                        {currentPage === 'News' && <NewsFeedPage />}
                    </motion.main>
                </AnimatePresence>
            </div>


            {/* Modals */}
            <DataEntryModal isOpen={isDataEntryOpen} onClose={() => setDataEntryOpen(false)} onSave={() => {}} />
            <ScenarioModeler isOpen={isScenarioModelerOpen} onClose={() => setScenarioModelerOpen(false)} data={{}} />
            <DirectorProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setProfileOpen(false)} 
                director={selectedDirector} 
                selectedKpi={Kpi.Sales} 
                period={currentPeriod}
            />
             <ImageUploaderModal
                isOpen={isImageUploaderOpen}
                onClose={() => setImageUploaderOpen(false)}
                onUpdate={handleUpdateDirectorPhotos}
                directors={directors}
            />

        </div>
    );
};

export default App;