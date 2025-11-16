import React, { useState, useMemo, useEffect } from 'react';
import { Note, NoteCategory, View, Period } from '../types';
import { NOTE_CATEGORIES, DIRECTORS } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';

interface NotesPanelProps {
  allNotes: Note[];
  addNote: (periodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }) => void;
  currentView: View;
  mainDashboardPeriod: Period;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ allNotes, addNote, currentView, mainDashboardPeriod }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('General');
  
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState(mainDashboardPeriod.label);
  
  // The scope can be a director, total company, or a specific store
  const defaultScope = JSON.stringify({ view: currentView });
  const [selectedScope, setSelectedScope] = useState<string>(defaultScope);

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
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-[350px] flex flex-col">
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
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filteredNotes.length === 0 ? (
          <p className="text-slate-400 text-center mt-4">No notes for this selection.</p>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className="bg-slate-700 p-3 rounded-md">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-cyan-400">{note.category}</p>
                <p className="text-xs text-slate-400">{note.storeId || `${note.view}'s Region`}</p>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap mt-1">{note.content}</p>
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