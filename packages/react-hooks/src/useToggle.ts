import { useCallback, useState } from 'react';

/**
 * A custom hook accepting a boolean initial state and providing a return state setter function
 * // Example
 * function App() {
 *  // Call the hook which returns, current value and the toggler function
 *  const [isTextChanged, setIsTextChanged] = useToggle();
 *  return (
 *    <button onClick={setIsTextChanged}>{isTextChanged ? 'Toggled' : 'Click to Toggle'}</button>
 *  );
 * }
 * @param initialState boolean value indicating the initial state value being truthy or falsy
 * @returns current truthy/boolean state and the state setter
 */
export default function useToggle(initialState = false): [boolean, () => void] {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState((state) => !state);
  }, []);

  return [state, toggle];
}
