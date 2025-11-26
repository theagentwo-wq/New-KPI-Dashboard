import React, { useState, useMemo, useEffect } from 'react';
import { View, Period, FinancialLineItem, PeriodType } from '../types';
import { ALL_STORES, DIRECTORS } from '../constants';
import { getInitialPeriod, ALL_PERIODS } from '../utils/dateUtils';
import { Icon } from '../components/Icon';
import { getPerformanceData } from '../services/firebaseService';

// Helper to format currency
const formatCurrency = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

// Dummy data generator if no P&L data exists yet
const generateMockPnl = (sales: number): FinancialLineItem[] => {
    return [
        { name: "Gross Sales", category: "Sales", actual: sales, budget: sales * 0.98, indent: 0 },
        { name: "Discounts", category: "Sales", actual: sales * -0.02, budget: sales * -0.015, indent: 1 },
        { name: "Net Sales", category: "Sales", actual: sales * 0.98, budget: sales * 0.965, indent: 0 },
        
        { name: "Cost of Goods Sold", category: "COGS", actual: sales * 0.24, budget: sales * 0.23, indent: 0 },
        { name: "Food Cost", category: "COGS", actual: sales * 0.18, budget: sales * 0.175, indent: 1 },
        { name: "Dairy", category: "COGS", actual: sales * 0.03, budget: sales * 0.028, indent: 2 },
        { name: "Meat", category: "COGS", actual: sales * 0.08, budget: sales * 0.075, indent: 2 },
        { name: "Produce", category: "COGS", actual: sales * 0.04, budget: sales * 0.04, indent: 2 },
        { name: "Beverage Cost", category: "COGS", actual: sales * 0.06, budget: sales * 0.055, indent: 1 },

        { name: "Labor", category: "Labor", actual: sales * 0.32, budget: sales * 0.30, indent: 0 },
        { name: "FOH Hourly", category: "Labor", actual: sales * 0.12, budget: sales * 0.11, indent: 1 },
        { name: "BOH Hourly", category: "Labor", actual: sales * 0.14, budget: sales * 0.13, indent: 1 },
        { name: "Management", category: "Labor", actual: sales * 0.06, budget: sales * 0.06, indent: 1 },

        { name: "Operating Expenses", category: "Operating Expenses", actual: sales * 0.15, budget: sales * 0.14, indent: 0 },
        { name: "Marketing", category: "Operating Expenses", actual: sales * 0.02, budget: sales * 0.02, indent: 1 },
        { name: "Utilities", category: "Operating Expenses", actual: sales * 0.03, budget: sales * 0.025, indent: 1 },
        { name: "Repairs", category: "Operating Expenses", actual: sales * 0.015, budget: sales * 0.01, indent: 1 },
        
        { name: "Store Operating Profit", category: "Other", actual: sales * 0.27, budget: sales * 0.295, indent: 0 },
    ];
};

