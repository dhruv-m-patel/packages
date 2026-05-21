import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to set variable value to true or false when a key gets pressed
 * @param targetKey event.Key to compare.
 * reference: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 * @returns state value indicating whether target key was pressed or not
 */
export default function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    },
    [targetKey]
  );

  const upHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    },
    [targetKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
}
