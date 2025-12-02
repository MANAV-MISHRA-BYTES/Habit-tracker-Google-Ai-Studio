import React, { useState, useEffect } from 'react';
import { Sun, Moon, Plus, LayoutGrid, FileText, X } from 'lucide-react';
import HabitCard from './components/HabitCard';
import NoteEditor from './components/NoteEditor';
import { Habit, Note, ViewMode } from './types';
import { format } from 'date-fns';

function App() {
  // --- State ---
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spark_theme') === 'dark' || 
             (!localStorage.getItem('spark_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('spark_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('spark_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<ViewMode>('tracker');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  
  // New Habit Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitType, setNewHabitType] = useState<'daily' | 'monthly_goal'>('daily');
  const [newHabitTarget, setNewHabitTarget] = useState(10);

  // --- Effects ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('spark_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('spark_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('spark_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('spark_notes', JSON.stringify(notes));
  }, [notes]);

  // --- Handlers ---
  const toggleHabit = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const exists = h.history.includes(dateStr);
      const newHistory = exists 
        ? h.history.filter(d => d !== dateStr)
        : [...h.history, dateStr];
      return { ...h, history: newHistory };
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const createHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title: newHabitTitle,
      type: newHabitType,
      targetCount: newHabitType === 'monthly_goal' ? newHabitTarget : undefined,
      history: [],
      color: 'orange',
      createdAt: new Date().toISOString()
    };
    
    setHabits([...habits, newHabit]);
    setShowHabitModal(false);
    setNewHabitTitle('');
    setNewHabitType('daily');
  };

  const saveNote = (updatedNote: Note) => {
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === updatedNote.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedNote;
        return copy;
      }
      return [updatedNote, ...prev];
    });
    setActiveNoteId(null);
  };

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans selection:bg-pink-200 dark:selection:bg-pink-900">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/20">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">Spark</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
            <button 
              onClick={() => setView('tracker')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'tracker' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}
            >
              Tracker
            </button>
            <button 
              onClick={() => { setView('notes'); setActiveNoteId(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'notes' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}
            >
              Notes
            </button>
          </div>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12 min-h-screen">
        
        {view === 'tracker' && (
          <div className="animate-in fade-in duration-500">
             <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">My Habits</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">Keep the flame alive.</p>
               </div>
               <button 
                 onClick={() => setShowHabitModal(true)}
                 className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-zinc-500/10"
               >
                 <Plus size={18} /> New Habit
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map(habit => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    onToggle={toggleHabit} 
                    onDelete={deleteHabit}
                  />
                ))}
                
                {habits.length === 0 && (
                   <div className="col-span-1 md:col-span-2 py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                     <p className="text-zinc-400 mb-4">No habits started yet.</p>
                     <button onClick={() => setShowHabitModal(true)} className="text-pink-500 font-medium hover:underline">Start your first spark</button>
                   </div>
                )}
             </div>
          </div>
        )}

        {view === 'notes' && (
          <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)]">
             {activeNoteId === 'new' || activeNoteId ? (
                <NoteEditor 
                  note={notes.find(n => n.id === activeNoteId)} 
                  onSave={saveNote}
                  onCancel={() => setActiveNoteId(null)}
                />
             ) : (
                <>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">My Notes</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Capture your thoughts.</p>
                    </div>
                    <button 
                      onClick={() => setActiveNoteId('new')}
                      className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-transform shadow-lg"
                    >
                      <Plus size={18} /> New Note
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map(note => (
                      <div 
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className="group relative p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-900 transition-all cursor-pointer shadow-sm hover:shadow-md h-64 flex flex-col"
                      >
                         <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3 line-clamp-1">{note.title}</h3>
                         <p className="text-zinc-500 text-sm line-clamp-6 flex-1 whitespace-pre-line" style={{ fontFamily: note.style.fontFamily === 'serif' ? 'serif' : note.style.fontFamily === 'mono' ? 'monospace' : 'sans-serif' }}>
                           {note.content}
                         </p>
                         <div className="mt-4 flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs text-zinc-400">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
                            <button 
                              onClick={(e) => deleteNote(e, note.id)}
                              className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={16} />
                            </button>
                         </div>
                      </div>
                    ))}
                     {notes.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                          <p className="text-zinc-400">Your mind is clear.</p>
                        </div>
                     )}
                  </div>
                </>
             )}
          </div>
        )}

      </main>

      {/* Habit Modal */}
      {showHabitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Spark</h2>
              <button onClick={() => setShowHabitModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={createHabit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Habit Name</label>
                  <input 
                    type="text" 
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g. Read 30 mins"
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    autoFocus
                  />
                </div>

                <div>
                   <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Frequency</label>
                   <div className="grid grid-cols-2 gap-2">
                     <button 
                       type="button"
                       onClick={() => setNewHabitType('daily')}
                       className={`p-3 rounded-xl border text-sm font-medium transition-all ${newHabitType === 'daily' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                     >
                       Daily Streak
                     </button>
                     <button 
                       type="button"
                       onClick={() => setNewHabitType('monthly_goal')}
                       className={`p-3 rounded-xl border text-sm font-medium transition-all ${newHabitType === 'monthly_goal' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                     >
                       Monthly Goal
                     </button>
                   </div>
                </div>

                {newHabitType === 'monthly_goal' && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Target Per Month</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="31" 
                        value={newHabitTarget} 
                        onChange={(e) => setNewHabitTarget(parseInt(e.target.value))}
                        className="flex-1 accent-pink-500"
                      />
                      <span className="text-xl font-bold font-mono w-10 text-center">{newHabitTarget}</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!newHabitTitle}
                className="w-full mt-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Ignite
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;