import React from 'react';
import { MissionMode } from '../types';
import { Sun, Moon } from 'lucide-react';

interface TopScreenProps {
  onSelect: (mode: MissionMode) => void;
}

export const TopScreen: React.FC<TopScreenProps> = ({ onSelect }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-slate-800 to-slate-900 relative overflow-hidden">

      {/* 背景の星 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-60 animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* タイトル */}
      <div className="text-center mb-12 z-10">
        <h1 className="text-4xl font-black text-white tracking-widest drop-shadow-lg">
          Daily Quest
        </h1>
        <p className="text-slate-400 font-bold text-sm mt-2 tracking-wider">
          どっちのミッションをやる？
        </p>
      </div>

      {/* 朝・夜 選択ボタン */}
      <div className="flex flex-col gap-6 w-full max-w-xs px-6 z-10">

        {/* 朝ミッション */}
        <button
          onClick={() => onSelect('morning')}
          className="group relative flex items-center gap-5 bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white rounded-3xl p-6 shadow-2xl shadow-amber-900/50 active:scale-95 transition-all duration-200 border-2 border-amber-300/40"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sun size={40} className="drop-shadow-lg" />
          </div>
          <div className="text-left">
            <div className="text-2xl font-black tracking-wide">朝ミッション</div>
            <div className="text-amber-100 text-sm font-bold mt-0.5">出発までに準備しよう！</div>
          </div>
          {/* 光の演出 */}
          <div className="absolute top-3 right-4 text-2xl opacity-60 animate-bounce" style={{ animationDuration: '2s' }}>✨</div>
        </button>

        {/* 夜ミッション */}
        <button
          onClick={() => onSelect('night')}
          className="group relative flex items-center gap-5 bg-gradient-to-br from-indigo-500 to-violet-700 hover:from-indigo-400 hover:to-violet-600 text-white rounded-3xl p-6 shadow-2xl shadow-indigo-900/50 active:scale-95 transition-all duration-200 border-2 border-indigo-400/40"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Moon size={40} className="drop-shadow-lg" />
          </div>
          <div className="text-left">
            <div className="text-2xl font-black tracking-wide">夜ミッション</div>
            <div className="text-indigo-200 text-sm font-bold mt-0.5">寝る前に全部クリアしよう！</div>
          </div>
          {/* 星の演出 */}
          <div className="absolute top-3 right-4 text-2xl opacity-60 animate-pulse" style={{ animationDuration: '2.5s' }}>🌟</div>
        </button>

      </div>
    </div>
  );
};
