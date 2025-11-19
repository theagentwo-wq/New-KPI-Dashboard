import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { extractKpisFromDocument, extractKpisFromText, deleteImportFile } from '../services/geminiService';
import { uploadFile, uploadTextAsFile } from '../services/firebaseService';
import { ALL_STORES } from '../constants';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportActuals: (data: any[]) => void;
  onImportBudget: (data: any[]) => void;
}

const MAX_IMAGE_WIDTH = 1500; // pixels

type ImportStep = 'upload' | 'verify' | 'processing' | 'finished';

interface ExtractedData {
    dataType: 'Actuals' | 'Budget';
    data: any[];
    sourceName: string;
}

const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (img.width <= MAX_IMAGE_WIDTH) {
                    resolve(file);
                    return;
                }
                const canvas = document.createElement('canvas');
                const scaleFactor = MAX_IMAGE_WIDTH / img.width;
                canvas.width = MAX_IMAGE_WIDTH;
                canvas.height = img.height * scaleFactor;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Canvas toBlob failed'));
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const resizedFile = new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
                        resolve(resizedFile);
                    }, 'image/jpeg', 0.9
                );
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

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
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setStep('upload');
    setStagedFiles([]);
    setStagedText('');
    setProgress({ current: 0, total: 0 });
    setStatusLog([]);
    setErrors([]);
    setExtractedData([]);
  };

  useEffect(() => { if (isOpen) resetState(); }, [isOpen]);
  useEffect(() => { if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; } }, [statusLog]);
  
  const processAndSetFiles = async (files: File[]) => {
      setStatusLog(['Optimizing images before upload...']);
      const resizedFiles = await Promise.all(files.map(resizeImage));
      setStagedFiles(resizedFiles);
      setStagedText('');
      setErrors([]);
      setStatusLog([]);
  };

  const handleFileDrop = (fileList: FileList) => { if (fileList && fileList.length > 0) processAndSetFiles(Array.from(fileList)); };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
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
                setStatusLog([]);
                setErrors([]);
            });
            return;
        }
    }
  }, []);

  useEffect(() => {
    if (isOpen) window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handlePaste]);

  const handleAnalyze = async () => {
    if (stagedFiles.length === 0 && !stagedText.trim()) {
      setErrors(['Please select files, paste an image, or paste text to analyze.']);
      return;
    }
    setStep('processing');
    setStatusLog([]);
    setErrors([]);
    setExtractedData([]);

    let jobs: { type: 'file' | 'text-chunk', content: File | string, name: string }[] = [];
    if (stagedFiles.length > 0) {
        jobs = stagedFiles.map(file => ({ type: 'file', content: file, name: file.name }));
    } else {
        const yearRegex = /(\d{4} Weekly Sales Breakdown)/g;
        const chunks = stagedText.split(yearRegex).filter(Boolean);
        if (chunks.length > 1) {
            for (let i = 0; i < chunks.length; i += 2) jobs.push({ type: 'text-chunk', content: chunks[i] + (chunks[i+1] || ''), name: chunks[i] });
        } else {
            jobs.push({ type: 'text-chunk', content: stagedText, name: 'Pasted text' });
        }
    }

    setProgress({ current: 0, total: jobs.length });
    const allExtractedData: ExtractedData[] = [];

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const currentJobNum = i + 1;
        setProgress({ current: currentJobNum, total: jobs.length });
        setStatusLog(prev => [...prev, `[${currentJobNum}/${jobs.length}] Analyzing chunk: '${job.name}'...`]);
        let fileUrl: string | null = null, filePath: string | null = null;
        try {
            let result: { dataType: 'Actuals' | 'Budget', data: any[] };
            if (job.type === 'file') {
                setStatusLog(prev => [...prev, `  -> Uploading file to secure storage...`]);
                const uploadResult = await uploadFile(job.content as File);
                ({ fileUrl, filePath } = uploadResult);
                setStatusLog(prev => [...prev, `  -> Asking AI to analyze document...`]);
                result = await extractKpisFromDocument({ fileUrl, filePath, mimeType: (job.content as File).type, fileName: job.name });
            } else {
                setStatusLog(prev => [...prev, `  -> Uploading text chunk to secure storage...`]);
                const uploadResult = await uploadTextAsFile(job.content as string, job.name);
                ({ fileUrl, filePath } = uploadResult);
                setStatusLog(prev => [...prev, `  -> Asking AI to analyze text chunk...`]);
                result = await extractKpisFromText({ fileUrl, filePath });
            }
            if (!result.dataType || !result.data) throw new Error("AI analysis returned an unexpected format.");
            allExtractedData.push({ ...result, sourceName: job.name });
            setStatusLog(prev => [...prev, `  -> SUCCESS: AI found ${result.data.length} rows of '${result.dataType}' data.`]);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setErrors(prev => [...prev, `FAILED: ${job.name} - ${errorMsg}`]);
            setStatusLog(prev => [...prev, `  -> ERROR: ${errorMsg}`]);
        } finally {
            if (filePath) await deleteImportFile(filePath);
        }
    }
    
    if (allExtractedData.length > 0) {
      setExtractedData(allExtractedData);
      setStep('verify');
    } else {
      setStatusLog(prev => [...prev, `\nAnalysis Complete. No data was successfully extracted.`]);
      setStep('finished');
    }
  };

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
              {stagedFiles.length > 0 ? (
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
      switch(step) {
          case 'upload':
              return (
                <>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleAnalyze} disabled={stagedFiles.length === 0 && !stagedText.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
                        Analyze
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
