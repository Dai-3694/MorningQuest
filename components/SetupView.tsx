
import React, { useState } from 'react';
import { Task, TaskIcon, DEFAULT_TASKS } from '../types';
import { IconDisplay } from './IconDisplay';
import { generateSchedule } from '../services/geminiService';
import { Trash2, Plus, Play, Sparkles, RotateCcw, ArrowUp, ArrowDown, Pencil, Check, X, Minus, Clock, User, ClipboardList, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SetupViewProps {
  name: string;
  setName: (name: string) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  onStart: () => void;
  onLog: () => void;
  onStamp: () => void;
  themeColor: string;
}

export const SetupView: React.FC<SetupViewProps> = ({ name, setName, tasks, setTasks, departureTime, setDepartureTime, onStart, onLog, onStamp, themeColor }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; duration: number }>({ title: '', duration: 0 });

  const totalTimeMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  // Calculate Estimated Finish Time
  const now = new Date();
  const estimatedFinish = new Date(now.getTime() + totalTimeMinutes * 60000);
  const finishTimeStr = `${estimatedFinish.getHours()}:${estimatedFinish.getMinutes().toString().padStart(2, '0')}`;

  const theme = {
    primary: themeColor === 'rose' ? 'bg-rose-500' : 'bg-sky-500',
    primaryHover: themeColor === 'rose' ? 'hover:bg-rose-600' : 'hover:bg-sky-600',
    light: themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50',
    border: themeColor === 'rose' ? 'border-rose-200' : 'border-sky-200',
    text: themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600',
    shadow: themeColor === 'rose' ? 'shadow-rose-200/80' : 'shadow-sky-200/80',
    placeholder: themeColor === 'rose' ? 'placeholder-rose-300' : 'placeholder-sky-300',
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const newTasks = await generateSchedule(prompt);
      setTasks(newTasks);
      setEditingId(null);
    } catch (e) {
      alert('AIスケジュールの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このタスクを削除しますか？')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm('初期設定に戻しますか？')) {
      setTasks(DEFAULT_TASKS);
      setEditingId(null);
    }
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tasks.length - 1)) return;
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    setTasks(newTasks);
  };

  // Edit Handlers
  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValues({ title: task.title, duration: task.durationMinutes });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const newTasks = tasks.map(t =>
      t.id === editingId
        ? { ...t, title: editValues.title, durationMinutes: Math.max(1, editValues.duration) }
        : t
    );
    setTasks(newTasks);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const chartData = tasks.map(t => ({
    name: t.title,
    value: t.durationMinutes > 0 ? t.durationMinutes : 1,
    color: t.color
  }));

  return (
    <div className="h-full overflow-y-auto pb-32 scroll-smooth">
      <div className="p-4 space-y-6 max-w-xl mx-auto">

        {/* Header with Navigation */}
        <header className="mt-2 text-center space-y-2 relative">
          {/* Navigation Icons */}
          <div className="absolute top-0 right-0 flex gap-1">
<button onClick={onLog} className={`p-2 text-slate-400 ${themeColor === 'rose' ? 'hover:text-rose-500' : 'hover:text-sky-500'} bg-white rounded-full shadow-sm border border-slate-200`}>
  <ClipboardList size={18} />
</button>
<button onClick={onStamp} className={`p-2 text-slate-400 ${themeColor === 'rose' ? 'hover:text-rose-500' : 'hover:text-sky-500'} bg-white rounded-full shadow-sm border border-slate-200`}>
  <Award size={18} />
</button>
          </div>

          <div className="pt-12"> {/* Add padding to parent */}
            <div className="relative group inline-flex justify-center items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力"
                className={`text-2xl font-black text-center bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-slate-400 focus:ring-0 w-48 transition-all ${theme.text} ${theme.placeholder}`}
              />
              <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <h1 className="text-slate-400 font-bold text-xs tracking-widest uppercase">Morning Quest</h1>
          </div>
        </header>

        {/* Departure Time Setting */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-600 font-bold">
            <Clock size={24} className={theme.text} />
            <span>出発時刻</span>
          </div>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="text-2xl font-black text-slate-800 bg-slate-100 rounded-lg px-3 py-1 border-transparent focus:border-sky-400 focus:ring-0"
          />
        </div>

        {/* AI Generator */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <Sparkles size={16} />
            <h2 className="font-bold text-sm">AIにおまかせ</h2>
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-2 rounded-xl border border-indigo-100 text-sm focus:border-indigo-400 focus:ring-0 resize-none text-slate-700 bg-indigo-50/50"
              rows={2}
              placeholder="例: 7時に起きる..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition flex flex-col justify-center items-center text-xs"
            >
              {isGenerating ? <span className="animate-spin">⚡</span> : <Sparkles size={18} />}
              <span>作成</span>
            </button>
          </div>
        </div>

        {/* Total Time Chart (Compact) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm relative h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute pointer-events-none text-center">
            <div className="text-xl font-black text-slate-700">{Math.floor(totalTimeMinutes / 60)}h {totalTimeMinutes % 60}m</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total</div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-600">ミッション ({tasks.length})</h3>
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-200">
              <RotateCcw size={10} /> リセット
            </button>
          </div>

          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {editingId === task.id ? (
                // Edit Mode
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-300 flex flex-col gap-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: task.color }}>
                      <IconDisplay icon={task.icon} size={16} />
                    </div>
                    <input
                      value={editValues.title}
                      onChange={e => setEditValues({ ...editValues, title: e.target.value })}
                      className="flex-1 p-2 rounded-lg border border-indigo-200 text-base font-bold text-slate-700"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-indigo-100">
                      <button onClick={() => setEditValues(prev => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))} className="p-1 bg-slate-100 rounded hover:bg-indigo-100"><Minus size={16} /></button>
                      <span className="font-black text-indigo-700 w-8 text-center">{editValues.duration}</span>
                      <button onClick={() => setEditValues(prev => ({ ...prev, duration: prev.duration + 1 }))} className="p-1 bg-slate-100 rounded hover:bg-indigo-100"><Plus size={16} /></button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="p-2 bg-green-500 text-white rounded-lg"><Check size={18} /></button>
                      <button onClick={handleCancelEdit} className="p-2 bg-slate-200 text-slate-500 rounded-lg"><X size={18} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: task.color }}>
                    <IconDisplay icon={task.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-700 truncate">{task.title}</div>
                    <div className="text-xs font-bold text-slate-400">{task.durationMinutes}分</div>
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveTask(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ArrowUp size={14} /></button>
                      <button onClick={() => moveTask(index, 'down')} disabled={index === tasks.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ArrowDown size={14} /></button>
                    </div>
                    <button onClick={() => handleStartEdit(task)} className="p-2 text-slate-400 hover:text-indigo-500"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => {
              const newTask: Task = {
                id: Date.now().toString(),
                title: '新しいタスク',
                durationMinutes: 5,
                icon: TaskIcon.DEFAULT,
                color: '#cbd5e1',
                type: 'flexible'
              };
              setTasks([...tasks, newTask]);
              handleStartEdit(newTask);
            }}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 font-bold flex justify-center items-center gap-2"
          >
            <Plus size={20} /> 追加
          </button>
        </div>
      </div>

      {/* Floating Start Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="text-center mb-2 text-xs font-bold text-slate-500">
          今始めると <span className="text-lg text-slate-800 mx-1">{finishTimeStr}</span> 頃に完了予定
        </div>
        <button
          onClick={onStart}
          className={`w-full py-4 ${theme.primary} ${theme.primaryHover} text-white text-xl font-black rounded-2xl ${theme.shadow} shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 ring-2 ring-white`}
        >
          <Play fill="currentColor" size={24} />
          スタート！
        </button>
      </div>
    </div>
  );
};
