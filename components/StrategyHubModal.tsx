import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { uploadFile } from '../services/firebaseService';
import { getStrategicAnalysis, deleteImportFile } from '../services/geminiService';
import { marked } from 'marked';

interface StrategyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyHubModal: React.FC<StrategyHubModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisHtml, setAnalysisHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setFile(null);
    setIsLoading(false);
    setLoadingMessage('');
    setAnalysisHtml('');
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
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
          setFile(pastedFile);
          setAnalysisHtml('');
          setError(null);
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('paste', handlePaste);
    }
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, handlePaste]);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file or paste an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisHtml('');
    let filePath: string | null = null;

    try {
      setLoadingMessage("Uploading to secure storage...");
      const uploadResult = await uploadFile(file);
      filePath = uploadResult.filePath;

      setLoadingMessage("Analyzing document with AI...");
      const result = await getStrategicAnalysis(uploadResult.fileUrl, file.type, file.name);
      
      setLoadingMessage("Formatting results...");
      const html = await marked.parse(result);
      setAnalysisHtml(html);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Analysis failed: ${errorMsg}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (filePath) {
        // Clean up the temporary file in the background
        await deleteImportFile(filePath);
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileSelect(e.dataTransfer.files); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Strategy Hub" size="large">
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Upload any document (e.g., a PDF of event sales, an image of a report, a marketing plan) and the AI will generate a strategic brief with key insights and recommendations.
        </p>
        
        {!analysisHtml && !isLoading && (
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
            <p className="text-slate-400 mt-3">{loadingMessage}</p>
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