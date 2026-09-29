import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { UnitPreference } from '../types/gym';

interface UnitContextType {
  unit: UnitPreference;
  toggleUnit: () => void;
  weightSteps: number[];
  formatWeight: (val: number | string | undefined) => string;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const unit: UnitPreference = profile?.unit_preference || 'kg';

  const toggleUnit = () => {
    const nextUnit: UnitPreference = unit === 'kg' ? 'lbs' : 'kg';
    updateProfile({ unit_preference: nextUnit });
  };

  // Step increments: Section 4 Rapid-Increment Steppers
  // kg standard: +1.25, +2.5, +5, +10
  // lbs standard: +2.5, +5, +10, +25
  const weightSteps = unit === 'kg' ? [1.25, 2.5, 5, 10] : [2.5, 5, 10, 25];

  const formatWeight = (val: number | string | undefined) => {
    if (val === '' || val === undefined || isNaN(Number(val))) return '';
    const num = Number(val);
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, weightSteps, formatWeight }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) throw new Error('useUnit must be used within UnitProvider');
  return context;
};
