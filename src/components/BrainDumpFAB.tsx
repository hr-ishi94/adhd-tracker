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
      className="btn-primary fixed z-50 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] w-12 h-12 !p-0 rounded-full group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-300"
    >
      <Plus className="w-5 h-5 stroke-[2.75] transition-transform group-hover:rotate-90 duration-200" />
    </button>
  );
};
