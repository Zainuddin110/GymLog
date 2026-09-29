import React, { useState, useEffect } from 'react';
import { Settings2, Check } from 'lucide-react';

interface EquipmentNotesProps {
  initialNotes: string;
  onSave: (notes: string) => void;
}

export const EquipmentNotes: React.FC<EquipmentNotesProps> = ({
  initialNotes,
  onSave
}) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes]);

  const handleBlur = () => {
    if (notes !== initialNotes) {
      onSave(notes);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 my-3 transition-colors focus-within:border-slate-400 focus-within:bg-white">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5 text-slate-600" />
          <span>Equipment Micro-Notes</span>
        </div>
        {isSavedRecently && (
          <span className="flex items-center gap-1 text-emerald-700 normal-case font-semibold">
            <Check className="w-3 h-3 stroke-[2.5]" /> Auto-saved
          </span>
        )}
      </div>

      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder='e.g., "Seat pin #4, handle notch 2, belt set 3+"'
        className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
      />
    </div>
  );
};
