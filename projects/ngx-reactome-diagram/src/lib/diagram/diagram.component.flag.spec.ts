import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { MockInstance } from 'vitest';
import cytoscape from 'cytoscape';
import { interactivityOf, Style } from 'ngx-reactome-cytoscape-style';

import { DiagramComponent } from './diagram.component';
import { DIAGRAM_CONFIG_TOKEN, DiagramService } from '../services/diagram.service';
import checkpoints from '../services/fixtures/R-HSA-69620.json';
import checkpointsGraph from '../services/fixtures/R-HSA-69620.graph.json';
import mpsVII from '../services/fixtures/R-HSA-2206292.json';
import mpsVIIGraph from '../services/fixtures/R-HSA-2206292.graph.json';

/**
 * How flagging looks, issue #14 bugs 2, 12 and 13: read from the styles
 * cytoscape computes with the library's own style sheet and handlers bound, on
 * diagrams the diagram service draws from the stored fixtures. Cell Cycle
 * Checkpoints (R-HSA-69620) has sub-pathway bands; MPS VII (R-HSA-2206292) has
 * trivial molecules. jsdom cannot draw, so a canvas that measures and draws
 * nothing stands in, as in the diagram service's specs.
 */
describe('DiagramComponent, flagging', () => {
  const BASE = 'https://example.org/diagram';
  let canvas: MockInstance;
  let component: DiagramComponent;
  let cy: cytoscape.Core | undefined;

  beforeEach(() => {
    vi.stubGlobal('matchMedia', (media: string) => ({ media, matches: false }));
    canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        new Proxy(
          {},
          {
            get: (_target, name) =>
              name === 'measureText'
                ? (text: string) => ({ width: text.length * 6 })
                : () => ({ addColorStop: () => undefined, data: [] }),
            set: () => true,
          }
        ) as never
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: { diagramUrl: BASE } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new DiagramComponent());
    component.legend = cytoscape({ headless: true });
  });
  afterEach(() => {
    // Drawn on a page, it would go on drawing after the test.
    cy?.destroy();
    cy = undefined;
    canvas.mockRestore();
    vi.unstubAllGlobals();
  });

  async function drawn(id: string, layout: object, graph: object): Promise<cytoscape.Core> {
    const loaded = firstValueFrom(TestBed.inject(DiagramService).getDiagram(id));
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${BASE}/${id}.json`).flush(structuredClone(layout));
    http.expectOne(`${BASE}/${id}.graph.json`).flush(structuredClone(graph));
    const elements = await loaded;
    const container = document.createElement('div');
    const style = new Style(container);
    cy = cytoscape({
      container,
      elements,
      style: style.getStyleSheet(),
      layout: { name: 'preset' },
    });
    style.bindToCytoscape(cy);
    component.cy = cy;
    return cy;
  }

  const opacity = (e: cytoscape.SingularElementArgument, name: string) =>
    Number(e.numericStyle(name as never));

  describe('bug 2: clearing a flag', () => {
    it('leaves no halo on the lines it flagged', async () => {
      const cy = await drawn('R-HSA-69620', checkpoints, checkpointsGraph);
      const line = cy.edges().not('[?color]').first();
      expect(opacity(line, 'underlay-opacity')).toBe(0);
      component.flagElements(line, cy);
      expect(opacity(line, 'underlay-opacity')).toBe(1);
      component.flagElements(cy.collection(), cy);
      expect(opacity(line, 'underlay-opacity')).toBe(0);
    });

    it('gives the sub-pathway bands back as they were', async () => {
      const cy = await drawn('R-HSA-69620', checkpoints, checkpointsGraph);
      const band = cy.edges('[?color]').first();
      // Zoomed out, where the bands show.
      cy.zoom(0.2);
      interactivityOf(cy)?.onZoom.shadow();
      const before = opacity(band, 'underlay-opacity');
      expect(before).toBeGreaterThan(0);
      component.flagElements(cy.nodes('.reaction').first(), cy);
      expect(opacity(band, 'underlay-opacity')).toBe(0);
      component.flagElements(cy.collection(), cy);
      expect(opacity(band, 'underlay-opacity')).toBe(before);
    });
  });

  describe('bug 12: trivial molecules while something is flagged', () => {
    it('stay visible when the diagram is restyled', async () => {
      const cy = await drawn('R-HSA-2206292', mpsVII, mpsVIIGraph);
      const trivial = cy.nodes('.trivial');
      expect(trivial.nonempty()).toBe(true);
      // Zoomed out, where they are faded away when nothing is flagged.
      cy.zoom(cy.minZoom());
      interactivityOf(cy)?.onZoom.shadow();
      expect(opacity(trivial.first(), 'opacity')).toBeLessThan(1);

      component.flagElements(cy.nodes('.reaction').first(), cy);
      // What a theme change or an analysis loading does.
      interactivityOf(cy)?.onZoom.shadow();
      expect(trivial.map((t) => opacity(t, 'opacity'))).toEqual(trivial.map(() => 1));
    });
  });

  describe('bug 13: a reaction type flagged from the legend', () => {
    it('flags its lines too', async () => {
      const cy = await drawn('R-HSA-69620', checkpoints, checkpointsGraph);
      // The token the legend sets for a reaction type.
      component.flag(['class:transition!drug'], cy);
      const reactions = cy.nodes('.transition.reaction');
      expect(reactions.nonempty()).toBe(true);
      const lines = reactions.connectedEdges();
      expect(lines.nonempty()).toBe(true);
      expect(lines.filter((line) => !line.hasClass('flag')).map((line) => line.id())).toEqual([]);
    });
  });
});
