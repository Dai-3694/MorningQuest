import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { IconDisplay } from './IconDisplay';
import { Check, Moon, Clock, Star } from 'lucide-react';
import { taskCompleteMessages, getRandomMessage } from '../randomMessages';

interface NightActiveViewProps {
  tasks: Task[];
  bedTime: string; // "HH:mm"
  onComplete: () => void;
  onBack: () => void;
}

export const NightActiveView: React.FC<NightActiveViewProps> = ({ tasks, bedTime, onComplete, onBack }) => {
  const startTask = tasks.find(t => t.type === 'start');
  const endTask = tasks.find(t => t.type === 'end');
  const flexibleTasks = tasks.filter(t => t.type === 'flexible');

  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(startTask ? [startTask.id] : [])
  );
  const [taskMessages, setTaskMessages] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Undo 用
  const [undoTaskId, setUndoTaskId] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1秒ごと更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // 就寝時刻の Date を取得（深夜またぎ対応）
  const getBedTimeDate = (now: Date): Date => {
    const [h, m] = bedTime.split(':').map(Number);
    const bed = new Date(now);
    bed.setHours(h, m, 0, 0);
    if (bed.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
      bed.setDate(bed.getDate() + 1);
    }
    return bed;
  };

  // 就寝時刻まで残り何分か
  const getBedTimeRemaining = (): { hours: number; minutes: number; isCountdownActive: boolean; isPast: boolean } => {
    const now = currentTime;
    const bed = getBedTimeDate(now);
    const msLeft = bed.getTime() - now.getTime();
    if (msLeft < 0) {
      return { hours: 0, minutes: 0, isCountdownActive: true, isPast: true };
    }
    const totalMinutes = Math.ceil(msLeft / 60000);
    const isCountdownActive = totalMinutes <= 60; // 1時間前からカウントダウン表示
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      isCountdownActive,
      isPast: false,
    };
  };

  const bedRemaining = getBedTimeRemaining();
  const allFlexibleDone = flexibleTasks.every(t => completedIds.has(t.id));
  const canFinish = allFlexibleDone;

  const handleComplete = (taskId: string) => {
    if (completedIds.has(taskId)) return;

    setCompletedIds(prev => new Set(prev).add(taskId));
    setTaskMessages(prev => ({
      ...prev,
      [taskId]: getRandomMessage(taskCompleteMessages),
    }));

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoTaskId(taskId);
    setShowUndo(true);
    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false);
      setUndoTaskId(null);
    }, 4000);
  };

  const handleUndo = () => {
    if (!undoTaskId) return;
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(undoTaskId);
      return next;
    });
    setTaskMessages(prev => {
      const next = { ...prev };
      delete next[undoTaskId];
      return next;
    });
    setShowUndo(false);
    setUndoTaskId(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  // 就寝カウントダウンの色
  const countdownColor = bedRemaining.isPast
    ? 'bg-rose-600 text-white animate-pulse'
    : bedRemaining.isCountdownActive
      ? bedRemaining.minutes <= 15
        ? 'bg-rose-500 text-white animate-pulse'
        : 'bg-amber-500 text-white'
      : 'bg-indigo-600/80 text-white';

  const completedCount = flexibleTasks.filter(t => completedIds.has(t.id)).length;
  const progressPercent = flexibleTasks.length > 0
    ? Math.round((completedCount / flexibleTasks.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 relative overflow-hidden">

      {/* ヘッダー */}
      <div className="bg-indigo-950/80 backdrop-blur-md border-b border-indigo-700/50 px-4 py-3 flex flex-col gap-2 shadow-lg z-10">
        <div className="flex justify-between items-center">

          {/* 現在時刻 */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Clock size={15} className="text-indigo-300" />
            <span className="text-white font-black text-lg tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* 就寝カウントダウン（1時間前から表示） */}
          {bedRemaining.isCountdownActive && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black ${countdownColor}`}>
              <Moon size={15} />
              {bedRemaining.isPast
                ? 'ねる時間すぎてるよ！'
                : `ねるまであと ${bedRemaining.hours > 0 ? `${bedRemaining.hours}時間` : ''}${bedRemaining.minutes}分`
              }
            </div>
          )}
          {!bedRemaining.isCountdownActive && (
            <div className="flex items-center gap-1.5 bg-indigo-800/60 px-3 py-1.5 rounded-full text-indigo-300 text-xs font-bold">
              <Moon size={14} />
              <span>就寝 {bedTime}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (window.confirm('夜のミッションをやめますか？')) onBack();
            }}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white/70 font-bold"
          >
            戻る
          </button>
        </div>

        {/* 進捗バー */}
        <div className="w-full bg-white/10 rounded-full h-4 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/90">
            {completedCount} / {flexibleTasks.length} クリア
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* スタートタスク（完了済み扱いで表示） */}
        {startTask && (
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
              <Check size={20} className="text-white" />
            </div>
            <div className="font-bold text-white/80">{startTask.title}</div>
            <span className="ml-auto text-emerald-400 font-black text-sm">完了!</span>
          </div>
        )}

        {/* フレキシブルタスク */}
        {flexibleTasks.map(task => {
          const isDone = completedIds.has(task.id);
          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                isDone
                  ? 'bg-emerald-900/40 border-emerald-700/50 opacity-70'
                  : 'bg-white/10 border-white/20 shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isDone ? 'bg-emerald-500' : ''}`}
                style={!isDone ? { backgroundColor: task.color } : {}}
              >
                {isDone
                  ? <Check size={22} className="text-white" />
                  : <IconDisplay icon={task.icon} size={22} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold truncate ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                  {task.title}
                </div>
                {isDone && taskMessages[task.id] && (
                  <div className="text-amber-400 text-xs font-bold animate-bounce mt-0.5">
                    {taskMessages[task.id]}
                  </div>
                )}
              </div>
              {isDone ? (
                <span className="text-emerald-400 font-black text-sm shrink-0">✓完了</span>
              ) : (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="shrink-0 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md"
                >
                  できた
                </button>
              )}
            </div>
          );
        })}

        {/* エンドタスク（おやすみ） */}
        {endTask && (
          <div className={`rounded-2xl border-2 p-4 transition-all ${canFinish ? 'bg-violet-900/60 border-violet-500' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${canFinish ? 'bg-violet-500 text-white' : 'bg-white/10 text-white/30'}`}>
                <Moon size={24} />
              </div>
              <div className="flex-1">
                <div className={`font-black text-lg ${canFinish ? 'text-violet-200' : 'text-white/30'}`}>
                  {endTask.title}
                </div>
                {!canFinish && (
                  <div className="text-xs text-white/30">ミッションをぜんぶ終わらせよう！</div>
                )}
              </div>
            </div>
            <button
              onClick={onComplete}
              disabled={!canFinish}
              className={`w-full py-4 text-xl font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                canFinish
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white ring-4 ring-white/10'
                  : 'bg-white/10 text-white/20 cursor-not-allowed'
              }`}
            >
              <Star size={22} fill={canFinish ? 'currentColor' : 'none'} />
              <span>おやすみ！ミッション完了！</span>
            </button>
          </div>
        )}
      </div>

      {/* Undo トースト */}
      {showUndo && undoTaskId && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-3 z-20">
          <span className="text-sm font-bold">
            {tasks.find(t => t.id === undoTaskId)?.title} を完了
          </span>
          <button
            onClick={handleUndo}
            className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
          >
            もどす
          </button>
        </div>
      )}
    </div>
  );
};
