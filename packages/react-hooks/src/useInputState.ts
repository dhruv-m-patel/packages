import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';

/**
 * This hook helps when state variables are bound to inputs (text, passwords, etc). It creates and returns
 * a function as the second value, which can be passed to onChange right away.
 *
 * @param initialState
 * @returns
 */
export default function useInputState(
  initialState: string | (() => string),
  trim = true
): [
  string,
  ChangeEventHandler<HTMLInputElement>,
  Dispatch<SetStateAction<string>>,
] {
  const [value, setValue] = useState<string>(initialState);
  const handleInputCallback = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (trim) {
        setValue(event.target?.value.trim());
      } else {
        setValue(event.target?.value);
      }
    },
    [setValue]
  );
  return [value, handleInputCallback, setValue];
}
