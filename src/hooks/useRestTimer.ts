import { useState, useEffect, useRef, useCallback } from 'react';
import { playRestCompleteSound, triggerHaptic } from '../lib/audioCues';

export function useRestTimer(defaultSeconds = 90) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onTimerComplete = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
    playRestCompleteSound();
    triggerHaptic([150, 100, 200, 100, 300]);
  }, [clearTimerInterval]);

  const startTimer = useCallback((seconds: number) => {
    clearTimerInterval();
    setInitialDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [clearTimerInterval]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
  }, [clearTimerInterval]);

  const resumeTimer = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }, [isRunning, pauseTimer, resumeTimer]);

  const addSeconds = useCallback((additional: number) => {
    setTimeLeft(prev => {
      const next = Math.max(0, prev + additional);
      if (next > 0 && !isRunning) {
        setIsRunning(true);
      }
      return next;
    });
    setInitialDuration(prev => Math.max(prev, prev + additional));
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
    setTimeLeft(0);
  }, [clearTimerInterval]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      onTimerComplete();
    }

    return () => clearTimerInterval();
  }, [isRunning, timeLeft, onTimerComplete, clearTimerInterval]);

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return {
    timeLeft,
    initialDuration,
    isRunning,
    formattedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    toggleTimer,
    addSeconds,
    stopTimer
  };
}

