import { Feather, Star, Trophy, Crown, Cat, Flame, Sparkles, type LucideIcon } from 'lucide-react';

// ============================================================
// 称号システム: 「グレード（動物）× クラス（二つ名）」の組み合わせ方式
// グレード 7種 × クラス 5種 = 35段階
// 10回達成ごとにクラスが上がり、クラスが一周するとグレードが上がる
// → 350回で全称号コンプリート（≒1年以上遊べる）
// ============================================================

// --- グレード定義（動物の進化） ---
export interface Grade {
  name: string;         // 動物名
  emoji: string;        // 表示用絵文字
  icon: LucideIcon;     // lucide アイコン
  cardColor: string;    // スタンプカード上部の色
  stampColor: string;   // スタンプの色クラス
  bg: string;           // 背景色クラス
  ringColor: string;    // RewardView のリングカラー
}

export const GRADES: Grade[] = [
  { name: 'ひよこ',     emoji: '🐣', icon: Feather,   cardColor: 'bg-yellow-400',  stampColor: 'text-yellow-500',  bg: 'bg-yellow-50',  ringColor: 'ring-yellow-400' },
  { name: 'うさぎ',     emoji: '🐰', icon: Star,      cardColor: 'bg-sky-400',     stampColor: 'text-sky-500',     bg: 'bg-sky-50',     ringColor: 'ring-sky-400' },
  { name: 'ねこ',       emoji: '🐱', icon: Cat,       cardColor: 'bg-pink-400',    stampColor: 'text-pink-500',    bg: 'bg-pink-50',    ringColor: 'ring-pink-400' },
  { name: 'ライオン',   emoji: '🦁', icon: Trophy,    cardColor: 'bg-orange-400',  stampColor: 'text-orange-500',  bg: 'bg-orange-50',  ringColor: 'ring-orange-400' },
  { name: 'ドラゴン',   emoji: '🐉', icon: Flame,     cardColor: 'bg-red-500',     stampColor: 'text-red-500',     bg: 'bg-red-50',     ringColor: 'ring-red-500' },
  { name: 'ユニコーン', emoji: '🦄', icon: Sparkles,  cardColor: 'bg-violet-500',  stampColor: 'text-violet-500',  bg: 'bg-violet-50',  ringColor: 'ring-violet-500' },
  { name: 'おうさま',   emoji: '👑', icon: Crown,     cardColor: 'bg-indigo-600',  stampColor: 'text-indigo-600',  bg: 'bg-indigo-50',  ringColor: 'ring-amber-400' },
];

// --- クラス定義（二つ名の進化） ---
export interface RankClass {
  name: string;       // 二つ名
  stars: number;      // 表示用★の数（1〜5）
}

export const CLASSES: RankClass[] = [
  { name: 'ルーキー',       stars: 1 },
  { name: 'ファイター',     stars: 2 },
  { name: 'エース',         stars: 3 },
  { name: 'チャンピオン',   stars: 4 },
  { name: 'マスター',       stars: 5 },
];

export const TOTAL_RANKS = GRADES.length * CLASSES.length; // 35
export const MAX_RANK = TOTAL_RANKS - 1;                   // 34

// --- ヘルパー関数 ---

/** rank を 0〜MAX_RANK の安全な範囲にクランプする（localStorage 破損対策） */
const safeRank = (rank: number): number => {
  return Math.max(0, Math.min(Math.floor(rank), MAX_RANK));
};

/** rank 番号 (0〜34) → グレード index (0〜6) */
export const getGradeIndex = (rank: number): number => {
  return Math.floor(safeRank(rank) / CLASSES.length);
};

/** rank 番号 (0〜34) → クラス index (0〜4) */
export const getClassIndex = (rank: number): number => {
  return safeRank(rank) % CLASSES.length;
};

/** rank 番号 (0〜34) → グレード定義 */
export const getGrade = (rank: number): Grade => {
  return GRADES[getGradeIndex(rank)];
};

/** rank 番号 (0〜34) → クラス定義 */
export const getRankClass = (rank: number): RankClass => {
  return CLASSES[getClassIndex(rank)];
};

/** rank 番号 (0〜34) → 称号文字列（例:「ひよこ ルーキー級」） */
export const getRankTitle = (rank: number): string => {
  const grade = getGrade(rank);
  const cls = getRankClass(rank);
  return `${grade.emoji} ${grade.name}${cls.name}級`;
};

/** rank 番号 (0〜34) → 称号文字列（絵文字なし、コンパクト表示用） */
export const getRankTitleShort = (rank: number): string => {
  const grade = getGrade(rank);
  const cls = getRankClass(rank);
  return `${grade.name}${cls.name}級`;
};

/** クラスが一周してグレードが上がったか（特別演出用） */
export const isGradeUp = (rank: number): boolean => {
  return rank > 0 && getClassIndex(rank) === 0;
};

/** 最高ランクに到達済みか */
export const isMaxRank = (rank: number): boolean => {
  return rank >= MAX_RANK;
};

// --- 旧データとの互換マッピング ---
// 旧: rank 0=ひよこ, 1=うさぎ, 2=ライオン, 3=おうさま
// 新: rank 0〜4=ひよこ系, 5〜9=うさぎ系, 10〜14=ねこ系, 15〜19=ライオン系, ...
// 旧 rank 値 (0〜3) はそのまま新 rank としても正しく動作する
// （旧0=ひよこルーキー, 旧1=ひよこファイター, 旧2=ひよこエース, 旧3=ひよこチャンピオン）
// これにより既存ユーザーのデータが壊れることはない
