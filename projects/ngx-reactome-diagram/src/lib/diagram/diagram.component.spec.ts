import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import cytoscape from 'cytoscape';
import { ReactomeEvent, ReactomeEventTypes } from 'ngx-reactome-cytoscape-style';

import { DiagramComponent } from './diagram.component';
import { DIAGRAM_CONFIG_TOKEN } from '../services/diagram.service';
import { DiagramStateService } from '../services/diagram-state.service';

describe('DiagramComponent', () => {
  // jsdom has no matchMedia, which the theme reads.
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (media: string) => ({ media, matches: false }));
  });
  afterEach(() => vi.unstubAllGlobals());

  function configure() {
    TestBed.configureTestingModule({
      imports: [DiagramComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: {} },
      ],
    });
  }

  it('is created with what it injects', () => {
    configure();
    expect(TestBed.createComponent(DiagramComponent).componentInstance).toBeTruthy();
  });

  // Issue #14, bug 10. The events are sent as the diagram's container sends
  // them, from a graph with two entities. The component is made without its
  // view, which jsdom cannot draw, and given an empty legend.
  describe('deselecting', () => {
    const cy = cytoscape({
      headless: true,
      elements: [
        { data: { id: 'a', reactomeId: 1, graph: { stId: 'R-HSA-1' } }, classes: 'PhysicalEntity' },
        { data: { id: 'b', reactomeId: 2, graph: { stId: 'R-HSA-2' } }, classes: 'PhysicalEntity' },
      ],
    });
    const send = (component: DiagramComponent, type: ReactomeEventTypes, id: string) =>
      component['_reactomeEvents$'].next(
        new ReactomeEvent(type, {
          element: cy.getElementById(id),
          type: 'PhysicalEntity',
          reactomeId: String(cy.getElementById(id).data('reactomeId')),
          cy,
        })
      );

    // The handler looks once the event has been handled.
    const settled = () => new Promise((resolve) => setTimeout(resolve, 10));

    function given(selected: string) {
      configure();
      const component = TestBed.runInInjectionContext(() => new DiagramComponent());
      component.legend = cytoscape({ headless: true });
      const state = TestBed.inject(DiagramStateService);
      state.blockRouterChange = true;
      state.set('select', selected);
      cy.elements().unselect();
      return { component, state };
    }

    it('clears the selection when the selected element is deselected', async () => {
      const { component, state } = given('R-HSA-1');
      send(component, ReactomeEventTypes.unselect, 'a');
      await settled();
      expect(state.get('select')).toBe('');
    });

    it('keeps the selection when another element is deselected', async () => {
      const { component, state } = given('R-HSA-2');
      send(component, ReactomeEventTypes.unselect, 'a');
      await settled();
      expect(state.get('select')).toBe('R-HSA-2');
    });

    it('keeps it while something is still selected, as when another is clicked', async () => {
      const { component, state } = given('R-HSA-1');
      cy.getElementById('b').select();
      send(component, ReactomeEventTypes.unselect, 'a');
      await settled();
      expect(state.get('select')).toBe('R-HSA-1');
    });
  });
});
