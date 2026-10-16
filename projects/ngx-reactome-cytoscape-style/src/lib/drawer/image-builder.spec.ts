import { describe, expect, it } from 'vitest';
import cytoscape from 'cytoscape';
import chroma from 'chroma-js';
import { Style } from '../style';
import { clearDrawersCache, CROSS, imageBuilder, OMMITED_ICON } from './image-builder';
import { Properties } from '../properties';

/**
 * The image builder's caches.
 *
 * Diagram node ids are small numbers that every diagram reuses, and the caches
 * are shared by every Style on the page. A cache keyed on the id alone hands
 * one diagram's drawing to another: two embedded diagrams, the compare view,
 * a diagram after navigation.
 */

function aStyle() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const style = new Style(container);
  // As loadAnalysis sets it, without the rest of what loadAnalysis does.
  style.currentPalette = chroma.scale(['#0000ff', '#ff0000']);
  return style;
}

type NodeSpec = {
  id?: string;
  width: number;
  height: number;
  classes?: string[];
  exp?: unknown;
  kind?: string;
};

function aNode({ id = '1', width, height, classes = [], exp, kind = 'Complex' }: NodeSpec) {
  const cy = cytoscape({
    headless: true,
    elements: [
      {
        data: { id, width, height, displayName: 'X', ...(exp ? { exp } : {}) },
        classes: [kind, 'PhysicalEntity', ...classes],
      },
    ],
  });
  return cy.getElementById(id);
}

const images = (style: Style, node: cytoscape.NodeSingular) =>
  imageBuilder(style.properties, style)(node)['background-image'] as string[];

