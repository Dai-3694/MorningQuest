
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { IconDisplay } from './IconDisplay';
import { Check, ArrowRight, DoorOpen, AlertTriangle, ThumbsUp, Clock } from 'lucide-react';

interface ActiveViewProps {
  tasks: Task[];
  departureTime: string; // "HH:mm"
  onComplete: () => void;
  onBack: () => void;
}

type UrgencyLevel = 'safe' | 'warning' | 'danger';

export const ActiveView: React.FC<ActiveViewProps> = ({ tasks, departureTime, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [metrics, setMetrics] = useState<{
    level: UrgencyLevel;
    diffMinutes: number; // + means buffer, - means overtime
    remainingTaskMinutes: number;
    minutesToDeparture: number;
  }>({
    level: 'safe',
    diffMinutes: 0,
    remainingTaskMinutes: 0,
    minutesToDeparture: 0
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const urgencyTimerRef = useRef<number | null>(null);

  const currentTask = tasks[currentIndex];
  const nextTask = tasks[currentIndex + 1];

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

    // Re-request on visibility change (e.g. switching tabs)
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

  // Initialize Timer for Task
  useEffect(() => {
    setTimeLeft(currentTask.durationMinutes * 60);
  }, [currentIndex, currentTask]);

  // Main Timer Loop
  useEffect(() => {
    let lastTickTime = Date.now();
    const timerId = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - lastTickTime) / 1000);
      lastTickTime = now;

      setCurrentTime(new Date(now));
      if (elapsedSeconds > 0) {
        setTimeLeft(prev => Math.max(0, prev - elapsedSeconds));
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Urgency & Metrics Calculation Loop
  useEffect(() => {
    const calculateMetrics = () => {
      const now = new Date();

      // Parse Departure Time
      const [depH, depM] = departureTime.split(':').map(Number);
      const departure = new Date(now);
      departure.setHours(depH, depM, 0, 0);

      // Handle crossing midnight
      if (departure.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
        departure.setDate(departure.getDate() + 1);
      }

      // Minutes until departure
      const msToDeparture = departure.getTime() - now.getTime();
      const minutesToDeparture = msToDeparture / 60000;

      // Calculate Remaining Duration of All Tasks (Current remaining + Future tasks)
      let remainingSeconds = timeLeft;
      for (let i = currentIndex + 1; i < tasks.length; i++) {
        remainingSeconds += tasks[i].durationMinutes * 60;
      }
      const remainingTaskMinutes = remainingSeconds / 60;

      // Buffer
      const bufferMinutes = minutesToDeparture - remainingTaskMinutes;

      let level: UrgencyLevel = 'safe';
      if (bufferMinutes < 0) level = 'danger';
      else if (bufferMinutes < 10) level = 'warning'; // Less than 10 min buffer
      else level = 'safe';

      setMetrics({
        level,
        diffMinutes: Math.floor(bufferMinutes),
        remainingTaskMinutes,
        minutesToDeparture
      });
    };

    calculateMetrics();
    urgencyTimerRef.current = window.setInterval(calculateMetrics, 1000);

    return () => {
      if (urgencyTimerRef.current) clearInterval(urgencyTimerRef.current);
    };
  }, [departureTime, tasks, currentIndex, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const isOvertime = timeLeft === 0 && currentTask.durationMinutes > 0;

  // Visual Configurations based on Urgency
  const visualConfig = {
    safe: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      barColor: 'bg-emerald-500',
      icon: <ThumbsUp size={28} />,
      message: '順調！余裕あり',
    },
    warning: {
      bg: 'bg-yellow-200', // Stronger yellow
      text: 'text-yellow-900',
      barColor: 'bg-yellow-500',
      icon: <Clock size={28} className="animate-pulse" />,
      message: '急ごう！',
    },
    danger: {
      bg: 'bg-rose-200 animate-pulse-slow', // Stronger red
      text: 'text-rose-900',
      barColor: 'bg-rose-600',
      icon: <AlertTriangle size={28} className="animate-bounce" />,
      message: '遅れる！急げ！',
    },
  }[metrics.level];

  return (
    <div className={`flex flex-col h-full w-full ${visualConfig.bg} transition-colors duration-500 relative overflow-hidden`}>

      {/* Header / Meter Section */}
      <div className="bg-white/90 backdrop-blur-md border-b border-black/10 p-4 flex flex-col gap-2 shadow-sm z-10">
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 font-black text-xl ${visualConfig.text}`}>
            {visualConfig.icon}
            <span>{visualConfig.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button onClick={onBack} className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-full text-slate-600 font-bold">
              戻る
            </button>
          </div>
        </div>

        {/* Time Budget Meter */}
        <div className="w-full bg-slate-300 rounded-full h-8 relative overflow-hidden shadow-inner border border-black/5">
          {/* Progress Bar */}
          <div
            className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 ${metrics.level === 'danger' ? 'bg-rose-500 animate-pulse' : metrics.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${metrics.minutesToDeparture <= 0 ? 100 : Math.min(100, (metrics.remainingTaskMinutes / metrics.minutesToDeparture) * 100)}%` }}
          >
          </div>

          {/* Label Overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-black text-slate-700 drop-shadow-sm pointer-events-none">
            <span className="bg-white/50 px-1 rounded">残りタスク: {Math.ceil(metrics.remainingTaskMinutes)}分</span>
            <span className="bg-white/50 px-1 rounded">出発まで: {Math.max(0, Math.ceil(metrics.minutesToDeparture))}分</span>
          </div>
        </div>

        {/* Buffer Text */}
        <div className="text-center font-bold text-base mt-1">
          {metrics.diffMinutes >= 0 ? (
            <span className="text-emerald-700">あと <span className="text-2xl">{metrics.diffMinutes}</span> 分あそべるよ！</span>
          ) : (
            <span className="text-rose-700"> <span className="text-2xl">{Math.abs(metrics.diffMinutes)}</span> 分 足りない！！</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 overflow-y-auto">

        {/* Main Timer Circle */}
        <div className="relative mt-2">
          <div className={`flex flex-col items-center justify-center w-full`}>
            <div
              className={`w-52 h-52 rounded-full flex items-center justify-center mb-2 shadow-2xl border-[16px] transition-all duration-300 bg-white ${isOvertime ? 'border-rose-500 animate-shake' : metrics.level === 'danger' ? 'border-rose-400' : metrics.level === 'warning' ? 'border-amber-400' : 'border-emerald-400'}`}
            >
              <IconDisplay icon={currentTask.icon} size={100} className={visualConfig.text} />
            </div>

            <div className={`text-7xl font-black font-mono tabular-nums tracking-tighter drop-shadow-sm ${isOvertime ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </div>

            <h2 className="text-3xl font-black text-slate-800 mt-1 text-center leading-tight px-2 drop-shadow-sm">
              {currentTask.title}
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm space-y-3 pb-8">
          <button
            onClick={handleNext}
            className={`w-full py-5 text-white text-3xl font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform ring-4 ring-white/50
                    ${metrics.level === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                metrics.level === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            <span>{currentIndex === tasks.length - 1 ? '出発！' : 'できた！'}</span>
            {currentIndex === tasks.length - 1 ? <DoorOpen size={32} /> : <Check size={32} />}
          </button>

          {/* Next Task Preview */}
          {nextTask && (
            <div className="bg-white/60 p-3 rounded-2xl border border-white/50 w-full flex items-center gap-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm text-sm bg-slate-300">
                <IconDisplay icon={nextTask.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">NEXT <ArrowRight size={10} /></div>
                <div className="font-bold text-lg text-slate-700 truncate">{nextTask.title}</div>
              </div>
              <div className="text-base font-black text-slate-500">{nextTask.durationMinutes}分</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
