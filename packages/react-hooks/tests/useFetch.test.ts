import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useFetch from '../src/useFetch';

describe('useFetch', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({ ok: true, value: 42 }),
      })) as unknown as typeof fetch
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns data after successful fetch', async () => {
    const { result } = renderHook(() =>
      useFetch<{ ok: boolean; value: number }>('https://example.test/data')
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual({ ok: true, value: 42 });
    expect(result.current.error).toBeNull();
  });

  it('exposes error on rejection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('boom');
      }) as unknown as typeof fetch
    );
    const { result } = renderHook(() => useFetch('https://example.test/x'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });
});
