import React, { useMemo, useState } from 'react';
import { Settings, Flame, Medal, Lock, CheckCircle2, X } from 'lucide-react';
import type { Streak, HabitQuitTracker, RewardRedemption, Reward } from '../types';
import { REWARDS_CATALOG, HABIT_MILESTONES } from '../lib/storage';
import { ART, CoinIcon, SegmentedTabs, ScreenHeader, Page } from '../components/ui';

interface ProfileScreenProps {
  userName: string;
  coins: number;
  streak: Streak;
  habitTrackers: HabitQuitTracker[];
  redemptions: RewardRedemption[];
  onRedeem: (reward: Reward) => boolean;
  onOpenSettings: () => void;
  onBack: () => void;
}

type ProfileTab = 'store' | 'achievements';

interface Badge {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
}

const STREAK_BADGES = [
  { days: 3, icon: '🔥', title: '3-Day Spark', description: 'Keep a 3 day streak' },
  { days: 7, icon: '⭐', title: 'One Week Strong', description: 'Keep a 7 day streak' },
  { days: 14, icon: '🏅', title: 'Two Week Flow', description: 'Keep a 14 day streak' },
  { days: 30, icon: '🏆', title: 'Monthly Master', description: 'Keep a 30 day streak' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userName,
  coins,
  streak,
  habitTrackers,
  redemptions,
  onRedeem,
  onOpenSettings,
  onBack,
}) => {
  const [tab, setTab] = useState<ProfileTab>('store');
  const [pending, setPending] = useState<Reward | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const badges = useMemo<Badge[]>(() => {
    const best = Math.max(streak.best || 0, streak.current || 0);
    const list: Badge[] = STREAK_BADGES.map((b) => ({
      id: `streak-${b.days}`,
      icon: b.icon,
      title: b.title,
      description: b.description,
      unlocked: best >= b.days,
    }));
    habitTrackers.forEach((t) => {
      HABIT_MILESTONES.forEach((m) => {
        list.push({
          id: `${t.id}-${m.id}`,
          icon: m.badge,
          title: m.title,
          description: `${t.habitName} · ${m.rewardDescription}`,
          unlocked: t.unlockedMilestones.includes(m.id),
        });
      });
    });
    return list;
  }, [streak, habitTrackers]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const sortedBadges = useMemo(
    () => [...badges].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
    [badges]
  );

  const recent = useMemo(
    () => [...redemptions].sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt)).slice(0, 5),
    [redemptions]
  );

  const confirmRedeem = () => {
    if (!pending) return;
    const ok = onRedeem(pending);
    setToast(ok ? `Enjoy your ${pending.title}! 🎉` : 'Not enough coins yet — keep going!');
    setPending(null);
    window.setTimeout(() => setToast(null), 2600);
  };

  const gearButton = (size: 'lg' | 'sm') => (
    <button
      type="button"
      onClick={onOpenSettings}
      aria-label="Settings"
      className={`rounded-full text-warm-700 dark:text-warm-200 hover:bg-warm-200/60 dark:hover:bg-warm-800 ${size === 'lg' ? 'p-2' : 'p-1.5'}`}
    >
      <Settings className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
    </button>
  );

  return (
    <Page>
      <ScreenHeader title="Profile" onBack={onBack} right={gearButton('lg')} />

      <div className="px-5 space-y-4">
        {/* Profile card */}
        <div className="flex items-center gap-3">
          <img
            src={ART.profileAvatar}
            alt=""
            aria-hidden="true"
            className="w-16 h-16 rounded-full object-cover shrink-0 select-none"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-extrabold text-warm-800 dark:text-warm-50 truncate">{userName}</h2>
            <p className="text-xs text-warm-500 dark:text-warm-400">Consistent progress creates a better you.</p>
          </div>
          {gearButton('sm')}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="card p-3 flex flex-col items-center text-center">
            <CoinIcon className="w-6 h-6" />
            <span className="mt-1.5 text-base font-extrabold text-warm-800 dark:text-warm-50">{coins.toLocaleString()}</span>
            <span className="text-[10px] text-warm-500">Coins</span>
          </div>
          <div className="card p-3 flex flex-col items-center text-center">
            <Flame className="w-6 h-6 text-focus-600 fill-focus-400" />
            <span className="mt-1.5 text-base font-extrabold text-warm-800 dark:text-warm-50">{streak.current}</span>
            <span className="text-[10px] text-warm-500">Day streak</span>
          </div>
          <div className="card p-3 flex flex-col items-center text-center">
            <Medal className="w-6 h-6 text-honey-500" />
            <span className="mt-1.5 text-base font-extrabold text-warm-800 dark:text-warm-50">{unlockedCount}</span>
            <span className="text-[10px] text-warm-500">Badges</span>
          </div>
        </div>

        <SegmentedTabs<ProfileTab>
          options={[
            { id: 'store', label: 'Rewards Store' },
            { id: 'achievements', label: 'Achievements' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {toast && (
          <div role="status" className="card-honey px-4 py-2.5 text-sm font-bold text-warm-800 dark:text-honey-100 text-center">
            {toast}
          </div>
        )}

        {tab === 'store' ? (
          <>
            {pending && (
              <div className="card p-4 space-y-3 border-2 border-focus-300 dark:border-focus-700">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-warm-800 dark:text-warm-50">
                    Redeem {pending.title} for {pending.cost.toLocaleString()} coins?
                  </p>
                  <button type="button" onClick={() => setPending(null)} aria-label="Cancel" className="text-warm-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={confirmRedeem} className="btn-primary flex-1">
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPending(null)}
                    className="flex-1 rounded-2xl border border-warm-200 dark:border-warm-700 text-sm font-bold text-warm-700 dark:text-warm-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {REWARDS_CATALOG.map((r) => (
                <div key={r.id} className="card p-3 flex flex-col items-center text-center">
                  <img src={r.image} alt="" aria-hidden="true" className="w-16 h-12 object-contain select-none" />
                  <span className="mt-2 text-[13px] font-bold text-warm-800 dark:text-warm-50">{r.title}</span>
                  <span className="text-[11px] font-semibold text-focus-600">{r.cost.toLocaleString()} coins</span>
                  <button
                    type="button"
                    className="btn-pill mt-2"
                    disabled={coins < r.cost}
                    onClick={() => setPending(r)}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-warm-500 px-1">Recent redemptions</h3>
              {recent.length === 0 ? (
                <p className="text-xs text-warm-500 px-1">No rewards redeemed yet. You've earned a treat soon!</p>
              ) : (
                <div className="card divide-y divide-warm-200/70 dark:divide-warm-800">
                  {recent.map((red) => {
                    const reward = REWARDS_CATALOG.find((r) => r.id === red.rewardId);
                    return (
                      <div key={red.id} className="flex items-center gap-3 px-3.5 py-2.5">
                        {reward && <img src={reward.image} alt="" aria-hidden="true" className="w-9 h-6 object-contain" />}
                        <span className="flex-1 text-[13px] font-semibold text-warm-800 dark:text-warm-100">
                          {reward?.title ?? 'Reward'}
                        </span>
                        <span className="text-[11px] text-warm-500">{formatDate(red.redeemedAt)}</span>
                        <span className="text-[11px] font-bold text-focus-600">-{red.cost.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {sortedBadges.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-3 p-3 rounded-2xl ${
                  b.unlocked ? 'card-honey' : 'card opacity-60 grayscale'
                }`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl ${
                    b.unlocked ? 'bg-white/70' : 'bg-warm-200 dark:bg-warm-800'
                  }`}
                >
                  {b.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-warm-800 dark:text-warm-50 truncate">{b.title}</p>
                  <p className="text-[11px] text-warm-500 dark:text-warm-400 truncate">{b.description}</p>
                </div>
                {b.unlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-warm-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
};