describe('the image builder', () => {
  it("does not hand one diagram's drawing to another node with the same id", () => {
    clearDrawersCache();
    const small = aNode({ width: 100, height: 40 });
    const large = aNode({ width: 300, height: 120 });
    images(aStyle(), small);
    const afterSmall = images(aStyle(), large);

    clearDrawersCache();
    const alone = images(aStyle(), large);
    // Drawn on its own, or after a smaller node with the same id: the same.
    expect(afterSmall).toEqual(alone);
  });

  it('does not change a cached drawing when it adds an analysis gradient', () => {
    clearDrawersCache();
    const style = aStyle();
    const exp = [0.2, 0.8];
    const plain = images(style, aNode({ id: '2', width: 100, height: 40, exp }));
    // The same node hovered: a new combination of classes, so drawn again
    // from the same cached drawer.
    const hovered = images(
      style,
      aNode({ id: '2', width: 100, height: 40, exp, classes: ['hover'] })
    );
    const patterns = (layers: string[]) =>
      layers.map((l) => decodeURIComponent(l).split('<pattern id="gradient"').length - 1);
    expect(Math.max(...patterns(plain)), 'a gradient is drawn').toBe(1);
    // One gradient per layer that has one -- not one more for every redraw.
    expect(Math.max(...patterns(hovered))).toBe(1);
  });

  it("colours a node by its own analysis values, not another node's with the same id", () => {
    clearDrawersCache();
    const palette = chroma.scale(['#0000ff', '#ff0000']);
    const colours = (layers: string[]) =>
      layers.flatMap((l) =>
        [...decodeURIComponent(l).matchAll(/<rect fill="(#[0-9a-f]{6})"/g)].map((m) => m[1])
      );
    const low = colours(images(aStyle(), aNode({ id: '3', width: 100, height: 40, exp: [0.05] })));
    expect(low, 'the gradient is drawn, in its own colour').toEqual([palette(0.05).hex()]);
    const high = colours(images(aStyle(), aNode({ id: '3', width: 100, height: 40, exp: [0.95] })));
    expect(high).toEqual([palette(0.95).hex()]);
  });

  it('draws a polymer as its offset copy behind the shape, once', () => {
    clearDrawersCache();
    const style = aStyle();
    const plain = images(style, aNode({ id: '4', width: 100, height: 40 }));
    const polymer = images(style, aNode({ id: '5', width: 100, height: 40, classes: ['Polymer'] }));
    const shadows = polymer.filter((l) => decodeURIComponent(l).includes('style="filter:'));
    expect(shadows.length, 'an offset copy').toBeGreaterThan(0);
    // The shape's own layers once, behind them its offset copies: not the shape
    // drawn twice over.
    expect(polymer.length).toBe(plain.length + shadows.length);
  });

  // A protein, molecule or RNA draws its body with the node's own shape, so
  // its background layer is optional -- never drawn as a layer. The offset
  // copy behind a polymer of one was skipped with it, so every such polymer,
  // and the legend's Polymer key, looked like a single plain entity (review
  // of the changes since WebsiteAngular #373).
  for (const kind of ['Protein', 'Molecule', 'RNA']) {
    it(`draws a polymer of a ${kind} with its offset copy, the shape once`, () => {
      clearDrawersCache();
      const style = aStyle();
      const plain = images(style, aNode({ id: '6', width: 100, height: 40, kind }));
      const polymer = images(
        style,
        aNode({ id: '7', width: 100, height: 40, kind, classes: ['Polymer'] })
      );
      const shadows = polymer.filter((l) => decodeURIComponent(l).includes('style="filter:'));
      expect(shadows.length, 'an offset copy').toBeGreaterThan(0);
      expect(polymer.length).toBe(plain.length + shadows.length);
    });
  }

  // The cross and the omitted icon were cached on size alone (the icon on
  // nothing), and the cache was never cleared: after a switch to the dark
  // theme, crossed-out nodes kept the light theme's red, and two styles on
  // one page shared whichever cross was drawn first.
  it('draws a cross in the colour it is asked for, not the first one cached', () => {
    clearDrawersCache();
    const with_ = (negative: string) =>
      ({ global: { negative, thickness: 2, onSurface: negative } }) as unknown as Properties;
    const size = { width: 100, height: 40 } as Parameters<typeof CROSS>[1];
    expect(CROSS(with_('#ba1a1a'), size)['background-image']).toContain('#ba1a1a');
    expect(CROSS(with_('#ea2323'), size)['background-image']).toContain('#ea2323');
    expect(OMMITED_ICON(with_('#ba1a1a'))).not.toBe(OMMITED_ICON(with_('#ea2323')));
  });

  it('forgets every cached cross when the drawers are cleared', () => {
    const size = { width: 100, height: 40 } as Parameters<typeof CROSS>[1];
    CROSS({ global: { negative: '#000000', thickness: 2 } } as unknown as Properties, size);
    clearDrawersCache();
    expect(CROSS.cache.size).toBe(0);
  });

  // The drawing a node gets is remembered per builder by its id, classes and
  // selection -- not its size or analysis values, so a node resized or given
  // new values without the cache being cleared kept its old drawing.
  it('draws a node again when its size or values change', () => {
    clearDrawersCache();
    const build = imageBuilder(aStyle().properties, aStyle());
    const node = aNode({ id: '8', width: 100, height: 40, exp: [0.1] });
    const first = build(node)['background-image'];
    node.data('width', 300);
    expect(build(node)['background-image']).not.toEqual(first);
    const resized = build(node)['background-image'];
    node.data('exp', [0.9]);
    expect(build(node)['background-image']).not.toEqual(resized);
  });

  it('paints the whole node when the same value repeats with counts', () => {
    clearDrawersCache();
    // [value, count] pairs: 2 of 0.3 then 5 more of 0.3 -- one colour across
    // all seven shares of the width.
    const layers = images(
      aStyle(),
      aNode({
        id: '6',
        width: 100,
        height: 40,
        exp: [
          [0.3, 2],
          [0.3, 5],
        ],
      })
    );
    const widths = layers.flatMap((l) =>
      [
        ...decodeURIComponent(l).matchAll(
          /<rect fill="#[0-9a-f]{6}" x="([\d.]+)" height="1" width="([\d.]+)"/g
        ),
      ].map((m) => Number(m[1]) + Number(m[2]))
    );
    expect(widths.length, 'a gradient is drawn').toBeGreaterThan(0);
    // Its right edge at the node's (plus the 0.01 overlap the rects carry).
    expect(Math.max(...widths)).toBeCloseTo(1.01, 5);
  });

  it('draws no gradient, rather than NaN, when there is nothing to divide', () => {
    clearDrawersCache();
    const layers = images(aStyle(), aNode({ id: '8', width: 100, height: 40, exp: [[0.3, 0]] }));
    expect(layers.join('')).not.toContain('NaN');
  });
});
