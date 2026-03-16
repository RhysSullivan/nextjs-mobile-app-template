'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(durationSeconds: number = 600) {
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemaining(durationSeconds);
    setIsComplete(false);
  }, [durationSeconds, stop]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = 1 - remaining / durationSeconds;

  return {
    isRunning,
    isComplete,
    remaining,
    display,
    progress,
    minutes,
    seconds,
    start,
    stop,
    reset,
  };
}
