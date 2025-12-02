import React, { useState, useEffect } from 'react';
import { Note, NoteStyle } from '../types';
import { ArrowLeft, Save, Sparkles, Type, Palette, AlignLeft } from 'lucide-react';
import { refineNoteContent } from '../services/geminiService';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

const DEFAULT_STYLE: NoteStyle = {
  fontFamily: 'sans',
  fontSize: 'base',
  color: '#000000', // Handled by class logic mainly, but kept for custom hex
};

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [style, setStyle] = useState<NoteStyle>(note?.style || DEFAULT_STYLE);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate ID if new
  const id = note?.id || crypto.randomUUID();

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id,
      title,
      content,
      style,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAiRefine = async () => {
    if (!aiPrompt) return;
    setIsProcessing(true);
    const refined = await refineNoteContent(content, aiPrompt);
    setContent(refined);
    setIsProcessing(false);
    setShowAiInput(false);
    setAiPrompt('');
  };

  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <button onClick={onCancel} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex gap-2 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
          {/* Font Family */}
          <div className="relative group">
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400">
              <Type size={18} />
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-2 hidden group-hover:flex flex-col gap-1 w-32 z-20">
              <button onClick={() => setStyle({...style, fontFamily: 'sans'})} className="px-3 py-1.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded font-sans">Sans Serif</button>
              <button onClick={() => setStyle({...style, fontFamily: 'serif'})} className="px-3 py-1.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded font-serif">Serif</button>
              <button onClick={() => setStyle({...style, fontFamily: 'mono'})} className="px-3 py-1.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded font-mono">Monospace</button>
            </div>
          </div>

          {/* Size */}
          <div className="relative group">
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400">
              <AlignLeft size={18} />
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-2 hidden group-hover:flex flex-col gap-1 w-24 z-20">
              <button onClick={() => setStyle({...style, fontSize: 'sm'})} className="px-3 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">Small</button>
              <button onClick={() => setStyle({...style, fontSize: 'base'})} className="px-3 py-1.5 text-base text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">Normal</button>
              <button onClick={() => setStyle({...style, fontSize: 'lg'})} className="px-3 py-1.5 text-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">Large</button>
            </div>
          </div>

          {/* Color - Simple Preset Palette */}
          <div className="relative group">
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400">
              <Palette size={18} style={{ color: style.color !== '#000000' ? style.color : undefined }} />
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-2 hidden group-hover:grid grid-cols-3 gap-1 w-32 z-20">
              {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'].map(c => (
                 <button 
                  key={c}
                  onClick={() => setStyle({...style, color: c})} 
                  className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-600"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* AI Toggle */}
          <button 
            onClick={() => setShowAiInput(!showAiInput)} 
            className={`p-2 rounded-lg transition-colors ${showAiInput ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}
          >
            <Sparkles size={18} />
          </button>
        </div>

        <button 
          onClick={handleSave} 
          disabled={!title.trim()}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <Save size={16} /> Save
        </button>
      </div>

      {/* AI Prompt Area */}
      {showAiInput && (
        <div className="p-4 bg-purple-50 dark:bg-zinc-800/50 border-b border-purple-100 dark:border-zinc-700 flex gap-2 animate-in slide-in-from-top-2">
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="E.g., 'Summarize this', 'Make it more professional', 'Create a list'"
            className="flex-1 px-3 py-2 rounded-lg border border-purple-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAiRefine()}
          />
          <button 
            onClick={handleAiRefine}
            disabled={isProcessing || !aiPrompt.trim()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {isProcessing ? 'Thinking...' : 'Go'}
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 mb-6"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className={`w-full h-[calc(100%-80px)] resize-none bg-transparent border-none outline-none placeholder-zinc-300 dark:placeholder-zinc-600 dark:text-zinc-200 ${getFontClass(style.fontFamily)} ${getSizeClass(style.fontSize)}`}
          style={{ 
            color: style.color !== '#000000' ? style.color : undefined,
            lineHeight: '1.6'
          }}
        />
      </div>
    </div>
  );
};

export default NoteEditor;