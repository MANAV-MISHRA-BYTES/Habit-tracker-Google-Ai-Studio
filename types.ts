export type HabitType = 'daily' | 'monthly_goal';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  color: string;
  targetCount?: number; // For monthly goals (e.g., 10 times)
  history: string[]; // ISO Date strings (YYYY-MM-DD)
  createdAt: string;
}

export interface NoteStyle {
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  style: NoteStyle;
  updatedAt: string;
}

export type ViewMode = 'tracker' | 'notes';