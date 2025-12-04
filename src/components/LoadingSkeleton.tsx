import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangle'
}) => {
  const baseClass = 'relative overflow-hidden bg-slate-700/50';
  const variantClass = {
    card: 'rounded-xl h-28',
    text: 'rounded h-4',
    circle: 'rounded-full',
    rectangle: 'rounded-lg'
  }[variant];

  return (
    <div className={`${baseClass} ${variantClass} ${className}`}>
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent"
        animate={{
          translateX: ['100%', '200%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

interface KPICardSkeletonProps {
  count?: number;
}

export const KPICardSkeleton: React.FC<KPICardSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05
          }}
          className="p-4 rounded-xl bg-slate-800/40 border border-slate-700"
        >
          {/* Icon and title */}
          <div className="flex items-center gap-3 mb-4">
            <LoadingSkeleton variant="circle" className="w-9 h-9" />
            <LoadingSkeleton variant="text" className="w-24 h-4" />
          </div>
          {/* Value */}
          <LoadingSkeleton variant="text" className="w-16 h-8" />
        </motion.div>
      ))}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-700">
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton key={`header-${index}`} variant="text" className="flex-1 h-3" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={`row-${rowIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: rowIndex * 0.05
          }}
          className="flex gap-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="flex-1 h-6"
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};
