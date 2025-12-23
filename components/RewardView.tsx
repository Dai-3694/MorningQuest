import React, { useEffect, useState } from 'react';
import { Medal, MissionLog } from '../types';
import { Trophy, Star, Feather, Crown, Gift, ArrowRight } from 'lucide-react';
import { generateRewardComment } from '../services/geminiService';

interface RewardViewProps {
    childName: string;
    rank: number;
    logs: MissionLog[];
    onAccept: (medal: Medal) => void;
}

export const RewardView: React.FC<RewardViewProps> = ({ childName, rank, logs, onAccept }) => {
    const [comment, setComment] = useState<string>('メッセージを作成中...');
    const [showContent, setShowContent] = useState(false);

    const rankInfo = [
        { title: 'ひよこポエム級', icon: <Feather size={48} />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { title: 'うさぎジャンプ級', icon: <Star size={48} />, color: 'text-sky-500', bg: 'bg-sky-50' },
        { title: 'ライオンパワー級', icon: <Trophy size={48} />, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'おうさまマスター級', icon: <Crown size={48} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ][rank] || { title: 'すごい！', icon: <Star size={48} />, color: 'text-rose-500', bg: 'bg-rose-50' };

    useEffect(() => {
        const fetchComment = async () => {
            const msg = await generateRewardComment(childName, logs);
            setComment(msg);
            setShowContent(true);
        };
        fetchComment();
    }, [childName, logs]);

    const handleGotIt = () => {
        const newMedal: Medal = {
            id: `medal-${Date.now()}`,
            title: rankInfo.title,
            date: new Date().toLocaleDateString('ja-JP'),
            comment: comment,
            rankAtTime: rank
        };
        onAccept(newMedal);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
            {/* Celebration Background Animation (Simplified) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-bounce opacity-20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            color: ['#fbbf24', '#38bdf8', '#f87171', '#a78bfa'][i % 4]
                        }}
                    >
                        <Star size={Math.random() * 20 + 20} fill="currentColor" />
                    </div>
                ))}
            </div>

            <div className={`w-full max-w-md ${showContent ? 'animate-in fade-in zoom-in duration-500' : 'opacity-0'} flex flex-col items-center text-center space-y-8 z-10`}>
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full ${rankInfo.bg} flex items-center justify-center shadow-2xl border-4 border-white ring-4 ring-offset-2 ring-amber-400 animate-pulse`}>
                        {rankInfo.icon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg">
                        <Gift size={24} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800">10回達成！</h2>
                    <p className={`text-xl font-bold ${rankInfo.color} flex items-center justify-center gap-2`}>
                        ランクアップ：{rankInfo.title}
                    </p>
                </div>

                <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200 shadow-inner relative mt-6">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border-2 border-amber-200 text-xs font-black text-amber-600">
                        ひみつのメッセージ
                    </div>
                    <p className="text-slate-700 font-bold leading-relaxed text-lg">
                        {comment}
                    </p>
                </div>

                <div className="w-full pt-8">
                    <button
                        onClick={handleGotIt}
                        className="w-full py-5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        <span>メダルをもらう！</span>
                        <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
