import React, { useState } from 'react';
import { Flame, Check, Trash2, Zap } from 'lucide-react';
import { Habit } from '../types';
import { format, subDays, isSameDay, isSameMonth, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { getHabitMotivation } from '../services/geminiService';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const [motivation, setMotivation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Calculate Streak or Count
  const calculateStats = () => {
    if (habit.type === 'daily') {
      let streak = 0;
      // Simple backward check for streak
      for (let i = 0; i < 365; i++) {
        const d = subDays(today, i);
        const dStr = format(d, 'yyyy-MM-dd');
        if (habit.history.includes(dStr)) {
          streak++;
        } else if (i === 0) {
          // If today isn't done yet, don't break streak immediately, check yesterday
          continue; 
        } else {
          break;
        }
      }
      return { label: 'Current Streak', value: `${streak} Days` };
    } else {
      // Monthly Goal
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      
      const count = habit.history.filter(dateStr => {
        const date = parseISO(dateStr);
        return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
      }).length;
      
      return { label: 'This Month', value: `${count} / ${habit.targetCount}` };
    }
  };

  const stats = calculateStats();
  const isCompletedToday = habit.history.includes(todayStr);

  const handleAiMotivation = async () => {
    setLoadingAi(true);
    const streakVal = parseInt(stats.value);
    const text = await getHabitMotivation(habit.title, isNaN(streakVal) ? 0 : streakVal);
    setMotivation(text);
    setLoadingAi(false);
  };

  // Render last 7 days for daily view
  const renderDailyFlames = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const isDone = habit.history.includes(dStr);
      const isToday = i === 0;

      days.push(
        <div key={dStr} className="group relative flex flex-col items-center">
          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
            <div className="bg-zinc-800 text-white text-xs rounded px-2 py-1 shadow-lg">
               <span className="block font-semibold text-center uppercase text-[10px] tracking-wider opacity-70">
                {format(d, 'MMMM')}
              </span>
              {format(d, 'MMM do, yyyy')}
            </div>
          </div>
          
          <button
            onClick={() => onToggle(habit.id, dStr)}
            disabled={!isToday} // Only allow clicking today directly from the row, or enable backfilling if desired. Let's allow backfilling.
            className={`p-2 rounded-full transition-all duration-300 ${
              isDone 
                ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/20 shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                : 'text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Flame 
              size={isToday ? 28 : 20} 
              className={`${isDone ? 'fill-orange-500 animate-flicker' : 'fill-transparent'}`} 
            />
          </button>
          <span className="text-[10px] mt-1 text-zinc-400 font-mono">
            {isToday ? 'Today' : format(d, 'dd')}
          </span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700/50 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{habit.title}</h3>
            {habit.type === 'monthly_goal' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Goal: {habit.targetCount}/mo
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide font-medium">
            {stats.label}: <span className="text-zinc-600 dark:text-zinc-300 font-bold">{stats.value}</span>
          </p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleAiMotivation}
            className="p-2 rounded-lg text-zinc-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            title="Get AI Motivation"
          >
            <Zap size={18} className={loadingAi ? "animate-pulse" : ""} />
          </button>
          <button 
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {motivation && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-zinc-700 dark:to-zinc-700 rounded-lg text-sm text-purple-800 dark:text-purple-200 italic border-l-2 border-purple-400">
          "{motivation}"
        </div>
      )}

      {/* Visualization Area */}
      <div className="mt-4">
        {habit.type === 'daily' ? (
          <div className="flex justify-between items-end gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {renderDailyFlames()}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl">
             <div className="flex flex-col">
                <span className="text-sm text-zinc-500">Log Session</span>
                <span className="text-xs text-zinc-400">Click the flame to record</span>
             </div>
             
             <div className="group relative">
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-40 -left-12">
                  <div className="bg-zinc-800 text-white text-xs rounded px-2 py-1 text-center shadow-lg">
                    {format(today, 'MMMM yyyy')}
                  </div>
                </div>
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className={`relative p-4 rounded-full transition-all duration-500 ${
                     isCompletedToday // For monthly goals, clicking today again just adds another entry or toggles off? Usually goals are counts. Let's make it toggle today for simplicity in this MVP, or allow multiple? Let's stick to toggle date existence to prevent spamming.
                     ? 'bg-gradient-to-tr from-orange-400 to-red-500 shadow-lg scale-110'
                     : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                >
                   <Flame 
                    size={32} 
                    className={`${habit.history.includes(todayStr) ? 'text-white fill-white animate-flicker' : 'text-zinc-400 fill-zinc-400'}`} 
                   />
                   {habit.history.includes(todayStr) && (
                     <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-800 rounded-full p-1 shadow-sm">
                       <Check size={10} className="text-green-500" />
                     </div>
                   )}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;