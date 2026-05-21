import { useEffect } from 'react';

/**
 * A custom hook to execute a function at a given interval
 * @param fn Function to execute at interval
 * @param interval Interval in milliseconds
 */
export default function useInterval(fn: () => void, interval: number) {
  useEffect(() => {
    const id = setInterval(fn, interval);
    return () => {
      clearInterval(id);
    };
  });
}
