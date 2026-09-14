import React from 'react';
import { Plus } from 'lucide-react';

interface BrainDumpFABProps {
  onClick: () => void;
}

export const BrainDumpFAB: React.FC<BrainDumpFABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Quick Brain Dump"
      title="Quick Brain Dump"
      className="fixed z-50 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] flex items-center justify-center w-12 h-12 bg-warm-900 dark:bg-warm-100 text-white dark:text-warm-900 rounded-full shadow-lifted hover:scale-105 active:scale-95 transition-all duration-200 group focus-visible:ring-4 focus-visible:ring-focus-400"
    >
      <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
    </button>
  );
};
