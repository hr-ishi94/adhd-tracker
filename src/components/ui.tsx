import React from 'react';
import { Check, ChevronLeft } from 'lucide-react';

// Illustrations cropped from the design reference, served from /public/art
export const ART = {
  todayHero: '/art/today_hero.png',
  coinJar: '/art/coin_jar.png',
  avatar: '/art/avatar.png',
  profileAvatar: '/art/profile_avatar.png',
  focusMascot: '/art/focus_mascot.png',
  roadmapHero: '/art/roadmap_hero.png',
  eveningHero: '/art/evening_hero.png',
  celebrate: '/art/celebrate.png',
  quoteMascot: '/art/quote_mascot.png',
  chest: '/art/chest.png',
  fire: '/art/fire.png',
  brain: '/art/brain.png',
  coin: '/art/coin.png',
  iconWorkout: '/art/icon_workout.png',
  iconBook: '/art/icon_book.png',
  iconLaptop: '/art/icon_laptop.png',
} as const;

export const CoinIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <img src={ART.coin} alt="" aria-hidden="true" className={`${className} rounded-full object-cover select-none`} />
);

/** Orange-on-honey "+50" reward pill used on priority tickets */
export const CoinPill: React.FC<{ amount: number; muted?: boolean }> = ({ amount, muted }) => (
  <span
    className={`inline-flex items-center justify-center min-w-[52px] px-2.5 py-1 rounded-xl text-sm font-extrabold ${
      muted ? 'bg-warm-200 text-warm-500' : 'bg-gradient-to-b from-honey-300 to-honey-400 text-warm-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
    }`}
  >
    +{amount}
  </span>
);

interface SegmentedTabsProps<T extends string> {
  options: { id: T; label: React.ReactNode }[];
  value: T;
  onChange: (id: T) => void;
  dark?: boolean;
  className?: string;
}

export function SegmentedTabs<T extends string>({ options, value, onChange, dark, className = '' }: SegmentedTabsProps<T>) {
  return (
    <div role="tablist" className={`seg ${dark ? 'seg-dark' : ''} ${className}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`seg-item ${value === o.id ? 'seg-item-active' : ''}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ScreenHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  light?: boolean; // white text for dark / illustrated backgrounds
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, right, onBack, light }) => (
  <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 safe-top">
    <div className="flex items-center gap-2 min-w-0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={`-ml-2 p-1.5 rounded-full ${light ? 'text-white hover:bg-white/10' : 'text-warm-800 dark:text-warm-100 hover:bg-warm-200/60 dark:hover:bg-warm-800'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div className="min-w-0">
        <h1 className={`text-[24px] leading-tight font-extrabold tracking-tight truncate ${light ? 'text-white' : 'text-warm-800 dark:text-warm-50'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${light ? 'text-white/75' : 'text-warm-500 dark:text-warm-400'}`}>{subtitle}</p>
        )}
      </div>
    </div>
    {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
  </header>
);

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, className = '' }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    data-checked={checked}
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`check-box ${className}`}
  >
    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
  </button>
);

export const ProgressBar: React.FC<{ value: number; className?: string; barClassName?: string }> = ({
  value,
  className = 'h-2 bg-warm-200 dark:bg-warm-800',
  barClassName = 'bg-gradient-to-r from-focus-400 to-focus-600',
}) => (
  <div className={`w-full rounded-full overflow-hidden ${className}`}>
    <div className={`h-full rounded-full transition-all duration-500 ${barClassName}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

/** Full-bleed illustrated header that fades into the cream page */
export const HeroBanner: React.FC<{ src: string; className?: string; fade?: boolean; children?: React.ReactNode }> = ({
  src,
  className = 'h-40',
  fade = true,
  children,
}) => (
  <div className={`relative w-full overflow-hidden ${fade ? 'hero-fade' : ''} ${className}`}>
    <img src={src} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

/** Cream page wrapper shared by all tab screens */
export const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-full w-full max-w-md mx-auto flex flex-col pb-28 ${className}`}>{children}</div>
);
