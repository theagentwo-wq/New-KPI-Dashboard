import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteCategory, View, Period } from '../types';
import { NOTE_CATEGORIES, DIRECTORS } from '../constants';
import { ALL_PERIODS } from '../utils/dateUtils';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { RichTextEditor, RichTextEditorHandle } from './RichTextEditor';
import { getNoteTrends } from '../services/geminiService';
import { marked } from 'marked';
import { FirebaseStatus } from '../types';
import { storage } from '../services/firebaseService';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

interface NotesPanelProps {
  allNotes: Note[];
  addNote: (monthlyPeriodLabel: string, category: NoteCategory, content: string, scope: { view: View, storeId?: string }, imageDataUrl?: string) => void;
  updateNote: (noteId: string, newContent: string, newCategory: NoteCategory, pinned?: boolean) => void;
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

export const NotesPanel: React.FC<NotesPanelProps> = ({ allNotes, addNote, updateNote, deleteNote, currentView, heightClass = 'max-h-[600px]', dbStatus }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>(NoteCategory.General);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Get current fiscal week for today's date
  const getCurrentWeek = () => {
    const now = new Date();

    // Find matching fiscal weekly period that contains today
    const weeklyPeriods = ALL_PERIODS.filter((p: Period) => p.type === 'weekly');
    const matchingWeek = weeklyPeriods.find(p => {
      return now >= p.startDate && now <= p.endDate;
    });

    return matchingWeek || null;
  };

  const initialWeek = useMemo(() => getCurrentWeek(), []);
  const [notesPeriod, setNotesPeriod] = useState<Period | null>(initialWeek); // Start with current week
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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

  const [isLastWeekModalOpen, setLastWeekModalOpen] = useState(false);
  const [isSummaryViewOpen, setSummaryViewOpen] = useState(false);

  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [summarySearchTerm, setSummarySearchTerm] = useState('');

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Phase 1: Loading states for operations
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Phase 2: Sort and view options
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'category'>('newest');
  const [isCompactView, setIsCompactView] = useState(false);

  // Phase 3: Templates and bulk operations
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (content.trim()) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        setLastSaved(new Date());
      }, 2000); // Save indicator after 2 seconds of no typing
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content]);

  useEffect(() => {
    if (filterCategory !== 'All') {
      setCategory(filterCategory);
    } else {
      setCategory(NoteCategory.General);
    }
  }, [filterCategory]);

  useEffect(() => {
    setSelectedScope(JSON.stringify({ view: currentView }));
    setFilterCategory('All');
  }, [currentView]);

  // Speech recognition setup
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

        if (finalTranscript && editorRef.current) {
            editorRef.current.insertText(' ' + finalTranscript);
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

  const weeklyPeriods = useMemo(() => ALL_PERIODS.filter((p: Period) => p.type === 'weekly'), []);

  // Month options (2025-2028)
  const monthOptions = useMemo(() => {
    const months = [];
    for (let year = 2025; year <= 2028; year++) {
      for (let month = 1; month <= 12; month++) {
        months.push({
          value: `${year}-${String(month).padStart(2, '0')}`,
          label: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
    }
    return months;
  }, []);

  const handlePrevWeek = () => {
    if (!notesPeriod) return;
    const currentIndex = weeklyPeriods.findIndex(p => p.label === notesPeriod.label);
    if (currentIndex > 0) {
      setNotesPeriod(weeklyPeriods[currentIndex - 1]);
    }
  };

  const handleNextWeek = () => {
    if (!notesPeriod) return;
    const currentIndex = weeklyPeriods.findIndex(p => p.label === notesPeriod.label);
    if (currentIndex < weeklyPeriods.length - 1) {
      setNotesPeriod(weeklyPeriods[currentIndex + 1]);
    }
  };

  const handleJumpToCurrentWeek = () => {
    const currentWeek = getCurrentWeek();
    if (currentWeek) {
      setNotesPeriod(currentWeek);
      const weekStart = new Date(currentWeek.startDate);
      setSelectedMonth(`${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  const handleMonthChange = (monthValue: string) => {
    setSelectedMonth(monthValue);
    // Jump to first week of selected month
    const [year, month] = monthValue.split('-').map(Number);
    const firstWeek = weeklyPeriods.find(p => {
      const start = new Date(p.startDate);
      return start.getFullYear() === year && start.getMonth() === month - 1;
    });
    if (firstWeek) {
      setNotesPeriod(firstWeek);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        try {
          // Upload to Firebase Storage
          const imageRef = ref(storage, `notes_images/${new Date().toISOString()}.jpg`);
          const snapshot = await uploadString(imageRef, dataUrl, 'data_url');
          const storageUrl = await getDownloadURL(snapshot.ref);

          // Insert Storage URL into editor (not base64 data URL)
          if (editorRef.current) {
            editorRef.current.insertImage(storageUrl);
          }
        } catch (error) {
          console.error('[NotesPanel] Error uploading image to Firebase Storage:', error);
          alert('Failed to upload image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const insertCheckbox = () => {
    if (editorRef.current) {
      editorRef.current.insertCheckbox();
    }
  };

  const parseCheckboxes = (text: string) => {
    // Parse markdown-style checkboxes: - [ ] or - [x]
    const lines = text.split('\n');
    return lines.map(line => {
      const uncheckedMatch = line.match(/^- \[ \] (.+)$/);
      const checkedMatch = line.match(/^- \[x\] (.+)$/);
      if (uncheckedMatch) return { text: uncheckedMatch[1], checked: false };
      if (checkedMatch) return { text: checkedMatch[1], checked: true };
      return { text: line, checked: null }; // Regular text
    });
  };

  const handleAddNote = async () => {
    if (!content.trim() || isAdding) return;

    setIsAdding(true);
    try {
      if (notesPeriod) {
        const scope = JSON.parse(selectedScope);
        // Note: images are now embedded in the HTML content, not separate
        addNote(notesPeriod.label, category, content, scope, undefined);
        setContent('');
        setLastSaved(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsAdding(false), 300);
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

  const handleSaveEdit = async () => {
    if (editingNoteId && editContent.trim() && !isSavingEdit) {
      setIsSavingEdit(true);
      try {
        updateNote(editingNoteId, editContent, editCategory);
        handleCancelEdit();
      } finally {
        setTimeout(() => setIsSavingEdit(false), 300);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (isDeletingId) return;
    setIsDeletingId(noteId);
    try {
      deleteNote(noteId);
    } finally {
      setTimeout(() => setIsDeletingId(null), 300);
    }
  };

  // Phase 2: Toggle pin status
  const handleTogglePin = (note: Note) => {
    updateNote(note.id, note.content, note.category, !note.pinned);
  };

  // Phase 3: Note templates
  const noteTemplates = [
    {
      name: 'Daily Standup',
      category: NoteCategory.Operations,
      content: `<p><strong>Today's Focus:</strong></p><ul><li>Priority 1: </li><li>Priority 2: </li><li>Priority 3: </li></ul><p><strong>Blockers:</strong></p><ul><li></li></ul><p><strong>Team Updates:</strong></p><ul><li></li></ul>`
    },
    {
      name: 'Incident Report',
      category: NoteCategory.Operations,
      content: `<p><strong>Incident Date/Time:</strong> </p><p><strong>Location:</strong> </p><p><strong>Description:</strong></p><p></p><p><strong>Actions Taken:</strong></p><ul><li></li></ul><p><strong>Follow-up Required:</strong></p><ul><li></li></ul>`
    },
    {
      name: 'Guest Complaint',
      category: NoteCategory.GuestFeedback,
      content: `<p><strong>Guest Name:</strong> </p><p><strong>Date/Time:</strong> </p><p><strong>Issue:</strong></p><p></p><p><strong>Resolution:</strong></p><p></p><p><strong>Compensation Offered:</strong> </p><p><strong>Follow-up:</strong> </p>`
    },
    {
      name: 'Team Meeting Notes',
      category: NoteCategory.General,
      content: `<p><strong>Meeting Date:</strong> </p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li></li></ul><p><strong>Discussion Points:</strong></p><ul><li></li></ul><p><strong>Action Items:</strong></p><ul><li>☐ </li></ul>`
    },
    {
      name: 'Staff Performance',
      category: NoteCategory.HR,
      content: `<p><strong>Staff Member:</strong> </p><p><strong>Date:</strong> </p><p><strong>Strengths:</strong></p><ul><li></li></ul><p><strong>Areas for Improvement:</strong></p><ul><li></li></ul><p><strong>Action Plan:</strong></p><ul><li>☐ </li></ul>`
    },
    {
      name: 'Equipment/Facility Issue',
      category: NoteCategory.Facilities,
      content: `<p><strong>Item/Area:</strong> </p><p><strong>Issue Description:</strong></p><p></p><p><strong>Urgency:</strong> ☐ High ☐ Medium ☐ Low</p><p><strong>Reported To:</strong> </p><p><strong>Expected Resolution:</strong> </p>`
    },
    {
      name: 'Marketing Campaign',
      category: NoteCategory.Marketing,
      content: `<p><strong>Campaign Name:</strong> </p><p><strong>Start Date:</strong> </p><p><strong>End Date:</strong> </p><p><strong>Target Audience:</strong> </p><p><strong>Goals:</strong></p><ul><li></li></ul><p><strong>Channels:</strong></p><ul><li></li></ul><p><strong>Budget:</strong> </p>`
    }
  ];

  const applyTemplate = (template: typeof noteTemplates[0]) => {
    setContent(template.content);
    setCategory(template.category);
    setShowTemplates(false);
    // Focus editor after applying template
    if (editorRef.current) {
      setTimeout(() => editorRef.current?.focus?.(), 100);
    }
  };

  // Phase 3: Bulk operations
  const toggleNoteSelection = (noteId: string) => {
    const newSelection = new Set(selectedNotes);
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId);
    } else {
      newSelection.add(noteId);
    }
    setSelectedNotes(newSelection);
  };

  const selectAllNotes = () => {
    setSelectedNotes(new Set(filteredNotes.map(n => n.id)));
  };

  const deselectAllNotes = () => {
    setSelectedNotes(new Set());
  };

  const bulkDelete = async () => {
    if (selectedNotes.size === 0) return;
    if (!confirm(`Delete ${selectedNotes.size} note(s)?`)) return;

    for (const noteId of Array.from(selectedNotes)) {
      await handleDeleteNote(noteId);
    }
    setSelectedNotes(new Set());
    setIsBulkMode(false);
  };

  const bulkChangeCategory = async (newCategory: NoteCategory) => {
    if (selectedNotes.size === 0) return;

    for (const noteId of Array.from(selectedNotes)) {
      const note = filteredNotes.find(n => n.id === noteId);
      if (note) {
        await updateNote(noteId, note.content, newCategory, note.pinned);
      }
    }
    setSelectedNotes(new Set());
    setIsBulkMode(false);
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
    const scope = JSON.parse(selectedScope);

    let periodFiltered = allNotes;
    if (notesPeriod) {
      periodFiltered = allNotes.filter((note: Note) => note.monthlyPeriodLabel === notesPeriod.label);
    }

    const scopeFiltered = periodFiltered.filter((note: Note) => {
      let noteView: string;
      let noteStoreId: string | undefined;

      if (note.scope) {
        noteView = note.scope.view;
        noteStoreId = note.scope.storeId;
      } else if ((note as any).view) {
        noteView = (note as any).view;
        noteStoreId = (note as any).storeId;
      } else {
        return false;
      }

      const viewMatches = noteView.toLowerCase() === scope.view.toLowerCase();
      const storeIdMatches = (noteStoreId || undefined) === scope.storeId;
      return viewMatches && storeIdMatches;
    });

    const categoryFiltered = scopeFiltered.filter((note: Note) =>
        filterCategory === 'All' || note.category === filterCategory
    );

    const searchFiltered = categoryFiltered.filter((note: Note) =>
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Phase 2: Apply sorting with pinned notes always on top
    const sorted = [...searchFiltered].sort((a, b) => {
      // Pinned notes always come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then apply selected sort order
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return sorted;
  }, [allNotes, notesPeriod, selectedScope, filterCategory, searchTerm, sortOrder]);

  // Get last week's notes for follow-up
  const lastWeekNotes = useMemo(() => {
    if (!notesPeriod) return [];
    const currentIndex = weeklyPeriods.findIndex(p => p.label === notesPeriod.label);
    if (currentIndex <= 0) return [];

    const lastWeekPeriod = weeklyPeriods[currentIndex - 1];
    const scope = JSON.parse(selectedScope);

    return allNotes.filter((note: Note) => {
      if (note.monthlyPeriodLabel !== lastWeekPeriod.label) return false;

      let noteView: string;
      let noteStoreId: string | undefined;
      if (note.scope) {
        noteView = note.scope.view;
        noteStoreId = note.scope.storeId;
      } else if ((note as any).view) {
        noteView = (note as any).view;
        noteStoreId = (note as any).storeId;
      } else {
        return false;
      }

      const viewMatches = noteView.toLowerCase() === scope.view.toLowerCase();
      const storeIdMatches = (noteStoreId || undefined) === scope.storeId;
      return viewMatches && storeIdMatches;
    });
  }, [notesPeriod, weeklyPeriods, allNotes, selectedScope]);

  // Extract uncompleted action items from last week
  const actionItemsFromLastWeek = useMemo(() => {
    const items: string[] = [];
    lastWeekNotes.forEach(note => {
      const parsed = parseCheckboxes(note.content);
      parsed.forEach(item => {
        if (item.checked === false) {
          items.push(item.text);
        }
      });
    });
    return items;
  }, [lastWeekNotes]);

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

  // Get date range for current week
  const weekDateRange = useMemo(() => {
    if (!notesPeriod) return '';
    const start = new Date(notesPeriod.startDate);
    const end = new Date(notesPeriod.endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [notesPeriod]);

  // Category badges for current notes
  const categoryBadges = useMemo(() => {
    const counts = filteredNotes.reduce((acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    }, {} as Record<NoteCategory, number>);
    return counts;
  }, [filteredNotes]);

  // Summary View - All notes for selected scope, searchable and grouped by week
  const summaryNotes = useMemo(() => {
    const scope = JSON.parse(selectedScope);
    let notes = allNotes.filter((note: Note) => {
      // Scope matching
      let noteView = '';
      let noteStoreId: string | undefined = '';

      if (note.scope) {
        noteView = note.scope.view || '';
        noteStoreId = note.scope.storeId;
      } else if ((note as any).view) {
        noteView = (note as any).view || '';
        noteStoreId = (note as any).storeId;
      } else {
        return false;
      }

      const viewMatches = noteView.toLowerCase() === scope.view.toLowerCase();
      // FIX: Match the logic used in main filteredNotes - allow undefined storeId to match
      const storeMatches = (noteStoreId || undefined) === scope.storeId;

      if (!viewMatches || !storeMatches) return false;

      // Search term matching
      if (summarySearchTerm.trim()) {
        const term = summarySearchTerm.toLowerCase();
        return note.content.toLowerCase().includes(term) ||
               note.category.toLowerCase().includes(term);
      }

      return true;
    });

    // Group by week
    const grouped: Record<string, Note[]> = {};
    notes.forEach((note: Note) => {
      const week = note.monthlyPeriodLabel || 'No Period';
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(note);
    });

    // Sort weeks descending (most recent first)
    const sorted = Object.entries(grouped).sort(([weekA], [weekB]) => {
      const periodA = ALL_PERIODS.find(p => p.label === weekA);
      const periodB = ALL_PERIODS.find(p => p.label === weekB);
      if (!periodA || !periodB) return 0;
      return new Date(periodB.startDate).getTime() - new Date(periodA.startDate).getTime();
    });

    return sorted;
  }, [allNotes, selectedScope, summarySearchTerm]);

  const exportNotesToText = () => {
    const scope = JSON.parse(selectedScope);
    const scopeLabel = scope.view === 'totalCompany' ? 'Total Company' :
                       DIRECTORS.find(d => d.id === scope.view)?.name || scope.view;
    const storeLabel = scope.storeId === 'All' ? 'All Locations' : scope.storeId;

    let text = `NOTES SUMMARY\n`;
    text += `${scopeLabel} - ${storeLabel}\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `\n${'='.repeat(80)}\n\n`;

    summaryNotes.forEach(([week, notes]) => {
      text += `\n${week}\n${'-'.repeat(week.length)}\n\n`;
      notes.forEach((note: Note) => {
        text += `[${note.category}] - ${new Date(note.createdAt).toLocaleString()}\n`;
        text += `${note.content}\n\n`;
      });
    });

    // Create download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${scopeLabel.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              className={`p-3 rounded-md ${note.pinned ? 'bg-yellow-900/20 border-2 border-yellow-600/40' : 'bg-slate-700/50'}`}
            >
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                    <RichTextEditor
                      content={editContent}
                      onChange={setEditContent}
                      placeholder="Edit your note..."
                      disabled={false}
                    />
                    <div className="flex justify-between items-center">
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value as NoteCategory)} className="bg-slate-800 text-white border border-slate-600 rounded-md p-1 text-xs focus:ring-cyan-500 focus:border-cyan-500">
                            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 rounded-md disabled:opacity-50"
                              disabled={isSavingEdit}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1 px-2 rounded-md flex items-center gap-1 disabled:opacity-50"
                              disabled={isSavingEdit}
                            >
                              {isSavingEdit && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                              Save
                            </button>
                        </div>
                    </div>
                </div>
              ) : (
                <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                           {isBulkMode && (
                             <input
                               type="checkbox"
                               checked={selectedNotes.has(note.id)}
                               onChange={() => toggleNoteSelection(note.id)}
                               className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                             />
                           )}
                           <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                <Icon name="dashboard" className="w-4 h-4 text-slate-400"/>
                           </div>
                           <div>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryDisplayColors[note.category].bg} ${categoryDisplayColors[note.category].text}`}>{note.category}</span>
                                <p className="text-xs text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                           </div>
                      </div>
                      <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePin(note)}
                            className={`transition-colors ${note.pinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                            disabled={isDeletingId === note.id}
                            title={note.pinned ? "Unpin note" : "Pin note to top"}
                          >
                            <svg className="w-4 h-4" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleStartEdit(note)}
                            className="text-slate-400 hover:text-white"
                            disabled={isDeletingId === note.id}
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-50"
                            disabled={isDeletingId === note.id}
                          >
                            {isDeletingId === note.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Icon name="trash" className="w-4 h-4" />
                            )}
                          </button>
                      </div>
                    </div>
                    {isCompactView ? (
                      <div className="pl-11 pr-3">
                        <p className="text-sm text-slate-300 truncate">
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          className="prose prose-sm prose-invert max-w-none my-3 pl-11 break-words"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                        {note.imageUrl && (
                          <button onClick={() => openImagePreview(note.imageUrl!)} className="mt-2 ml-11">
                            <img src={note.imageUrl} alt="Note attachment" className="max-h-24 rounded-md border-2 border-slate-600 hover:border-cyan-500 transition-colors" />
                          </button>
                        )}
                      </>
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
        {/* Header with Navigation */}
        <div className="p-4 border-b border-slate-700 space-y-3">
            {/* Week Navigation */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevWeek}
                      disabled={!notesPeriod}
                      className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous Week"
                    >
                      <Icon name="chevronLeft" className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <h3 className="text-lg font-bold text-cyan-400">
                          {notesPeriod?.label || 'Select a Week'}
                        </h3>
                        {filteredNotes.length > 0 && (
                          <span className="bg-cyan-600/30 text-cyan-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {filteredNotes.length}
                          </span>
                        )}
                      </div>
                      {weekDateRange && (
                        <p className="text-xs text-slate-400">{weekDateRange}</p>
                      )}
                    </div>
                    <button
                      onClick={handleNextWeek}
                      disabled={!notesPeriod}
                      className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next Week"
                    >
                      <Icon name="chevronRight" className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleJumpToCurrentWeek}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-md transition-colors"
                    title="Jump to Current Week"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSummaryViewOpen(true)}
                    className="flex items-center gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md transition-colors"
                    title="View all notes timeline and export"
                  >
                    <Icon name="calendar" className="w-4 h-4" />
                    Summary
                  </button>
                  <button
                    onClick={handleAnalyzeTrends}
                    disabled={filteredNotes.length < 2 || dbStatus.status !== 'connected'}
                    className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={filteredNotes.length < 2 ? "Need at least 2 notes to analyze trends" : "Analyze Note Trends with AI"}
                  >
                    <Icon name="sparkles" className="w-4 h-4" />
                    Analyze
                  </button>
                </div>
            </div>

            {/* Scope & Month Picker */}
            <div className="grid grid-cols-2 gap-2">
              <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                  >
                  {noteScopeOptions.map((opt: { label: string, value: string }) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="bg-slate-700 text-white border border-slate-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                  >
                  {monthOptions.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
              </select>
            </div>

            <DiagnosticErrorPanel />
        </div>

        {/* Action Items Help - Show on current week only */}
        {notesPeriod && actionItemsFromLastWeek.length === 0 && (
          <div className="px-4 py-2 bg-cyan-900/10 border-b border-cyan-700/30">
            <p className="text-xs text-cyan-300">
              💡 <span className="font-semibold">Tip:</span> Click the <span className="font-bold">☐ Action Item</span> button to add follow-up tasks. Uncompleted items will automatically appear next week!
            </p>
          </div>
        )}

        {/* Action Items from Last Week */}
        {actionItemsFromLastWeek.length > 0 && (
          <div className="px-4 py-3 bg-amber-900/20 border-b border-amber-700/50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-amber-300 uppercase">Follow-ups from Last Week</p>
              <button
                onClick={() => setLastWeekModalOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                View All
              </button>
            </div>
            <div className="space-y-1">
              {actionItemsFromLastWeek.slice(0, 3).map((item, i) => (
                <p key={i} className="text-xs text-slate-300">☐ {item}</p>
              ))}
              {actionItemsFromLastWeek.length > 3 && (
                <p className="text-xs text-slate-500">+ {actionItemsFromLastWeek.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Category Indicators & Search */}
        <div className="p-4 border-b border-slate-700 space-y-3">
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'category')}
                className="bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
                title="Sort order"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="category">By Category</option>
              </select>
              <button
                onClick={() => setIsCompactView(!isCompactView)}
                className={`p-2 rounded-md border transition-colors ${
                  isCompactView
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'
                }`}
                title={isCompactView ? "Switch to detailed view" : "Switch to compact view"}
              >
                <Icon name={isCompactView ? "list" : "menu"} className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsBulkMode(!isBulkMode)}
                className={`p-2 rounded-md border transition-colors ${
                  isBulkMode
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'
                }`}
                title={isBulkMode ? "Exit bulk mode" : "Bulk select mode"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {allNoteCategories.map((cat) => {
                    const count = cat === 'All' ? filteredNotes.length : categoryBadges[cat] || 0;
                    if (cat === 'All') {
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                filterCategory === cat ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                {cat} ({count})
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
                            {cat} {count > 0 && `(${count})`}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Bulk Operations Toolbar */}
        {isBulkMode && (
          <div className="px-4 py-3 bg-purple-900/20 border-b border-purple-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-purple-300">
                  {selectedNotes.size} selected
                </span>
                <button
                  onClick={selectAllNotes}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllNotes}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Deselect All
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => bulkChangeCategory(e.target.value as NoteCategory)}
                  className="bg-slate-800 text-white border border-slate-600 rounded-md p-1 text-xs"
                  disabled={selectedNotes.size === 0}
                  value=""
                >
                  <option value="">Change Category...</option>
                  {NOTE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={bulkDelete}
                  disabled={selectedNotes.size === 0}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 min-h-[400px] px-4 pt-4 pb-0 overflow-y-auto space-y-3 custom-scrollbar">
          {renderStatusOrContent()}
        </div>

        {/* Add Note Section */}
        <div className="px-4 pb-4 pt-3 border-t border-slate-700 space-y-3 bg-slate-800/50">
          <RichTextEditor
            ref={editorRef}
            content={content}
            onChange={setContent}
            placeholder={getPlaceholderText()}
            disabled={dbStatus.status !== 'connected'}
            className={isListening ? 'ring-2 ring-red-500 border-red-500' : ''}
          />
          <div className="flex justify-between items-center pt-2">
             <div className="flex items-center gap-2">
                 <div className="relative">
                   <button
                     onClick={() => setShowTemplates(!showTemplates)}
                     className="flex items-center gap-2 text-sm text-slate-400 hover:text-white font-semibold py-2 px-2 rounded-md transition-colors"
                     disabled={dbStatus.status !== 'connected'}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     <span className="hidden sm:inline">Templates</span>
                   </button>
                   {showTemplates && (
                     <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-10 max-h-80 overflow-y-auto">
                       <div className="p-2">
                         <div className="text-xs font-semibold text-slate-400 px-2 py-1">Quick Templates</div>
                         {noteTemplates.map((template, idx) => (
                           <button
                             key={idx}
                             onClick={() => applyTemplate(template)}
                             className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                           >
                             <div className="font-medium">{template.name}</div>
                             <div className="text-xs text-slate-500">{template.category}</div>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
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

                <button
                    onClick={insertCheckbox}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white font-semibold py-2 px-2 rounded-md transition-colors"
                    disabled={dbStatus.status !== 'connected'}
                    title="Insert Action Item Checkbox"
                >
                    <span className="text-base">☐</span>
                    <span className="hidden sm:inline">Action Item</span>
                </button>

                {lastSaved && (
                  <span className="text-xs text-slate-500">
                    Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
                  </span>
                )}
            </div>

            <button
              onClick={handleAddNote}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 flex items-center gap-2"
              disabled={dbStatus.status !== 'connected' || !content.trim() || isAdding}
            >
              {isAdding && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <Modal isOpen={isLastWeekModalOpen} onClose={() => setLastWeekModalOpen(false)} title="Last Week's Notes" size="large">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {lastWeekNotes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No notes from last week</p>
          ) : (
            lastWeekNotes.map((note: Note) => (
              <div key={note.id} className="bg-slate-700/50 p-3 rounded-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryDisplayColors[note.category].bg} ${categoryDisplayColors[note.category].text}`}>{note.category}</span>
                  <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
                <div
                  className="prose prose-sm prose-invert max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                {note.imageUrl && (
                  <img src={note.imageUrl} alt="Note attachment" className="mt-2 max-h-24 rounded-md border-2 border-slate-600" />
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Summary View Modal - Timeline of all notes with search and export */}
      <Modal isOpen={isSummaryViewOpen} onClose={() => setSummaryViewOpen(false)} title="Notes Summary & Timeline" size="large">
        <div className="space-y-4">
          {/* Search and Export Header */}
          <div className="flex gap-3">
            <input
              type="search"
              placeholder="Search all notes..."
              value={summarySearchTerm}
              onChange={(e) => setSummarySearchTerm(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-400"
            />
            <button
              onClick={exportNotesToText}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              <Icon name="download" className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Timeline */}
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {summaryNotes.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                {summarySearchTerm ? 'No notes match your search' : 'No notes found for this selection'}
              </p>
            ) : (
              summaryNotes.map(([week, notes], idx) => {
                // Phase 3: Color-coded timeline - cycle through colors
                const colors = [
                  { border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400' },
                  { border: 'border-cyan-500', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
                  { border: 'border-green-500', bg: 'bg-green-500/20', text: 'text-green-400' },
                  { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
                  { border: 'border-pink-500', bg: 'bg-pink-500/20', text: 'text-pink-400' },
                  { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-400' },
                ];
                const color = colors[idx % colors.length];

                return (
                <div key={week} className={`border-l-4 ${color.border} pl-4`}>
                  {/* Week Header */}
                  <div className="mb-3">
                    <h4 className={`text-lg font-bold ${color.text}`}>{week}</h4>
                    <p className="text-xs text-slate-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Notes for this week */}
                  <div className="space-y-2">
                    {notes.map((note: Note) => (
                      <div key={note.id} className="bg-slate-800/50 p-3 rounded-md hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryDisplayColors[note.category].bg} ${categoryDisplayColors[note.category].text}`}>
                            {note.category}
                          </span>
                          <p className="text-xs text-slate-400">
                            {new Date(note.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div
                          className="prose prose-sm prose-invert max-w-none leading-relaxed break-words"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                        {note.imageUrl && (
                          <img
                            src={note.imageUrl}
                            alt="Note attachment"
                            className="mt-2 max-h-20 rounded-md border border-slate-600 cursor-pointer hover:border-cyan-400 transition-colors"
                            onClick={() => {
                              setPreviewImageUrl(note.imageUrl!);
                              setPreviewModalOpen(true);
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Summary Stats */}
          <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
            <span>Total: {summaryNotes.reduce((sum, [, notes]) => sum + notes.length, 0)} notes across {summaryNotes.length} weeks</span>
            <span className="text-slate-500">Tip: Use Export to save as text file</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
