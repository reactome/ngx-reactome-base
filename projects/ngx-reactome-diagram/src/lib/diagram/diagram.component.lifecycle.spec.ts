import { ChangeDetectorRef, ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { config } from 'rxjs';
import type { MockInstance } from 'vitest';
import cytoscape from 'cytoscape';
import { ReactomeEvent, ReactomeEventTypes } from 'ngx-reactome-cytoscape-style';

import { DiagramComponent, DiagramLoadFailure } from './diagram.component';
import { DIAGRAM_CONFIG_TOKEN } from '../services/diagram.service';
import { DarkService } from '../services/dark.service';
import { DiagramStateService } from '../services/diagram-state.service';
import checkpoints from '../services/fixtures/R-HSA-69620.json';
import checkpointsGraph from '../services/fixtures/R-HSA-69620.graph.json';
import mpsVII from '../services/fixtures/R-HSA-2206292.json';
import mpsVIIGraph from '../services/fixtures/R-HSA-2206292.graph.json';
import sarsCov2 from '../services/fixtures/R-HSA-9679191.json';
import sarsCov2Graph from '../services/fixtures/R-HSA-9679191.graph.json';

/**
 * The component's lifecycle, issue #14 bugs 3, 11 and 14 and two of its
 * smaller findings: loading a diagram, replacing it, being destroyed, and a
 * zoneless host. Diagrams come from the stored fixtures: MPS VII
 * (R-HSA-2206292) is a disease diagram, drawn with the compare pane; Cell
 * Cycle Checkpoints (R-HSA-69620) and R-HSA-9679191 are not. jsdom cannot
 * draw, so a canvas that measures and draws nothing stands in, as in the
 * diagram service's specs.
 */
describe('DiagramComponent, lifecycle', () => {
  const BASE = 'https://example.org/diagram';
  const FIXTURES: Record<string, [object, object]> = {
    'R-HSA-69620': [checkpoints, checkpointsGraph],
    'R-HSA-2206292': [mpsVII, mpsVIIGraph],
    'R-HSA-9679191': [sarsCov2, sarsCov2Graph],
  };
  let canvas: MockInstance;
  let http: HttpTestingController;

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
      imports: [DiagramComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: { diagramUrl: BASE } },
        // For the component made without its view, which has no change detector.
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => undefined } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(DiagramStateService).blockRouterChange = true;
  });
  afterEach(() => {
    canvas.mockRestore();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.removeItem('is-dark');
  });

  /** The two requests a diagram is drawn from. */
  const requests = (id: string) => [
    http.expectOne(`${BASE}/${id}.json`),
    http.expectOne(`${BASE}/${id}.graph.json`),
  ];

  const answer = (id: string) => {
    const [layout, graph] = FIXTURES[id];
    const [layoutRequest, graphRequest] = requests(id);
    layoutRequest.flush(structuredClone(layout));
    graphRequest.flush(structuredClone(graph));
  };

  /** The component made with its view, the diagram `id` drawn. */
  async function shown(id: string): Promise<ComponentFixture<DiagramComponent>> {
    const fixture = TestBed.createComponent(DiagramComponent);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    answer(id);
    await fixture.whenStable();
    return fixture;
  }

  /** An error thrown in a handler is reported out of band, as uncaught. */
  async function uncaught(send: () => void): Promise<unknown[]> {
    const errors: unknown[] = [];
    config.onUnhandledError = (error) => errors.push(error);
    try {
      send();
      await new Promise((resolve) => setTimeout(resolve, 10));
    } finally {
      config.onUnhandledError = null;
    }
    return errors;
  }

  /** The component made without its view, a stand-in container given. */
  function viewless(): DiagramComponent {
    const component = TestBed.runInInjectionContext(() => new DiagramComponent());
    component.cytoscapeContainer = new ElementRef(document.createElement('div'));
    component.legend = cytoscape({ headless: true });
    return component;
  }

  describe('bug 3: loading a diagram', () => {
    it('drops a response a later request has replaced', () => {
      const component = viewless();
      const drawn = vi.spyOn(component, 'displayNetwork').mockImplementation(() => undefined);
      component.diagramId = 'R-HSA-69620';
      component.loadDiagram();
      const earlier = requests('R-HSA-69620');
      component.diagramId = 'R-HSA-9679191';
      component.loadDiagram();
      answer('R-HSA-9679191');
      expect(drawn).toHaveBeenCalledTimes(1);

      // The earlier answer, slower, arrives last.
      const [layout, graph] = FIXTURES['R-HSA-69620'];
      if (!earlier[0].cancelled) earlier[0].flush(structuredClone(layout));
      if (!earlier[1].cancelled) earlier[1].flush(structuredClone(graph));
      expect(drawn).toHaveBeenCalledTimes(1);
      expect(earlier.map((request) => request.cancelled)).toEqual([true, true]);
    });

    it('reports a diagram that fails to load, and keeps the one shown', () => {
      const component = viewless();
      const drawn = vi.spyOn(component, 'displayNetwork').mockImplementation(() => undefined);
      const reported = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const before = cytoscape({ headless: true });
      component.cy = before;
      component.diagramId = 'R-HSA-0';
      component.loadDiagram();
      http
        .expectOne(`${BASE}/R-HSA-0.json`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(reported).toHaveBeenCalledTimes(1);
      expect(String(reported.mock.calls[0][0])).toContain('R-HSA-0');
      expect(drawn).not.toHaveBeenCalled();
      expect(component.cy).toBe(before);
      expect(before.destroyed()).toBe(false);
    });
  });

  describe('a failed load, told to the host', () => {
    /** What `loadFailed` emits for the component in `fixture`. */
    const failures = (fixture: ComponentFixture<DiagramComponent>) => {
      const told: DiagramLoadFailure[] = [];
      fixture.componentInstance.loadFailed.subscribe((failure) => told.push(failure));
      return told;
    };

    it('emits the id and the status, and keeps the diagram shown', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const fixture = await shown('R-HSA-69620');
      const told = failures(fixture);
      const before = fixture.componentInstance.cy;
      const drawn = before.nodes().length;
      fixture.componentRef.setInput('id', 'R-HSA-0');
      await fixture.whenStable();
      http
        .expectOne(`${BASE}/R-HSA-0.json`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
      await fixture.whenStable();
      expect(told).toEqual([{ diagramId: 'R-HSA-0', status: 404 }]);
      expect(fixture.componentInstance.cy).toBe(before);
      expect(before.destroyed()).toBe(false);
      expect(before.nodes().length).toBe(drawn);
      expect(drawn).toBeGreaterThan(0);
      fixture.destroy();
    });

    it('emits status 0 for a network error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const fixture = await shown('R-HSA-69620');
      const told = failures(fixture);
      fixture.componentRef.setInput('id', 'R-HSA-0');
      await fixture.whenStable();
      http.expectOne(`${BASE}/R-HSA-0.json`).error(new ProgressEvent('error'));
      await fixture.whenStable();
      expect(told).toEqual([{ diagramId: 'R-HSA-0', status: 0 }]);
      fixture.destroy();
    });

    it('emits status 0 for a failure that is not HTTP', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const fixture = await shown('R-HSA-69620');
      const told = failures(fixture);
      fixture.componentRef.setInput('id', 'R-HSA-0');
      await fixture.whenStable();
      // Answered, but not a diagram: building its elements throws.
      requests('R-HSA-0').forEach((request) => request.flush({}));
      await fixture.whenStable();
      expect(told).toEqual([{ diagramId: 'R-HSA-0', status: 0 }]);
      fixture.destroy();
    });
  });

  describe('bug 11: tearing down', () => {
    it('destroys the diagram, the compare pane and the legend', async () => {
      const fixture = await shown('R-HSA-2206292');
      const { cy, cyCompare, legend } = fixture.componentInstance;
      expect([cy, cyCompare, legend].every((core) => core !== undefined)).toBe(true);
      fixture.destroy();
      expect([cy, cyCompare, legend].map((core) => core.destroyed())).toEqual([true, true, true]);
    });

    it('stops following the theme', async () => {
      const fixture = await shown('R-HSA-69620');
      const restyled = vi.spyOn(fixture.componentInstance.reactomeStyle, 'update');
      const heard = vi.spyOn(fixture.componentInstance, 'updateStyle');
      fixture.destroy();
      TestBed.inject(DarkService).isDark = true;
      // The theme is applied a moment later.
      await new Promise((resolve) => setTimeout(resolve, 20));
      // Counted: the calls hold whole graphs, too large to print.
      expect(restyled.mock.calls.length).toBe(0);
      expect(heard).not.toHaveBeenCalled();
    });

    it('cancels a diagram still loading', async () => {
      const fixture = TestBed.createComponent(DiagramComponent);
      fixture.componentRef.setInput('id', 'R-HSA-69620');
      await fixture.whenStable();
      const pending = requests('R-HSA-69620');
      fixture.destroy();
      expect(pending.map((request) => request.cancelled)).toEqual([true, true]);
    });

    it('destroys the diagram it replaces, and its compare pane', async () => {
      const fixture = await shown('R-HSA-2206292');
      const { cy, cyCompare } = fixture.componentInstance;
      fixture.componentRef.setInput('id', 'R-HSA-69620');
      await fixture.whenStable();
      answer('R-HSA-69620');
      await fixture.whenStable();
      expect([cy.destroyed(), cyCompare.destroyed()]).toEqual([true, true]);
      expect(fixture.componentInstance.cy.destroyed()).toBe(false);

      // The new diagram's state is not drawn on the old pane. Blocked from
      // the address, the state tells no one of a change.
      const state = TestBed.inject(DiagramStateService);
      state.blockRouterChange = false;
      expect(await uncaught(() => state.set('flag', ['class:Protein!drug']))).toEqual([]);
      await fixture.whenStable();
      expect(fixture.componentInstance.cy.elements('.flag').nonempty()).toBe(true);
      expect(cyCompare.elements('.flag').length).toBe(0);
      fixture.destroy();
    });

    it('restyles nothing destroyed after a theme change just before', async () => {
      const fixture = await shown('R-HSA-2206292');
      const restyled = vi.spyOn(fixture.componentInstance.reactomeStyle, 'update');
      TestBed.inject(DarkService).isDark = true;
      fixture.destroy();
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(restyled.mock.calls.length).toBe(0);
    });
  });

  describe('bug 14: a zoneless host', () => {
    it('shows the compare pane once a disease diagram is drawn', async () => {
      const fixture = await shown('R-HSA-2206292');
      expect(fixture.componentInstance.comparing).toBe(true);
      const pane = fixture.debugElement.query(By.css('#disease-container'))
        .nativeElement as HTMLElement;
      expect(pane.style.display).toBe('flex');
      fixture.destroy();
    });
  });

  describe('events before anything has loaded', () => {
    const legendEvent = (component: DiagramComponent) => {
      const legend = cytoscape({
        headless: true,
        elements: [{ data: { id: 'protein' }, classes: 'Protein' }],
      });
      component.legend = legend;
      return new ReactomeEvent(ReactomeEventTypes.hover, {
        element: legend.getElementById('protein'),
        type: 'PhysicalEntity',
        reactomeId: 'protein',
        cy: legend,
      });
    };

    it('a legend event before a diagram has loaded does not throw', async () => {
      const component = TestBed.runInInjectionContext(() => new DiagramComponent());
      const event = legendEvent(component);
      expect(await uncaught(() => component['_reactomeEvents$'].next(event))).toEqual([]);
    });

    it('a legend click before a diagram has loaded sets the flag, drawn when it arrives', async () => {
      const fixture = TestBed.createComponent(DiagramComponent);
      fixture.componentRef.setInput('id', 'R-HSA-69620');
      await fixture.whenStable();
      const component = fixture.componentInstance;
      // The legend is made at once; the diagram is still loading.
      expect(component.cy).toBeUndefined();
      const legend = component.legend;
      const transition = legend.getElementById('transition');
      expect(transition.nonempty()).toBe(true);
      component['_reactomeEvents$'].next(
        new ReactomeEvent(ReactomeEventTypes.select, {
          element: transition,
          type: 'reaction',
          reactomeId: 'transition',
          cy: legend,
        })
      );
      expect(TestBed.inject(DiagramStateService).get('flag')).toEqual(['class:transition!drug']);

      answer('R-HSA-69620');
      await fixture.whenStable();
      const reactions = component.cy.nodes('.transition.reaction');
      expect(reactions.nonempty()).toBe(true);
      const lines = reactions.connectedEdges();
      expect(lines.nonempty()).toBe(true);
      const unflagged = reactions.add(lines).filter((element) => !element.hasClass('flag'));
      expect(unflagged.map((element) => element.id())).toEqual([]);
      fixture.destroy();
    });

    it('a diagram event before the legend has loaded does not throw', async () => {
      const component = TestBed.runInInjectionContext(() => new DiagramComponent());
      const cy = cytoscape({
        headless: true,
        elements: [{ data: { id: 'protein' }, classes: 'Protein' }],
      });
      const event = new ReactomeEvent(ReactomeEventTypes.hover, {
        element: cy.getElementById('protein'),
        type: 'PhysicalEntity',
        reactomeId: 'protein',
        cy,
      });
      expect(await uncaught(() => component['_reactomeEvents$'].next(event))).toEqual([]);
    });
  });

  describe('the legend', () => {
    it('drags by its handle only', async () => {
      const fixture = await shown('R-HSA-69620');
      const drag = fixture.debugElement.query(By.directive(CdkDrag)).injector.get(CdkDrag);
      let started = 0;
      drag.started.subscribe(() => started++);
      const press = (target: Element) => {
        target.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            clientX: 10,
            clientY: 10,
            button: 0,
            // Not one a screen reader fakes, which the drag ignores.
            buttons: 1,
            detail: 1,
          })
        );
        document.dispatchEvent(
          new MouseEvent('mousemove', { bubbles: true, clientX: 60, clientY: 10 })
        );
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 60 }));
      };
      const part = (selector: string) =>
        fixture.debugElement.query(By.css(selector)).nativeElement as HTMLElement;
      press(part('#legend'));
      expect(started).toBe(0);
      press(part('#legend-handle'));
      expect(started).toBe(1);
      fixture.destroy();
    });
  });
});
