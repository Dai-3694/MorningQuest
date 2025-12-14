import React, { useMemo } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { missionCompleteMessages, getRandomMessage } from '../randomMessages';

interface CompletionViewProps {
  onReset: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({ onReset }) => {
  // コンポーネントマウント時に1回だけランダムメッセージを生成
  const randomMessage = useMemo(() => getRandomMessage(missionCompleteMessages), []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-yellow-50 to-orange-100 p-6 text-center">
      
      <div className="mb-8 animate-bounce">
        <Trophy size={120} className="text-yellow-500 drop-shadow-lg" />
      </div>

      <h1 className="text-4xl font-black text-orange-600 mb-4">
        ミッションコンプリート！
      </h1>
      
      <p className="text-2xl text-orange-800 font-black mb-4 animate-pulse">
        {randomMessage}
      </p>
      
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