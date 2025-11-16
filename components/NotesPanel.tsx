import React, { useState, useMemo, useEffect } from 'react';
import { Note, NoteCategory, View, Period } from '../types';
import { NOTE_CATEGORIES, DIRECTORS, NOTE_CATEGORY_COLORS } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';
import { Icon } from './Icon';

interface NotesPanelProps {
  allNotes: Note[];
  addNote: (periodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }) => void;
  updateNote: (noteId: string, newContent: string, newCategory: NoteCategory) => void;
  deleteNote: (noteId: string) => void;
  currentView: View;
  mainDashboardPeriod: Period;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ allNotes, addNote, updateNote, deleteNote, currentView, mainDashboardPeriod }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('General');
  
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState(mainDashboardPeriod.label);
  
  const defaultScope = JSON.stringify({ view: currentView });
  const [selectedScope, setSelectedScope] = useState<string>(defaultScope);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteCategory>('General');

  useEffect(() => {
    setSelectedPeriodLabel(mainDashboardPeriod.label);
    setSelectedScope(JSON.stringify({ view: currentView }));
  }, [mainDashboardPeriod, currentView]);
  
  const handleAddNote = () => {
    if (content.trim()) {
      const scope = JSON.parse(selectedScope);
      addNote(selectedPeriodLabel, category, content, scope);
      setContent('');
      setCategory('General');
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
      options.push({ label: "Total Company Note", value: JSON.stringify({ view: 'Total Company' }) });
      DIRECTORS.forEach(d => {
        options.push({ label: `Note for ${d.name}'s Region`, value: JSON.stringify({ view: d.id }) });
      });
    } else {
      const director = DIRECTORS.find(d => d.id === currentView);
      if (director) {
        options.push({ label: `Note for ${director.name}'s Region`, value: JSON.stringify({ view: director.id }) });
        director.stores.forEach(store => {
          options.push({ label: store, value: JSON.stringify({ view: director.id, storeId: store }) });
        });
      }
    }
    return options;
  }, [currentView]);

  const weeklyPeriods = useMemo(() => ALL_PERIODS.filter(p => p.type === 'Week'), []);
  
  const filteredNotes = useMemo(() => {
    const scope = JSON.parse(selectedScope);
    return allNotes.filter(note => 
      note.periodLabel === selectedPeriodLabel &&
      note.view === scope.view &&
      note.storeId === scope.storeId
    );
  }, [allNotes, selectedPeriodLabel, selectedScope]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 space-y-2">
        <h3 className="text-lg font-bold text-cyan-400">Notes</h3>
        <div className="grid grid-cols-2 gap-2">
            <select
                value={selectedPeriodLabel}
                onChange={(e) => setSelectedPeriodLabel(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
            >
                {weeklyPeriods.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
            <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                >
                {noteScopeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
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
                        <p className="text-xs text-slate-400">{note.storeId || `${note.view}'s Region`}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStartEdit(note)} className="text-slate-400 hover:text-white"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => deleteNote(note.id)} className="text-slate-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap mt-1">{note.content}</p>
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
        <div className="flex flex-wrap justify-between items-center gap-2">
           <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
          <button onClick={handleAddNote} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};