import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { extractKpisFromDocument, extractKpisFromText } from '../services/geminiService';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportActuals: (data: any[]) => void;
  onImportBudget: (data: any[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImportActuals, onImportBudget }) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedText, setStagedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const resetState = () => {
    setStagedFiles([]);
    setStagedText('');
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setStatusLog([]);
    setErrors([]);
  };

  useEffect(() => {
    if (isOpen) resetState();
  }, [isOpen]);

  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [statusLog]);

  const handleFileDrop = (fileList: FileList) => {
    if (fileList && fileList.length > 0) {
      setStagedFiles(Array.from(fileList));
      setStagedText('');
      setStatusLog([]);
      setErrors([]);
    }
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                setStagedFiles([new File([blob], "pasted-image.png", { type: blob.type })]);
                setStagedText('');
                setStatusLog([]);
                setErrors([]);
                return;
            }
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
    if (isOpen) {
        window.addEventListener('paste', handlePaste);
    }
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, handlePaste]);

  const handleImport = async () => {
    if (stagedFiles.length === 0 && !stagedText.trim()) {
      setErrors(['Please select files, paste an image, or paste text to import.']);
      return;
    }

    setIsProcessing(true);
    setStatusLog([]);
    setErrors([]);

    const processAndImport = async (processor: () => Promise<{ dataType: 'Actuals' | 'Budget', data: any[] }>, sourceName: string) => {
        setStatusLog(prev => [...prev, `  -> Asking AI to analyze ${sourceName}...`]);
        const result = await processor();

        if (!result.dataType || !result.data) {
            throw new Error("AI analysis returned an unexpected format.");
        }

        setStatusLog(prev => [...prev, `  -> AI classified data as '${result.dataType}'. Importing ${result.data.length} rows...`]);

        if (result.dataType === 'Actuals') {
            onImportActuals(result.data);
        } else if (result.dataType === 'Budget') {
            onImportBudget(result.data);
        } else {
            throw new Error(`Unknown data type returned by AI: ${result.dataType}`);
        }
    };

    if (stagedFiles.length > 0) {
        setProgress({ current: 0, total: stagedFiles.length });
        for (let i = 0; i < stagedFiles.length; i++) {
            const file = stagedFiles[i];
            const currentFileNum = i + 1;
            setProgress({ current: currentFileNum, total: stagedFiles.length });
            setStatusLog(prev => [...prev, `[${currentFileNum}/${stagedFiles.length}] Processing ${file.name}...`]);

            try {
                const base64Data = await fileToBase64(file);
                await processAndImport(() => extractKpisFromDocument({ mimeType: file.type, data: base64Data }, file.name), `document ${file.name}`);
                setStatusLog(prev => [...prev, `  -> SUCCESS: ${file.name} imported.`]);

            } catch (err) {
                let errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
                if (errorMsg.toLowerCase().includes('timeout') || errorMsg.includes('504')) {
                    errorMsg = "The analysis of this large document timed out. Please try splitting the text into smaller sections (e.g., one year at a time) and import them separately.";
                }
                setErrors(prev => [...prev, `FAILED: ${file.name} - ${errorMsg}`]);
                setStatusLog(prev => [...prev, `  -> ERROR: ${errorMsg}`]);
            }
        }
    } else if (stagedText.trim()) {
        setStatusLog(prev => [...prev, `[1/1] Pre-analyzing large text for chunking...`]);
        
        const chunkRegex = /(\d{4}\s+Weekly\s+Sales\s+Breakdown)/g;
        const textParts = stagedText.split(chunkRegex).filter(Boolean);
        
        const jobs: { name: string; content: string }[] = [];
        if (textParts.length <= 1) {
            jobs.push({ name: 'Pasted text', content: stagedText });
        } else {
             for (let i = 0; i < textParts.length; i += 2) {
                if (textParts[i] && textParts[i+1]) {
                    jobs.push({ name: textParts[i].trim(), content: textParts[i] + textParts[i+1] });
                } else if (textParts[i]) {
                    jobs.push({ name: `Pasted Text (Part ${jobs.length + 1})`, content: textParts[i] });
                }
            }
        }

        setProgress({ current: 0, total: jobs.length });

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const currentJobNum = i + 1;
            setProgress({ current: currentJobNum, total: jobs.length });
            setStatusLog(prev => [...prev, `[${currentJobNum}/${jobs.length}] Processing chunk: ${job.name}...`]);

            try {
                await processAndImport(() => extractKpisFromText(job.content), `chunk '${job.name}'`);
                setStatusLog(prev => [...prev, `  -> SUCCESS: Chunk '${job.name}' imported.`]);
            } catch(err) {
                let errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
                if (errorMsg.toLowerCase().includes('timeout') || errorMsg.includes('504')) {
                    errorMsg = "The analysis for this chunk timed out. It might still be too large.";
                }
                setErrors(prev => [...prev, `FAILED: ${job.name} - ${errorMsg}`]);
                setStatusLog(prev => [...prev, `  -> ERROR: ${errorMsg}`]);
            }
        }
    }

    setStatusLog(prev => [...prev, `\nImport Complete.`]);
    setIsProcessing(false);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.add('border-cyan-500', 'bg-slate-700'); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dropzoneRef.current?.classList.remove('border-cyan-500', 'bg-slate-700'); handleFileDrop(e.dataTransfer.files); };
  
  const acceptedFileTypes = ".csv, .xlsx, .xlsm, .xls, .png, .jpg, .jpeg";
  const isFinished = !isProcessing && progress.total > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Universal Data Hub">
      <div className="space-y-4">
        {!isProcessing && !isFinished && (
             <p className="text-slate-300 text-sm">
                Upload spreadsheets (Actuals or Budgets), images, or paste text. The AI will act as a financial analyst to classify, read, and import the data automatically.
            </p>
        )}
       
        {!isProcessing && !isFinished && (
            <div 
            ref={dropzoneRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-slate-800/50"
            >
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
        )}
        
        {(isProcessing || isFinished) && (
            <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <p className="text-cyan-400 font-semibold">{isProcessing ? 'Importing...' : 'Finished'}</p>
                    <p className="text-slate-400">{progress.current} / {progress.total}</p>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                <div ref={logContainerRef} className="bg-slate-900 border border-slate-700 rounded-md p-3 h-48 overflow-y-auto custom-scrollbar text-xs font-mono">
                    {statusLog.map((log, i) => (
                        <p key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>
                            {log}
                        </p>
                    ))}
                </div>
            </div>
        )}

        {errors.length > 0 && (
            <div className="space-y-1">
                 <h3 className="text-sm font-bold text-red-400">Errors Encountered:</h3>
                {errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400 bg-red-900/30 p-1.5 rounded-md">{err}</p>
                ))}
            </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
          {isFinished ? (
            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md shadow-lg shadow-cyan-900/20">Close</button>
          ) : (
            <>
                <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                <button onClick={handleImport} disabled={isProcessing || (stagedFiles.length === 0 && !stagedText.trim())} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20">
                    {isProcessing ? 'Processing...' : `Import`}
                </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
