import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Note, NoteCategory, View, Period } from '../types';
import { NOTE_CATEGORIES, DIRECTORS, NOTE_CATEGORY_COLORS } from '../constants';
import { getMonthlyPeriodForDate } from '../utils/dateUtils';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { getNoteTrends } from '../services/geminiService';
import { marked } from 'marked';

interface NotesPanelProps {
  allNotes: Note[];
  addNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageUrl?: string) => void;
  updateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
  deleteNote: (noteId: string) => void;
  currentView: View;
  mainDashboardPeriod: Period;
  heightClass?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ allNotes, addNote, updateNote, deleteNote, currentView, mainDashboardPeriod, heightClass = 'max-h-[500px]' }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('General');
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultScope = JSON.stringify({ view: currentView });
  const [selectedScope, setSelectedScope] = useState<string>(defaultScope);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteCategory>('General');
  
  const [isTrendsModalOpen, setTrendsModalOpen] = useState(false);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [trendsResultHtml, setTrendsResultHtml] = useState('');
  
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const currentMonthlyPeriod = useMemo(() => getMonthlyPeriodForDate(mainDashboardPeriod.startDate), [mainDashboardPeriod]);
  
  useEffect(() => {
    setSelectedScope(JSON.stringify({ view: currentView }));
  }, [currentView]);
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setStagedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = () => {
    if (content.trim() && currentMonthlyPeriod) {
      const scope = JSON.parse(selectedScope);
      addNote(currentMonthlyPeriod.label, category, content, scope, stagedImage || undefined);
      setContent('');
      setCategory('General');
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
    if (currentView === 'Total Company') {
      options.push({ label: "Total Company Notes", value: JSON.stringify({ view: 'Total Company' }) });
      DIRECTORS.forEach(d => {
        options.push({ label: `Notes for ${d.name}'s Region`, value: JSON.stringify({ view: d.id }) });
      });
    } else {
      const director = DIRECTORS.find(d => d.id === currentView);
      if (director) {
        options.push({ label: `Notes for ${director.name}'s Region`, value: JSON.stringify({ view: director.id }) });
        director.stores.forEach(store => {
          options.push({ label: store, value: JSON.stringify({ view: director.id, storeId: store }) });
        });
      }
    }
    return options;
  }, [currentView]);

  const filteredNotes = useMemo(() => {
    if (!currentMonthlyPeriod) return [];
    const scope = JSON.parse(selectedScope);
    return allNotes.filter(note => 
      note.monthlyPeriodLabel === currentMonthlyPeriod.label &&
      note.view === scope.view &&
      note.storeId === scope.storeId
    );
  }, [allNotes, currentMonthlyPeriod, selectedScope]);
  
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

  return (
    <>
      <div className={`bg-slate-800 rounded-lg border border-slate-700 flex flex-col ${heightClass}`}>
        <div className="p-4 border-b border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-400">Notes for {currentMonthlyPeriod?.label}</h3>
                <button 
                  onClick={handleAnalyzeTrends}
                  disabled={filteredNotes.length < 2}
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
                {noteScopeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <p className="text-slate-400 text-center mt-4">No notes for this selection.</p>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className={`group bg-slate-700 p-3 rounded-md border-l-4 ${NOTE_CATEGORY_COLORS[note.category]}`}>
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
                        <div>
                          <p className={`text-xs font-bold ${NOTE_CATEGORY_COLORS[note.category].replace('border-', 'text-')}`}>{note.category}</p>
                          <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEdit(note)} className="text-slate-400 hover:text-white"><Icon name="edit" className="w-4 h-4" /></button>
                            <button onClick={() => deleteNote(note.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap my-2">{note.content}</p>
                      {note.imageUrl && (
                        <button onClick={() => openImagePreview(note.imageUrl!)} className="mt-2">
                          <img src={note.imageUrl} alt="Note attachment" className="max-h-24 rounded-md border-2 border-slate-600 hover:border-cyan-500 transition-colors" />
                        </button>
                      )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Add new note...`}
            rows={2}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
          />
          {stagedImage && (
            <div className="relative w-fit">
              <img src={stagedImage} alt="Preview" className="max-h-24 rounded border-2 border-slate-500" />
              <button onClick={() => { setStagedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                <select value={category} onChange={(e) => setCategory(e.target.value as NoteCategory)} className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500">
                  {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md transition-colors">
                   <Icon name="photo" className="w-4 h-4" /> Attach Photo
                </button>
            </div>
            <button onClick={handleAddNote} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
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