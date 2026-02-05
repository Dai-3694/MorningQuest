import React, { useMemo } from 'react';
import { Trophy, RotateCcw, Home, Zap, Star } from 'lucide-react';
import { missionCompleteMessages, getRandomMessage } from '../randomMessages';

interface CompletionViewProps {
  isBonus: boolean;
  isSuccess: boolean;
  onReset: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({ isBonus, isSuccess, onReset }) => {
  // コンポーネントマウント時に1回だけランダムメッセージを生成
  const randomMessage = useMemo(() => getRandomMessage(missionCompleteMessages), []);

  return (
    <div className={`flex flex-col items-center justify-center h-full p-6 text-center ${isBonus && isSuccess ? 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100' : 'bg-gradient-to-b from-yellow-50 to-orange-100'}`}>
      
      {/* ボーナス成功時の特別表示 */}
      {isBonus && isSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white font-black text-lg py-2 px-6 rounded-full shadow-lg animate-bounce">
          <Zap size={20} />
          <span>早起きボーナス達成！ スタンプ 2個ゲット！</span>
          <Zap size={20} />
        </div>
      )}

      <div className="mb-8 animate-bounce relative">
        <Trophy size={120} className="text-yellow-500 drop-shadow-lg" />
        {isBonus && isSuccess && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Star size={28} fill="#f59e0b" className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
            <Star size={28} fill="#f59e0b" className="text-amber-500 animate-spin" style={{ animationDuration: '2.5s' }} />
          </div>
        )}
      </div>

      <h1 className="text-4xl font-black text-orange-600 mb-4">
        ミッションコンプリート！
      </h1>
      
      <p className="text-2xl text-orange-800 font-black mb-4 animate-pulse">
        {randomMessage}
      </p>
      
      {isBonus && !isSuccess && (
        <p className="text-sm text-orange-600/70 font-bold mb-2">
          ボーナスチャンスだったけど、次はきっと間に合う！
        </p>
      )}

      <p className="text-lg text-orange-800/70 font-bold mb-12">
        いってらっしゃい！
      </p>

      <button
        onClick={onReset}
        className="px-8 py-4 bg-white text-orange-500 font-bold rounded-2xl shadow-lg hover:bg-orange-50 transition flex items-center gap-2"
      >
        <Home size={20} />
        ホームに戻る
      </button>
    </div>
  );
};