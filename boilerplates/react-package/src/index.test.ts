import { describe, it, expect, vi } from 'vitest';
import { sayHello } from './index.js';

describe('Unit test: index', () => {
  it('sayHello should print a message', () => {
    const spy = vi.spyOn(global.console, 'info').mockImplementation(() => {});

    sayHello();

    expect(spy.mock.calls.pop()).toEqual(['Hello World!']);
    spy.mockClear();
  });

  it('sayHello should print name in the message', () => {
    const spy = vi.spyOn(global.console, 'info').mockImplementation(() => {});

    sayHello('John');

    expect(spy.mock.calls.pop()).toEqual(['Hello John!']);
    spy.mockClear();
  });
});
