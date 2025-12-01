
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { IconDisplay } from './IconDisplay';
import { Check, DoorOpen, AlertTriangle, ThumbsUp, Clock, Sun } from 'lucide-react';

interface ActiveViewProps {
  tasks: Task[];
  departureTime: string; // "HH:mm"
  onComplete: () => void;
  onBack: () => void;
}

type UrgencyLevel = 'safe' | 'warning' | 'danger';

export const ActiveView: React.FC<ActiveViewProps> = ({ tasks, departureTime, onComplete, onBack }) => {
  // 完了したタスクのIDを管理
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState<{
    level: UrgencyLevel;
    diffMinutes: number;
    remainingTaskMinutes: number;
    minutesToDeparture: number;
  }>({
    level: 'safe',
    diffMinutes: 0,
    remainingTaskMinutes: 0,
    minutesToDeparture: 0
  });

  // タスクの分類（typeプロパティを使用して堅牢に分類）
  const wakeUpTask = tasks.find(t => t.type === 'start');
  const departureTask = tasks.find(t => t.type === 'end');
  const flexibleTasks = tasks.filter(t => t.type === 'flexible');

  // フェーズ判定（wakeUpTaskが存在しない場合は起床フェーズをスキップ）
  const isWakeUpPhase = wakeUpTask ? !completedTaskIds.has(wakeUpTask.id) : false;
  const allFlexibleCompleted = flexibleTasks.every(t => completedTaskIds.has(t.id));
  const canDepart = !isWakeUpPhase && allFlexibleCompleted;

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request Wake Lock to keep screen on
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen Wake Lock active');
        }
      } catch (err) {
        console.error(`${err} - Wake Lock not supported or rejected`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 緊急度メーターの計算
  useEffect(() => {
    const calculateMetrics = () => {
      const now = currentTime;

      // 出発時刻をパース
      const [depH, depM] = departureTime.split(':').map(Number);
      const departure = new Date(now);
      departure.setHours(depH, depM, 0, 0);

      // 深夜をまたぐ場合の処理
      if (departure.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
        departure.setDate(departure.getDate() + 1);
      }

      // 出発までの時間（分）
      const msToDeparture = departure.getTime() - now.getTime();
      const minutesToDeparture = msToDeparture / 60000;

      // 残りタスクの合計時間を計算（未完了のもののみ）
      let remainingSeconds = 0;
      tasks.forEach(task => {
        if (!completedTaskIds.has(task.id)) {
          remainingSeconds += task.durationMinutes * 60;
        }
      });
      const remainingTaskMinutes = remainingSeconds / 60;

      // バッファ計算
      const bufferMinutes = minutesToDeparture - remainingTaskMinutes;

      let level: UrgencyLevel = 'safe';
      if (bufferMinutes < 0) level = 'danger';
      else if (bufferMinutes < 10) level = 'warning';
      else level = 'safe';

      setMetrics({
        level,
        diffMinutes: Math.floor(bufferMinutes),
        remainingTaskMinutes,
        minutesToDeparture
      });
    };

    calculateMetrics();
  }, [departureTime, tasks, completedTaskIds, currentTime]);

  // タスク完了ハンドラー
  const handleCompleteTask = (taskId: string) => {
    setCompletedTaskIds(prev => new Set(prev).add(taskId));
  };

  // 出発ハンドラー
  const handleDepart = () => {
    onComplete();
  };

  // ビジュアル設定
  const visualConfig = {
    safe: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      barColor: 'bg-emerald-500',
      icon: <ThumbsUp size={24} />,
      message: '順調！余裕あり',
    },
    warning: {
      bg: 'bg-yellow-200',
      text: 'text-yellow-900',
      barColor: 'bg-yellow-500',
      icon: <Clock size={24} className="animate-pulse" />,
      message: '急ごう！',
    },
    danger: {
      bg: 'bg-rose-200 animate-pulse-slow',
      text: 'text-rose-900',
      barColor: 'bg-rose-600',
      icon: <AlertTriangle size={24} className="animate-bounce" />,
      message: '遅れる！急げ！',
    },
  }[metrics.level];

  return (
    <div className={`flex flex-col h-full w-full ${visualConfig.bg} transition-colors duration-500 relative overflow-hidden`}>

      {/* ヘッダー / ステータスバー */}
      <div className="bg-white/90 backdrop-blur-md border-b border-black/10 p-3 flex flex-col gap-2 shadow-sm z-10">
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 font-black text-lg ${visualConfig.text}`}>
            {visualConfig.icon}
            <span>{visualConfig.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-full text-slate-600 font-bold">
              戻る
            </button>
          </div>
        </div>

        {/* タイムバジェットメーター */}
        <div className="w-full bg-slate-300 rounded-full h-6 relative overflow-hidden shadow-inner border border-black/5">
          <div
            className={`h-full transition-all duration-500 ease-out ${metrics.level === 'danger' ? 'bg-rose-500 animate-pulse' : metrics.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${metrics.minutesToDeparture <= 0 ? 100 : Math.min(100, (metrics.remainingTaskMinutes / metrics.minutesToDeparture) * 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-black text-slate-700 drop-shadow-sm pointer-events-none">
            <span className="bg-white/50 px-1 rounded">残り: {Math.ceil(metrics.remainingTaskMinutes)}分</span>
            <span className="bg-white/50 px-1 rounded">出発まで: {Math.max(0, Math.ceil(metrics.minutesToDeparture))}分</span>
          </div>
        </div>

        {/* バッファ表示 */}
        <div className="text-center font-bold text-sm">
          {metrics.diffMinutes >= 0 ? (
            <span className="text-emerald-700">あと <span className="text-xl">{metrics.diffMinutes}</span> 分あそべるよ！</span>
          ) : (
            <span className="text-rose-700"><span className="text-xl">{Math.abs(metrics.diffMinutes)}</span> 分 足りない！！</span>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">

        {/* フェーズ1: 起床前 */}
        {isWakeUpPhase && wakeUpTask ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center shadow-2xl border-8 border-white">
              <Sun size={64} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-800">{wakeUpTask.title}</h2>
            <p className="text-slate-500 font-bold">目安: {wakeUpTask.durationMinutes}分</p>
            <button
              onClick={() => handleCompleteTask(wakeUpTask.id)}
              className="px-12 py-5 bg-amber-500 hover:bg-amber-600 text-white text-3xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform ring-4 ring-white/50"
            >
              おきた！
            </button>
          </div>
        ) : (
          <>
            {/* 起きる完了表示 */}
            {wakeUpTask && (
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                <Check size={20} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-700">{wakeUpTask.title}</div>
                <div className="text-xs text-slate-400">{wakeUpTask.durationMinutes}分</div>
              </div>
              <span className="text-emerald-600 font-black text-sm">完了!</span>
            </div>
            )}

            {/* フェーズ2: 自由順タスクリスト */}
            <div className="bg-white/60 rounded-2xl p-3 space-y-2 border border-white/50">
              <h3 className="text-sm font-bold text-slate-500 px-2">じゆうにできるミッション</h3>
              {flexibleTasks.map(task => {
                const isCompleted = completedTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-white border border-slate-200 shadow-sm'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${
                        isCompleted ? 'bg-emerald-500' : ''
                      }`}
                      style={!isCompleted ? { backgroundColor: task.color } : {}}
                    >
                      {isCompleted ? <Check size={20} /> : <IconDisplay icon={task.icon} size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400">{task.durationMinutes}分</div>
                    </div>
                    {isCompleted ? (
                      <span className="text-emerald-600 font-black text-sm px-3">✓完了</span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm active:scale-95 transition-transform text-sm"
                      >
                        できた
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* フェーズ3: 出発ボタン */}
            {departureTask && (
            <div className={`p-4 rounded-2xl border-2 ${canDepart ? 'bg-rose-50 border-rose-300' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${canDepart ? 'bg-rose-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                  <DoorOpen size={24} />
                </div>
                <div>
                  <div className={`font-black text-lg ${canDepart ? 'text-rose-700' : 'text-slate-400'}`}>
                    {departureTask.title}
                  </div>
                  {!canDepart && (
                    <div className="text-xs text-slate-400">全部できたら押せるよ！</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDepart}
                disabled={!canDepart}
                className={`w-full py-4 text-2xl font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  canDepart 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-white/50' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>出発する！</span>
                <DoorOpen size={28} />
              </button>
            </div>
            )}
          </>
        )}

        {/* 現在時刻 */}
        <div className="text-center pb-4">
          <span className="text-sm font-bold text-slate-500">いまのじこく</span>
          <div className="text-2xl font-bold text-slate-600 bg-white/50 px-4 py-1 rounded-full shadow-sm border border-white inline-block ml-2">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

      </div>
    </div>
  );
};
