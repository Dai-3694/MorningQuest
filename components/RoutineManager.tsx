
import React, { useState, useEffect } from 'react';
import { Task, AppMode, DEFAULT_TASKS, DEFAULT_NIGHT_TASKS, ChildState, TaskType, MissionMode, ChildProfile, createDefaultProfile } from '../types';
import { SetupView } from './SetupView';
import { ActiveView } from './ActiveView';
import { CompletionView } from './CompletionView';
import { NightActiveView } from './NightActiveView';
import { NightCompletionView } from './NightCompletionView';
import { LogView } from './LogView';
import { StampView } from './StampView';
import { RewardView } from './RewardView';
import { MissionLog, StampCard, Medal } from '../types';
import { MAX_RANK } from '../rankData';

const TOTAL_STAMP_SLOTS = 15; // 朝夜共通スタンプ枠

/**
 * ローカルストレージから読み込んだタスクに type プロパティがない場合、
 * デフォルト値を付与するマイグレーション関数
 */
const migrateTasksWithType = (tasks: Task[]): Task[] => {
  return tasks.map((task, index, arr) => {
    if (task.type) return task;
    let type: TaskType = 'flexible';
    if (index === 0) type = 'start';
    else if (index === arr.length - 1) type = 'end';
    return { ...task, type };
  });
};

interface RoutineManagerProps {
  childId: string;
  initialName: string;
  themeColor: string;
  missionMode: MissionMode;
}

