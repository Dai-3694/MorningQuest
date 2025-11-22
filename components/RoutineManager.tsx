
import React, { useState, useEffect } from 'react';
import { Task, AppMode, DEFAULT_TASKS, ChildState } from '../types';
import { SetupView } from './SetupView';
import { ActiveView } from './ActiveView';
import { CompletionView } from './CompletionView';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: ChildState = JSON.parse(saved);
        setTasks(parsed.tasks || DEFAULT_TASKS);
        setDepartureTime(parsed.departureTime || '08:00');
        if (parsed.name) setName(parsed.name);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save state whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const stateToSave: ChildState = { name, tasks, departureTime };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [name, tasks, departureTime, isLoaded, storageKey]);

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
          themeColor={themeColor}
        />
      )}
      
      {mode === 'active' && (
        <ActiveView 
          tasks={tasks}
          departureTime={departureTime}
          onComplete={() => setMode('completed')}
          onBack={() => {
            if (window.confirm('本当にやめますか？')) {
              setMode('setup');
            }
          }}
        />
      )}

      {mode === 'completed' && (
        <CompletionView 
          onReset={() => setMode('setup')}
        />
      )}
    </div>
  );
};
