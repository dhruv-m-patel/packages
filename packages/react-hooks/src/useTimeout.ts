import { useEffect } from 'react';

/**
 * A custom hook to execute a function at a given timeout
 * @param fn Function to execute at a timeout
 * @param timeout timeout in milliseconds
 */
export default function useTimeout(fn: () => void, timeout: number) {
  useEffect(() => {
    const id = setTimeout(fn, timeout);
    return () => {
      clearTimeout(id);
    };
  });
}
