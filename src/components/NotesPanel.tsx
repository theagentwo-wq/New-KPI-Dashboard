import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteCategory, View, Period, PeriodType } from '../types';
import { NOTE_CATEGORIES, DIRECTORS } from '../constants';
import { getMonthlyPeriodForDate, ALL_PERIODS } from '../utils/dateUtils';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { getNoteTrends } from '../services/geminiService';
import { marked } from 'marked';
import { FirebaseStatus } from '../types';

interface NotesPanelProps {
  allNotes: Note[];
  addNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => void;
  updateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
  deleteNote: (noteId: string) => void;
  currentView: View;
  mainDashboardPeriod: Period;
  heightClass?: string;
  dbStatus: FirebaseStatus;
}

const categoryFilterColors: { [key in NoteCategory]: { base: string, active: string, text: string } } = {
  [NoteCategory.General]: { base: 'bg-slate-700 hover:bg-slate-600', active: 'bg-slate-500', text: 'text-slate-200' },
  [NoteCategory.Operations]: { base: 'bg-teal-900/60 hover:bg-teal-800/70', active: 'bg-teal-500', text: 'text-teal-300' },
  [NoteCategory.Marketing]: { base: 'bg-blue-900/60 hover:bg-blue-800/70', active: 'bg-blue-500', text: 'text-blue-300' },
  [NoteCategory.HR]: { base: 'bg-indigo-900/60 hover:bg-indigo-800/70', active: 'bg-indigo-500', text: 'text-indigo-300' },
  [NoteCategory.GuestFeedback]: { base: 'bg-pink-900/60 hover:bg-pink-800/70', active: 'bg-pink-500', text: 'text-pink-300' },
  [NoteCategory.Staffing]: { base: 'bg-yellow-900/60 hover:bg-yellow-800/70', active: 'bg-yellow-500', text: 'text-yellow-300' },
  [NoteCategory.Facilities]: { base: 'bg-orange-900/60 hover:bg-orange-800/70', active: 'bg-orange-500', text: 'text-orange-300' },
  [NoteCategory.Reviews]: { base: 'bg-purple-900/60 hover:bg-purple-800/70', active: 'bg-purple-500', text: 'text-purple-300' },
};

