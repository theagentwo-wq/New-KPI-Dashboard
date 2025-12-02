import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PerformanceData, Period, ComparisonMode, View, StorePerformanceData, Budget, Anomaly, Note, NoteCategory, DataItem, Kpi, PeriodType, PeriodOption, FirebaseStatus, KPISummaryCardsProps, AnomalyDetailModalProps, WeatherInfo } from '../types';
import { KPI_CONFIG, DIRECTORS, ALL_STORES } from '../constants';
import { getPreviousPeriod, getYoYPeriod, ALL_PERIODS } from '../utils/dateUtils';
import { getWeatherForLocation } from '../services/weatherService';
// import { AIAssistant } from '../components/AIAssistant'; // DISABLED - was causing 500 errors on page load
import { NotesPanel } from '../components/NotesPanel';
import { LocationInsightsModal } from '../components/LocationInsightsModal';
import { CompanyStoreRankings } from '../components/CompanyStoreRankings';
import { AIAlerts } from '../components/AIAlerts';
import { AnomalyDetailModal } from '../components/AnomalyDetailModal';
import { ReviewAnalysisModal } from '../components/ReviewAnalysisModal';
import { PerformanceMatrix } from '../components/PerformanceMatrix';
import { Modal } from '../components/Modal';
import { ExecutiveSummaryModal } from '../components/ExecutiveSummaryModal';
import { KPISummaryCards } from '../components/KPISummaryCards';

