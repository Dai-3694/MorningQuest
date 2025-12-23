import React from 'react';
import { StampCard } from '../types';
import { ArrowLeft, Star, Gift, Feather, Crown, Trophy, Medal as MedalIcon } from 'lucide-react';

interface StampViewProps {
    stampCard: StampCard;
    onBack: () => void;
    themeColor: string;
}

export const StampView: React.FC<StampViewProps> = ({ stampCard, onBack, themeColor }) => {
    const totalSlots = 10;
    const currentStamps = stampCard.currentStamps;

    const rankThemes = [
        { title: 'ひよこポエム級', icon: <Feather size={20} />, cardColor: 'bg-yellow-400', stampColor: 'text-yellow-500', bg: 'bg-yellow-50' },
        { title: 'うさぎジャンプ級', icon: <Star size={20} />, cardColor: 'bg-sky-400', stampColor: 'text-sky-500', bg: 'bg-sky-50' },
        { title: 'ライオンパワー級', icon: <Trophy size={20} />, cardColor: 'bg-orange-400', stampColor: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'おうさまマスター級', icon: <Crown size={20} />, cardColor: 'bg-indigo-600', stampColor: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    const currentTheme = rankThemes[stampCard.rank] || rankThemes[0];

    const colorClass = themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600';
    const bgClass = themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50';
    const buttonClass = themeColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600';

    return (
        <div className={`flex-1 flex flex-col h-full ${bgClass} overflow-y-auto pb-10`}>
            <div className="p-4 flex items-center gap-4 sticky top-0 z-10 bg-inherit/80 backdrop-blur-sm">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-full text-white shadow-md transition-colors ${buttonClass}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className={`text-xl font-bold ${colorClass}`}>スタンプとメダル</h2>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center">

                {/* Rank & Reward Summary */}
                <div className="mb-8 flex gap-3 w-full max-w-sm">
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                        <div className={`p-2 rounded-full ${currentTheme.bg}`}>
                            <div className={currentTheme.stampColor}>{currentTheme.icon}</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">現在のランク</span>
                            <span className={`text-sm font-black text-slate-700`}>{currentTheme.title}</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                        <div className={`p-2 rounded-full ${themeColor === 'rose' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                            <Gift className={colorClass} size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ごほうび</span>
                            <span className={`text-sm font-black text-slate-700`}>{stampCard.totalRewards}回</span>
                        </div>
                    </div>
                </div>

                {/* Stamp Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden mb-12">
                    <div className={`absolute top-0 left-0 w-full h-4 ${currentTheme.cardColor}`} />

                    <h3 className="text-center font-bold text-gray-700 mb-6 mt-2 text-lg">
                        あさのミッション・スタンプ
                    </h3>

                    <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: totalSlots }).map((_, idx) => {
                            const isStamped = idx < currentStamps;
                            const isLast = idx === totalSlots - 1;

                            return (
                                <div
                                    key={idx}
                                    className={`
                                        aspect-square relative rounded-xl border-2 border-dashed flex items-center justify-center
                                        ${isStamped ? (currentTheme.bg + ' border-transparent') : 'border-gray-100 bg-gray-50/50'}
                                    `}
                                >
                                    {isStamped ? (
                                        <div className="animate-bounce-short">
                                            <Star
                                                size={isLast ? 28 : 24}
                                                fill="currentColor"
                                                className={`${currentTheme.stampColor} drop-shadow-sm`}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-200 font-black text-sm">{idx + 1}</span>
                                    )}

                                    {isLast && !isStamped && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                            <Gift size={24} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-400 font-bold">
                        あと {totalSlots - currentStamps} 個でランクアップ！
                    </div>
                </div>

                {/* Medals Collection */}
                <div className="w-full max-w-sm space-y-4">
                    <h3 className={`font-black text-lg ${colorClass} flex items-center gap-2`}>
                        <MedalIcon size={24} />
                        メダルコレクション
                    </h3>

                    {stampCard.medals.length === 0 ? (
                        <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                            <p className="text-gray-400 font-bold">10回達成してメダルをあつめよう！</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stampCard.medals.slice().reverse().map((medal) => (
                                <div key={medal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${rankThemes[medal.rankAtTime]?.bg || 'bg-gray-50'}`}>
                                        <div className={rankThemes[medal.rankAtTime]?.stampColor || 'text-gray-400'}>
                                            {rankThemes[medal.rankAtTime]?.icon || <Star size={24} />}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-slate-700 text-sm">{medal.title}</h4>
                                            <span className="text-[10px] font-bold text-gray-400">{medal.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                            "{medal.comment}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
