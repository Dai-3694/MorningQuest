
import React, { useState, useEffect } from 'react';
import { MissionMode } from './types';
import { TopScreen } from './components/TopScreen';
import { RoutineManager } from './components/RoutineManager';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { Maximize, Minimize, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [missionMode, setMissionMode] = useState<MissionMode | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  // トップ画面
  if (missionMode === null) {
    return (
      <>
        <PWAUpdateNotification />
        <TopScreen onSelect={(mode) => setMissionMode(mode)} />
        {/* フルスクリーンボタン */}
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800/80 text-white p-2 rounded-full shadow-lg backdrop-blur hover:bg-slate-700 transition-opacity opacity-50 hover:opacity-100"
          title="全画面表示"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </>
    );
  }

  // ミッション画面
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 relative">
      <PWAUpdateNotification />

      {/* トップに戻るボタン */}
      <button
        onClick={() => setMissionMode(null)}
        className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur transition-opacity opacity-60 hover:opacity-100 ${
          missionMode === 'night'
            ? 'bg-indigo-900/80 text-indigo-200 hover:bg-indigo-800'
            : 'bg-slate-800/80 text-white hover:bg-slate-700'
        }`}
        title="トップに戻る"
      >
        <ArrowLeft size={14} />
        {missionMode === 'morning' ? '🌅 朝' : '🌙 夜'}
      </button>

      {/* フルスクリーンボタン */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800/80 text-white p-2 rounded-full shadow-lg backdrop-blur hover:bg-slate-700 transition-opacity opacity-50 hover:opacity-100"
        title="全画面表示"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Child 1 Area (Left) */}
        <RoutineManager
          childId="child1"
          initialName="プレイヤー1"
          themeColor="sky"
          missionMode={missionMode}
        />

        {/* Child 2 Area (Right) */}
        <RoutineManager
          childId="child2"
          initialName="プレイヤー2"
          themeColor="rose"
          missionMode={missionMode}
        />
      </div>
    </div>
  );
};

export default App;
