import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { getReviewSummary } from '../services/geminiService';
import { marked } from 'marked';

interface ReviewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: string;
}

export const ReviewAnalysisModal: React.FC<ReviewAnalysisModalProps> = ({ isOpen, onClose, location }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
        if (summary) {
            const html = await marked.parse(summary);
            setSanitizedHtml(html);
        } else {
            setSanitizedHtml('');
        }
    };
    renderMarkdown();
  }, [summary]);

  useEffect(() => {
    if (isOpen && location) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setSummary('');
        const result = await getReviewSummary(location);
        setSummary(result);
        setIsLoading(false);
      };
      fetchSummary();
    }
  }, [isOpen, location]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Analysis for ${location}`}>
      <div className="space-y-4 min-h-[300px] max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 h-full min-h-[300px]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            <p className="text-slate-400">Analyzing recent Google Reviews...</p>
          </div>
        ) : (
          <div 
            className="prose prose-sm prose-invert max-w-none text-slate-200" 
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          ></div>
        )}
      </div>
    </Modal>
  );
};
