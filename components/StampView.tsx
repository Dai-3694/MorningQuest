import React from 'react';
import { StampCard } from '../types';
import { ArrowLeft, Star, Gift, Medal as MedalIcon } from 'lucide-react';
import { getGrade, getRankClass, getRankTitle, getRankTitleShort, GRADES, CLASSES, getGradeIndex, getClassIndex, isMaxRank, TOTAL_RANKS } from '../rankData';

interface StampViewProps {
    stampCard: StampCard;
    onBack: () => void;
    themeColor: string;
}

export const StampView: React.FC<StampViewProps> = ({ stampCard, onBack, themeColor }) => {
    const totalSlots = 10;
    const currentStamps = stampCard.currentStamps;

    const grade = getGrade(stampCard.rank);
    const rankClass = getRankClass(stampCard.rank);
    const GradeIcon = grade.icon;

    const colorClass = themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600';
    const bgClass = themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50';
    const buttonClass = themeColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600';

    // ランクの進捗計算
    const currentGradeIdx = getGradeIndex(stampCard.rank);
    const currentClassIdx = getClassIndex(stampCard.rank);

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
                <div className="mb-4 flex gap-3 w-full max-w-sm">
                    <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
                        <div className={`p-2 rounded-full ${grade.bg}`}>
                            <div className={grade.stampColor}><GradeIcon size={20} /></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">現在のランク</span>
                            <span className={`text-sm font-black text-slate-700`}>{getRankTitleShort(stampCard.rank)}</span>
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

                {/* Rank Progress - グレード & クラスの進捗表示 */}
                <div className="mb-8 w-full max-w-sm bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ランクの旅</span>
                        <span className="text-xs font-bold text-gray-400">
                            {stampCard.rank + 1} / {TOTAL_RANKS}
                        </span>
                    </div>

                    {/* グレード進捗（動物アイコン並び） */}
                    <div className="flex items-center justify-between mb-3">
                        {GRADES.map((g, idx) => {
                            const Icon = g.icon;
                            const reached = idx <= currentGradeIdx;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                        reached ? g.bg + ' ' + g.stampColor : 'bg-gray-100 text-gray-300'
                                    } ${idx === currentGradeIdx ? 'ring-2 ring-offset-1 ' + g.ringColor : ''}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className={`text-[9px] font-bold ${reached ? 'text-gray-600' : 'text-gray-300'}`}>
                                        {g.emoji}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* クラス進捗（★の数） */}
                    <div className="flex items-center gap-1 justify-center">
                        {CLASSES.map((cls, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                                <Star
                                    size={18}
                                    fill={idx <= currentClassIdx ? 'currentColor' : 'none'}
                                    className={idx <= currentClassIdx ? grade.stampColor : 'text-gray-200'}
                                />
                                <span className={`text-[8px] font-bold ${idx <= currentClassIdx ? 'text-gray-500' : 'text-gray-300'}`}>
                                    {cls.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {isMaxRank(stampCard.rank) && (
                        <div className="mt-3 text-center text-xs font-black text-amber-600 bg-amber-50 py-1 rounded-full">
                            🎊 全称号コンプリート！伝説のおうさま！ 🎊
                        </div>
                    )}
                </div>

                {/* Stamp Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden mb-12">
                    <div className={`absolute top-0 left-0 w-full h-4 ${grade.cardColor}`} />

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
                                        ${isStamped ? (grade.bg + ' border-transparent') : 'border-gray-100 bg-gray-50/50'}
                                    `}
                                >
                                    {isStamped ? (
                                        <div className="animate-bounce-short">
                                            <Star
                                                size={isLast ? 28 : 24}
                                                fill="currentColor"
                                                className={`${grade.stampColor} drop-shadow-sm`}
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
                        {isMaxRank(stampCard.rank)
                            ? `あと ${totalSlots - currentStamps} 個でごほうび！`
                            : `あと ${totalSlots - currentStamps} 個でランクアップ！`
                        }
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
                            {stampCard.medals.slice().reverse().map((medal) => {
                                const medalGrade = getGrade(medal.rankAtTime);
                                const MedalGradeIcon = medalGrade.icon;
                                return (
                                    <div key={medal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
                                        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${medalGrade.bg}`}>
                                            <div className={medalGrade.stampColor}>
                                                <MedalGradeIcon size={20} />
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
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
