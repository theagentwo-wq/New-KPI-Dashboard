import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { uploadFile, listenToAnalysisJob } from '../services/firebaseService';
import { startStrategicAnalysisJob, deleteImportFile } from '../services/geminiService';
import { marked } from 'marked';
import { resizeImage } from '../utils/imageUtils';
import firebase from 'firebase/compat/app';

interface StrategyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyHubModal: React.FC<StrategyHubModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'pending' | 'processing' | 'complete' | 'error'>('idle');
  const [analysisHtml, setAnalysisHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<firebase.Unsubscribe | null>(null);

  const resetState = () => {
    setFile(null);
    setJobId(null);
    setJobStatus('idle');
    setAnalysisHtml('');
    setError(null);
    if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
    return () => {
      // Ensure listener is cleaned up when modal is force-closed
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isOpen]);

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const resizedFile = await resizeImage(files[0]);
      setFile(resizedFile);
      setAnalysisHtml('');
      setError(null);
    }
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          const pastedFile = new File([blob], "pasted-image.png", { type: blob.type });
          const resizedFile = await resizeImage(pastedFile);
          setFile(resizedFile);
          setAnalysisHtml('');
          setError(null);
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && jobStatus === 'idle') {
      window.addEventListener('paste', handlePaste);
    }
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, jobStatus, handlePaste]);

  useEffect(() => {
    if (jobId) {
      unsubscribeRef.current = listenToAnalysisJob(jobId, (jobData) => {
        if (!jobData) return;
        setJobStatus(jobData.status);
        if (jobData.status === 'complete') {
          setError(null);
          // FIX: marked.parse can return a string or a promise.
          // Wrap with Promise.resolve to handle both cases consistently.
          Promise.resolve(marked.parse(jobData.result || '')).then(html => setAnalysisHtml(html as string));
          if (unsubscribeRef.current) unsubscribeRef.current();
        } else if (jobData.status === 'error') {
          setError(`Analysis failed: ${jobData.error || 'An unknown error occurred in the background job.'}`);
          if (unsubscribeRef.current) unsubscribeRef.current();
        }
      });
    }
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [jobId]);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file or paste an image first.");
      return;
    }

    setJobStatus('pending');
    setError(null);
    setAnalysisHtml('');
    let filePath: string | null = null;

    try {
      const uploadResult = await uploadFile(file);
      filePath = uploadResult.filePath;
      
      const { jobId } = await startStrategicAnalysisJob({
        ...uploadResult,
        mimeType: file.type,
        fileName: file.name
      });
      setJobId(jobId);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Analysis failed: ${errorMsg}`);
      setJobStatus('error');
      console.error(err);
      if (filePath) {
        await deleteImportFile(filePath); // Cleanup on initial failure
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileSelect(e.dataTransfer.files); };

  const isLoading = jobStatus === 'pending' || jobStatus === 'processing';
  
  const getLoadingMessage = () => {
      switch (jobStatus) {
          case 'pending': return 'Submitting analysis job...';
          case 'processing': return 'AI analysis is in progress... This may take a moment.';
          default: return '';
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Strategy Hub" size="large">
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Upload any document (e.g., a PDF of event sales, an image of a report, a marketing plan) and the AI will generate a strategic brief with key insights and recommendations.
        </p>
        
        {jobStatus !== 'complete' && !isLoading && (
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
            {file ? (
              <div>
                <p className="text-slate-200 font-bold text-lg">File Ready for Analysis</p>
                <p className="text-sm text-cyan-400">{file.name}</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-300 font-medium text-lg">Drag & drop a file, click to browse, or paste</p>
                <p className="text-sm text-slate-500 mt-2">Supports PDF, TXT, PNG, JPG, etc.</p>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <p className="text-slate-400 mt-3">{getLoadingMessage()}</p>
          </div>
        )}

        {analysisHtml && (
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-md max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div
              className="prose prose-sm prose-invert max-w-none text-slate-200"
              dangerouslySetInnerHTML={{ __html: analysisHtml }}
            ></div>
          </div>
        )}

        {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">
            Close
          </button>
          <button
            onClick={analysisHtml ? resetState : handleAnalyze}
            disabled={isLoading || (!file && !analysisHtml)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
          >
            {analysisHtml ? (
              <span className="flex items-center gap-2"><Icon name="plus" className="w-5 h-5" />Analyze Another</span>
            ) : (
              <span className="flex items-center gap-2"><Icon name="brain" className="w-5 h-5" />Generate Brief</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
