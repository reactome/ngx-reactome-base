import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cytoscape from 'cytoscape';
import { Interactivity } from './interactivity';
import { Style } from './style';

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

  it('names a curve of no points', () => {
    expect(() => interpolate(130, [])).toThrow('interpolate: the curve has no points');
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

/**
 * A protein's structure video plays while it is hovered. An interactor's node
 * is named after its accession (`interactor-<acc>`), and a static interactor
 * has no type, so it is a `Protein`; the video was found with a
 * `#video-<node id>` selector, which a ChEBI accession's colon made invalid,
 * so hovering such an interactor threw.
 */
describe('structure video', () => {
  // jsdom cannot draw, and the structure layers need cytoscape's canvas
  // renderer: a context that measures and draws nothing stands in, as in the
  // diagram library's specs. Its target is typed as the smallest context the
  // DOM declares; every other member comes from the proxy.
  beforeEach(() => {
    const context: ImageBitmapRenderingContext = {
      canvas: document.createElement('canvas'),
      transferFromImageBitmap: () => undefined,
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        new Proxy(context, {
          get: (_target, name) =>
            name === 'measureText'
              ? (text: string) => ({ width: text.length * 6 })
              : () => ({ addColorStop: () => undefined, data: [] }),
          set: () => true,
        })
    );
  });
  afterEach(() => vi.restoreAllMocks());

  const hovered = (id: string) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const cy = cytoscape({
      container,
      elements: [
        {
          data: {
            id,
            width: 60,
            height: 20,
            html: `<video loop id="video-${id}"><source src="x.webm" type="video/webm"></video>`,
          },
          classes: 'Protein PhysicalEntity Interactor',
          position: { x: 0, y: 0 },
        },
      ],
    });
    try {
      new Style(container).bindToCytoscape(cy);
      const video = container.querySelector('video');
      if (!video) throw new Error('the video layer drew no video');
      // As loaded, so the handler plays it.
      Object.defineProperty(video, 'readyState', { value: video.HAVE_ENOUGH_DATA });
      const play = vi.spyOn(video, 'play').mockResolvedValue(undefined);
      cy.getElementById(id).emit('mouseover');
      return play;
    } finally {
      cy.destroy();
      container.remove();
    }
  };

  it('plays for a protein', () => {
    expect(hovered('11')).toHaveBeenCalledOnce();
  });

  it('plays for an interactor whose id is not a valid selector', () => {
    expect(hovered('interactor-CHEBI:28304')).toHaveBeenCalledOnce();
  });
});

/**
 * A graph with no container -- headless -- binds when structures are off, the
 * structure layers being the only part that needs a page. Its events were sent
 * to `cy.container()`, which is null there: selecting or hovering an entity, or
 * opening an interactor badge, threw "Cannot read properties of null (reading
 * 'dispatchEvent')", out of the caller's `select()`.
 */
describe('a graph without a container', () => {
  const bound = () => {
    const host = document.createElement('div');
    host.style.setProperty('--structures', '0');
    const cy = cytoscape({
      headless: true,
      elements: [
        { data: { id: 'e', reactomeId: 1 }, classes: 'Protein PhysicalEntity' },
        { data: { id: 'b', reactomeId: 2 }, classes: 'InteractorOccurrences' },
      ],
    });
    new Style(host).bindToCytoscape(cy);
    return cy;
  };

  it('selects an entity', () => {
    const cy = bound();
    expect(() => cy.$id('e').select()).not.toThrow();
    expect(cy.$id('e').selected()).toBe(true);
  });

  it('hovers an entity', () => {
    expect(() => bound().$id('e').emit('mouseover')).not.toThrow();
  });

  it('opens an interactor badge', () => {
    const cy = bound();
    expect(() => cy.$id('b').emit('tap')).not.toThrow();
    expect(cy.$id('b').hasClass('opened')).toBe(true);
  });
});
