import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle as lodashThrottle } from 'lodash';
import { throttle } from './throttle';

// Replaces lodash's throttle(fn, wait), so it is held to lodash's behaviour: the
// first call runs at once, calls inside the window run once at its end, and a
// quiet window runs nothing.
describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /** When `fn` ran, for calls made at the given times. */
  function runs(impl: (fn: () => void, wait: number) => () => void, callsAt: number[]) {
    const at: number[] = [];
    const start = Date.now();
    const t = impl(() => at.push(Date.now() - start), 500);
    let now = 0;
    for (const time of callsAt) {
      vi.advanceTimersByTime(time - now);
      now = time;
      t();
    }
    vi.advanceTimersByTime(5000);
    return at;
  }

  const sequences: [string, number[]][] = [
    ['one call', [0]],
    ['a burst', [0, 10, 20, 30]],
    ['steady calls', [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100]],
    ['two bursts apart', [0, 50, 2000, 2050]],
    ['a call just after a window', [0, 499, 501, 1200]],
  ];

  // And some irregular ones, the way render events arrive: fixed seeds, so a
  // failure names a sequence that can be replayed.
  for (const seed of [1, 7, 42, 1234]) {
    let x = seed;
    const next = () => (x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
    const calls: number[] = [];
    let time = 0;
    for (let i = 0; i < 40; i++) calls.push((time += Math.floor(next() * 400)));
    sequences.push([`irregular, seed ${seed}`, calls]);
  }

  for (const [name, calls] of sequences) {
    it(`runs when lodash's does: ${name}`, () => {
      expect(runs(throttle, calls)).toEqual(runs(lodashThrottle, calls));
    });
  }

  /** When `fn` ran when the clock is set back mid-sequence, for each implementation. */
  function runsWithClockBack(impl: (fn: () => void, wait: number) => () => void) {
    vi.setSystemTime(100_000);
    const at: number[] = [];
    const t = impl(() => at.push(Date.now()), 500);
    t();
    vi.advanceTimersByTime(100);
    t();
    // The clock goes back, as a system clock can: lodash treats that as a fresh start.
    vi.setSystemTime(50_000);
    t();
    vi.advanceTimersByTime(5000);
    return at;
  }

  it("runs when lodash's does when the clock goes backwards", () => {
    expect(runsWithClockBack(throttle)).toEqual(runsWithClockBack(lodashThrottle));
  });

  /** When `fn` ran when `fn` itself calls the throttled function, as a render can. */
  function runsReentrant(impl: (fn: () => void, wait: number) => () => void) {
    const start = Date.now();
    const at: number[] = [];
    let depth = 0;
    const t: () => void = impl(() => {
      at.push(Date.now() - start);
      if (depth++ < 3) t();
    }, 500);
    t();
    vi.advanceTimersByTime(5000);
    return at;
  }

  it("runs when lodash's does when fn calls it again", () => {
    expect(runsReentrant(throttle)).toEqual(runsReentrant(lodashThrottle));
  });
});
