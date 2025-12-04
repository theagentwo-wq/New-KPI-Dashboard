import React from 'react';
import { motion } from 'framer-motion';
import { Kpi, KPISummaryCardsProps } from '../types';
import { KPI_CONFIG, KPI_ICON_MAP, DASHBOARD_KPIS } from '../constants';
import { Icon } from './Icon';
import { AnimatedNumberDisplay } from './AnimatedNumberDisplay';
import { KPICardSkeleton } from './LoadingSkeleton';

const cardVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Card: React.FC<{ kpi: Kpi, value: number, isSelected: boolean, onSelect: () => void }> = ({ kpi, value, isSelected, onSelect }) => {
    const config = KPI_CONFIG[kpi];

    const formatter = (val: number) => {
        if (!config) return val.toString();
        switch (config.format) {
            case 'currency':
                return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            case 'percent':
                return `${(val * 100).toFixed(1)}%`;
            case 'number':
                return val.toFixed(2);
            default:
                return val.toString();
        }
    };
    
    return (
        <motion.div
            variants={cardVariants}
            layout
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`group relative p-4 rounded-xl cursor-pointer overflow-hidden border transition-all duration-300 ${
                isSelected
                ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-900/20'
                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-900/10'
            }`}
        >
            {/* Animated Background Gradient for Selected State */}
            {isSelected && (
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
            
            {/* Glow Effect on Hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'}`}>
                            <Icon name={KPI_ICON_MAP[kpi]} className="w-5 h-5" />
                        </div>
                        <h4 className={`text-sm font-semibold ${isSelected ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'}`}>{kpi}</h4>
                    </div>
                    {isSelected && (
                        <motion.div 
                            layoutId={"active-indicator"}
                            className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        />
                    )}
                </div>
                
                <div className="flex items-end justify-between">
                    <p className={`text-2xl font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        <AnimatedNumberDisplay value={value} formatter={formatter} />
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ data, selectedKpi, onKpiSelect }) => {
    const kpisToShow = DASHBOARD_KPIS;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    if (!data || Object.keys(data).length === 0) {
        return <KPICardSkeleton count={kpisToShow.length} />;
    }

    return (
        <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {kpisToShow.map((kpi) => {
                const value = data[kpi];
                // Show card with 0 if value is missing instead of hiding it
                const displayValue = (value === undefined || isNaN(value)) ? 0 : value;

                return (
                    <Card
                        key={kpi}
                        kpi={kpi}
                        value={displayValue}
                        isSelected={selectedKpi === kpi}
                        onSelect={() => onKpiSelect(kpi)}
                    />
                );
            })}
        </motion.div>
    );
};