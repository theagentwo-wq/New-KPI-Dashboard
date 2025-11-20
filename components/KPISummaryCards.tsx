import React from 'react';
import { motion } from 'framer-motion';
import { Kpi, PerformanceData } from '../types';
import { KPI_CONFIG, KPI_ICON_MAP } from '../constants';
import { Icon } from './Icon';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { AnimatedNumberDisplay } from './AnimatedNumberDisplay';

interface KPISummaryCardsProps {
    data?: PerformanceData;
    selectedKpi: Kpi;
    onKpiSelect: (kpi: Kpi) => void;
}

const Card: React.FC<{ kpi: Kpi, value: number, isSelected: boolean, onSelect: () => void }> = ({ kpi, value, isSelected, onSelect }) => {
    const config = KPI_CONFIG[kpi];
    const animatedValue = useAnimatedNumber(value);

    const formatter = (val: number) => {
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
            onClick={onSelect}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isSelected 
                ? 'bg-slate-700/80 ring-2 ring-cyan-400 shadow-lg shadow-cyan-900/50' 
                : 'bg-slate-800/60 hover:bg-slate-700/50 border border-slate-700'
            }`}
            whileHover={{ y: -5 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon name={KPI_ICON_MAP[kpi]} className="w-5 h-5 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-300">{kpi}</h4>
                </div>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
                <AnimatedNumberDisplay value={animatedValue} formatter={formatter} />
            </p>
        </motion.div>
    );
};

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ data, selectedKpi, onKpiSelect }) => {
    const kpisToShow: Kpi[] = [
        Kpi.Sales,
        Kpi.SOP,
        Kpi.PrimeCost,
        Kpi.FoodCost,
        Kpi.VariableLabor,
        Kpi.AvgReviews
    ];

    if (!data) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpisToShow.map(kpi => (
                    <div key={kpi} className="p-4 rounded-lg bg-slate-800 border border-slate-700 animate-pulse h-24">
                        <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpisToShow.map(kpi => {
                const value = data[kpi];
                if (value === undefined || isNaN(value)) return null;
                
                return (
                    <Card
                        key={kpi}
                        kpi={kpi}
                        value={value}
                        isSelected={selectedKpi === kpi}
                        onSelect={() => onKpiSelect(kpi)}
                    />
                );
            })}
        </div>
    );
};
