
export enum TaskIcon {
  SUN = 'sun',
  TOOTHBRUSH = 'toothbrush',
  SHIRT = 'shirt',
  UTENSILS = 'utensils',
  BACKPACK = 'backpack',
  DOOR_OPEN = 'door-open',
  BOOK = 'book',
  GAMEPAD = 'gamepad',
  DEFAULT = 'circle'
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  icon: TaskIcon;
  color: string;
}

export type AppMode = 'setup' | 'active' | 'completed';

export interface ChildState {
  name: string; // プレイヤーの名前を追加
  tasks: Task[];
  departureTime: string; // Format "HH:mm"
}

export const DEFAULT_TASKS: Task[] = [
  { id: '1', title: '起きる・顔を洗う', durationMinutes: 10, icon: TaskIcon.SUN, color: '#fbbf24' }, // amber-400
  { id: '2', title: '朝ごはん', durationMinutes: 20, icon: TaskIcon.UTENSILS, color: '#f87171' }, // red-400
  { id: '3', title: '歯磨き', durationMinutes: 5, icon: TaskIcon.TOOTHBRUSH, color: '#60a5fa' }, // blue-400
  { id: '4', title: '着替え', durationMinutes: 10, icon: TaskIcon.SHIRT, color: '#a78bfa' }, // violet-400
  { id: '5', title: '持ち物チェック', durationMinutes: 5, icon: TaskIcon.BACKPACK, color: '#34d399' }, // emerald-400
  { id: '6', title: '出発！', durationMinutes: 0, icon: TaskIcon.DOOR_OPEN, color: '#fb7185' }, // rose-400
];