export const FinancialsPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.TotalCompany);
    const [selectedStore, setSelectedStore] = useState<string>('All Stores');
    const [periodType, setPeriodType] = useState<'Week' | 'Month' | 'Quarter' | 'Year'>('Month');
    const [currentPeriod, setCurrentPeriod] = useState<Period>(getInitialPeriod());
    const [financialData, setFinancialData] = useState<FinancialLineItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Sales', 'COGS', 'Labor', 'Operating Expenses']);

    // Helper to get previous/next periods
    const periodsForType = useMemo(() => {
      const typeMapping: { [key: string]: PeriodType } = { 'Week': 'weekly', 'Month': 'monthly', 'Quarter': 'quarterly', 'Year': 'yearly' };
      return ALL_PERIODS.filter(p => p.type === typeMapping[periodType]);
    }, [periodType]);
    const currentPeriodIndex = useMemo(() => periodsForType.findIndex(p => p.label === currentPeriod.label), [periodsForType, currentPeriod]);
    
    const handlePrevPeriod = () => { if (currentPeriodIndex > 0) setCurrentPeriod(periodsForType[currentPeriodIndex - 1]); };
    const handleNextPeriod = () => { if (currentPeriodIndex < periodsForType.length - 1) setCurrentPeriod(periodsForType[currentPeriodIndex + 1]); };

    // Filter stores based on view
    const availableStores = useMemo(() => {
        if (currentView === 'Total Company') return ['All Stores', ...ALL_STORES];
        const director = DIRECTORS.find(d => d.id === currentView);
        return director ? ['All Region', ...director.stores] : [];
    }, [currentView]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            
            // Fetch actuals for the period
            const data = await getPerformanceData(currentPeriod.startDate, currentPeriod.endDate);
            
            // Filter by store/view
            let relevantData = data;
            if (selectedStore !== 'All Stores' && selectedStore !== 'All Region') {
                relevantData = data.filter(d => d.storeId === selectedStore);
            } else if (currentView !== 'Total Company') {
                const director = DIRECTORS.find(d => d.id === currentView);
                relevantData = data.filter(d => director?.stores.includes(d.storeId));
            }

            // Aggregate P&L Data
            // If real P&L data exists in `pnl` property, aggregate it. 
            // Otherwise, fallback to mock generator for demo based on 'Sales' KPI.
            
            const aggregatedPnl: { [name: string]: FinancialLineItem } = {};
            let hasRealPnl = false;

            relevantData.forEach(record => {
                if (record.pnl && record.pnl.length > 0) {
                    hasRealPnl = true;
                    record.pnl.forEach(item => {
                        if (!aggregatedPnl[item.name]) {
                            aggregatedPnl[item.name] = { ...item, actual: 0, budget: 0 };
                        }
                        aggregatedPnl[item.name].actual += item.actual;
                        aggregatedPnl[item.name].budget = (aggregatedPnl[item.name].budget || 0) + (item.budget || 0);
                    });
                }
            });

            if (hasRealPnl) {
                setFinancialData(Object.values(aggregatedPnl));
            } else {
                // Fallback: Generate from Sales KPI
                const totalSales = relevantData.reduce((sum, d) => sum + (d.data.Sales || 0), 0);
                if (totalSales > 0) {
                    setFinancialData(generateMockPnl(totalSales));
                } else {
                    setFinancialData([]);
                }
            }
            setIsLoading(false);
        };
        
        fetchData();
    }, [currentPeriod, currentView, selectedStore]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    // Group data by category for rendering
    const groupedData = useMemo(() => {
        const groups: { [key: string]: FinancialLineItem[] } = {};
        financialData.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [financialData]);

    const categoryOrder = ['Sales', 'COGS', 'Labor', 'Operating Expenses', 'Other'];

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            {/* Header Controls */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">Financial Statements</h1>
                    <p className="text-sm text-slate-400">Profit & Loss Statement</p>
                </div>

                <div className="flex items-center gap-3">
                     <select 
                        value={currentView} 
                        onChange={(e) => { setCurrentView(e.target.value as View); setSelectedStore(e.target.value === View.TotalCompany ? 'All Stores' : 'All Region'); }} 
                        className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm"
                    >
                        <option value="Total Company">Total Company</option>
                        {DIRECTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                        value={selectedStore} 
                        onChange={(e) => setSelectedStore(e.target.value)} 
                        className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm"
                    >
                        {availableStores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-900 rounded-md p-1">
                        {(['Week', 'Month', 'Quarter', 'Year'] as const).map(t => (
                            <button key={t} onClick={() => setPeriodType(t)} className={`px-3 py-1 text-xs font-semibold rounded ${periodType === t ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-700 rounded-md p-1">
                         <button onClick={handlePrevPeriod} className="p-1 hover:text-white text-slate-300"><Icon name="chevronLeft" className="w-4 h-4" /></button>
                         <span className="text-sm font-mono w-32 text-center">{currentPeriod.label}</span>
                         <button onClick={handleNextPeriod} className="p-1 hover:text-white text-slate-300"><Icon name="chevronRight" className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* P&L Table */}
            <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-y-.auto custom-scrollbar flex-1">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-3 w-1/3">Account</th>
                                <th className="px-4 py-3 text-right">Actual</th>
                                <th className="px-4 py-3 text-right">% Sales</th>
                                <th className="px-4 py-3 text-right">Budget</th>
                                <th className="px-4 py-3 text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>Loading Financials...</td></tr>
                            ) : financialData.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-20 text-slate-500">No financial data available for this period.</td></tr>
                            ) : (
                                categoryOrder.map(category => {
                                    const items = groupedData[category] || [];
                                    if (items.length === 0) return null;
                                    const isExpanded = expandedCategories.includes(category);
                                    
                                    return (
                                        <React.Fragment key={category}>
                                            {/* Category Header */}
                                            <tr className="bg-slate-700/30 cursor-pointer hover:bg-slate-700/50" onClick={() => toggleCategory(category)}>
                                                <td className="px-4 py-2 font-bold text-white flex items-center gap-2">
                                                    <Icon name={isExpanded ? 'compress' : 'expand'} className="w-3 h-3 text-slate-400" />
                                                    {category}
                                                </td>
                                                <td colSpan={4}></td> 
                                            </tr>
                                            
                                            {/* Items */}
                                            {isExpanded && items.map((item, idx) => {
                                                const netSales = financialData.find(i => i.name === 'Net Sales')?.actual || 1; // Avoid div by zero
                                                const variance = item.actual - (item.budget || 0);
                                                
                                                // Variance Color Logic:
                                                // Sales: Positive = Good (Green)
                                                // Expenses (COGS, Labor, OpEx): Positive = Bad (Red), Negative = Good (Green)
                                                const isExpense = category === 'COGS' || category === 'Labor' || category === 'Operating Expenses';
                                                const varColor = isExpense 
                                                    ? (variance > 0 ? 'text-red-400' : 'text-green-400')
                                                    : (variance >= 0 ? 'text-green-400' : 'text-red-400');

                                                return (
                                                    <tr key={`${category}-${idx}`} className="hover:bg-slate-700/20 border-b border-slate-700/30 last:border-0">
                                                        <td className="px-6 py-2">
                                                            <div style={{ paddingLeft: `${(item.indent || 0) * 1.5}rem` }} className={`${item.indent === 0 ? 'font-semibold text-white' : 'text-slate-400'}`}>
                                                                {item.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-mono text-slate-200">{formatCurrency(item.actual)}</td>
                                                        <td className="px-4 py-2 text-right font-mono text-slate-400 text-xs">{formatPercent(item.actual / netSales)}</td>
                                                        <td className="px-4 py-2 text-right font-mono text-slate-400">{formatCurrency(item.budget || 0)}</td>
                                                        <td className={`px-4 py-2 text-right font-mono font-semibold ${varColor}`}>
                                                            {formatCurrency(variance)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};