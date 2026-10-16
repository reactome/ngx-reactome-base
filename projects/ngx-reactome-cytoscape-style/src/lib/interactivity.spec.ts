import { afterEach, describe, expect, it, vi } from 'vitest';
import { Interactivity } from './interactivity';

/**
 * The zoom curves' interpolation. It used `if (y) return y`, so an exact 0 --
 * the curves' own 0-valued points: shadow and trivial opacity at 40%, structure
 * opacity at 130% -- read as "not in this segment", ran on to
 * console.assert(false), and a curve of one point returned 0, not its value.
 */
const interpolate = (x: number, points: { x: number; y: number }[]) =>
  Interactivity.prototype.interpolate.call(
    { lerp: Interactivity.prototype.lerp } as unknown as Interactivity,
    x,
    // The curve's points are P, an unexported [x, y] array with x and y
    // getters; interpolate reads only those.
    points as never
  );

describe('interpolate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('answers an exact 0 without asserting', () => {
    const assert = vi.spyOn(console, 'assert');
    expect(
      interpolate(130, [
        { x: 130, y: 0 },
        { x: 150, y: 100 },
      ])
    ).toBe(0);
    expect(
      interpolate(40, [
        { x: 20, y: 100 },
        { x: 40, y: 0 },
        { x: 60, y: 100 },
      ])
    ).toBe(0);
    expect(assert).not.toHaveBeenCalledWith(false, expect.anything());
  });

  it('gives a curve of one point its value', () => {
    expect(interpolate(130, [{ x: 130, y: 50 }])).toBe(50);
  });

  it('interpolates between points as before', () => {
    expect(
      interpolate(140, [
        { x: 130, y: 0 },
        { x: 150, y: 100 },
      ])
    ).toBe(50);
    expect(
      interpolate(10, [
        { x: 20, y: 7 },
        { x: 40, y: 9 },
      ])
    ).toBe(7);
    expect(
      interpolate(90, [
        { x: 20, y: 7 },
        { x: 40, y: 9 },
      ])
    ).toBe(9);
  });
});
