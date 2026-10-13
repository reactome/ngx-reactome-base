/**
 * A function that remembers its results, keyed on its first argument or on what
 * `resolver` returns for its arguments -- lodash's memoize, which this replaces.
 *
 * lodash is CommonJS, so a single named import of it carried the whole library
 * (about 73 KB) into every bundle that used this one, the embeddable diagram's
 * included. Nothing else here needed it.
 */
export type Memoized<F extends (...args: never[]) => unknown> = F & {
  /** Every remembered result; clear it to have them computed again. */
  readonly cache: Map<unknown, ReturnType<F>>;
};

export function memoize<F extends (...args: never[]) => unknown>(
  fn: F,
  resolver?: (...args: Parameters<F>) => unknown
): Memoized<F> {
  const cache = new Map<unknown, ReturnType<F>>();
  const memoized = (...args: Parameters<F>): ReturnType<F> => {
    const key = resolver ? resolver(...args) : args[0];
    if (cache.has(key)) return cache.get(key) as ReturnType<F>;
    const result = fn(...args) as ReturnType<F>;
    cache.set(key, result);
    return result;
  };
  return Object.assign(memoized, { cache }) as unknown as Memoized<F>;
}
