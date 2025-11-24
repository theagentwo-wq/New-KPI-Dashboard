import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { uploadFile } from '../services/firebaseService';
import { startStrategicAnalysisJob, deleteImportFile, chatWithStrategy } from '../services/geminiService';
import { marked } from 'marked';
import { resizeImage } from '../utils/imageUtils';
import { AnalysisMode } from '../types';

// Define the shape of the job object, to be managed by App.tsx
export interface ActiveAnalysisJob {
  id: string;
  status: 'idle' | 'pending' | 'processing' | 'complete' | 'error' | 'cancelled';
  result?: string; // This will hold the HTML result
  error?: string;
  fileName?: string;
  mode?: AnalysisMode;
}

interface StrategyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJob: ActiveAnalysisJob | null;
  setActiveJob: React.Dispatch<React.SetStateAction<ActiveAnalysisJob | null>>;
  onCancel: () => void;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    html?: string;
}

const processingMessages = [
    'Starting secure analysis... this may take up to 60-90 seconds for complex documents...',
    'AI is reading the document structure...',
    'Extracting key metrics and data points...',
    'Identifying primary business questions...',
    'Synthesizing strategic insights...',
    'Compiling actionable recommendations...',
];

const MODE_CONFIG: { [key in AnalysisMode]: { icon: string; color: string; desc: string } } = {
    'General': { icon: 'brain', color: 'text-cyan-400', desc: 'Balanced overview of all key metrics.' },
    'Financial': { icon: 'budget', color: 'text-green-400', desc: 'Deep dive on margins, P&L, and ROI.' },
    'Operational': { icon: 'dashboard', color: 'text-blue-400', desc: 'Focus on labor, efficiency, and execution.' },
    'Marketing': { icon: 'sparkles', color: 'text-purple-400', desc: 'Sentiment, brand, and growth opportunities.' },
};

