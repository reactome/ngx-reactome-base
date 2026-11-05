import { afterEach, describe, expect, it, vi } from 'vitest';
import cytoscape from 'cytoscape';
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

/**
 * Which nodes get their label shrunk for a structure. An export turns structures
 * off (`--structures: 0`): the structure layers are not part of the drawing, and
 * whether a lazy load had restored a label by the time of the export was chance.
 */
describe('structure containers', () => {
  const containers = (structures: boolean) => {
    const cy = cytoscape({
      headless: true,
      elements: [
        { data: { id: 'p' }, classes: 'Protein' },
        { data: { id: 'm' }, classes: 'Molecule' },
        { data: { id: 'c' }, classes: 'Complex' },
      ],
    });
    // The class's own methods, without the constructor's DOM layers.
    const self: Interactivity = Object.assign(
      Object.create(Interactivity.prototype) as Interactivity,
      {
        cy,
        properties: { features: { structures } },
        withoutStructure: cy.collection(),
      }
    );
    self.updateProteins();
    return self.structureContainers.map((n) => n.id()).sort();
  };

  it('holds the proteins and molecules when structures are shown', () => {
    expect(containers(true)).toEqual(['m', 'p']);
  });

  it('holds nothing when structures are off', () => {
    expect(containers(false)).toEqual([]);
  });
});
