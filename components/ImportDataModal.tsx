import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { startImportJob, deleteImportFile } from '../services/geminiService';
import { uploadFile, uploadTextAsFile, listenToImportJob } from '../services/firebaseService';
import { ALL_STORES } from '../constants';
import * as XLSX from 'xlsx';
import { resizeImage } from '../utils/imageUtils';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportActuals: (data: any[]) => void;
  onImportBudget: (data: any[]) => void;
}

type ImportStep = 'upload' | 'guided-paste' | 'verify' | 'processing' | 'finished';

interface ExtractedData {
    dataType: 'Actuals' | 'Budget';
    data: any[];
    sourceName: string;
    isDynamicSheet?: boolean;
}

const processingMessages = [
    'Submitting job to the AI analyst...',
    'AI is reading the document structure...',
    'Analyzing financial data and KPIs...',
    'Identifying data types (Actuals vs. Budgets)...',
    'Extracting row-level information...',
    'Formatting results for verification...',
    'This can take up to 2 minutes for complex files...'
];

const EditableCell: React.FC<{ value: string; onChange: (newValue: string) => void; isStore?: boolean; }> = ({ value, onChange, isStore = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        onChange(currentValue);
    };

    if (isEditing) {
        if (isStore) {
            return (
                <select
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                    className="w-full bg-slate-900 border border-cyan-500 rounded p-1 text-xs"
                >
                    <option value="">-- Select Store --</option>
                    {ALL_STORES.map(store => <option key={store} value={store}>{store}</option>)}
                </select>
            )
        }
        return (
            <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                autoFocus
                className="w-full bg-slate-900 border border-cyan-500 rounded p-1 text-xs"
            />
        );
    }

    return (
        <div onClick={() => setIsEditing(true)} className={`p-1 text-xs w-full h-full ${!value ? 'bg-yellow-900/50 text-yellow-300' : ''}`}>
            {value || <span className="italic">Missing</span>}
        </div>
    );
};

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImportActuals, onImportBudget }) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedText, setStagedText] = useState<string>('');
  const [stagedWorkbook, setStagedWorkbook] = useState<{ file: File; sheets: string[] } | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [pastedStoreData, setPastedStoreData] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState(processingMessages[0]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  const resetState = () => {
    setStep('upload');
    setStagedFiles([]);
    setStagedText('');
    setStagedWorkbook(null);
    setSelectedSheets([]);
    setPastedStoreData({});
    setProgress({ current: 0, total: 0 });
    setStatusLog([]);
    setErrors([]);
    setExtractedData([]);
    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];
  };

  useEffect(() => { if (isOpen) resetState(); }, [isOpen]);
  useEffect(() => { if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; } }, [statusLog]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 'processing') {
      setCurrentProcessingMessage(processingMessages[0]); // Reset to first message on start
      interval = setInterval(() => {
        setCurrentProcessingMessage(prev => {
          const currentIndex = processingMessages.indexOf(prev);
          return processingMessages[(currentIndex + 1) % processingMessages.length];
        });
      }, 3500); // Change message every 3.5 seconds
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [step]);


  const processAndSetFiles = async (files: File[]) => {
      const excelFile = files.find(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.xlsm'));
      if (excelFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetNames = workbook.SheetNames;
            setStagedWorkbook({ file: excelFile, sheets: sheetNames });
            setSelectedSheets(sheetNames); // Select all by default
            setStagedFiles([]);
            setStagedText('');
            setErrors([]);
            setStatusLog([]);
        };
        reader.readAsArrayBuffer(excelFile);
      } else {
        setStatusLog(['Optimizing images before upload...']);
        const resizedFiles = await Promise.all(files.map(file => resizeImage(file)));
        setStagedFiles(resizedFiles);
        setStagedWorkbook(null);
        setStagedText('');
        setErrors([]);
        setStatusLog([]);
      }
  };

  const handleFileDrop = (fileList: FileList) => { if (fileList && fileList.length > 0) processAndSetFiles(Array.from(fileList)); };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (step !== 'upload') return; // Only allow global paste on the upload step
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) await processAndSetFiles([new File([blob], "pasted-image.png", { type: blob.type })]);
            return;
        }
    }
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'string') {
            items[i].getAsString((text) => {
                setStagedText(text);
                setStagedFiles([]);
                setStagedWorkbook(null);
                setStatusLog([]);
                setErrors([]);
            });
            return;
        }
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handlePaste]);
  
  const handleToggleSheet = (sheetName: string) => {
    setSelectedSheets(prev => prev.includes(sheetName) ? prev.filter(s => s !== sheetName) : [...prev, sheetName]);
  };
  
  const handleAnalyzePastedData = async () => {
    const jobs = (Object.entries(pastedStoreData) as [string, string][])
        .filter(([, text]) => text.trim())
        .map(([storeName, text]) => ({
            type: 'text-chunk' as const,
            content: text,
            name: `Pasted data for ${storeName}`
        }));

    if (jobs.length === 0) {
        setErrors(['Please paste data for at least one store to continue.']);
        return;
    }
    await runAnalysisJobs(jobs);
  };

  const handleAnalyze = async () => {
    const hasFiles = stagedFiles.length > 0;
    const hasText = stagedText.trim().length > 0;
    const hasWorkbook = stagedWorkbook && selectedSheets.length > 0;

    if (!hasFiles && !hasText && !hasWorkbook) {
      setErrors(['Please select files, paste an image, or paste text to analyze.']);
      return;
    }
    setStep('processing');
    setStatusLog([]);
    setErrors([]);
    setExtractedData([]);

    let jobs: { type: 'file' | 'text-chunk', content: File | string, name: string }[] = [];
    if (hasFiles) {
        jobs = stagedFiles.map(file => ({ type: 'file', content: file, name: file.name }));
    } else if (hasText) {
        jobs.push({ type: 'text-chunk', content: stagedText, name: 'Pasted text' });
    } else if (hasWorkbook) {
        const workbookFile = stagedWorkbook.file;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetJobs = selectedSheets.map(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const csvText = XLSX.utils.sheet_to_csv(worksheet);
                return {
                    type: 'text-chunk' as const,
                    content: csvText,
                    name: `${workbookFile.name} - ${sheetName}`
                };
            });
            await runAnalysisJobs(sheetJobs);
        };
        reader.readAsArrayBuffer(workbookFile);
        return; // runAnalysisJobs will be called asynchronously
    }

    await runAnalysisJobs(jobs);
  };

  const runAnalysisJobs = async (jobs: { type: 'file' | 'text-chunk', content: File | string, name: string }[]) => {
    setStep('processing');
    setProgress({ current: 0, total: jobs.length });
    const allExtractedData: ExtractedData[] = [];

    await new Promise<void>(resolveAllJobs => {
        let completedJobs = 0;

        const handleJobCompletion = () => {
            completedJobs++;
            setProgress(prev => ({ ...prev, current: completedJobs }));
            if (completedJobs === jobs.length) {
                resolveAllJobs();
            }
        };

        if (jobs.length === 0) {
            resolveAllJobs();
            return;
        }
        
        jobs.forEach(async (job, index) => {
            let filePath: string | null = null;
            let jobId: string | null = null;
            try {
                setStatusLog(prev => [...prev, `[${index + 1}/${jobs.length}] Submitting job for '${job.name}'...`]);
                
                let uploadResult;
                if (job.type === 'file') {
                    uploadResult = await uploadFile(job.content as File);
                    ({ jobId } = await startImportJob({ ...uploadResult, mimeType: (job.content as File).type, fileName: job.name }, 'document'));
                } else {
                    uploadResult = await uploadTextAsFile(job.content as string, job.name);
                    ({ jobId } = await startImportJob(uploadResult, 'text'));
                }
                filePath = uploadResult.filePath;
                
                const unsubscribe = listenToImportJob(jobId!, (jobData) => {
                    if (jobData.status === 'complete') {
                        setStatusLog(prev => [...prev, `  -> SUCCESS: Job for '${job.name}' completed.`]);
                        const extractedResult: ExtractedData = { ...jobData.result, sourceName: job.name };
                        allExtractedData.push(extractedResult);
                        unsubscribe();
                        handleJobCompletion();
                    } else if (jobData.status === 'error') {
                        const errorMsg = jobData.error || 'Background job failed.';
                        setStatusLog(prev => [...prev, `  -> ERROR: Job for '${job.name}' failed: ${errorMsg}`]);
                        setErrors(prev => [...prev, `FAILED: ${job.name} - ${errorMsg}`]);
                        unsubscribe();
                        handleJobCompletion();
                    }
                });
                unsubscribesRef.current.push(unsubscribe);

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to submit job.';
                setStatusLog(prev => [...prev, `  -> ERROR: Could not submit job for '${job.name}': ${errorMsg}`]);
                setErrors(prev => [...prev, `FAILED to submit job: ${job.name} - ${errorMsg}`]);
                if (filePath) await deleteImportFile(filePath);
                handleJobCompletion();
            }
        });
    });

    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];
    
    if (allExtractedData.some(d => d.isDynamicSheet)) {
        setStatusLog(prev => [...prev, "\nDynamic sheet detected! AI requires separate data for each store. Please use the Guided Paste workflow."]);
        setStep('guided-paste');
    } else if (allExtractedData.length > 0) {
        setExtractedData(allExtractedData);
        setStep('verify');
    } else {
        setStatusLog(prev => [...prev, `\nAnalysis Complete. No data was successfully extracted.`]);
        setStep('finished');
    }
  }

  const handleDataChange = (sourceIndex: number, rowIndex: number, column: string, value: string) => {
      const newData = [...extractedData];
      newData[sourceIndex].data[rowIndex][column] = value;
      setExtractedData(newData);
  };
  
  const handleConfirmImport = async () => {
      setStep('processing');
      setStatusLog(['Beginning final import process...']);
      setProgress({ current: 0, total: extractedData.length });
      let hasErrors = false;

      for(let i=0; i<extractedData.length; i++) {
        const item = extractedData[i];
        setProgress({ current: i + 1, total: extractedData.length });
        setStatusLog(prev => [...prev, `[${i+1}/${extractedData.length}] Importing '${item.dataType}' from '${item.sourceName}'...`]);
        try {
          if (item.dataType === 'Actuals') {
            await onImportActuals(item.data);
          } else if (item.dataType === 'Budget') {
            await onImportBudget(item.data);
          }
          setStatusLog(prev => [...prev, `  -> SUCCESS: Imported ${item.data.length} rows.`]);
        } catch(err) {
            hasErrors = true;
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setErrors(prev => [...prev, `IMPORT FAILED: ${item.sourceName} - ${errorMsg}`]);
            setStatusLog(prev => [...prev, `  -> ERROR: ${errorMsg}`]);
        }
      }
      setStatusLog(prev => [...prev, `\nImport Complete.`]);
      if(hasErrors) setErrors(prev => [...prev, 'Some data may not have been imported. Please review the errors.']);
      setStep('finished');
  };

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
            <div ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => document.getElementById('file-upload')?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50">
              <input id="file-upload" type="file" accept={acceptedFileTypes} className="hidden" onChange={(e) => handleFileDrop(e.target.files!)} multiple />
              <Icon name="download" className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              {stagedWorkbook ? (
                 <div className="text-slate-200 text-sm text-left">
                    <p className="font-bold text-lg text-center mb-2">{stagedWorkbook.file.name}</p>
                    <p className="text-xs text-slate-400 mb-2">Select sheets to analyze:</p>
                    <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1 p-2 bg-slate-900/50 rounded-md">
                        {stagedWorkbook.sheets.map(sheet => (
                            <label key={sheet} className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={selectedSheets.includes(sheet)} onChange={() => handleToggleSheet(sheet)} className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 text-cyan-500 rounded focus:ring-cyan-500"/>
                                <span>{sheet}</span>
                            </label>
                        ))}
                    </div>
                </div>
              ) : stagedFiles.length > 0 ? (
                <div className="text-slate-200 text-sm">
                  <p className="font-bold text-lg">{stagedFiles.length} file(s) selected:</p>
                  <ul className="mt-2 text-left max-h-24 overflow-y-auto custom-scrollbar list-disc pl-5">
                    {stagedFiles.map(f => <li key={f.name}>{f.name}</li>)}
                  </ul>
                </div>
              ) : stagedText ? (
                <div className="text-slate-200 text-sm">
                  <p className="font-bold text-lg">Pasted text ready for import</p>
                  <p className="text-xs text-slate-400">({stagedText.length} characters)</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-300 font-medium text-lg">Drag & drop files, click to browse, or paste an image/text</p>
                  <p className="text-sm text-slate-500 mt-2">Supports Excel, CSV, PNG, JPG</p>
                </>
              )}
            </div>
          </>
        );
      case 'guided-paste':
        return (
            <div className="space-y-4">
                <div className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
                    <h3 className="text-md font-bold text-cyan-400 flex items-center gap-2">
                        <Icon name="sparkles" className="w-5 h-5" />
                        Guided Paste Required
                    </h3>
                    <p className="text-slate-300 text-sm mt-1">The AI detected a dynamic sheet that uses a dropdown. To ensure accuracy, please copy the data for each store from your spreadsheet and paste it into the corresponding box below.</p>
                </div>
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {ALL_STORES.map(store => (
                        <div key={store} className="bg-slate-800 p-3 rounded-md border border-slate-700">
                           <div className="flex justify-between items-center">
                             <label htmlFor={`paste-area-${store}`} className="font-semibold text-slate-200">{store}</label>
                             {pastedStoreData[store] && <span className="text-xs text-green-400">Pasted ✓</span>}
                           </div>
                            <textarea
                                id={`paste-area-${store}`}
                                value={pastedStoreData[store] || ''}
                                onChange={(e) => setPastedStoreData(prev => ({ ...prev, [store]: e.target.value }))}
                                placeholder={`Paste data for ${store} here...`}
                                rows={2}
                                className="mt-2 w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white text-xs placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'verify':
        return (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">AI analysis is complete. Please review the extracted data below for accuracy. You can click on any cell to make corrections before importing.</p>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg">
                {extractedData.map((item, sourceIndex) => {
                    if (item.data.length === 0) return null;
                    const headers = Object.keys(item.data[0]);
                    return (
                        <div key={sourceIndex} className="mb-4">
                            <h3 className="text-md font-bold text-cyan-400 p-2 bg-slate-900/50">{item.sourceName} <span className="text-xs font-normal text-slate-400">({item.dataType})</span></h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-700">
                                        <tr>
                                            {headers.map(h => <th key={h} className="p-2 text-xs font-semibold text-slate-300">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {item.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-slate-800/50">
                                                {headers.map(header => (
                                                    <td key={header} className="p-0 border-r border-slate-700 last:border-r-0">
                                                        <EditableCell
                                                            value={row[header]}
                                                            onChange={newValue => handleDataChange(sourceIndex, rowIndex, header, newValue)}
                                                            isStore={header === 'Store Name'}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        );
      case 'processing':
      case 'finished':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <p className="text-cyan-400 font-semibold">{step === 'processing' ? 'Processing...' : 'Finished'}</p>
              <p className="text-slate-400">{progress.current} / {progress.total}</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            {step === 'processing' && (
                <div className="text-center p-2 min-h-[40px] flex items-center justify-center">
                    <p className="text-slate-300 text-sm transition-opacity duration-500">{currentProcessingMessage}</p>
                </div>
            )}
            <div ref={logContainerRef} className="bg-slate-900 border border-slate-700 rounded-md p-3 h-48 overflow-y-auto custom-scrollbar text-xs font-mono">
              {statusLog.map((log, i) => (
                <p key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>{log}</p>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderFooter = () => {
      const isAnalyzeDisabled = stagedFiles.length === 0 && !stagedText.trim() && (!stagedWorkbook || selectedSheets.length === 0);
      switch(step) {
          case 'upload':
              return (
                <>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
                        Analyze
                    </button>
                </>
              );
          case 'guided-paste':
              return (
                 <>
                    <button onClick={() => setStep('upload')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Back</button>
                    <button onClick={handleAnalyzePastedData} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">
                       Analyze Pasted Data
                    </button>
                </>
              );
          case 'verify':
              return (
                 <>
                    <button onClick={() => setStep('upload')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Back</button>
                    <button onClick={handleConfirmImport} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">
                       Confirm & Import
                    </button>
                </>
              );
          case 'finished':
              return <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">Close</button>;
          case 'processing':
              return null; // No buttons during processing
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Data Hub" size="large">
      <div className="space-y-4">
        {renderContent()}
        {errors.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-400">Errors Encountered:</h3>
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-400 bg-red-900/30 p-1.5 rounded-md">{err}</p>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          {renderFooter()}
        </div>
      </div>
    </Modal>
  );
};
