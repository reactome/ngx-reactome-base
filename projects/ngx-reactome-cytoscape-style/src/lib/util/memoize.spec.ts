import { describe, expect, it, vi } from 'vitest';
import { memoize as lodashMemoize } from 'lodash';
import { memoize } from './memoize';

// Replaces lodash's memoize, so it is held to lodash's behaviour.
/** What both offer, so the same checks run against each. */
type Impl = <F extends (...args: never[]) => unknown>(
  fn: F,
  resolver?: (...args: Parameters<F>) => unknown
) => F & { cache: { clear(): void } };

describe('memoize', () => {
  for (const [name, impl] of [
    ['lodash', lodashMemoize as unknown as Impl],
    ['ours', memoize as Impl],
  ] as const) {
    it(`${name}: keys on the first argument by default`, () => {
      const fn = vi.fn((_a: object, b: number) => b);
      const m = impl(fn);
      const key = {};
      expect(m(key, 1)).toBe(1);
      expect(m(key, 2)).toBe(1);
      expect(m({}, 3)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it(`${name}: keys on what the resolver returns`, () => {
      const fn = vi.fn((_p: object, size: { w: number }) => size.w * 2);
      const m = impl(fn, (_p: object, size: { w: number }) => `${size.w}`);
      expect(m({}, { w: 2 })).toBe(4);
      expect(m({}, { w: 2 })).toBe(4);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it(`${name}: computes again once its cache is cleared`, () => {
      const fn = vi.fn((a: string) => a.length);
      const m = impl(fn);
      m('abc');
      m.cache.clear();
      m('abc');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it(`${name}: remembers an undefined result`, () => {
      const fn = vi.fn((_a: string) => undefined);
      const m = impl(fn);
      m('x');
      m('x');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});
