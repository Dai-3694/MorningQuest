
export enum TaskIcon {
  SUN = 'sun',
  TOOTHBRUSH = 'toothbrush',
  SHIRT = 'shirt',
  UTENSILS = 'utensils',
  BACKPACK = 'backpack',
  DOOR_OPEN = 'door-open',
  BOOK = 'book',
  GAMEPAD = 'gamepad',
  BATH = 'bath',
  MOON = 'moon',
  PENCIL = 'pencil',
  BOX = 'box',
  DEFAULT = 'circle'
}

export type TaskType = 'start' | 'flexible' | 'end';

// ミッションの種別（朝 / 夜）
export type MissionMode = 'morning' | 'night';

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
  isBonus?: boolean; // 早起きボーナスチャンスだったか
  missionMode?: MissionMode; // 朝 or 夜
}

export interface StampCard {
  currentStamps: number;
  totalRewards: number;
  rank: number; // 0〜34: グレード(動物)×クラス(二つ名)の組み合わせ（詳細は rankData.ts 参照）
  medals: Medal[];
}

export interface ChildState {
  name: string; // プレイヤーの名前を追加
  tasks: Task[];
  nightTasks: Task[]; // 夜用タスク
  departureTime: string; // Format "HH:mm"
  bedTime: string; // 就寝時刻 Format "HH:mm"
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

export const DEFAULT_NIGHT_TASKS: Task[] = [
  { id: 'n1', title: 'ただいま！', durationMinutes: 5, icon: TaskIcon.DOOR_OPEN, color: '#fb923c', type: 'start' }, // orange-400 - 固定（最初）
  { id: 'n2', title: 'プリントを出す', durationMinutes: 5, icon: TaskIcon.PENCIL, color: '#facc15', type: 'flexible' }, // yellow-400
  { id: 'n3', title: 'お箸・コップを出す', durationMinutes: 5, icon: TaskIcon.UTENSILS, color: '#f87171', type: 'flexible' }, // red-400
  { id: 'n4', title: '宿題をする', durationMinutes: 20, icon: TaskIcon.BOOK, color: '#60a5fa', type: 'flexible' }, // blue-400
  { id: 'n5', title: 'お風呂に入る', durationMinutes: 20, icon: TaskIcon.BATH, color: '#34d399', type: 'flexible' }, // emerald-400
  { id: 'n6', title: '晩ごはん', durationMinutes: 20, icon: TaskIcon.UTENSILS, color: '#f97316', type: 'flexible' }, // orange-500
  { id: 'n7', title: 'おへやの片付け', durationMinutes: 10, icon: TaskIcon.BOX, color: '#a78bfa', type: 'flexible' }, // violet-400
  { id: 'n8', title: '明日の準備', durationMinutes: 10, icon: TaskIcon.BACKPACK, color: '#38bdf8', type: 'flexible' }, // sky-400
  { id: 'n9', title: '歯磨き', durationMinutes: 5, icon: TaskIcon.TOOTHBRUSH, color: '#818cf8', type: 'flexible' }, // indigo-400
  { id: 'n10', title: 'トイレ', durationMinutes: 5, icon: TaskIcon.DEFAULT, color: '#94a3b8', type: 'flexible' }, // slate-400
  { id: 'n11', title: 'おやすみ！', durationMinutes: 0, icon: TaskIcon.MOON, color: '#6366f1', type: 'end' }, // indigo-500 - 固定（最後）
];
