
import React, { useState, useEffect } from 'react';
import { Task, AppMode, DEFAULT_TASKS, ChildState, TaskType } from '../types';
import { SetupView } from './SetupView';
import { ActiveView } from './ActiveView';
import { CompletionView } from './CompletionView';
import { LogView } from './LogView';
import { StampView } from './StampView';
import { RewardView } from './RewardView';
import { MissionLog, StampCard, Medal } from '../types';

/**
 * ローカルストレージから読み込んだタスクに type プロパティがない場合、
 * デフォルト値を付与するマイグレーション関数
 */
const migrateTasksWithType = (tasks: Task[]): Task[] => {
  return tasks.map((task, index, arr) => {
    // すでに type プロパティがあればそのまま返す
    if (task.type) {
      return task;
    }

    // type プロパティがない場合、位置に基づいてデフォルト値を付与
    let type: TaskType = 'flexible';
    if (index === 0) {
      type = 'start';
    } else if (index === arr.length - 1) {
      type = 'end';
    }

    return { ...task, type };
  });
};

interface RoutineManagerProps {
  childId: string;
  initialName: string;
  themeColor: string; // 'sky' | 'rose' etc for styling distinction
}

export const RoutineManager: React.FC<RoutineManagerProps> = ({ childId, initialName, themeColor }) => {
  const storageKey = `mq_state_${childId}`;

  const [mode, setMode] = useState<AppMode>('setup');
  const [name, setName] = useState<string>(initialName);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [departureTime, setDepartureTime] = useState<string>('08:00');
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [stampCard, setStampCard] = useState<StampCard>({
    currentStamps: 0,
    totalRewards: 0,
    rank: 0,
    medals: []
  });
  const [isBonus, setIsBonus] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChildState = JSON.parse(saved);
        // タスクにtypeプロパティがない場合はマイグレーションを実行
        const migratedTasks = parsed.tasks ? migrateTasksWithType(parsed.tasks) : DEFAULT_TASKS;
        setTasks(migratedTasks);
        setDepartureTime(parsed.departureTime || '08:00');
        if (parsed.name) setName(parsed.name);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.stampCard) {
          setStampCard({
            currentStamps: parsed.stampCard.currentStamps || 0,
            totalRewards: parsed.stampCard.totalRewards || 0,
            rank: parsed.stampCard.rank || 0,
            medals: parsed.stampCard.medals || []
          });
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save state whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const stateToSave: ChildState = { name, tasks, departureTime, logs, stampCard };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [name, tasks, departureTime, logs, stampCard, isLoaded, storageKey]);

  // Prevent accidental navigation away during active mode
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (mode === 'active') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mode]);

  const borderClass = themeColor === 'rose' ? 'border-rose-200' : 'border-sky-200';
  const bgClass = themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50';

  if (!isLoaded) return <div className="flex-1 bg-white animate-pulse" />;

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden border-r-4 last:border-r-0 ${borderClass} ${bgClass}`}>
      {/* Child Header Label (Shows current name) */}
      <div className={`absolute top-0 left-0 z-30 px-4 py-1 rounded-br-xl font-bold text-white text-sm shadow-md ${themeColor === 'rose' ? 'bg-rose-400' : 'bg-sky-400'}`}>
        {name}
      </div>

      {mode === 'setup' && (
        <SetupView
          name={name}
          setName={setName}
          tasks={tasks}
          setTasks={setTasks}
          departureTime={departureTime}
          setDepartureTime={setDepartureTime}
          onStart={() => setMode('active')}
          onLog={() => setMode('log')}
          onStamp={() => setMode('stamp')}
          themeColor={themeColor}
        />
      )}

      {mode === 'active' && (
        <ActiveView
          tasks={tasks}
          departureTime={departureTime}
          isBonus={isBonus}
          onBonusDetected={() => setIsBonus(true)}
          onComplete={(totalActualSeconds?: number) => {
            // Calculate success (finished before departure time)
            const now = new Date();
            const [deptHour, deptMinute] = departureTime.split(':').map(Number);
            const deptDate = new Date();
            deptDate.setHours(deptHour, deptMinute, 0, 0);

            const isSuccess = now <= deptDate;
            const scheduledDurationSeconds = tasks.reduce((acc, t) => acc + t.durationMinutes * 60, 0);

            // Update Logs
            const newLog: MissionLog = {
              date: now.toLocaleDateString('sv-SE'),
              completedAt: now.toISOString(),
              totalDurationSeconds: scheduledDurationSeconds,
              actualDurationSeconds: totalActualSeconds,
              isSuccess,
              isBonus: isBonus
            };
            setLogs(prev => [...prev, newLog]);

            // Update Stamps if success (bonus = +2, normal = +1)
            if (isSuccess) {
              const stampsToAdd = isBonus ? 2 : 1;
              setStampCard(prev => ({
                ...prev,
                currentStamps: prev.currentStamps + stampsToAdd
              }));
            }

            setMode('completed');
          }}
          onBack={() => {
            if (window.confirm('本当にやめますか？')) {
              setIsBonus(false);
              setMode('setup');
            }
          }}
        />
      )}

      {mode === 'completed' && (
        <CompletionView
          isBonus={isBonus}
          isSuccess={logs.length > 0 ? logs[logs.length - 1].isSuccess : false}
          onReset={() => {
            const bonusWasActive = isBonus;
            setIsBonus(false);
            if (stampCard.currentStamps >= 10) {
              setMode('reward');
            } else {
              setMode('setup');
            }
          }}
        />
      )}

      {mode === 'reward' && (
        <RewardView
          childName={name}
          rank={stampCard.rank}
          logs={logs}
          onAccept={(medal) => {
            setStampCard(prev => ({
              ...prev,
              currentStamps: 0,
              totalRewards: prev.totalRewards + 1,
              rank: Math.min(prev.rank + 1, 3),
              medals: [...prev.medals, medal]
            }));
            setMode('stamp');
          }}
        />
      )}

      {mode === 'log' && (
        <LogView
          logs={logs}
          onBack={() => setMode('setup')}
          themeColor={themeColor}
        />
      )}

      {mode === 'stamp' && (
        <StampView
          stampCard={stampCard}
          onBack={() => setMode('setup')}
          themeColor={themeColor}
        />
      )}
    </div>
  );
};
