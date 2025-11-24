import React from 'react';
import { StampCard } from '../types';
import { ArrowLeft, Star, Gift } from 'lucide-react';

interface StampViewProps {
    stampCard: StampCard;
    onBack: () => void;
    themeColor: string;
}

export const StampView: React.FC<StampViewProps> = ({ stampCard, onBack, themeColor }) => {
    const totalSlots = 10;
    const currentStamps = stampCard.currentStamps;

    const colorClass = themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600';
    const bgClass = themeColor === 'rose' ? 'bg-rose-50' : 'bg-sky-50';
    const buttonClass = themeColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-sky-500 hover:bg-sky-600';
    const stampColor = themeColor === 'rose' ? 'text-rose-500' : 'text-sky-500';

    return (
        <div className={`flex-1 flex flex-col h-full ${bgClass} overflow-y-auto`}>
            <div className="p-4 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-full text-white shadow-md transition-colors ${buttonClass}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className={`text-xl font-bold ${colorClass}`}>スタンプカード</h2>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center">

                {/* Reward Counter */}
                <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 w-full max-w-xs justify-center">
                    <div className={`p-2 rounded-full ${themeColor === 'rose' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                        <Gift className={colorClass} size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500">もらったごほうび</span>
                        <span className={`text-2xl font-black ${colorClass}`}>{stampCard.totalRewards}回</span>
                    </div>
                </div>

                {/* Stamp Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm aspect-[3/4] flex flex-col relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-4 ${themeColor === 'rose' ? 'bg-rose-400' : 'bg-sky-400'}`} />

                    <h3 className="text-center font-bold text-gray-700 mb-6 mt-2 text-lg">
                        朝のミッション クリア！
                    </h3>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {Array.from({ length: totalSlots }).map((_, idx) => {
                            const isStamped = idx < currentStamps;
                            const isLast = idx === totalSlots - 1;

                            return (
                                <div
                                    key={idx}
                                    className={`
                    relative rounded-xl border-2 border-dashed flex items-center justify-center
                    ${isStamped ? (themeColor === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-sky-200 bg-sky-50') : 'border-gray-200'}
                  `}
                                >
                                    {isStamped ? (
                                        <div className="animate-bounce-short">
                                            <Star
                                                size={isLast ? 48 : 32}
                                                fill="currentColor"
                                                className={`${stampColor} drop-shadow-sm`}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 font-bold text-xl">{idx + 1}</span>
                                    )}

                                    {isLast && !isStamped && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                            <Gift size={40} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-400 font-medium">
                        あと {totalSlots - currentStamps} 個でごほうび！
                    </div>
                </div>
            </div>
        </div>
    );
};
