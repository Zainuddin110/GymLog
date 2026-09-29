import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock(autoRequest = false) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockSentinelRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }
    try {
      if (!wakeLockSentinelRef.current) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          setIsLocked(false);
          wakeLockSentinelRef.current = null;
        });
        wakeLockSentinelRef.current = sentinel;
        setIsLocked(true);
      }
      return true;
    } catch (err: any) {
      // Wake lock can fail if battery saver is on or document isn't active
      console.warn('Wake Lock request error:', err?.message || err);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch (err) {
        console.warn('Wake lock release error:', err);
      }
      wakeLockSentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestWakeLock();
    }

    // Re-acquire wake lock on tab refocus if autoRequest is true
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRequest && !wakeLockSentinelRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [autoRequest, requestWakeLock, releaseWakeLock]);

  return { isLocked, requestWakeLock, releaseWakeLock };
}

