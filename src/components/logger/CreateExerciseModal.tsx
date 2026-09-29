import React, { useState } from 'react';
import { Exercise, SplitType } from '../../types/gym';
import { SyncManager } from '../../lib/syncManager';
import { X, Check } from 'lucide-react';

interface CreateExerciseModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
}

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  userId,
  onClose,
  onCreated
}) => {
  const [name, setName] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('Push');
  const [machineSettings, setMachineSettings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const newEx: Exercise = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: name.trim(),
        split_type: splitType,
        machine_settings: machineSettings.trim(),
        created_at: new Date().toISOString()
      };

      await SyncManager.saveCustomExercise(newEx, userId);
      onCreated(newEx);
      setName('');
      setMachineSettings('');
      onClose();
    } catch (err) {
      console.error('Failed to create exercise:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const splits: SplitType[] = ['Push', 'Pull', 'Legs', 'Arms', 'Core'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Create Custom Exercise</h3>
          <button
            onClick={onClose}
            className="min-h-touch h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Incline Machine Chest Press"
              className="w-full min-h-touch px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-xs shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Split Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {splits.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSplitType(s)}
                  className={`min-h-[40px] px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    splitType === s
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Equipment Micro-Notes
            </label>
            <input
              type="text"
              value={machineSettings}
              onChange={e => setMachineSettings(e.target.value)}
              placeholder="e.g. Seat pin 4, grip notch 2"
              className="w-full min-h-touch px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white text-xs shadow-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full min-h-touch h-12 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Custom Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