export const StrategyHubModal: React.FC<StrategyHubModalProps> = ({ isOpen, onClose, activeJob, setActiveJob, onCancel }) => {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('General');
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(processingMessages[0]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derive state from props
  const jobStatus = activeJob?.status || 'idle';
  const error = jobStatus === 'error' ? activeJob?.error || null : null;
  const isLoading = jobStatus === 'pending' || jobStatus === 'processing';

  const resetLocalState = () => {
    setStagedFile(null);
    setSelectedMode('General');
    setChatMessages([]);
    setChatInput('');
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
      setCurrentProcessingMessage(processingMessages[0]); // Start at the beginning
      interval = setInterval(() => {
        setCurrentProcessingMessage(prev => {
          const currentIndex = processingMessages.indexOf(prev);
          return processingMessages[(currentIndex + 1) % processingMessages.length];
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

  // Populate chat with initial result when job completes
  useEffect(() => {
      if (jobStatus === 'complete' && activeJob?.result && chatMessages.length === 0) {
          const processResult = async () => {
              const html = await marked.parse(activeJob.result!);
              setChatMessages([{ sender: 'ai', text: activeJob.result!, html }]);
          };
          processResult();
      }
  }, [jobStatus, activeJob?.result]);

  // Auto-scroll chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
      setActiveJob({ id: 'temp-id', status: 'pending', fileName: stagedFile.name, mode: selectedMode });

      const uploadResult = await uploadFile(stagedFile);
      filePath = uploadResult.filePath;
      
      const { jobId } = await startStrategicAnalysisJob({
        ...uploadResult,
        mimeType: stagedFile.type,
        fileName: stagedFile.name,
        mode: selectedMode
      });
      
      // Update parent state with real job ID
      setActiveJob(prev => prev ? { ...prev, id: jobId, status: 'pending' } : { id: jobId, status: 'pending', fileName: stagedFile.name, mode: selectedMode });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setActiveJob({ id: 'error-id', status: 'error', error: `Analysis submission failed: ${errorMsg}`, fileName: stagedFile.name });
      if (filePath) await deleteImportFile(filePath);
    }
  };
  
  const handleSendMessage = async (text: string = chatInput) => {
      if (!text.trim() || isChatLoading || !activeJob?.result) return;
      
      const newUserMsg: ChatMessage = { sender: 'user', text };
      setChatMessages(prev => [...prev, newUserMsg]);
      setChatInput('');
      setIsChatLoading(true);
      
      try {
          const response = await chatWithStrategy(activeJob.result, text, activeJob.mode || 'General');
          const html = await marked.parse(response);
          setChatMessages(prev => [...prev, { sender: 'ai', text: response, html }]);
      } catch (e) {
          console.error(e);
          setChatMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I couldn't process that request right now." }]);
      } finally {
          setIsChatLoading(false);
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

  const renderChat = () => {
      return (
          <div className="flex flex-col h-[65vh]">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-4 ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 border border-slate-700'}`}>
                              {msg.html ? (
                                  <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: msg.html }}></div>
                              ) : (
                                  <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                              )}
                          </div>
                      </div>
                  ))}
                  {isChatLoading && (
                      <div className="flex justify-start">
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                              <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                              </div>
                          </div>
                      </div>
                  )}
                  <div ref={chatEndRef} />
              </div>
              
              {/* Suggested Actions */}
              {chatMessages.length > 0 && !isChatLoading && (
                  <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                      <button onClick={() => handleSendMessage("What are the top 3 risks?")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Identify Risks</button>
                      <button onClick={() => handleSendMessage("Draft an email to the team based on this.")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Draft Team Email</button>
                      <button onClick={() => handleSendMessage("Explain the financial impact.")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Financial Impact</button>
                  </div>
              )}

              <div className="p-4 border-t border-slate-700 bg-slate-800">
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask a follow-up question..."
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                          disabled={isChatLoading}
                      />
                      <button 
                          onClick={() => handleSendMessage()}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <Icon name="plus" className="w-5 h-5 rotate-90" /> {/* Using rotate to look like send arrow */}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderUpload = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <p className="text-slate-300 mt-4 font-medium text-lg">{getLoadingMessage()}</p>
          {activeJob?.mode && (
              <p className="text-cyan-400 text-sm mt-2 flex items-center gap-2">
                  <Icon name={MODE_CONFIG[activeJob.mode].icon} className="w-4 h-4" />
                  Using {activeJob.mode} Lens
              </p>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {(Object.keys(MODE_CONFIG) as AnalysisMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                        selectedMode === mode 
                        ? 'bg-slate-700 border-cyan-500 ring-1 ring-cyan-500' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                      <Icon name={MODE_CONFIG[mode].icon} className={`w-6 h-6 mb-2 ${MODE_CONFIG[mode].color}`} />
                      <p className="font-bold text-slate-200 text-sm">{mode}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1">{MODE_CONFIG[mode].desc}</p>
                  </button>
              ))}
          </div>

          <div
            ref={dropzoneRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('strategy-file-upload')?.click()}
            className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-slate-800/50 min-h-[200px]"
          >
            <input id="strategy-file-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
            <Icon name="download" className="w-16 h-16 mx-auto text-slate-500 mb-4" />
            {stagedFile ? (
              <div className="text-center">
                <p className="text-slate-200 font-bold text-xl">File Ready</p>
                <p className="text-sm text-cyan-400 mt-1">{stagedFile.name}</p>
                <p className="text-xs text-slate-500 mt-2">Click 'Generate Brief' to analyze with {selectedMode} lens.</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-300 font-medium text-lg">Drag & drop a file or click to browse</p>
                <p className="text-sm text-slate-500 mt-2">Supports Reports (PDF, IMG) & Spreadsheets</p>
              </div>
            )}
          </div>
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
            <span className="flex items-center gap-2"><Icon name="plus" className="w-5 h-5" />New Analysis</span>
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
    <Modal isOpen={isOpen} onClose={handleFullClose} title="AI Strategy Command Center" size="large">
      <div className="space-y-4 h-full flex flex-col">
        {jobStatus === 'idle' && (
             <p className="text-slate-300 text-sm">
              Select an analysis lens and upload a document. The AI will generate a tailored strategic brief and allow you to ask follow-up questions.
            </p>
        )}
        
        {jobStatus === 'complete' ? renderChat() : renderUpload()}

        {error && <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-auto">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};