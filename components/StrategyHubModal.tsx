import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { uploadFile } from '../services/firebaseService';
import { startStrategicAnalysisJob, deleteImportFile } from '../services/geminiService';
import { marked } from 'marked';
import { resizeImage } from '../utils/imageUtils';

// Define the shape of the job object, to be managed by App.tsx
export interface ActiveAnalysisJob {
  id: string;
  status: 'idle' | 'pending' | 'processing' | 'complete' | 'error' | 'cancelled';
  result?: string; // This will hold the HTML result
  error?: string;
  fileName?: string;
}

interface StrategyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJob: ActiveAnalysisJob | null;
  setActiveJob: React.Dispatch<React.SetStateAction<ActiveAnalysisJob | null>>;
  onCancel: () => void;
}

const processingMessages = [
    'Submitting analysis job...',
    'AI is reading the document structure...',
    'Extracting key metrics and data points...',
    'Identifying primary business questions...',
    'Synthesizing strategic insights...',
    'Compiling actionable recommendations...',
    'This can take up to a minute for complex documents...'
];

export const StrategyHubModal: React.FC<StrategyHubModalProps> = ({ isOpen, onClose, activeJob, setActiveJob, onCancel }) => {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(processingMessages[0]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  
  // Derive state from props
  const jobStatus = activeJob?.status || 'idle';
  const analysisHtml = jobStatus === 'complete' ? activeJob?.result || '' : '';
  const error = jobStatus === 'error' ? activeJob?.error || null : null;
  const isLoading = jobStatus === 'pending' || jobStatus === 'processing';

  const resetLocalState = () => {
    setStagedFile(null);
  };
  
  const handleFullClose = () => {
    // Only reset the job if it's finished or errored.
    if (jobStatus === 'complete' || jobStatus === 'error' || jobStatus === 'idle' || jobStatus === 'cancelled') {
      setActiveJob(null);
      resetLocalState();
    }
    onClose();
  };
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (jobStatus === 'processing') {
      setCurrentProcessingMessage(processingMessages[1]); // Start at a meaningful message
      interval = setInterval(() => {
        setCurrentProcessingMessage(prev => {
          const currentIndex = processingMessages.indexOf(prev);
          // Cycle through messages, but don't use the first one again
          const nextIndex = (currentIndex === processingMessages.length - 1) ? 1 : currentIndex + 1;
          return processingMessages[nextIndex];
        });
      }, 3500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [jobStatus]);

  useEffect(() => {
    // When the modal is opened without an active job, reset local state.
    if (isOpen && !activeJob) {
      resetLocalState();
    }
  }, [isOpen, activeJob]);

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const resizedFile = await resizeImage(files[0]);
      setStagedFile(resizedFile);
    }
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (!isOpen || jobStatus !== 'idle') return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          const pastedFile = new File([blob], "pasted-image.png", { type: blob.type });
          const resizedFile = await resizeImage(pastedFile);
          setStagedFile(resizedFile);
          return;
        }
      }
    }
  }, [isOpen, jobStatus]);

  useEffect(() => {
    if (isOpen) window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handlePaste]);


  const handleAnalyze = async () => {
    if (!stagedFile) return;

    let filePath: string | null = null;

    try {
      // Set initial pending state in parent
      setActiveJob({ id: 'temp-id', status: 'pending', fileName: stagedFile.name });

      const uploadResult = await uploadFile(stagedFile);
      filePath = uploadResult.filePath;
      
      const { jobId } = await startStrategicAnalysisJob({
        ...uploadResult,
        mimeType: stagedFile.type,
        fileName: stagedFile.name
      });
      
      // Update parent state with real job ID
      setActiveJob(prev => prev ? { ...prev, id: jobId, status: 'pending' } : { id: jobId, status: 'pending', fileName: stagedFile.name });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setActiveJob({ id: 'error-id', status: 'error', error: `Analysis submission failed: ${errorMsg}`, fileName: stagedFile.name });
      if (filePath) await deleteImportFile(filePath);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileSelect(e.dataTransfer.files); };

  const getLoadingMessage = () => {
      switch (jobStatus) {
          case 'pending': return 'Submitting analysis job...';
          case 'processing': return currentProcessingMessage;
          default: return '';
      }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <p className="text-slate-400 mt-3">{getLoadingMessage()}</p>
        </div>
      );
    }

    if (jobStatus === 'complete' && analysisHtml) {
      return (
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-md max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: analysisHtml }}></div>
        </div>
      );
    }

    return (
      <div
        ref={dropzoneRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('strategy-file-upload')?.click()}
        className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50"
      >
        <input id="strategy-file-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
        <Icon name="download" className="w-12 h-12 mx-auto text-slate-500 mb-3" />
        {stagedFile ? (
          <div>
            <p className="text-slate-200 font-bold text-lg">File Ready for Analysis</p>
            <p className="text-sm text-cyan-400">{stagedFile.name}</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-300 font-medium text-lg">Drag & drop a file, click to browse, or paste</p>
            <p className="text-sm text-slate-500 mt-2">Supports PDF, TXT, PNG, JPG, etc.</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderFooter = () => {
    if (isLoading) {
      return (
        <>
            <button onClick={onCancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Cancel Job</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Run in Background</button>
        </>
      );
    }
    
    if (jobStatus === 'complete' || jobStatus === 'error') {
      return (
        <>
          <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Close</button>
          <button onClick={() => { setActiveJob(null); resetLocalState(); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md">
            <span className="flex items-center gap-2"><Icon name="plus" className="w-5 h-5" />Analyze Another</span>
          </button>
        </>
      );
    }
    
    // Default state: 'idle'
    return (
      <>
        <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
        <button
          onClick={handleAnalyze}
          disabled={!stagedFile}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
        >
          <span className="flex items-center gap-2"><Icon name="brain" className="w-5 h-5" />Generate Brief</span>
        </button>
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleFullClose} title="AI Strategy Hub" size="large">
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Upload any document (e.g., a PDF of event sales, an image of a report, a marketing plan) and the AI will generate a strategic brief with key insights and recommendations.
        </p>
        
        {renderContent()}

        {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};