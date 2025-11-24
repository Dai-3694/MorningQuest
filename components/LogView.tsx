import React from 'react';
import { MissionLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

interface LogViewProps {
    logs: MissionLog[];
    onBack: () => void;
    themeColor: string;
}

export const LogView: React.FC<LogViewProps> = ({ logs, onBack, themeColor }) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare data for chart (last 7 entries or all if less)
    const chartData = sortedLogs.slice(-14).map(log => ({
        date: new Date(log.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        duration: Math.round(log.totalDurationSeconds / 60),
    }));

    const colorClass = themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600';
    const bgClass = themeColor === 'rose' ? 'bg-rose-100' : 'bg-sky-100';
    const buttonClass = themeColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600';

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
            <div className="p-4 border-b flex items-center gap-4 sticky top-0 bg-white z-10">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-full text-white shadow-md transition-colors ${buttonClass}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className={`text-xl font-bold ${colorClass}`}>きろく</h2>
            </div>

            <div className="p-6 space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${bgClass} flex flex-col items-center justify-center`}>
                        <span className="text-sm font-bold text-gray-600 mb-1">クリア回数</span>
                        <span className={`text-3xl font-black ${colorClass}`}>
                            {logs.filter(l => l.isSuccess).length}
                            <span className="text-sm ml-1 text-gray-500">回</span>
                        </span>
                    </div>
                    <div className={`p-4 rounded-xl ${bgClass} flex flex-col items-center justify-center`}>
                        <span className="text-sm font-bold text-gray-600 mb-1">平均タイム</span>
                        <span className={`text-3xl font-black ${colorClass}`}>
                            {logs.length > 0
                                ? Math.round(logs.reduce((acc, cur) => acc + cur.totalDurationSeconds, 0) / logs.length / 60)
                                : 0}
                            <span className="text-sm ml-1 text-gray-500">分</span>
                        </span>
                    </div>
                </div>

                {/* Chart */}
                {logs.length > 0 && (
                    <div className="bg-white rounded-xl border p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className={colorClass} />
                            <h3 className="font-bold text-gray-700">かかった時間のグラフ</h3>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        unit="分"
                                        width={40}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="duration"
                                        stroke={themeColor === 'rose' ? '#f43f5e' : '#0ea5e9'}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent History List */}
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className={colorClass} />
                        <h3 className="font-bold text-gray-700">さいきんのきろく</h3>
                    </div>
                    <div className="space-y-3">
                        {sortedLogs.slice().reverse().slice(0, 10).map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">
                                        {new Date(log.date).toLocaleDateString('ja-JP')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(log.completedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${log.isSuccess ? 'text-green-500' : 'text-orange-400'}`}>
                                        {log.isSuccess ? 'クリア！' : 'おしい！'}
                                    </span>
                                    <span className="font-mono font-bold text-lg text-gray-700">
                                        {Math.floor(log.totalDurationSeconds / 60)}
                                        <span className="text-xs ml-0.5">分</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                まだきろくがありません
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
