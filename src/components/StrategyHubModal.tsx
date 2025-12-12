import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { uploadFile } from '../services/firebaseService';
import { startStrategicAnalysisJob, chatWithStrategy } from '../services/geminiService';
import { callGeminiAPI } from '../lib/ai-client';
import { marked } from 'marked';
import { resizeImage } from '../utils/imageUtils';
import { AnalysisMode, Period, View, NoteCategory } from '../types';

export interface ActiveAnalysisJob {
  id: string;
  status: 'idle' | 'pending' | 'processing' | 'complete' | 'error' | 'cancelled';
  result?: string;
  error?: string;
  fileName?: string;
  mode?: AnalysisMode;
  progress?: number;
  timestamp?: number;
}

interface StrategyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: Period;
  activeView: View;
  onAddNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => Promise<void>;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    html?: string;
}

interface AnalysisHistoryItem {
  id: string;
  fileName: string;
  mode: AnalysisMode;
  result: string;
  timestamp: number;
  filePreview?: string;
}

// Future feature: Custom lenses
// interface CustomLens {
//   id: string;
//   name: string;
//   description: string;
//   icon: string;
//   color: string;
//   focusAreas: string[];
// }

const processingMessages = [
    'Starting secure analysis... this may take up to 60-90 seconds for complex documents...',
    'AI is reading the document structure...',
    'Extracting key metrics and data points...',
    'Identifying primary business questions...',
    'Synthesizing strategic insights...',
    'Compiling actionable recommendations...',
];

const ANALYSIS_MODE_CONFIG: { [key in AnalysisMode]: { icon: string; color: string; desc: string } } = {
    [AnalysisMode.General]: { icon: 'brain', color: 'text-cyan-400', desc: 'Balanced overview of all key metrics.' },
    [AnalysisMode.Financial]: { icon: 'budget', color: 'text-green-400', desc: 'Deep dive on margins, P&L, and ROI.' },
    [AnalysisMode.Operational]: { icon: 'dashboard', color: 'text-blue-400', desc: 'Focus on labor, efficiency, and execution.' },
    [AnalysisMode.Marketing]: { icon: 'sparkles', color: 'text-purple-400', desc: 'Sentiment, brand, and growth opportunities.' },
    [AnalysisMode.HR]: { icon: 'users', color: 'text-yellow-400', desc: 'Analyzes staffing, and employee sentiment.' },
};

const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = 'strategy_hub_history';

