import React, { useState, useEffect } from 'react';
import { ChildState, ChildProfile, AgeGroup, createDefaultProfile } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface PlayerSettingsProps {
  label: string;
  themeColor: 'sky' | 'rose';
  profile: ChildProfile;
  onChange: (updated: ChildProfile) => void;
}

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  'elementary-lower': '小学校低学年',
  'elementary-upper': '小学校高学年',
  'junior-high': '中学',
};

const PlayerSettings: React.FC<PlayerSettingsProps> = ({ label, themeColor, profile, onChange }) => {
  const accent = themeColor === 'rose' ? 'text-rose-600' : 'text-sky-600';
  const border = themeColor === 'rose' ? 'border-rose-300 focus:border-rose-500' : 'border-sky-300 focus:border-sky-500';
  const badgeBg = themeColor === 'rose' ? 'bg-rose-400' : 'bg-sky-400';
  const toggleOn = themeColor === 'rose' ? 'bg-rose-500' : 'bg-sky-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* プレイヤーラベル */}
      <div className={`px-4 py-2 ${badgeBg} text-white font-bold text-sm`}>{label}</div>

      <div className="p-4 space-y-4">
        {/* 名前 */}
        <div>
          <label className={`block text-xs font-bold ${accent} mb-1`}>なまえ</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl border ${border} text-slate-800 font-bold focus:ring-0 text-base`}
            maxLength={20}
          />
        </div>

        {/* 年齢区分 */}
        <div>
          <label className={`block text-xs font-bold ${accent} mb-1`}>ねんれい区分</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(AGE_GROUP_LABELS) as AgeGroup[]).map((ag) => (
              <button
                key={ag}
                onClick={() => onChange({ ...profile, ageGroup: ag })}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
                  profile.ageGroup === ag
                    ? `${badgeBg} text-white border-transparent`
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {AGE_GROUP_LABELS[ag]}
              </button>
            ))}
          </div>
        </div>

        {/* 早起きボーナス */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-bold ${accent}`}>早起きボーナス</label>
            <button
              onClick={() =>
                onChange({
                  ...profile,
                  bonusSettings: { ...profile.bonusSettings, enabled: !profile.bonusSettings.enabled },
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                profile.bonusSettings.enabled ? toggleOn : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  profile.bonusSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 早起き時刻（ボーナスON時のみ表示） */}
          {profile.bonusSettings.enabled && (
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500">ボーナス時刻</span>
              <input
                type="time"
                value={profile.bonusSettings.earlyBirdTime}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    bonusSettings: { ...profile.bonusSettings, earlyBirdTime: e.target.value },
                  })
                }
                className="text-xl font-black text-slate-800 bg-transparent focus:outline-none focus:ring-0 border-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingsScreenProps {
  onBack: () => void;
}

const CHILD_IDS = ['child1', 'child2'] as const;
const CHILD_LABELS = { child1: 'プレイヤー1', child2: 'プレイヤー2' };
const CHILD_THEMES: Record<string, 'sky' | 'rose'> = { child1: 'sky', child2: 'rose' };
const CHILD_DEFAULT_NAMES: Record<string, string> = { child1: 'プレイヤー1', child2: 'プレイヤー2' };

/** localStorage から ChildProfile を読み込む（マイグレーション付き） */
function loadProfile(childId: string): ChildProfile {
  const defaultName = CHILD_DEFAULT_NAMES[childId] ?? childId;
  try {
    const saved = localStorage.getItem(`mq_state_${childId}`);
    if (!saved) return createDefaultProfile(defaultName);
    const parsed: ChildState = JSON.parse(saved);
    if (parsed.profile) {
      // profile が存在する場合はデフォルトとマージして欠損フィールドを補完（undefined 値は除外）
      const defaults = createDefaultProfile(parsed.name || defaultName);
      return {
        name: parsed.profile.name || defaults.name,
        ageGroup: parsed.profile.ageGroup ?? defaults.ageGroup,
        bonusSettings: {
          enabled: parsed.profile.bonusSettings?.enabled ?? defaults.bonusSettings.enabled,
          earlyBirdTime: parsed.profile.bonusSettings?.earlyBirdTime ?? defaults.bonusSettings.earlyBirdTime,
        },
      };
    }
    // 旧データ: name のみある場合
    return createDefaultProfile(parsed.name || defaultName);
  } catch {
    return createDefaultProfile(defaultName);
  }
}

/** localStorage に ChildProfile を保存 */
function saveProfile(childId: string, profile: ChildProfile): void {
  const key = `mq_state_${childId}`;
  try {
    const saved = localStorage.getItem(key);
    const base: Partial<ChildState> = saved ? JSON.parse(saved) : {};
    const updated: ChildState = {
      ...base,
      name: profile.name,
      profile,
      tasks: base.tasks ?? [],
      nightTasks: base.nightTasks ?? [],
      departureTime: base.departureTime ?? '08:00',
      bedTime: base.bedTime ?? '21:00',
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // 保存失敗時は無視
  }
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<Record<string, ChildProfile>>(() =>
    Object.fromEntries(CHILD_IDS.map((id) => [id, loadProfile(id)]))
  );
  const [saved, setSaved] = useState(false);

  const handleChange = (childId: string, updated: ChildProfile) => {
    setProfiles((prev) => ({ ...prev, [childId]: updated }));
    setSaved(false);
  };

  const handleSave = () => {
    CHILD_IDS.forEach((id) => saveProfile(id, profiles[id]));
    setSaved(true);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-indigo-950 via-slate-800 to-slate-900 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 backdrop-blur border-b border-slate-700">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-black text-lg tracking-wide">設定</h1>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {CHILD_IDS.map((id) => (
          <PlayerSettings
            key={id}
            label={CHILD_LABELS[id]}
            themeColor={CHILD_THEMES[id]}
            profile={profiles[id]}
            onChange={(updated) => handleChange(id, updated)}
          />
        ))}
      </div>

      {/* 保存ボタン */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-700">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saved ? '保存しました ✓' : '設定を保存する'}
        </button>
      </div>
    </div>
  );
};
