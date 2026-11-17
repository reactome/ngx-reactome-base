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
