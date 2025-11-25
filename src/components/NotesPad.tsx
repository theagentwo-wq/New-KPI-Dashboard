
import { useState } from 'react';
import { NoteCategory, Note } from '../types';
import { NOTE_CATEGORIES, NOTE_CATEGORY_COLORS } from '../constants';
import { Plus, Tag } from 'lucide-react';

interface NotesPadProps {
  notes: Note[];
  onAddNote: (note: { content: string; category: NoteCategory }) => void;
}

export const NotesPad: React.FC<NotesPadProps> = ({ notes, onAddNote }) => {
  const [newNote, setNewNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>(NoteCategory.General);

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote({ content: newNote, category: selectedCategory });
      setNewNote('');
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
      <h3 className="font-bold text-white mb-4">Director's Notepad</h3>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        {notes.map(note => (
          <div key={note.id} className="bg-slate-900/70 p-3 rounded-md text-sm">
            <div className="flex items-start justify-between">
                <p className="text-slate-300 pr-4">{note.content}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${NOTE_CATEGORY_COLORS[note.category]}`}>
                  {note.category}
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
         {notes.length === 0 && <p className='text-sm text-slate-500 text-center p-4'>No notes yet.</p>}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700">
        <textarea 
          value={newNote} 
          onChange={e => setNewNote(e.target.value)} 
          placeholder="Add a new note..." 
          className="w-full bg-slate-900 border-slate-700 rounded-md p-2 text-sm"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
                <Tag size={16} className="text-slate-400" />
                {NOTE_CATEGORIES.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2 py-1 rounded-md text-xs ${selectedCategory === cat ? `${NOTE_CATEGORY_COLORS[cat]} text-white` : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {cat}
                    </button>
                ))}
            </div>
            <button onClick={handleAddNote} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded flex items-center">
                <Plus size={16} className="mr-1"/> Add Note
            </button>
        </div>
      </div>
    </div>
  );
};