interface DashboardPageProps {
    activePeriod: Period;
    activeView: View;
    setActivePeriod: (period: Period) => void;
    notes: Note[];
    onAddNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => void;
    onUpdateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
    onDeleteNote: (noteId: string) => void;
    loadedData: StorePerformanceData[];
    budgets: Budget[];
    isAlertsModalOpen: boolean;
    setIsAlertsModalOpen: (isOpen: boolean) => void;
    isExecutiveSummaryOpen: boolean;
    setIsExecutiveSummaryOpen: (isOpen: boolean) => void;
    dbStatus: FirebaseStatus;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
    activePeriod, activeView, setActivePeriod, notes, onAddNote, onUpdateNote, onDeleteNote, loadedData, 
    budgets, isAlertsModalOpen, setIsAlertsModalOpen,
    isExecutiveSummaryOpen, setIsExecutiveSummaryOpen, dbStatus
}) => {
    const [periodType, setPeriodType] = useState<PeriodOption>('Week');
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('vs. Prior Period');
    const [userLocation, _setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [anomalies, _setAnomalies] = useState<Anomaly[]>([]);
    const [selectedKpi, setSelectedKpi] = useState<Kpi>(Kpi.Sales);
    const [weatherData, setWeatherData] = useState<{ [storeId: string]: WeatherInfo }>({});

    const [isLocationInsightsOpen, setLocationInsightsOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [isAnomalyModalOpen, setAnomalyModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | undefined>(undefined);

    const comparisonPeriod = useMemo(() => {
        if (comparisonMode === 'vs. Budget') return activePeriod; // No period shift for budget
        return comparisonMode === 'vs. Last Year' ? getYoYPeriod(activePeriod) : getPreviousPeriod(activePeriod);
    }, [comparisonMode, activePeriod]);
    
    const periodsForType = useMemo(() => {
        const typeMapping: { [key in PeriodOption]: PeriodType } = { 'Day': 'daily', 'Week': 'weekly', 'Month': 'monthly', 'Quarter': 'quarterly', 'Year': 'yearly' };
        return ALL_PERIODS.filter((p: Period) => p.type === typeMapping[periodType]);
    }, [periodType]);

    const currentPeriodIndex = useMemo(() => {
        return periodsForType.findIndex((p: Period) => p.label === activePeriod.label);
    }, [periodsForType, activePeriod]);
    
    const dataForActivePeriod = useMemo(() => {
        console.log(`[DashboardPage] Filtering ${loadedData.length} records for period ${activePeriod.label}`);
        console.log(`[DashboardPage] Period range: ${activePeriod.startDate.toISOString()} to ${activePeriod.endDate.toISOString()}`);
        console.log(`[DashboardPage] Period timestamps: ${activePeriod.startDate.getTime()} to ${activePeriod.endDate.getTime()}`);

        const filtered = loadedData.filter((d, index) => {
            const dataDate = new Date(d.year, d.month -1, d.day);
            const matches = dataDate >= activePeriod.startDate && dataDate <= activePeriod.endDate;

            // Log first 3 records for debugging
            if (index < 3) {
                console.log(`[DashboardPage] Record ${index}:`);
                console.log(`  Store: ${d.storeId}`);
                console.log(`  Raw values: year=${d.year}, month=${d.month}, day=${d.day}`);
                console.log(`  Created date: ${dataDate.toISOString()} (timestamp: ${dataDate.getTime()})`);
                console.log(`  Comparison 1: ${dataDate.getTime()} >= ${activePeriod.startDate.getTime()} = ${dataDate >= activePeriod.startDate}`);
                console.log(`  Comparison 2: ${dataDate.getTime()} <= ${activePeriod.endDate.getTime()} = ${dataDate <= activePeriod.endDate}`);
                console.log(`  Final match: ${matches}`);
            }

            return matches;
        });

        console.log(`[DashboardPage] Filtered to ${filtered.length} records matching period`);
        return filtered;
    }, [loadedData, activePeriod]);

    const dataForComparisonPeriod = useMemo(() => {
        if (!comparisonPeriod) return [];
        return loadedData.filter(d => {
            const dataDate = new Date(d.year, d.month - 1, d.day);
            return dataDate >= comparisonPeriod.startDate && dataDate <= comparisonPeriod.endDate;
        });
    }, [loadedData, comparisonPeriod]);


    const handlePreviousPeriod = () => {
        if (currentPeriodIndex > 0) {
            setActivePeriod(periodsForType[currentPeriodIndex - 1]);
        }
    };

    const handleNextPeriod = () => {
        if (currentPeriodIndex < periodsForType.length - 1) {
            setActivePeriod(periodsForType[currentPeriodIndex + 1]);
        }
    };
    
    const handleSetPeriodType = (type: PeriodOption) => {
        setPeriodType(type);
        const typeMapping: { [key in PeriodOption]: PeriodType } = { 'Day': 'daily', 'Week': 'weekly', 'Month': 'monthly', 'Quarter': 'quarterly', 'Year': 'yearly' };
        const relevantPeriods = ALL_PERIODS.filter(p => p.type === typeMapping[type]);
        const today = new Date();
        const newPeriod = relevantPeriods.find(p => today >= p.startDate && today <= p.endDate) || relevantPeriods[relevantPeriods.length - 1];
        if(newPeriod) setActivePeriod(newPeriod);
    };

    const handleResetView = useCallback(() => {
        handleSetPeriodType('Week');
        setComparisonMode('vs. Prior Period');
        setSelectedKpi(Kpi.Sales);
    }, []);

    const isPrevPeriodDisabled = currentPeriodIndex <= 0;
    const isNextPeriodDisabled = currentPeriodIndex >= periodsForType.length - 1;

    const directorStores = useMemo(() => {
        if (activeView === View.TotalCompany) return ALL_STORES;
        const director = DIRECTORS.find((d) => d.id === activeView);
        return director ? director.stores : [];
    }, [activeView]);

    const processDataForTable = useCallback((
        actualData: StorePerformanceData[],
        comparisonStoreData: StorePerformanceData[],
        budgetData: Budget[],
        mode: ComparisonMode,
        period: Period
    ): { [storeId: string]: DataItem } => {
        
        const aggregate = (list: StorePerformanceData[]) => {
            console.log(`[processDataForTable.aggregate] Processing ${list.length} items`);
            console.log(`[processDataForTable.aggregate] Director stores:`, directorStores);

            const storeMap: { [id: string]: { sums: PerformanceData, counts: { [k in Kpi]?: number } } } = {};
            let skippedCount = 0;
            list.forEach((item, index) => {
                if (!directorStores.includes(item.storeId)) {
                    if (index < 3) {
                        console.log(`[processDataForTable.aggregate] Skipping ${item.storeId} - not in directorStores`);
                    }
                    skippedCount++;
                    return;
                }
                const { storeId, data } = item;
                if (!storeMap[storeId]) storeMap[storeId] = { sums: {}, counts: {} };
                (Object.keys(data) as Kpi[]).forEach(kpi => {
                    const value = data[kpi];
                    if (value !== undefined) {
                        storeMap[storeId].sums[kpi] = (storeMap[storeId].sums[kpi] || 0) + value;
                        storeMap[storeId].counts[kpi] = (storeMap[storeId].counts[kpi] || 0) + 1;
                    }
                });
            });
            console.log(`[processDataForTable.aggregate] Skipped ${skippedCount} items not in directorStores`);
            console.log(`[processDataForTable.aggregate] storeMap keys:`, Object.keys(storeMap));

            const result: { [id: string]: PerformanceData } = {};
            Object.keys(storeMap).forEach(storeId => {
                const { sums, counts } = storeMap[storeId];
                result[storeId] = {};
                (Object.keys(sums) as Kpi[]).forEach(kpi => {
                    const config = KPI_CONFIG[kpi];
                    // Skip if config doesn't exist for this KPI
                    if (!config) {
                        console.warn(`[DashboardPage] No config found for KPI: ${kpi}`);
                        return;
                    }
                    const count = counts[kpi] || 1;
                    result[storeId][kpi] = config.aggregation === 'sum' ? sums[kpi] : (sums[kpi] || 0) / count;
                });
            });
            return result;
        };

        const actuals = aggregate(actualData);
        const comparisons = mode !== 'vs. Budget' ? aggregate(comparisonStoreData) : {};

        const budgetsForPeriod = budgetData.filter(b => {
            const budgetDate = new Date(b.year, b.month - 1, 15);
            return budgetDate >= period.startDate && budgetDate <= period.endDate;
        });

        const finalResult: { [storeId: string]: DataItem } = {};
        
        directorStores.forEach(storeId => {
            const actual = actuals[storeId] || {};
            let comparison: PerformanceData | undefined;

            if (mode === 'vs. Budget') {
                const relevantBudgets = budgetsForPeriod.filter(b => b.storeId === storeId);
                if (relevantBudgets.length > 0) {
                  comparison = relevantBudgets.reduce((acc, b) => ({...acc, ...b.targets}), {});
                }
            } else {
                comparison = comparisons[storeId];
            }

            const variance: PerformanceData = {};
            (Object.keys(actual) as Kpi[]).forEach(kpi => {
                const actualValue = actual[kpi];
                const comparisonValue = comparison?.[kpi];
                if (actualValue !== undefined && comparisonValue !== undefined) {
                    variance[kpi] = actualValue - comparisonValue;
                }
            });

            finalResult[storeId] = { 
                id: storeId, 
                name: storeId, 
                value: actual[selectedKpi] || 0, 
                actual: actual,
                comparison,
                variance
            };
        });

        return finalResult;

    }, [directorStores, selectedKpi]);

    const processedDataForTable = useMemo(() => {
        return processDataForTable(dataForActivePeriod, dataForComparisonPeriod, budgets, comparisonMode, activePeriod);
    }, [dataForActivePeriod, dataForComparisonPeriod, budgets, comparisonMode, activePeriod, processDataForTable]);
    
    const summaryDataForCards = useMemo(() => {
        console.log('[DashboardPage] processedDataForTable:', processedDataForTable);
        console.log('[DashboardPage] processedDataForTable keys:', Object.keys(processedDataForTable));

        const dataToSummarize = Object.values(processedDataForTable).map(d => d.actual as PerformanceData);
        console.log('[DashboardPage] dataToSummarize length:', dataToSummarize.length);
        console.log('[DashboardPage] dataToSummarize:', dataToSummarize);

        if (dataToSummarize.length === 0) {
            console.warn('[DashboardPage] No data to summarize - processedDataForTable is empty!');
            return {};
        }

        const aggregated: PerformanceData = {};
        // Use Object.values to get actual enum values, not keys
        (Object.values(Kpi) as Kpi[]).forEach(kpi => {
            const kpiConfig = KPI_CONFIG[kpi];
            // Skip if config doesn't exist for this KPI
            if (!kpiConfig) {
                console.warn(`[DashboardPage] No config found for KPI: ${kpi}`);
                return;
            }
            const values = dataToSummarize.map(d => d[kpi]).filter(v => v !== undefined) as number[];
            if (values.length === 0) return;

            if (kpiConfig.aggregation === 'sum') {
                aggregated[kpi] = values.reduce((sum, v) => sum + v, 0);
            } else {
                aggregated[kpi] = values.reduce((sum, v) => sum + v, 0) / values.length;
            }
        });
        console.log('[DashboardPage] Summary data for cards:', aggregated);
        return aggregated;
    }, [processedDataForTable]);

    const directorAggregates = useMemo(() => {
        const directorData: { [key: string]: { aggregated: DataItem } } = {};
        DIRECTORS.forEach(d => {
            const directorStoreIds = d.stores;
            const directorStoreData = directorStoreIds.reduce((acc, storeId) => {
                if(processedDataForTable[storeId]) acc[storeId] = processedDataForTable[storeId];
                return acc;
            }, {} as typeof processedDataForTable);
    
            const aggregated: { actual: PerformanceData, comparison: PerformanceData, variance: PerformanceData } = {
                actual: {}, comparison: {}, variance: {}
            };

            // Use Object.values to get actual enum values, not keys
            (Object.values(Kpi) as Kpi[]).forEach(kpi => {
                 const kpiConfig = KPI_CONFIG[kpi];
                 // Skip if config doesn't exist for this KPI
                 if (!kpiConfig) {
                     console.warn(`[DashboardPage] No config found for KPI: ${kpi}`);
                     return;
                 }
                 const actualValues = Object.values(directorStoreData).map(s => s.actual?.[kpi]).filter(v => v !== undefined) as number[];
                 const comparisonValues = Object.values(directorStoreData).map(s => s.comparison?.[kpi]).filter(v => v !== undefined) as number[];

                if (actualValues.length === 0) return;

                if (kpiConfig.aggregation === 'sum') {
                    aggregated.actual[kpi] = actualValues.reduce((a, b) => a + b, 0);
                    aggregated.comparison[kpi] = comparisonValues.reduce((a, b) => a + b, 0);
                } else {
                    aggregated.actual[kpi] = actualValues.reduce((a, b) => a + b, 0) / actualValues.length;
                    aggregated.comparison[kpi] = comparisonValues.length > 0 ? comparisonValues.reduce((a, b) => a + b, 0) / comparisonValues.length : 0;
                }
                if(aggregated.actual[kpi] !== undefined && aggregated.comparison[kpi] !== undefined) {
                    aggregated.variance[kpi] = aggregated.actual[kpi]! - aggregated.comparison[kpi]!;
                }
            });
            directorData[d.id] = { aggregated: { id: d.id, name: d.firstName, value: 0, actual: aggregated.actual, comparison: aggregated.comparison, variance: aggregated.variance }};
        });
        return directorData;
    }, [processedDataForTable]);


    const handleLocationSelect = useCallback((location: string) => {
        setSelectedLocation(location);
        setLocationInsightsOpen(true);
    }, []);

    const handleReviewClick = useCallback((location: string) => {
        setSelectedLocation(location);
        setReviewModalOpen(true);
    }, []);

    const handleAnomalySelect = useCallback((anomaly: Anomaly) => {
        setSelectedAnomaly(anomaly);
        setAnomalyModalOpen(true);
        setIsAlertsModalOpen(false);
    }, [setIsAlertsModalOpen]);

    // Fetch weather for all visible stores on mount/data change
    useEffect(() => {
        const storeIds = Object.keys(processedDataForTable);
        if (storeIds.length === 0) return;

        // Fetch weather for all stores in parallel
        const fetchAllWeather = async () => {
            const weatherPromises = storeIds.map(async (storeId) => {
                // Skip if already fetched
                if (weatherData[storeId]) return;

                try {
                    const weather = await getWeatherForLocation(storeId);
                    if (weather) {
                        setWeatherData(prev => ({ ...prev, [storeId]: weather }));
                    }
                } catch (error) {
                    console.error(`Failed to fetch weather for ${storeId}:`, error);
                }
            });

            await Promise.all(weatherPromises);
        };

        fetchAllWeather();
    }, [processedDataForTable, weatherData]);

    // const historicalDataForAI = useMemo(() => { return []; }, []); // DISABLED - only used by AI Assistant

    const kpiSummaryCardsProps: KPISummaryCardsProps = {
        data: summaryDataForCards,
        selectedKpi: selectedKpi,
        onKpiSelect: setSelectedKpi,
        period: activePeriod,
        view: activeView
    };

    const anomalyDetailModalProps: AnomalyDetailModalProps = {
        isOpen: isAnomalyModalOpen,
        onClose: () => { setAnomalyModalOpen(false); setSelectedAnomaly(undefined); },
        anomaly: selectedAnomaly,
        data: processedDataForTable
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <KPISummaryCards {...kpiSummaryCardsProps} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                <div className="xl:col-span-3 space-y-6">
                    <CompanyStoreRankings
                         data={processedDataForTable}
                         selectedKpi={selectedKpi}
                         currentView={activeView}
                         period={activePeriod}
                         periodType={periodType}
                         setPeriodType={handleSetPeriodType as (type: string) => void}
                         comparisonMode={comparisonMode}
                         setComparisonMode={setComparisonMode as (mode: string) => void}
                         onLocationSelect={handleLocationSelect}
                         onReviewClick={handleReviewClick}
                         onPrevPeriod={handlePreviousPeriod}
                         onNextPeriod={handleNextPeriod}
                         isPrevPeriodDisabled={isPrevPeriodDisabled}
                         isNextPeriodDisabled={isNextPeriodDisabled}
                         onResetView={handleResetView}
                         weatherData={weatherData}
                    />
                    <NotesPanel 
                        allNotes={notes}
                        addNote={onAddNote}
                        updateNote={onUpdateNote}
                        deleteNote={onDeleteNote}
                        currentView={activeView}
                        mainDashboardPeriod={activePeriod}
                        dbStatus={dbStatus}
                    />
                </div>
                <div className="xl:col-span-1 space-y-6 xl:sticky top-8">
                    <PerformanceMatrix periodLabel={activePeriod.label} currentView={activeView} allStoresData={processedDataForTable} directorAggregates={directorAggregates} />
                    {/* <AIAssistant data={processedDataForTable} historicalData={historicalDataForAI} view={activeView} period={activePeriod} userLocation={userLocation} /> */}
                </div>
            </div>
             <LocationInsightsModal 
                isOpen={isLocationInsightsOpen}
                onClose={() => setLocationInsightsOpen(false)}
                location={selectedLocation}
                performanceData={selectedLocation ? (processedDataForTable[selectedLocation]?.actual as PerformanceData) : undefined}
                userLocation={userLocation}
            />
            <ReviewAnalysisModal 
                isOpen={isReviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                location={selectedLocation}
            />
             <Modal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} title="AI Anomaly Detections">
                <AIAlerts anomalies={anomalies} onSelectAnomaly={handleAnomalySelect} />
            </Modal>
            <AnomalyDetailModal {...anomalyDetailModalProps} />
            <ExecutiveSummaryModal 
                isOpen={isExecutiveSummaryOpen}
                onClose={() => setIsExecutiveSummaryOpen(false)}
                data={directorAggregates}
                view={activeView}
                period={activePeriod}
            />
        </div>
    );
};