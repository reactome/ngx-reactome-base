import { describe, expect, it } from 'vitest';
import cytoscape from 'cytoscape';
import { Style } from './style';

describe('the stylesheet', () => {
  // The colour for an interactor without expression values called the
  // not-found colour, a string, as a function, and threw. Its selector,
  // `[?exp]`, keeps such an interactor from reaching it in a diagram.
  it('colours an interactor without expression values as not found', () => {
    const container = document.createElement('div');
    container.style.setProperty('--analysis-not-found', '#123456');
    document.body.appendChild(container);
    const style = new Style(container);
    const rule = style
      .getStyleSheet()
      .find((r) => r.selector === 'node.InteractorOccurrences[?exp]');
    const css = rule?.css;
    const colour = css && 'background-color' in css ? css['background-color'] : undefined;
    const cy = cytoscape({ headless: true, elements: [{ data: { id: 'i' } }] });
    expect(typeof colour === 'function' ? colour(cy.$id('i')) : colour).toBe('#123456');
  });
});

describe('a label coloured by name', () => {
  function labelColours(labelColor: unknown) {
    const container = document.createElement('div');
    container.style.setProperty('--flag', '#654321');
    document.body.appendChild(container);
    const cy = cytoscape({
      headless: true,
      styleEnabled: true,
      style: new Style(container).getStyleSheet(),
      elements: [{ data: { id: 'plain' } }, { data: { id: 'named', labelColor } }],
    });
    const plain: unknown = cy.$id('plain').style('color');
    const named: unknown = cy.$id('named').style('color');
    return { plain, named };
  }

  it('takes the global colour it names', () => {
    expect(labelColours('flag').named).toBe('rgb(101,67,33)');
  });

  // A name that is not a global colour threw when cytoscape styled the
  // element. Unapplied, the label keeps the colour of the rules before this one.
  it('is not applied for a name that is not a global colour', () => {
    for (const name of ['nonsense', 'thickness', 3]) {
      const { plain, named } = labelColours(name);
      expect(named, String(name)).toBe(plain);
    }
  });
});
