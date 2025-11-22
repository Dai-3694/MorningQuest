
import React, { useState, useEffect } from 'react';
import { RoutineManager } from './components/RoutineManager';
import { Maximize, Minimize } from 'lucide-react';

const App: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50 relative">
      
      {/* Global Fullscreen Toggle - Positioned floating at bottom center or top based on preference */}
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
        />
        
        {/* Child 2 Area (Right) */}
        <RoutineManager 
          childId="child2" 
          initialName="プレイヤー2" 
          themeColor="rose" 
        />
      </div>
    </div>
  );
};

export default App;
