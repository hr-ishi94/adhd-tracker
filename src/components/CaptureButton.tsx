import React from 'react';
import { Plus } from 'lucide-react';

export const CaptureButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Capture a thought"
    className="btn-primary fixed z-40 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] w-14 h-14 !p-0 rounded-full"
  >
    <Plus className="w-6 h-6 stroke-[2.75]" />
  </button>
);