export const RoutineManager: React.FC<RoutineManagerProps> = ({ childId, initialName, themeColor, missionMode }) => {
  const storageKey = `mq_state_${childId}`;
  const isNight = missionMode === 'night';

  const [mode, setMode] = useState<AppMode>('setup');
  const [profile, setProfile] = useState<ChildProfile>(createDefaultProfile(initialName));
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [nightTasks, setNightTasks] = useState<Task[]>(DEFAULT_NIGHT_TASKS);
  const [departureTime, setDepartureTime] = useState<string>('08:00');
  const [bedTime, setBedTime] = useState<string>('21:00');
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [stampCard, setStampCard] = useState<StampCard>({
    currentStamps: 0,
    totalRewards: 0,
    rank: 0,
    medals: []
  });
  const [isBonus, setIsBonus] = useState(false);
  const [missionStartedAt, setMissionStartedAt] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChildState = JSON.parse(saved);
        const migratedTasks = parsed.tasks ? migrateTasksWithType(parsed.tasks) : DEFAULT_TASKS;
        setTasks(migratedTasks);
        if (parsed.nightTasks) {
          setNightTasks(migrateTasksWithType(parsed.nightTasks));
        }
        setDepartureTime(parsed.departureTime || '08:00');
        setBedTime(parsed.bedTime || '21:00');

        // プロフィールのマイグレーション: profile がなければ旧 name からデフォルトを生成
        const savedName = parsed.name || initialName;
        const migratedProfile: ChildProfile = parsed.profile
          ? {
              ...createDefaultProfile(savedName),
              ...parsed.profile,
              name: parsed.profile.name || savedName,
            }
          : createDefaultProfile(savedName);
        setProfile(migratedProfile);

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
      const stateToSave: ChildState = { name: profile.name, profile, tasks, nightTasks, departureTime, bedTime, logs, stampCard };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [profile, tasks, nightTasks, departureTime, bedTime, logs, stampCard, isLoaded, storageKey]);

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

  // missionMode が切り替わったときは setup に戻す（ランクアップ未処理チェック付き）
  useEffect(() => {
    setIsBonus(false);
    setMissionStartedAt(undefined);
    // missionMode 切替時にもランクアップ未処理があれば reward に遷移
    if (stampCard.currentStamps >= TOTAL_STAMP_SLOTS) {
      setMode('reward');
    } else {
      setMode('setup');
    }
  }, [missionMode]);

  // アプリ読み込み完了時にランクアップ未処理があれば自動的に reward 画面へ遷移
  // （ブラウザリロードなどでランクアップが中断された場合のリカバリー）
  useEffect(() => {
    if (isLoaded && stampCard.currentStamps >= TOTAL_STAMP_SLOTS && mode === 'setup') {
      setMode('reward');
    }
  }, [isLoaded, stampCard.currentStamps, mode]);

  // --- 朝/夜で切り替わる変数をここで一元定義 ---
  const currentTasks = isNight ? nightTasks : tasks;
  const setCurrentTasks = isNight ? setNightTasks : setTasks;
  const currentTime = isNight ? bedTime : departureTime;
  const setCurrentTime = isNight ? setBedTime : setDepartureTime;

  const borderClass = themeColor === 'rose' ? 'border-rose-200' : 'border-sky-200';
  const bgClass = isNight ? '' : (themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50');

  // ミッション完了時の共通処理
  const handleMissionComplete = (totalActualSeconds?: number) => {
    const now = new Date();
    const scheduledDurationSeconds = currentTasks.reduce((acc, t) => acc + t.durationMinutes * 60, 0);

    let isSuccess = true;
    if (!isNight) {
      const [deptHour, deptMinute] = departureTime.split(':').map(Number);
      const deptDate = new Date();
      deptDate.setHours(deptHour, deptMinute, 0, 0);
      isSuccess = now <= deptDate;
    } else {
      const [bedHour, bedMinute] = bedTime.split(':').map(Number);
      const bedDate = new Date(now);
      bedDate.setHours(bedHour, bedMinute, 0, 0);
      // 深夜またぎ対応: 就寝時刻が12時間以上前に見える場合は翌日扱い
      if (bedDate.getTime() < now.getTime() - 12 * 60 * 60 * 1000) {
        bedDate.setDate(bedDate.getDate() + 1);
      }
      isSuccess = now <= bedDate;
    }

    const newLog: MissionLog = {
      date: now.toLocaleDateString('sv-SE'),
      completedAt: now.toISOString(),
      totalDurationSeconds: scheduledDurationSeconds,
      actualDurationSeconds: totalActualSeconds,
      isSuccess,
      isBonus: isNight ? false : isBonus,
      missionMode,
    };
    setLogs(prev => [...prev, newLog]);

    if (isSuccess) {
      const stampsToAdd = (!isNight && isBonus) ? 2 : 1;
      setStampCard(prev => ({
        ...prev,
        currentStamps: prev.currentStamps + stampsToAdd,
      }));
    }

    setMode('completed');
  };

  // ランクアップ後の共通処理
  const handleRewardAccept = (medal: Medal) => {
    setStampCard(prev => {
      const overflow = prev.currentStamps - TOTAL_STAMP_SLOTS;
      return {
        ...prev,
        currentStamps: overflow,
        totalRewards: prev.totalRewards + 1,
        rank: Math.min(prev.rank + 1, MAX_RANK),
        medals: [...prev.medals, medal],
      };
    });
    setMode('stamp');
  };

  // 完了後の画面遷移
  const handleCompletionReset = () => {
    setIsBonus(false);
    setMissionStartedAt(undefined);
    if (stampCard.currentStamps >= TOTAL_STAMP_SLOTS) {
      setMode('reward');
    } else {
      setMode('setup');
    }
  };

  if (!isLoaded) return <div className="flex-1 bg-white animate-pulse" />;

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden border-r-4 last:border-r-0 ${borderClass} ${bgClass}`}>
      {/* プレイヤー名ラベル */}
      <div className={`absolute top-0 left-0 z-30 px-4 py-1 rounded-br-xl font-bold text-white text-sm shadow-md ${themeColor === 'rose' ? 'bg-rose-400' : 'bg-sky-400'}`}>
        {profile.name}
      </div>

      {mode === 'setup' && (
        <SetupView
          name={profile.name}
          tasks={currentTasks}
          setTasks={setCurrentTasks}
          departureTime={currentTime}
          setDepartureTime={setCurrentTime}
          onStart={() => {
            if (!isNight) {
              setMissionStartedAt(new Date().toISOString());
            }
            setMode('active');
          }}
          onLog={() => setMode('log')}
          onStamp={() => setMode('stamp')}
          themeColor={themeColor}
          missionMode={missionMode}
        />
      )}

      {mode === 'active' && (
        isNight ? (
          <NightActiveView
            tasks={currentTasks}
            bedTime={bedTime}
            onComplete={() => handleMissionComplete()}
            onBack={() => setMode('setup')}
          />
        ) : (
          <ActiveView
            tasks={currentTasks}
            departureTime={departureTime}
            isBonus={isBonus}
            onBonusDetected={() => setIsBonus(true)}
            earlyBirdTime={profile.bonusSettings.enabled ? profile.bonusSettings.earlyBirdTime : undefined}
            missionStartedAt={missionStartedAt}
            onComplete={(totalActualSeconds) => handleMissionComplete(totalActualSeconds)}
            onBack={() => {
              if (window.confirm('本当にやめますか？')) {
                setIsBonus(false);
                setMissionStartedAt(undefined);
                setMode('setup');
              }
            }}
          />
        )
      )}

      {mode === 'completed' && (
        isNight ? (
          <NightCompletionView
            isSuccess={logs.at(-1)?.isSuccess ?? false}
            currentStamps={stampCard.currentStamps}
            totalSlots={TOTAL_STAMP_SLOTS}
            onReset={handleCompletionReset}
          />
        ) : (
          <CompletionView
            isBonus={isBonus}
            isSuccess={logs.length > 0 ? logs[logs.length - 1].isSuccess : false}
            currentStamps={stampCard.currentStamps}
            totalSlots={TOTAL_STAMP_SLOTS}
            onReset={handleCompletionReset}
          />
        )
      )}

      {mode === 'reward' && (
        <RewardView
          childName={profile.name}
          rank={stampCard.rank}
          logs={logs}
          ageGroup={profile.ageGroup}
          onAccept={handleRewardAccept}
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
          totalSlots={TOTAL_STAMP_SLOTS}
          onBack={() => setMode('setup')}
          themeColor={themeColor}
        />
      )}
    </div>
  );
};
