import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, CheckCircle } from 'lucide-react';

export const PWAUpdateNotification: React.FC = () => {
  const [showUpdated, setShowUpdated] = useState(false);
  
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('SW registered:', swUrl);
      // 定期的に更新をチェック（1時間ごと）
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  // 自動更新を実行し、完了後に通知を表示
  useEffect(() => {
    if (needRefresh) {
      // 自動で更新を適用
      updateServiceWorker(true).then(() => {
        setShowUpdated(true);
      });
    }
  }, [needRefresh, updateServiceWorker]);

  // オフライン準備完了の通知
  useEffect(() => {
    if (offlineReady) {
      setShowUpdated(true);
    }
  }, [offlineReady]);

  // 通知を3秒後に自動で非表示
  useEffect(() => {
    if (showUpdated) {
      const timer = setTimeout(() => {
        setShowUpdated(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showUpdated]);

  if (!showUpdated) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
      <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg">
        <CheckCircle size={20} />
        <span className="font-bold text-sm">更新しました！</span>
      </div>
    </div>
  );
};