const categoryDisplayColors: { [key in NoteCategory]: { bg: string, text: string } } = {
  [NoteCategory.General]: { bg: 'bg-slate-600/50', text: 'text-slate-300' },
  [NoteCategory.Operations]: { bg: 'bg-teal-500/20', text: 'text-teal-300' },
  [NoteCategory.Marketing]: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  [NoteCategory.HR]: { bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  [NoteCategory.GuestFeedback]: { bg: 'bg-pink-500/20', text: 'text-pink-300' },
  [NoteCategory.Staffing]: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  [NoteCategory.Facilities]: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  [NoteCategory.Reviews]: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
};

export const NotesPanel: React.FC<NotesPanelProps> = ({ allNotes, addNote, updateNote, deleteNote, currentView, mainDashboardPeriod, heightClass = 'max-h-[600px]', dbStatus }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>(NoteCategory.General);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  const initialMonthlyPeriod = useMemo(() => getMonthlyPeriodForDate(mainDashboardPeriod.startDate) || ALL_PERIODS.find((p: Period) => p.type === 'monthly')!, [mainDashboardPeriod]);
  const [notesPeriod, setNotesPeriod] = useState<Period>(initialMonthlyPeriod);

  const defaultScope = JSON.stringify({ view: currentView });
  const [selectedScope, setSelectedScope] = useState<string>(defaultScope);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteCategory>(NoteCategory.General);
  
  const [isTrendsModalOpen, setTrendsModalOpen] = useState(false);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [trendsResultHtml, setTrendsResultHtml] = useState('');
  
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (filterCategory !== 'All') {
      setCategory(filterCategory);
    } else {
      setCategory(NoteCategory.General);
    }
  }, [filterCategory]);

  useEffect(() => {
    const newMonthlyPeriod = getMonthlyPeriodForDate(mainDashboardPeriod.startDate);
    if (newMonthlyPeriod) {
      setNotesPeriod(newMonthlyPeriod);
    }
  }, [mainDashboardPeriod]);
  
  useEffect(() => {
    setSelectedScope(JSON.stringify({ view: currentView }));
    setFilterCategory('All'); 
  }, [currentView]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        
        if (finalTranscript) {
            setContent(prev => {
                const trimmedPrev = prev.trim();
                const spacer = trimmedPrev.length > 0 ? ' ' : '';
                return trimmedPrev + spacer + finalTranscript;
            });
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isListeningRef.current = false;
            setIsListening(false);
        }
    };
    
    recognition.onend = () => {
        if (isListeningRef.current) {
            try { recognition.start(); } catch (e) {
                console.error("Failed to restart recognition", e);
                isListeningRef.current = false;
                setIsListening(false);
            }
        } else {
            setIsListening(false);
        }
    }

    recognitionRef.current = recognition;

    return () => {
        if (recognition) {
            recognition.onend = null;
            recognition.stop();
        }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    if (isListening) {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current.stop();
    } else {
        isListeningRef.current = true;
        setIsListening(true);
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
            isListeningRef.current = false;
            setIsListening(false);
        }
    }
  };

  const monthlyPeriods = useMemo(() => ALL_PERIODS.filter((p: Period) => p.type === 'monthly'), []);

  const handlePrevPeriod = () => {
    const currentIndex = monthlyPeriods.findIndex(p => p.label === notesPeriod.label);
    if (currentIndex > 0) setNotesPeriod(monthlyPeriods[currentIndex - 1]);
  };
  
  const handleNextPeriod = () => {
    const currentIndex = monthlyPeriods.findIndex(p => p.label === notesPeriod.label);
    if (currentIndex < monthlyPeriods.length - 1) setNotesPeriod(monthlyPeriods[currentIndex + 1]);
  };
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setStagedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = () => {
    if (content.trim() && notesPeriod) {
      const scope = JSON.parse(selectedScope);
      addNote(notesPeriod.label, category, content, scope, stagedImage || undefined);
      setContent('');
      setStagedImage(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      updateNote(editingNoteId, editContent, editCategory);
      handleCancelEdit();
    }
  };

  const noteScopeOptions = useMemo(() => {
    const options: { label: string, value: string }[] = [];
    const directors = DIRECTORS;
    if (currentView === View.TotalCompany) {
        options.push({ label: "Total Company Notes", value: JSON.stringify({ view: View.TotalCompany }) });
        directors.forEach(d => {
            options.push({ label: `Notes for ${d.name}'s Region`, value: JSON.stringify({ view: d.id as View }) });
        });
    } else {
        const director = directors.find(d => d.id === currentView);
        if (director) {
            options.push({ label: `Notes for ${director.name}'s Region`, value: JSON.stringify({ view: director.id as View }) });
            director.stores.forEach(store => {
                options.push({ label: store, value: JSON.stringify({ view: director.id as View, storeId: store }) });
            });
        }
    }
    return options;
}, [currentView]);


  const filteredNotes = useMemo(() => {
    if (!notesPeriod) return [];
    const scope = JSON.parse(selectedScope);
    return allNotes
        .filter((note: Note) => 
            note.monthlyPeriodLabel === notesPeriod.label &&
            note.scope.view === scope.view &&
            (note.scope.storeId || undefined) === scope.storeId
        )
        .filter((note: Note) => 
            filterCategory === 'All' || note.category === filterCategory
        )
        .filter((note: Note) => 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
  }, [allNotes, notesPeriod, selectedScope, filterCategory, searchTerm]);
  
  const handleAnalyzeTrends = async () => {
    if (filteredNotes.length === 0) return;
    setIsTrendsLoading(true);
    setTrendsModalOpen(true);
    setTrendsResultHtml('');
    const result = await getNoteTrends(filteredNotes);
    const html = await marked.parse(result);
    setTrendsResultHtml(html);
    setIsTrendsLoading(false);
  };
  
  const openImagePreview = (url: string) => {
    setPreviewImageUrl(url);
    setPreviewModalOpen(true);
  }

  const DiagnosticErrorPanel = () => {
    if (dbStatus.status !== 'error') return null;
    
    const isConnectionError = dbStatus.error?.includes('config');
    const title = isConnectionError ? "Database Connection Failed" : "Database Error";

    return (
      <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-md space-y-2">
        <div className="text-center">
          <p className="text-sm text-yellow-300 font-semibold">Notes Feature Disabled: {title}</p>
          <p className="text-xs text-yellow-400 mt-1 whitespace-pre-wrap">{dbStatus.error}</p>
        </div>
      </div>
    );
  };

  const renderStatusOrContent = () => {
    if (dbStatus.status === 'initializing') {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-400">Connecting to Notes Database...</p>
        </div>
      );
    }
    
    if (dbStatus.status === 'error') {
       return (
        <div className="flex items-center justify-center h-full p-4 text-center">
          <p className="text-slate-400">Database operation failed. Please check the error details above.</p>
        </div>
      );
    }
    
    return (
      <AnimatePresence>
        {filteredNotes.length === 0 ? (
           <div className="text-center text-slate-500 py-10">
                <Icon name="news" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notes for this selection.</p>
           </div>
        ) : (
          filteredNotes.map((note: Note) => (
            <motion.div 
              key={note.id} 
              {...({ layout: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, transition: { duration: 0.2 } } } as any)}
              className="bg-slate-700/50 p-3 rounded-md"
            >
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white text-sm" />
                    <div className="flex justify-between items-center">
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value as NoteCategory)} className="bg-slate-800 text-white border border-slate-600 rounded-md p-1 text-xs focus:ring-cyan-500 focus:border-cyan-500">
                            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button onClick={handleCancelEdit} className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 rounded-md">Cancel</button>
                            <button onClick={handleSaveEdit} className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1 px-2 rounded-md">Save</button>
                        </div>
                    </div>
                </div>
              ) : (
                <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                <Icon name="dashboard" className="w-4 h-4 text-slate-400"/>
                           </div>
                           <div>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryDisplayColors[note.category].bg} ${categoryDisplayColors[note.category].text}`}>{note.category}</span>
                                <p className="text-xs text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                           </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => handleStartEdit(note)} className="text-slate-400 hover:text-white"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => deleteNote(note.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap my-3 pl-11">{note.content}</p>
                    {note.imageUrl && (
                      <button onClick={() => openImagePreview(note.imageUrl!)} className="mt-2 ml-11">
                        <img src={note.imageUrl} alt="Note attachment" className="max-h-24 rounded-md border-2 border-slate-600 hover:border-cyan-500 transition-colors" />
                      </button>
                    )}
                </>
              )}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    );
  };
  
  const getPlaceholderText = () => {
      if (isListening) return 'Listening... (Speak now)';
      switch (dbStatus.status) {
          case 'initializing': return 'Connecting...';
          case 'error': return 'Database not connected.';
          case 'connected': 
            if (filterCategory === 'All') return `Add new note (will be saved as ${NoteCategory.General})...`
            return `Add new note (will be saved as ${filterCategory})...`;
      }
  }

  const allNoteCategories: ('All' | NoteCategory)[] = ['All', ...NOTE_CATEGORIES];

  return (
    <>
      <div className={`bg-slate-800 rounded-lg border border-slate-700 flex flex-col ${heightClass}`}>
        <div className="p-4 border-b border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevPeriod} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronLeft" className="w-5 h-5" /></button>
                    <h3 className="text-lg font-bold text-cyan-400">Notes for {notesPeriod.label}</h3>
                    <button onClick={handleNextPeriod} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300"><Icon name="chevronRight" className="w-5 h-5" /></button>
                </div>
                <button 
                  onClick={handleAnalyzeTrends}
                  disabled={filteredNotes.length < 2 || dbStatus.status !== 'connected'}
                  className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={filteredNotes.length < 2 ? "Need at least 2 notes to analyze trends" : "Analyze Note Trends with AI"}
                >
                  <Icon name="sparkles" className="w-4 h-4" />
                  Analyze Trends
                </button>
            </div>
            <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                >
                {noteScopeOptions.map((opt: { label: string, value: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <DiagnosticErrorPanel />
        </div>
        
         <div className="p-4 border-b border-slate-700 space-y-3">
            <input
              type="search"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <div className="flex flex-wrap items-center gap-2">
                {allNoteCategories.map((cat) => {
                    if (cat === 'All') {
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                filterCategory === cat ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                {cat}
                            </button>
                        )
                    }
                    const colors = categoryFilterColors[cat];
                    return (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                            filterCategory === cat ? `${colors.active} text-white` : `${colors.base} ${colors.text}`
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {renderStatusOrContent()}
        </div>
        
        <div className="p-4 border-t border-slate-700 space-y-3 bg-slate-800/50">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getPlaceholderText()}
            rows={3}
            className={`w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 ${isListening ? 'ring-2 ring-red-500 border-red-500' : ''}`}
            disabled={dbStatus.status !== 'connected'}
          />
          {stagedImage && (
            <div className="relative w-fit">
              <img src={stagedImage} alt="Preview" className="max-h-24 rounded border-2 border-slate-500" />
              <button onClick={() => { setStagedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
             <div className="flex items-center gap-2">
                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white font-semibold py-2 px-2 rounded-md transition-colors" disabled={dbStatus.status !== 'connected'}>
                  <Icon name="photo" className="w-5 h-5" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                
                <button 
                    onClick={toggleListening}
                    className={`flex items-center gap-2 text-sm font-semibold py-2 px-2 rounded-md transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                    disabled={dbStatus.status !== 'connected'}
                    title={isListening ? "Stop Dictation" : "Start Dictation"}
                >
                    <Icon name="microphone" className="w-5 h-5" />
                    <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Dictate'}</span>
                </button>
            </div>
            
            <button onClick={handleAddNote} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600" disabled={dbStatus.status !== 'connected' || !content.trim()}>
              Add Note
            </button>
          </div>
        </div>
      </div>
      
      <Modal isOpen={isTrendsModalOpen} onClose={() => setTrendsModalOpen(false)} title="AI Note Trend Analysis">
        <div className="min-h-[200px]">
          {isTrendsLoading ? (
             <div className="flex items-center justify-center space-x-2 h-full min-h-[200px]">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                <p className="text-slate-400">Identifying trends...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: trendsResultHtml }}></div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} title="Image Preview" size="large">
        <img src={previewImageUrl} alt="Note attachment preview" className="max-w-full max-h-[80vh] mx-auto rounded-md" />
      </Modal>
    </>
  );
};