import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { startImportJob } from '../services/geminiService';
import { uploadFile, uploadTextAsFile } from '../services/firebaseService';
import { callGeminiAPI } from '../lib/ai-client';
import { ALL_STORES } from '../constants';
import * as XLSX from 'xlsx';
import { resizeImage } from '../utils/imageUtils';
import { FileUploadResult, ActiveJob, Period } from '../types';
import { generateWeeklyMTDPeriods } from '../utils/dateUtils';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJob: ActiveJob | null;
  setActiveJob: React.Dispatch<React.SetStateAction<ActiveJob | null>>;
  onConfirmImport: (job: ActiveJob) => void;
}

const processingMessages = [
    'Starting secure analysis... this may take up to 2 minutes for complex files...',
    'Submitting job to the AI analyst...',
    'AI is reading the document structure...',
    'Analyzing financial data and KPIs...',
    'Identifying data types (Actuals vs. Budgets)...',
    'Extracting row-level information...',
    'Formatting results for verification...',
];

const EditableCell: React.FC<{ value: any; onChange: (newValue: string) => void; isStore?: boolean; }> = ({ value, onChange, isStore = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    // Convert value to string, handling numbers including 0
    const initialStringValue = value === null || value === undefined || value === '' ? '' : String(value);
    const [currentValue, setCurrentValue] = useState(initialStringValue);

    useEffect(() => {
        const newStringValue = value === null || value === undefined || value === '' ? '' : String(value);
        setCurrentValue(newStringValue);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        onChange(currentValue);
    };

    if (isEditing) {
        if (isStore) {
            return (
                <select value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleBlur} autoFocus className="w-full bg-slate-900 border border-cyan-500 rounded p-1 text-xs">
                    <option value="">-- Select Store --</option>
                    {ALL_STORES.map(store => <option key={store} value={store}>{store}</option>)}
                </select>
            )
        }
        return <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()} autoFocus className="w-full bg-slate-900 border border-cyan-500 rounded p-1 text-xs" />;
    }

    // Check if value is truly missing (null, undefined, or empty string)
    // Convert value to string for display, handling numbers including 0
    const stringValue = value === null || value === undefined || value === '' ? '' : String(value);
    const isMissing = value === null || value === undefined || value === '';
    // Highlight cells with 0 in amber to indicate they need manual entry
    const isZero = value === 0 || stringValue === '0';

    return (
        <div onClick={() => setIsEditing(true)} className={`p-1 text-xs w-full h-full cursor-pointer ${isMissing ? 'bg-yellow-900/50 text-yellow-300' : isZero ? 'bg-amber-900/30 text-amber-200' : ''}`}>
            {isMissing ? <span className="italic">Missing</span> : stringValue}
        </div>
    );
};

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, activeJob, setActiveJob, onConfirmImport }) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedText, setStagedText] = useState<string>('');
  const [stagedWorkbook, setStagedWorkbook] = useState<{ file: File; sheets: string[] } | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState<string>('');
  const [selectedFiscalPeriod, setSelectedFiscalPeriod] = useState<Period | null>(null);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(processingMessages[0]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Always use weekly MTD mode
  const periodType = 'weekly' as const;

  // Generate all available fiscal weeks for selection (FY2025, FY2026, FY2027)
  const availableFiscalWeeks = [
    ...generateWeeklyMTDPeriods(2025),
    ...generateWeeklyMTDPeriods(2026),
    ...generateWeeklyMTDPeriods(2027),
  ];

  const step = activeJob ? activeJob.step : 'upload';

  const resetLocalState = () => {
    setStagedFiles([]);
    setStagedText('');
    setStagedWorkbook(null);
    setSelectedSheets([]);
    setSelectedWeekStartDate('');
    setSelectedFiscalPeriod(null);
  };

  // Helper: Extract fiscal month name from period label (e.g., "FY2026 P12" → "December")
  const getFiscalMonthName = (periodLabel: string | undefined): string => {
    if (!periodLabel) return 'Unknown';

    const match = periodLabel.match(/P(\d+)/);
    if (!match) return 'Unknown';

    const periodNum = parseInt(match[1], 10);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames[periodNum - 1] || 'Unknown';
  };

  // Handler for fiscal week selection
  const handleFiscalWeekSelection = (periodLabel: string) => {
    const period = availableFiscalWeeks.find(p => p.label === periodLabel);
    if (period) {
      setSelectedFiscalPeriod(period);
      // Format the start date as YYYY-MM-DD for backend compatibility
      const year = period.startDate.getFullYear();
      const month = String(period.startDate.getMonth() + 1).padStart(2, '0');
      const day = String(period.startDate.getDate()).padStart(2, '0');
      setSelectedWeekStartDate(`${year}-${month}-${day}`);
    }
  };

  useEffect(() => {
    if (isOpen && !activeJob) resetLocalState();
  }, [isOpen, activeJob]);
  
  useEffect(() => { if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; } }, [activeJob?.statusLog]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 'processing') {
      setCurrentProcessingMessage(processingMessages[0]);
      interval = setInterval(() => {
        setCurrentProcessingMessage(prev => {
          const currentIndex = processingMessages.indexOf(prev);
          return processingMessages[(currentIndex + 1) % processingMessages.length];
        });
      }, 3500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [step]);

  // Job polling mechanism - check AI job status every 3 seconds
  useEffect(() => {
    if (!activeJob || activeJob.step !== 'pending') return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await callGeminiAPI('checkTaskStatus', { jobId: activeJob.id });

        if (status.status === 'completed' && status.results) {
          // Job completed successfully - move to verification step
          setActiveJob({
            ...activeJob,
            step: 'verify',
            extractedData: status.results,
            statusLog: [...activeJob.statusLog, '✓ SUCCESS: AI analysis complete, ready for verification'],
            progress: { current: 1, total: 1 }
          });
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          // Job failed
          setActiveJob({
            ...activeJob,
            step: 'error',
            errors: [...activeJob.errors, status.error || 'Unknown error occurred'],
            statusLog: [...activeJob.statusLog, `✗ ERROR: ${status.error || 'Job failed'}`]
          });
          clearInterval(pollInterval);
        } else if (status.status === 'running') {
          // Still processing - update status log
          const newLog = `Processing... (${Math.floor((Date.now() - new Date(activeJob.statusLog[0]).getTime()) / 1000)}s elapsed)`;
          if (activeJob.statusLog[activeJob.statusLog.length - 1] !== newLog) {
            setActiveJob({
              ...activeJob,
              statusLog: [...activeJob.statusLog.slice(0, -1), newLog]
            });
          }
        }
      } catch (error) {
        console.error('[ImportDataModal] Error polling job status:', error);
        setActiveJob(prev => ({
          ...prev!,
          step: 'error',
          errors: [...(prev?.errors || []), `Polling error: ${error instanceof Error ? error.message : 'Unknown error'}`],
          statusLog: [...(prev?.statusLog || []), `✗ ERROR: Failed to check job status`]
        }));
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [activeJob]);

  const processAndSetFiles = async (files: File[]) => {
      const excelFile = files.find(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.xlsm'));
      if (excelFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            setStagedWorkbook({ file: excelFile, sheets: workbook.SheetNames });
            setSelectedSheets(workbook.SheetNames);
            setStagedFiles([]); setStagedText('');
        };
        reader.readAsArrayBuffer(excelFile);
      } else {
        const resizedFiles = await Promise.all(files.map(file => resizeImage(file)));
        setStagedFiles(resizedFiles);
        setStagedWorkbook(null); setStagedText('');
      }
  };

  const handleFileDrop = (fileList: FileList) => { if (fileList && fileList.length > 0) processAndSetFiles(Array.from(fileList)); };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (step !== 'upload') return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) { if (items[i].type.indexOf('image') !== -1) { const blob = items[i].getAsFile(); if (blob) { await processAndSetFiles([new File([blob], "pasted-image.png", { type: blob.type })]); return; } } }
    for (let i = 0; i < items.length; i++) { if (items[i].kind === 'string') { items[i].getAsString((text) => { setStagedText(text); setStagedFiles([]); setStagedWorkbook(null); }); return; } }
  }, [step]);

  useEffect(() => {
    if (isOpen) window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handlePaste]);
  
  const handleToggleSheet = (sheetName: string) => setSelectedSheets(prev => prev.includes(sheetName) ? prev.filter(s => s !== sheetName) : [...prev, sheetName]);

  const handleAnalyze = () => {
    console.log('[ImportDataModal] handleAnalyze called', {
      filesCount: stagedFiles.length,
      hasText: !!stagedText,
      hasWorkbook: !!stagedWorkbook,
      selectedDate: selectedWeekStartDate
    });

    if (!selectedWeekStartDate) {
      alert('Please select a week start date before analyzing.');
      return;
    }

    let jobs: { type: 'file' | 'text-chunk', content: File | string, name: string }[] = [];
    if (stagedFiles.length > 0) jobs = stagedFiles.map(file => ({ type: 'file', content: file, name: file.name }));
    else if (stagedText.trim().length > 0) jobs.push({ type: 'text-chunk', content: stagedText, name: 'Pasted text' });
    else if (stagedWorkbook && selectedSheets.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target?.result, { type: 'array' });
            const sheetJobs = selectedSheets.map(sheetName => ({ type: 'text-chunk' as const, content: XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]), name: `${stagedWorkbook.file.name} - ${sheetName}` }));
            runAnalysisJobs(sheetJobs);
        };
        reader.readAsArrayBuffer(stagedWorkbook.file);
        return;
    }
    runAnalysisJobs(jobs);
  };

  const runAnalysisJobs = async (jobs: { type: 'file' | 'text-chunk', content: File | string, name: string }[]) => {
    if (jobs.length === 0) return;

    // Always use weekly MTD mode - no date conversion needed
    const dateToUse = selectedWeekStartDate;

    console.log('[ImportDataModal] Starting analysis jobs', {
      count: jobs.length,
      periodType,
      selectedDate: selectedWeekStartDate,
      dateToUse
    });

    try {
        const job = jobs[0];

        console.log('[ImportDataModal] Uploading file...', job.name);
        const uploadResult: FileUploadResult = await (async () => {
            if (job.type === 'file') {
                return await uploadFile(job.content as File, () => {});
            } else {
                return await uploadTextAsFile(job.content as string, job.name);
            }
        })();

        console.log('[ImportDataModal] Upload complete! Result:', JSON.stringify(uploadResult, null, 2));
        console.log('[ImportDataModal] fileUrl present?', !!uploadResult.fileUrl);
        console.log('[ImportDataModal] File uploaded, starting AI job with date:', dateToUse, 'periodType:', periodType);
        const { jobId } = await startImportJob(uploadResult, job.type === 'file' ? 'document' : 'text', dateToUse, periodType);

        console.log('[ImportDataModal] AI job started, jobId:', jobId);
        setActiveJob({
          id: jobId,
          step: 'pending',
          statusLog: [
            `📁 File uploaded: ${job.name}`,
            `📅 Week Start Date (MTD): ${dateToUse}`,
            `🤖 AI analysis started...`
          ],
          progress: { current: 0, total: 1 },
          errors: [],
          extractedData: []
        });
    } catch (err) {
        console.error('[ImportDataModal] Error in runAnalysisJobs:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to submit job.';
        setActiveJob({
          id: '',
          step: 'error',
          statusLog: ['❌ Analysis failed'],
          progress: { current: 0, total: 1 },
          errors: [errorMsg],
          extractedData: []
        });
    }
  };

  const handleDataChange = (sourceIndex: number, rowIndex: number, column: string, value: string) => {
      if (!activeJob) return;
      const newData = [...activeJob.extractedData];
      newData[sourceIndex].data[rowIndex][column] = value;
      setActiveJob({ ...activeJob, extractedData: newData });
  };
  
  const handleConfirm = () => { 
    if (activeJob) onConfirmImport(activeJob);
  }; 
  
  const handleFullClose = () => {
      setActiveJob(null);
      onClose();
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileDrop(e.dataTransfer.files); };
  
  const acceptedFileTypes = ".csv, .xlsx, .xlsm, .xls, .png, .jpg, .jpeg";

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <>
            <p className="text-slate-300 text-sm">Upload spreadsheets (Actuals or Budgets), images, or paste text. The AI will act as a financial analyst to classify, read, and import the data automatically.</p>
            <div ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => document.getElementById('file-upload')?.click()} className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50">
              <input id="file-upload" type="file" accept={acceptedFileTypes} className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} multiple />
              <Icon name="upload" className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              {stagedWorkbook ? (
                 <div className="text-slate-200 text-sm text-left">
                    <p className="font-bold text-lg text-center mb-2">{stagedWorkbook.file.name}</p><p className="text-xs text-slate-400 mb-2">Select sheets to analyze:</p>
                    <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1 p-2 bg-slate-900/50 rounded-md">
                        {stagedWorkbook.sheets.map(sheet => ( <label key={sheet} className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}> <input type="checkbox" checked={selectedSheets.includes(sheet)} onChange={() => handleToggleSheet(sheet)} className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 text-cyan-500 rounded focus:ring-cyan-500"/> <span>{sheet}</span> </label> ))}
                    </div>
                </div>
              ) : stagedFiles.length > 0 ? (
                <div className="text-slate-200 text-sm">
                  <p className="font-bold text-lg">{stagedFiles.length} file(s) selected:</p>
                  <ul className="mt-2 text-left max-h-24 overflow-y-auto custom-scrollbar list-disc pl-5"> {stagedFiles.map(f => <li key={f.name}>{f.name}</li>)} </ul>
                </div>
              ) : stagedText ? (
                <div className="text-slate-200 text-sm"> <p className="font-bold text-lg">Pasted text ready for import</p> <p className="text-xs text-slate-400">({stagedText.length} characters)</p> </div>
              ) : (
                <>
                  <p className="text-slate-300 font-medium text-lg">Drag & drop files, click to browse, or paste an image/text</p>
                  <p className="text-sm text-slate-500 mt-2">Supports Excel, CSV, PNG, JPG</p>
                </>
              )}
            </div>

            {/* Fiscal Week Selector - Show when files are staged */}
            {(stagedFiles.length > 0 || stagedWorkbook || stagedText) && (
              <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
                {/* Fiscal Week Dropdown (MTD mode) */}
                <div>
                  <label htmlFor="fiscal-week-select" className="block text-sm font-medium text-slate-300 mb-2">
                    📅 Select Fiscal Week (MTD):
                  </label>
                  <select
                    id="fiscal-week-select"
                    value={selectedFiscalPeriod?.label || ''}
                    onChange={(e) => handleFiscalWeekSelection(e.target.value)}
                    className="w-full max-w-md bg-slate-800 text-white border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="">-- Select a fiscal week --</option>
                    {availableFiscalWeeks.map((period) => {
                      // Format the display label using FISCAL month name (not calendar month)
                      const fiscalMonthName = getFiscalMonthName(period.periodLabel);

                      // Calculate actual week start date (not MTD period start)
                      const weekStartDate = new Date(period.startDate);
                      if (period.weekNumber && period.weekNumber > 1) {
                        weekStartDate.setDate(weekStartDate.getDate() + ((period.weekNumber - 1) * 7));
                      }

                      // Use FISCAL year from the period, not calendar year from the date
                      const fiscalYear = period.year;
                      const displayLabel = `${fiscalMonthName} ${fiscalYear} - Week ${period.weekNumber}`;
                      return (
                        <option key={period.label} value={period.label}>
                          {displayLabel} ({weekStartDate.toLocaleDateString()})
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Select the fiscal week this data represents. Data is treated as Month-to-Date cumulative through this week.
                  </p>
                </div>
              </div>
            )}
          </>
        );
      case 'guided-paste': return <p>Guided paste not implemented in this view.</p>;
      case 'verify':
        if (!activeJob) return null;
        return (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">AI analysis is complete. Please review the extracted data below for accuracy. You can click on any cell to make corrections before importing.</p>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg">
                {activeJob.extractedData.map((item, sourceIndex) => {
                    if (item.data.length === 0) return null;
                    // Filter out 'pnl' field - it's nested data that will be stored separately
                    const headers = Object.keys(item.data[0]).filter(key => key !== 'pnl');
                    return (
                        <div key={sourceIndex} className="mb-4">
                            <h3 className="text-md font-bold text-cyan-400 p-2 bg-slate-900/50">{item.sourceName} <span className="text-xs font-normal text-slate-400">({item.dataType})</span></h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-700"><tr>{headers.map(h => <th key={h} className="p-2 text-xs font-semibold text-slate-300">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-slate-700">{item.data.map((row, rowIndex) => (<tr key={rowIndex} className="hover:bg-slate-800/50">{headers.map(header => (<td key={header} className="p-0 border-r border-slate-700 last:border-r-0"><EditableCell value={row[header]} onChange={newValue => handleDataChange(sourceIndex, rowIndex, header, newValue)} isStore={header === 'Store Name'}/></td>))}</tr>))}</tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        );
      case 'pending':
      case 'processing':
      case 'finished':
      case 'error':
        if (!activeJob) return null;
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <p className="text-cyan-400 font-semibold">{step === 'processing' || step === 'pending' ? 'Processing...' : 'Finished'}</p>
              <p className="text-slate-400">{activeJob.progress.current} / {activeJob.progress.total}</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${activeJob.progress.total > 0 ? (activeJob.progress.current / activeJob.progress.total) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            {(step === 'processing' || step === 'pending') && (<div className="text-center p-2 min-h-[40px] flex items-center justify-center"><p className="text-slate-300 text-sm transition-opacity duration-500">{currentProcessingMessage}</p></div>)}
            <div ref={logContainerRef} className="bg-slate-900 border border-slate-700 rounded-md p-3 h-48 overflow-y-auto custom-scrollbar text-xs font-mono">
              {activeJob.statusLog.map((log, i) => (<p key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>{log}</p>))}
            </div>
          </div>
        );
    }
  };

  const renderFooter = () => {
      const hasData = stagedFiles.length > 0 || stagedText.trim().length > 0 || (stagedWorkbook && selectedSheets.length > 0);
      const isAnalyzeDisabled = !hasData || !selectedWeekStartDate;
      switch(step) {
          case 'upload': return (<>
              <button onClick={handleFullClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
              <button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
                Analyze {!selectedWeekStartDate && hasData ? '(Select date first)' : ''}
              </button>
          </>);
          case 'verify': return (<>
              <button onClick={() => setActiveJob(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Back</button>
              <button onClick={handleConfirm} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">Confirm & Import</button>
          </>);
          case 'finished':
          case 'error': return <button onClick={handleFullClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">Close</button>;
          case 'pending':
          case 'processing': return <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Run in Background</button>;
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleFullClose} title="Universal Data Hub" size="large">
      <div className="space-y-4">
        {renderContent()}
        {activeJob && activeJob.errors && activeJob.errors.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-400">Errors Encountered:</h3>
            {activeJob.errors.map((err, i) => (<p key={i} className="text-xs text-red-400 bg-red-900/30 p-1.5 rounded-md">{err}</p>))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};