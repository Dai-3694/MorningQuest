
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { IconDisplay } from './IconDisplay';
import { Check, DoorOpen, AlertTriangle, ThumbsUp, Clock, Sun } from 'lucide-react';
import { taskCompleteMessages, getRandomMessage } from '../randomMessages';

interface ActiveViewProps {
  tasks: Task[];
  departureTime: string; // "HH:mm"
  onComplete: (totalActualSeconds?: number) => void;
  onBack: () => void;
}

type UrgencyLevel = 'safe' | 'warning' | 'danger';

export const ActiveView: React.FC<ActiveViewProps> = ({ tasks, departureTime, onComplete, onBack }) => {
  // 完了したタスクのIDを管理
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  // 最後にアクション（開始または完了）が発生した時刻
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now());
  // 各タスクの確定済み経過秒数
  const [elapsedSeconds, setElapsedSeconds] = useState<Record<string, number>>({});
  // リアルタイム表示用の秒数（activeTaskIdの分）
  const [activeTaskElapsed, setActiveTaskElapsed] = useState<number>(0);

  // 各タスクの完了時メッセージを保存
  const [taskMessages, setTaskMessages] = useState<Record<string, string>>({});
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

  // 現在取り組んでいる（べき）タスクを順序通りに特定
  const currentTaskOrder = tasks.filter(t => !completedTaskIds.has(t.id));
  const activeTaskId = currentTaskOrder.length > 0 ? currentTaskOrder[0].id : null;

  // フェーズ判定（wakeUpTaskが存在しない場合は起床フェーズをスキップ）
  const isWakeUpPhase = wakeUpTask ? !completedTaskIds.has(wakeUpTask.id) : false;
  const allFlexibleCompleted = flexibleTasks.every(t => completedTaskIds.has(t.id));
  const canDepart = !isWakeUpPhase && allFlexibleCompleted;

  // 1秒ごとの更新処理
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // アクティブ（フォーカス）なタスクの現時点での経過時間を計算
      if (activeTaskId) {
        const secondsSinceLast = Math.floor((now.getTime() - lastActionTime) / 1000);
        const accumulated = (elapsedSeconds[activeTaskId] || 0) + secondsSinceLast;
        setActiveTaskElapsed(accumulated);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTaskId, lastActionTime, elapsedSeconds]);

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

  // 秒を MM:SS 形式に変換
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // タスク完了ハンドラー
  const handleCompleteTask = (taskId: string) => {
    const now = Date.now();
    const secondsSinceLast = Math.floor((now - lastActionTime) / 1000);

    // 今回アクティブだったタスクにここまでの時間を加算
    if (activeTaskId) {
      setElapsedSeconds(prev => ({
        ...prev,
        [activeTaskId]: (prev[activeTaskId] || 0) + secondsSinceLast
      }));
    }

    // 最後のアクションを更新
    setLastActionTime(now);

    // 完了フラグを立てる（既に追加されている場合は何もしない）
    if (completedTaskIds.has(taskId)) return;
    setCompletedTaskIds(prev => new Set(prev).add(taskId));

    // ランダムメッセージ
    setTaskMessages(prev => ({
      ...prev,
      [taskId]: getRandomMessage(taskCompleteMessages)
    }));
  };

  // 出発ハンドラー
  const handleDepart = () => {
    const now = Date.now();
    const secondsSinceLast = Math.floor((now - lastActionTime) / 1000);

    // 現在アクティブなタスク（出発タスクなど）の時間を最後に加算
    let finalElapsed = { ...elapsedSeconds };
    if (activeTaskId) {
      finalElapsed[activeTaskId] = (finalElapsed[activeTaskId] || 0) + secondsSinceLast;
    }

    // 全ての実際の合計時間を計算
    const totalActualSeconds = Object.values(finalElapsed).reduce((sum: number, sec: number) => sum + sec, 0);
    onComplete(totalActualSeconds);
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
            {/* いまのじこく - 目立つ表示 */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-3 py-1.5 rounded-full shadow-md">
              <Clock size={16} className="animate-pulse" />
              <span className="text-xs font-bold">いま</span>
              <span className="text-lg font-black tracking-wider">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
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
        {isWakeUpPhase ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 rounded-full bg-amber-400 flex items-center justify-center shadow-2xl border-8 border-white">
              <Sun size={64} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-800">{wakeUpTask?.title}</h2>
            <p className="text-slate-500 font-bold">目安: {wakeUpTask?.durationMinutes}分</p>
            <button
              onClick={() => wakeUpTask && handleCompleteTask(wakeUpTask.id)}
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
                  <div className="text-xs text-slate-400">
                    {wakeUpTask.durationMinutes}分
                    {elapsedSeconds[wakeUpTask.id] !== undefined && (
                      <span className="ml-2 text-slate-500">(かかった時間: {formatTime(elapsedSeconds[wakeUpTask.id])})</span>
                    )}
                  </div>
                </div>
                <span className="text-emerald-600 font-black text-sm">完了!</span>
              </div>
            )}

            {/* フェーズ2: 自由順タスクリスト */}
            <div className="bg-white/60 rounded-2xl p-3 space-y-2 border border-white/50">
              <h3 className="text-sm font-bold text-slate-500 px-2">ミッションをおわらせよう！</h3>
              {flexibleTasks.map(task => {
                const isCompleted = completedTaskIds.has(task.id);
                const isActive = activeTaskId === task.id;
                // Plan C: focusタスクならリアルタイム経過時間を、そうでなければ確定済み時間を使用
                const taskElapsed = isActive ? activeTaskElapsed : (elapsedSeconds[task.id] || 0);
                const isOverdue = !isCompleted && taskElapsed > task.durationMinutes * 60;

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${isCompleted
                      ? 'bg-emerald-50 border border-emerald-200 opacity-60'
                      : isActive
                        ? 'bg-white border-2 border-sky-400 shadow-md ring-2 ring-sky-100'
                        : 'bg-white/40 border border-slate-200 shadow-sm grayscale-[0.5]'
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${isCompleted ? 'bg-emerald-500' : isActive ? 'animate-bounce' : ''
                        }`}
                      style={!isCompleted ? { backgroundColor: task.color } : {}}
                    >
                      {isCompleted ? <Check size={20} /> : <IconDisplay icon={task.icon} size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`font-bold truncate ${isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {task.title}
                        </div>
                        {isActive && (
                          <span className="bg-sky-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                            いま！
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-400">{task.durationMinutes}分</div>
                        {(isActive || isCompleted) && (
                          <div className={`text-xs font-black ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                            {isCompleted ? '実績:' : 'いま:'} {formatTime(taskElapsed)}
                          </div>
                        )}
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="flex flex-col items-end">
                        <span className="text-emerald-600 font-black text-sm">✓完了</span>
                        {taskMessages[task.id] && (
                          <span className="text-amber-500 font-bold text-xs animate-bounce">
                            {taskMessages[task.id]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className={`px-4 py-2 font-bold rounded-xl shadow-sm active:scale-95 transition-all text-sm ${isActive
                          ? 'bg-sky-500 hover:bg-sky-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-500 hover:bg-slate-50'
                          }`}
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
                  <div className="flex-1">
                    <div className={`font-black text-lg ${canDepart ? 'text-rose-700' : 'text-slate-400'}`}>
                      {departureTask.title}
                    </div>
                    {!canDepart && (
                      <div className="text-xs text-slate-400">ミッションをぜんぶ終わらせよう！</div>
                    )}
                    {activeTaskId === departureTask.id && (
                      <div className="text-xs font-black text-rose-500">
                        しゅっぱつのじゅんび中: {formatTime(elapsedSeconds[departureTask.id] || 0)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDepart}
                  disabled={!canDepart}
                  className={`w-full py-4 text-2xl font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${canDepart
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

      </div>
    </div>
  );
};
