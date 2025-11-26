
import React, { useState, useEffect, useCallback } from 'react';
import { getExecutiveSummary } from '../services/geminiService';
import { View, Period } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { marked } from 'marked';

interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // directorAggregates
  view: View;
  period: Period;
}

export const ExecutiveSummaryModal: React.FC<ExecutiveSummaryModalProps> = ({ isOpen, onClose, data, view, period }) => {
  const [summaryHtml, setSummaryHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = useCallback(async () => {
    if (!data) {
      setSummaryHtml('');
      return;
    }
    setIsLoading(true);
    setSummaryHtml('');
    try {
      const result = await getExecutiveSummary(data, view, period);
      const html = await marked.parse(result);
      setSummaryHtml(html);
    } catch (error) {
      console.error("AI Summary Error:", error);
      try {
        const errorHtml = await marked.parse("I'm sorry, but I was unable to generate the executive summary at this time.");
        setSummaryHtml(errorHtml);
      } catch (e) { /* Should not happen */ }
    } finally {
      setIsLoading(false);
    }
  }, [data, view, period]);
  
  useEffect(() => {
    if (isOpen) {
      handleGenerateSummary();
    } else {
        setSummaryHtml('');
        setIsLoading(false);
    }
  }, [isOpen, handleGenerateSummary]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 min-h-[200px]">
            <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <p className="text-slate-400">Generating AI summary for {period.label}...</p>
        </div>
      );
    }

    if (summaryHtml) {
      return <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: summaryHtml }}></div>;
    }
    
    return (
        <div className="text-center py-4 min-h-[200px] flex flex-col justify-center items-center">
            <p className="text-slate-400 mb-3 text-sm">No summary has been generated.</p>
            <button 
              onClick={handleGenerateSummary} 
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center gap-2"
            >
              <Icon name="sparkles" className="w-5 h-5" />
              Generate Summary
            </button>
      </div>
    );
  };

  const headerControls = summaryHtml && !isLoading ? (
      <button onClick={handleGenerateSummary} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 p-1 rounded-md hover:bg-slate-700">
          <Icon name="sparkles" className="w-4 h-4" />
          Regenerate
      </button>
  ) : undefined;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Executive Summary: ${view} - ${period.label}`}
        headerControls={headerControls}
    >
        {renderContent()}
    </Modal>
  );
};
