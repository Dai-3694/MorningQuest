
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

export type TaskType = 'start' | 'flexible' | 'end';

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  icon: TaskIcon;
  color: string;
  type: TaskType;
}

export type AppMode = 'setup' | 'active' | 'completed' | 'log' | 'stamp' | 'reward';

export interface Medal {
  id: string;
  title: string;
  date: string;
  comment: string;
  rankAtTime: number;
}

export interface MissionLog {
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
  totalDurationSeconds: number; // Scheduled duration
  actualDurationSeconds?: number; // Actual measured duration
  isSuccess: boolean; // Completed before departure time
}

export interface StampCard {
  currentStamps: number;
  totalRewards: number;
  rank: number; // 0: ひよこ, 1: うさぎ, 2: ライオン, 3: おうさま
  medals: Medal[];
}

export interface ChildState {
  name: string; // プレイヤーの名前を追加
  tasks: Task[];
  departureTime: string; // Format "HH:mm"
  logs?: MissionLog[];
  stampCard?: StampCard;
}

export const DEFAULT_TASKS: Task[] = [
  { id: '1', title: '起きる', durationMinutes: 5, icon: TaskIcon.SUN, color: '#fbbf24', type: 'start' }, // amber-400 - 固定（最初）
  { id: '2', title: '顔を洗う', durationMinutes: 5, icon: TaskIcon.DEFAULT, color: '#38bdf8', type: 'flexible' }, // sky-400 - 自由順
  { id: '3', title: '朝ごはん', durationMinutes: 20, icon: TaskIcon.UTENSILS, color: '#f87171', type: 'flexible' }, // red-400 - 自由順
  { id: '4', title: '歯磨き', durationMinutes: 5, icon: TaskIcon.TOOTHBRUSH, color: '#60a5fa', type: 'flexible' }, // blue-400 - 自由順
  { id: '5', title: '着替え', durationMinutes: 10, icon: TaskIcon.SHIRT, color: '#a78bfa', type: 'flexible' }, // violet-400 - 自由順
  { id: '6', title: '持ち物チェック', durationMinutes: 5, icon: TaskIcon.BACKPACK, color: '#34d399', type: 'flexible' }, // emerald-400 - 自由順
  { id: '7', title: '出発！', durationMinutes: 0, icon: TaskIcon.DOOR_OPEN, color: '#fb7185', type: 'end' }, // rose-400 - 固定（最後）
];
