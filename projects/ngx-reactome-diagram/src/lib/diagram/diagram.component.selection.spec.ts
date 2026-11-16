import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { MockInstance } from 'vitest';
import cytoscape from 'cytoscape';
import { ReactomeEvent, ReactomeEventTypes, Style } from 'ngx-reactome-cytoscape-style';

import { DiagramComponent } from './diagram.component';
import { DIAGRAM_CONFIG_TOKEN, DiagramService } from '../services/diagram.service';
import { DiagramStateService } from '../services/diagram-state.service';
import checkpoints from '../services/fixtures/R-HSA-69620.json';
import checkpointsGraph from '../services/fixtures/R-HSA-69620.graph.json';

/**
 * Selecting and flagging, issue #14 bugs 1, 6, 7, 8 and 9, on Cell Cycle
 * Checkpoints (R-HSA-69620) as the diagram service draws it. The component is
 * made without its view (jsdom cannot draw one); where it draws a diagram
 * itself, a canvas that measures and draws nothing stands in, as in the
 * diagram service's own specs.
 */
describe('DiagramComponent, selecting', () => {
  const BASE = 'https://example.org/diagram';
  let canvas: MockInstance;
  let component: DiagramComponent;
  let state: DiagramStateService;

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
        // Made without its view, the component has no change detector of its own.
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => undefined } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new DiagramComponent());
    component.legend = cytoscape({ headless: true });
    state = TestBed.inject(DiagramStateService);
    state.blockRouterChange = true;
  });
  afterEach(() => {
    canvas.mockRestore();
    vi.unstubAllGlobals();
  });

  async function checkpointElements(): Promise<cytoscape.ElementsDefinition> {
    const loaded = firstValueFrom(TestBed.inject(DiagramService).getDiagram('R-HSA-69620'));
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${BASE}/R-HSA-69620.json`).flush(structuredClone(checkpoints));
    http.expectOne(`${BASE}/R-HSA-69620.graph.json`).flush(structuredClone(checkpointsGraph));
    return loaded;
  }

  const headless = async () => cytoscape({ headless: true, elements: await checkpointElements() });

  /** The handler looks once the event has been handled. */
  const settled = () => new Promise((resolve) => setTimeout(resolve, 10));

  const send = (type: ReactomeEventTypes, element: cytoscape.NodeSingular, cy: cytoscape.Core) =>
    component['_reactomeEvents$'].next(
      new ReactomeEvent(type, { element, type: 'PhysicalEntity', reactomeId: element.id(), cy })
    );

  describe('bug 1: a value from the address that is not a number', () => {
    it('flags only what carries that accession', async () => {
      const cy = await headless();
      const tp53 = cy.elements().filter((e) => e.data('acc') === 'P04637');
      expect(tp53.nonempty()).toBe(true);
      expect(component.getElements(['P04637'], cy).length).toBe(tp53.length);
    });

    it('flags nothing for a name nothing carries', async () => {
      const cy = await headless();
      expect(component.getElements(['PKM'], cy).length).toBe(0);
    });

    it('selects nothing by database id for text that is not a number', async () => {
      const cy = await headless();
      component.usedbId = true;
      expect(component.getElements(['P04637'], cy).length).toBe(0);
    });

    it('still selects by a database id given as text', async () => {
      const cy = await headless();
      component.usedbId = true;
      const first = cy.nodes('[reactomeId]').first();
      const dbId = first.data('reactomeId') as number;
      const expected = cy.elements().filter((e) => e.data('reactomeId') === dbId);
      expect(component.getElements([String(dbId)], cy).length).toBe(expected.length);
    });
  });

  describe('bug 6: clicking an element with no graph data', () => {
    it('leaves the selection as it was', async () => {
      const cy = cytoscape({
        headless: true,
        elements: [{ data: { id: 'faded' }, classes: 'PhysicalEntity' }],
      });
      state.set('select', 'R-HSA-69683');
      send(ReactomeEventTypes.select, cy.getElementById('faded'), cy);
      await settled();
      expect(state.get('select')).toBe('R-HSA-69683');
    });
  });

  describe('bug 7: a selection from the address when the diagram is drawn', () => {
    it('is zoomed to, and not sent to the host as a click', async () => {
      const elements = await checkpointElements();
      const container = document.createElement('div');
      component.cytoscapeContainer = new ElementRef(container);
      component.compareContainer = new ElementRef(document.createElement('div'));
      component.reactomeStyle = new Style(container);
      const sent: string[] = [];
      component.reactomeEvents$.subscribe((e) => sent.push(e.type));
      container.addEventListener(ReactomeEventTypes.select, (e) =>
        component['_reactomeEvents$'].next(e as ReactomeEvent)
      );
      // p-S15,S20-TP53 Tetramer, drawn once.
      state.set('select', 'R-HSA-3222171');

      component.displayNetwork(elements);

      const selected = component.cy.elements(':selected').nonempty();
      const zooming = component.cy.animated();
      // Drawn on a page, it would go on drawing after the test.
      component.cy.destroy();
      expect(selected).toBe(true);
      expect(zooming).toBe(true);
      expect(sent).toEqual([]);
    });
  });

  describe('bug 8: an event the component made itself', () => {
    it('does not hide the same event from the user after it', async () => {
      const cy = await headless();
      const node = cy.nodes('[acc = "P04637"]').first();
      const sent: string[] = [];
      component.reactomeEvents$.subscribe((e) => sent.push(e.type));
      component.avoidSideEffect(() => send(ReactomeEventTypes.select, node, cy));
      send(ReactomeEventTypes.select, node, cy);
      expect(sent).toEqual([ReactomeEventTypes.select]);
    });
  });

  describe('bug 9: a selection from the state while comparing', () => {
    it('fits the view, not the compare pane', async () => {
      component.cy = await headless();
      component.cyCompare = await headless();
      const view = vi.spyOn(component.cy, 'animate');
      const pane = vi.spyOn(component.cyCompare, 'animate');
      component.avoidSideEffect(() =>
        [component.cy, component.cyCompare].forEach((cy) => component.select('R-HSA-3222171', cy))
      );
      expect(view).toHaveBeenCalledTimes(1);
      expect(pane).not.toHaveBeenCalled();
    });
  });
});
