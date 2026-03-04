import React, { useMemo } from 'react';
import { Moon, Home, Star, Stamp } from 'lucide-react';
import { nightMissionCompleteMessages, getRandomMessage } from '../randomMessages';

interface NightCompletionViewProps {
  currentStamps: number;
  totalSlots: number;
  onReset: () => void;
}

export const NightCompletionView: React.FC<NightCompletionViewProps> = ({ currentStamps, totalSlots, onReset }) => {
  const randomMessage = useMemo(() => getRandomMessage(nightMissionCompleteMessages), []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-900">

      {/* 背景の星 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <Star
              size={Math.random() * 16 + 8}
              fill="currentColor"
              className="text-violet-300"
            />
          </div>
        ))}
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center">

        {/* 月アイコン */}
        <div className="mb-6 animate-bounce">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-2xl border-4 border-white/20">
            <Moon size={64} className="text-white drop-shadow-lg" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-white mb-3 drop-shadow-lg">
          ナイトミッション<br />コンプリート！
        </h1>

        <p className="text-xl text-violet-200 font-black mb-6 animate-pulse">
          {randomMessage}
        </p>

        {/* スタンプ獲得 */}
        <div className="mb-5 flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-lg py-3 px-6 rounded-2xl shadow-lg animate-bounce">
          <Stamp size={24} className="drop-shadow" />
          <span>スタンプ 1個ゲット！</span>
          <Star size={20} fill="currentColor" className="drop-shadow" />
        </div>

        {/* スタンプ進捗ミニカード */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-md border border-violet-400/30 flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: totalSlots }).map((_, idx) => (
              <Star
                key={idx}
                size={18}
                fill={idx < currentStamps ? 'currentColor' : 'none'}
                className={`transition-all duration-300 ${
                  idx < currentStamps ? 'text-violet-300 drop-shadow-sm' : 'text-white/20'
                } ${idx === currentStamps - 1 ? 'animate-bounce' : ''}`}
              />
            ))}
          </div>
          <span className="text-sm font-black text-violet-200">
            {currentStamps}/{totalSlots}
          </span>
        </div>

        <p className="text-lg text-violet-200/70 font-bold mb-10">
          おやすみなさい！いい夢を 🌙
        </p>

        <button
          onClick={onReset}
          className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl shadow-lg border border-white/20 transition flex items-center gap-2"
        >
          <Home size={20} />
          ホームに戻る
        </button>
      </div>
    </div>
  );
};
