/**
 * `fn`, run at most once every `wait` milliseconds: lodash's throttle(fn, wait),
 * which this replaces (see memoize.ts for why).
 *
 * A port of lodash's algorithm -- its throttle is its debounce with `leading`,
 * `trailing` and `maxWait = wait` -- rather than a simpler timer. The first call
 * runs at once; calls inside a window run `fn` once more when it ends; and a
 * window's end follows the last call, as lodash's does. throttle.spec.ts holds
 * the two to the same timings.
 */
export function throttle(fn: () => void, wait: number): () => void {
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;

  const invoke = (time: number) => {
    pending = false;
    lastInvokeTime = time;
    fn();
  };

  const shouldInvoke = (time: number) => {
    if (lastCallTime === undefined) return true;
    const sinceCall = time - lastCallTime;
    return sinceCall >= wait || sinceCall < 0 || time - lastInvokeTime >= wait;
  };

  const remainingWait = (time: number) =>
    Math.min(wait - (time - (lastCallTime ?? time)), wait - (time - lastInvokeTime));

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      timer = undefined;
      if (pending) invoke(time);
      return;
    }
    timer = setTimeout(timerExpired, remainingWait(time));
  };

  return () => {
    const time = Date.now();
    const invoking = shouldInvoke(time);
    pending = true;
    lastCallTime = time;
    if (invoking) {
      if (timer === undefined) {
        lastInvokeTime = time;
        timer = setTimeout(timerExpired, wait);
        invoke(time);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(timerExpired, wait);
      invoke(time);
      return;
    }
    timer ??= setTimeout(timerExpired, wait);
  };
}
