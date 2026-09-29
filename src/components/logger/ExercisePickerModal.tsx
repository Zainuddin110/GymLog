import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { Exercise } from '../../types/gym';
import { Search, X, Plus } from 'lucide-react';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onOpenCreateNew: () => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  onOpenCreateNew
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      db.exercises.toArray().then(setExercises);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Push', 'Pull', 'Legs', 'Arms', 'Core'];

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.split_type === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Exercise</h3>
            <p className="text-xs text-slate-500 mt-0.5">Add an exercise to your active workout</p>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & Category filters */}
        <div className="p-4 sm:p-5 space-y-3.5 border-b border-slate-200 bg-slate-50/70">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercise..."
              className="w-full min-h-touch pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 text-xs shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No exercises found matching &quot;{search}&quot;.
            </div>
          ) : (
            filtered.map(ex => (
              <div
                key={ex.id}
                onClick={() => {
                  onSelectExercise(ex);
                  onClose();
                }}
                className="pt-2.5 first:pt-0 cursor-pointer group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ex.split_type}
                    </span>
                    {ex.machine_settings && (
                      <span className="text-xs text-slate-400 truncate max-w-[220px]">
                        • {ex.machine_settings}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="min-h-touch min-w-touch h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Create custom exercise */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80">
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="w-full min-h-touch h-11 rounded-xl border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Custom Exercise
          </button>
        </div>
      </div>
    </div>
  );
};
