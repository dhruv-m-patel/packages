import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useToggle from '../src/useToggle';

describe('useToggle', () => {
  it('starts false by default', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('flips value on toggle()', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(false);
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });
});