export const StrategyHubModal: React.FC<StrategyHubModalProps> = ({ isOpen, onClose, activePeriod, activeView, onAddNote }) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(AnalysisMode.General);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(processingMessages[0]);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [activeJob, setActiveJob] = useState<ActiveAnalysisJob | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // const [customLenses, setCustomLenses] = useState<CustomLens[]>([]); // Future feature
  // const [showCustomLensBuilder, setShowCustomLensBuilder] = useState(false); // Future feature
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [suggestedLens, setSuggestedLens] = useState<AnalysisMode | null>(null);

  const jobStatus = activeJob?.status || 'idle';
  const error = jobStatus === 'error' ? activeJob?.error || null : null;
  const isLoading = jobStatus === 'pending' || jobStatus === 'processing';

  // Load analysis history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setAnalysisHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load analysis history:', e);
    }
  }, []);

  // Save analysis history to localStorage
  const saveAnalysisToHistory = (job: ActiveAnalysisJob, filePreview?: string) => {
    if (!job.result || !job.fileName || !job.mode) return;

    const newItem: AnalysisHistoryItem = {
      id: job.id,
      fileName: job.fileName,
      mode: job.mode,
      result: job.result,
      timestamp: job.timestamp || Date.now(),
      filePreview,
    };

    setAnalysisHistory(prev => {
      const updated = [newItem, ...prev.filter(item => item.id !== job.id)].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save analysis history:', e);
      }
      return updated;
    });
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setChatInput(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetLocalState = () => {
    setStagedFiles([]);
    setSelectedMode(AnalysisMode.General);
    setChatMessages([]);
    setChatInput('');
    setDocumentPreviews([]);
    setSuggestedLens(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleFullClose = () => {
    if (jobStatus === 'complete' || jobStatus === 'error' || jobStatus === 'idle' || jobStatus === 'cancelled') {
      setActiveJob(null);
      resetLocalState();
    }
    onClose();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (jobStatus === 'processing') {
      setCurrentProcessingMessage(processingMessages[0]);
      interval = setInterval(() => {
        setCurrentProcessingMessage(prev => {
          const currentIndex = processingMessages.indexOf(prev);
          return processingMessages[(currentIndex + 1) % processingMessages.length];
        });
        // Simulate progress
        setActiveJob(prev => prev ? { ...prev, progress: Math.min((prev.progress || 0) + 5, 95) } : null);
      }, 3500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [jobStatus]);

  // Job polling mechanism - check AI job status every 3 seconds
  useEffect(() => {
    if (!activeJob || (jobStatus !== 'pending' && jobStatus !== 'processing')) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await callGeminiAPI('checkTaskStatus', { jobId: activeJob.id });

        if (status.status === 'completed' && status.results) {
          // Job completed successfully
          setActiveJob({
            ...activeJob,
            status: 'complete',
            result: status.results,
            progress: 100
          });
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          // Job failed
          setActiveJob({
            ...activeJob,
            status: 'error',
            error: status.error || 'Analysis failed. Please try again.',
            progress: 0
          });
          clearInterval(pollInterval);
        } else if (status.status === 'processing') {
          // Update to processing status if not already
          setActiveJob(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: 'processing',
              progress: status.progress ? Math.min(status.progress, 95) : prev.progress
            };
          });
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Don't clear interval on network errors - keep trying
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [activeJob?.id, jobStatus]);

  useEffect(() => {
    if (isOpen && !activeJob) {
      resetLocalState();
    }
  }, [isOpen, activeJob]);

  useEffect(() => {
      if (jobStatus === 'complete' && activeJob?.result && chatMessages.length === 0) {
          const processResult = async () => {
              const html = await marked.parse(activeJob.result!);
              setChatMessages([{ sender: 'ai', text: activeJob.result!, html }]);
              // Save to history
              saveAnalysisToHistory(activeJob, documentPreviews[0]);
          };
          processResult();
      }
  }, [jobStatus, activeJob?.result, chatMessages.length]);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Generate document preview
  const generatePreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // Smart lens suggestion based on file name
  const suggestLensForFile = (fileName: string): AnalysisMode => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('p&l') || lowerName.includes('financial') || lowerName.includes('budget') || lowerName.includes('revenue')) {
      return AnalysisMode.Financial;
    }
    if (lowerName.includes('feedback') || lowerName.includes('review') || lowerName.includes('customer') || lowerName.includes('guest')) {
      return AnalysisMode.Marketing;
    }
    if (lowerName.includes('staff') || lowerName.includes('schedule') || lowerName.includes('employee') || lowerName.includes('labor')) {
      return AnalysisMode.HR;
    }
    if (lowerName.includes('operation') || lowerName.includes('efficiency') || lowerName.includes('performance')) {
      return AnalysisMode.Operational;
    }
    return AnalysisMode.General;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      const previewArray: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const resizedFile = await resizeImage(files[i]);
        fileArray.push(resizedFile);

        // Generate preview
        if (resizedFile.type.startsWith('image/')) {
          const preview = await generatePreview(resizedFile);
          previewArray.push(preview);
        }
      }

      setStagedFiles(fileArray);
      setDocumentPreviews(previewArray);

      // Smart lens suggestion
      if (fileArray.length === 1) {
        const suggested = suggestLensForFile(fileArray[0].name);
        setSuggestedLens(suggested);
        setSelectedMode(suggested);
      }
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
          setStagedFiles([resizedFile]);
          const preview = await generatePreview(resizedFile);
          setDocumentPreviews([preview]);
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
    if (stagedFiles.length === 0) return;

    try {
      setActiveJob({
        id: 'temp-id',
        status: 'pending',
        fileName: stagedFiles.length > 1 ? `${stagedFiles.length} files` : stagedFiles[0].name,
        mode: selectedMode,
        progress: 0,
        timestamp: Date.now()
      });

      // Upload all staged files for multi-file comparison
      const uploadResults = await Promise.all(
        stagedFiles.map(file => uploadFile(file, () => {}))
      );

      const { jobId } = await startStrategicAnalysisJob(uploadResults, selectedMode, activePeriod, activeView);
      // Keep status as 'pending' - polling will update to 'processing' when backend confirms
      setActiveJob(prev => prev ? { ...prev, id: jobId, progress: 10 } : {
        id: jobId,
        status: 'pending',
        fileName: stagedFiles.length > 1 ? `${stagedFiles.length} files` : stagedFiles[0].name,
        mode: selectedMode,
        progress: 10,
        timestamp: Date.now()
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      let specificError = `Analysis submission failed: ${errorMsg}`;

      // Better error messages
      if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        specificError = "Network error: Please check your internet connection and try again.";
      } else if (errorMsg.includes('timeout')) {
        specificError = "Analysis timed out: The document may be too large or complex. Try a smaller file.";
      } else if (errorMsg.includes('format')) {
        specificError = "Unsupported file format: Please upload a PDF, image, or spreadsheet.";
      }

      setActiveJob({
        id: 'error-id',
        status: 'error',
        error: specificError,
        fileName: stagedFiles[0].name,
        timestamp: Date.now()
      });
    }
  };

  const handleSendMessage = async (text: string = chatInput) => {
      if (!text.trim() || isChatLoading || !activeJob?.result) return;

      const newUserMsg: ChatMessage = { sender: 'user', text };
      setChatMessages(prev => [...prev, newUserMsg]);
      setChatInput('');
      setIsChatLoading(true);

      try {
          const response = await chatWithStrategy(activeJob.result, text, activeJob.mode || AnalysisMode.General);
          const html = await marked.parse(response);
          setChatMessages(prev => [...prev, { sender: 'ai', text: response, html }]);
      } catch (e) {
          console.error(e);
          setChatMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I couldn't process that request right now." }]);
      } finally {
          setIsChatLoading(false);
      }
  };

  const handleCancel = () => {
    setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
  };

  const handleRetry = () => {
    setActiveJob(null);
    handleAnalyze();
  };

  const handleExportToClipboard = async () => {
    if (!activeJob?.result) return;
    try {
      await navigator.clipboard.writeText(activeJob.result);
      alert('Analysis copied to clipboard!');
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleExportToNotes = async () => {
    if (!activeJob?.result || !activeJob?.mode) return;

    try {
      // Map analysis mode to note category
      const categoryMap: { [key in AnalysisMode]: NoteCategory } = {
        [AnalysisMode.General]: NoteCategory.General,
        [AnalysisMode.Financial]: NoteCategory.Operations,
        [AnalysisMode.Operational]: NoteCategory.Operations,
        [AnalysisMode.Marketing]: NoteCategory.Marketing,
        [AnalysisMode.HR]: NoteCategory.HR,
      };

      const category = categoryMap[activeJob.mode];

      // Format the note content with metadata
      const noteContent = `**${activeJob.mode} Analysis** ${activeJob.fileName ? `- ${activeJob.fileName}` : ''}\n\n${activeJob.result}`;

      // Add note using the callback
      await onAddNote(
        activePeriod.label,
        category,
        noteContent,
        { view: activeView },
        undefined // No image for now
      );

      alert('✅ Analysis exported to Notes successfully!');
    } catch (error) {
      console.error('Failed to export to notes:', error);
      alert('❌ Failed to export to Notes. Please try again.');
    }
  };

  const loadHistoryItem = async (item: AnalysisHistoryItem) => {
    const html = await marked.parse(item.result);
    setChatMessages([{ sender: 'ai', text: item.result, html }]);
    setActiveJob({
      id: item.id,
      status: 'complete',
      result: item.result,
      fileName: item.fileName,
      mode: item.mode,
      timestamp: item.timestamp,
    });
    setSelectedMode(item.mode);
    setShowHistory(false);
  };

  const handleSwitchLens = async (newMode: AnalysisMode) => {
    if (!stagedFiles.length || isLoading) return;
    setSelectedMode(newMode);
    await handleAnalyze();
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
  };

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

              {/* Quick Action Buttons */}
              {chatMessages.length > 0 && !isChatLoading && (
                  <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                      <button onClick={() => handleSendMessage("What are the top 3 risks?")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Identify Risks</button>
                      <button onClick={() => handleSendMessage("Draft an email to the team based on this.")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Draft Team Email</button>
                      <button onClick={() => handleSendMessage("Explain the financial impact.")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Financial Impact</button>
                      <button onClick={() => handleSendMessage("Summarize this in 3 bullet points.")} className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 border border-slate-600">Summarize</button>
                  </div>
              )}

              {/* Chat Input */}
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
                        onClick={toggleListening}
                        className={`p-2 rounded-md transition-colors ${
                          isListening
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                        }`}
                        title={isListening ? "Stop listening" : "Start voice input"}
                      >
                        <Icon name="microphone" className="w-5 h-5" />
                      </button>
                      <button
                          onClick={() => handleSendMessage()}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <Icon name="plus" className="w-5 h-5 rotate-90" />
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
          <div className="w-full max-w-md mb-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${activeJob?.progress || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">{activeJob?.progress || 0}% complete</p>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <p className="text-slate-300 font-medium text-lg text-center">{getLoadingMessage()}</p>
          {activeJob?.mode && (
              <p className="text-cyan-400 text-sm mt-2 flex items-center gap-2">
                  <Icon name={ANALYSIS_MODE_CONFIG[activeJob.mode].icon} className="w-4 h-4" />
                  Using {activeJob.mode} Lens
              </p>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
          {/* History Button */}
          {analysisHistory.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Icon name="calendar" className="w-4 h-4" />
                Recent Analyses ({analysisHistory.length})
              </button>

              {showHistory && (
                <div className="mt-2 bg-slate-800 border border-slate-700 rounded-md max-h-60 overflow-y-auto">
                  {analysisHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {item.filePreview && (
                          <img src={item.filePreview} alt="" className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{item.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon name={ANALYSIS_MODE_CONFIG[item.mode].icon} className={`w-3 h-3 ${ANALYSIS_MODE_CONFIG[item.mode].color}`} />
                            <span className="text-xs text-slate-400">{item.mode}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lens Selection */}
          <div className="mb-4">
            {suggestedLens && (
              <p className="text-xs text-cyan-400 mb-2 flex items-center gap-2">
                <Icon name="sparkles" className="w-3 h-3" />
                Suggested: {suggestedLens} lens based on filename
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(Object.values(AnalysisMode)).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                        selectedMode === mode
                        ? 'bg-slate-700 border-cyan-500 ring-1 ring-cyan-500'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                      <Icon name={ANALYSIS_MODE_CONFIG[mode].icon} className={`w-6 h-6 mb-2 ${ANALYSIS_MODE_CONFIG[mode].color}`} />
                      <p className="font-bold text-slate-200 text-sm">{mode}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1">{ANALYSIS_MODE_CONFIG[mode].desc}</p>
                  </button>
              ))}
            </div>
          </div>

          {/* File Upload Zone */}
          <div
            ref={dropzoneRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('strategy-file-upload')?.click()}
            className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-slate-800/50 min-h-[200px]"
          >
            <input
              id="strategy-file-upload"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {stagedFiles.length > 0 ? (
              <div className="text-center">
                {documentPreviews.length > 0 && (
                  <div className="mb-4 flex justify-center gap-2">
                    {documentPreviews.slice(0, 3).map((preview, idx) => (
                      <img
                        key={idx}
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-md border-2 border-cyan-500"
                      />
                    ))}
                  </div>
                )}
                <p className="text-slate-200 font-bold text-xl">
                  {stagedFiles.length === 1 ? 'File Ready' : `${stagedFiles.length} Files Ready`}
                </p>
                {stagedFiles.length === 1 && (
                  <p className="text-sm text-cyan-400 mt-1">{stagedFiles[0].name}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {stagedFiles.length > 1
                    ? `Click 'Generate Brief' to compare all ${stagedFiles.length} files with ${selectedMode} lens.`
                    : `Click 'Generate Brief' to analyze with ${selectedMode} lens.`
                  }
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Icon name="upload" className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-300 font-medium text-lg">Drag & drop files or click to browse</p>
                <p className="text-sm text-slate-500 mt-2">Supports: PDF, Images, Word, Excel, CSV</p>
                <p className="text-xs text-slate-600 mt-1">Paste (Ctrl+V) to upload screenshots</p>
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
            <button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Cancel Job</button>
            <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Run in Background</button>
        </>
      );
    }

    if (jobStatus === 'complete') {
      return (
        <div className="flex items-center gap-2 w-full">
          <div className="flex gap-2">
            <button
              onClick={handleExportToClipboard}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"
              title="Copy to clipboard"
            >
              <Icon name="copy" className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={handleExportToNotes}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"
              title="Save to Notes"
            >
              <Icon name="news" className="w-4 h-4" />
              Notes
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            {stagedFiles.length > 0 && (
              <div className="relative group">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2">
                  <Icon name="sparkles" className="w-4 h-4" />
                  Switch Lens
                </button>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-md shadow-xl p-2 space-y-1 min-w-[150px]">
                  {Object.values(AnalysisMode).filter(m => m !== selectedMode).map(mode => (
                    <button
                      key={mode}
                      onClick={() => handleSwitchLens(mode)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors flex items-center gap-2"
                    >
                      <Icon name={ANALYSIS_MODE_CONFIG[mode].icon} className={`w-4 h-4 ${ANALYSIS_MODE_CONFIG[mode].color}`} />
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Close</button>
            <button onClick={() => { setActiveJob(null); resetLocalState(); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md">
              <span className="flex items-center gap-2"><Icon name="plus" className="w-5 h-5" />New Analysis</span>
            </button>
          </div>
        </div>
      );
    }

    if (jobStatus === 'error') {
      return (
        <>
          <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Close</button>
          <button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-md">
            <span className="flex items-center gap-2"><Icon name="refresh" className="w-5 h-5" />Retry</span>
          </button>
          <button onClick={() => { setActiveJob(null); resetLocalState(); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md">
            <span className="flex items-center gap-2"><Icon name="plus" className="w-5 h-5" />New Analysis</span>
          </button>
        </>
      );
    }

    return (
      <>
        <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
        <button
          onClick={handleAnalyze}
          disabled={stagedFiles.length === 0}
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
              Select an analysis lens and upload documents. The AI will generate a tailored strategic brief with follow-up chat capabilities.
            </p>
        )}

        {jobStatus === 'complete' ? renderChat() : renderUpload()}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-md p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-auto">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};
