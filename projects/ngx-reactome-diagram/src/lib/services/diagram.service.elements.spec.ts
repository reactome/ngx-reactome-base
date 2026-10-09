import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import type cytoscape from 'cytoscape';

import { DIAGRAM_CONFIG_TOKEN, DiagramService } from './diagram.service';
import therapeutics from './fixtures/R-HSA-9679191.json';
import therapeuticsGraph from './fixtures/R-HSA-9679191.graph.json';
import mpsVII from './fixtures/R-HSA-2206292.json';
import mpsVIIGraph from './fixtures/R-HSA-2206292.graph.json';

/**
 * What the diagram is drawn from: Reactome's layout and graph files, turned
 * into cytoscape elements. Checked against real pathways, stored as fixtures
 * from the Reactome release (download/current/diagram/<id>.json and
 * .graph.json), rather than hand-made data that only has the shapes its
 * author thought of.
 *
 * - R-HSA-9679191, Potential therapeutics for SARS: drugs, entity sets,
 *   complexes and links.
 * - R-HSA-2206292, MPS VII - Sly syndrome: a disease diagram, with the normal
 *   entities faded out and the affected ones crossed out.
 */

type Layout = typeof therapeutics | typeof mpsVII;

const BASE = 'https://example.org/diagram';

async function elementsOf(
  id: string,
  layout: Layout,
  graph: object
): Promise<cytoscape.ElementsDefinition> {
  const service = TestBed.inject(DiagramService);
  const http = TestBed.inject(HttpTestingController);
  // The service writes into what it is given; give it its own copy.
  const loaded = firstValueFrom(service.getDiagram(id));
  http.expectOne(`${BASE}/${id}.json`).flush(structuredClone(layout));
  http.expectOne(`${BASE}/${id}.graph.json`).flush(structuredClone(graph));
  return loaded;
}

/** The element drawn for this id; a missing one fails the test by name. */
function drawn<T extends cytoscape.ElementDefinition>(
  byId: Map<string | undefined, T>,
  id: number
) {
  const element = byId.get(String(id));
  if (!element) throw new Error(`nothing is drawn for ${id}`);
  return element;
}

const all = (e: cytoscape.ElementsDefinition) => [...e.nodes, ...e.edges];
const classesOf = (d: cytoscape.ElementDefinition) =>
  typeof d.classes === 'string' ? d.classes.split(' ') : (d.classes ?? []);

describe('DiagramService, drawing real pathways', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: { diagramUrl: BASE } },
      ],
    });
    // Sub-pathway labels are spread apart in a rendered cytoscape graph, which
    // measures their text on a canvas; jsdom has none. A context that measures
    // a character as 6px and draws nothing is enough for the layout to run.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
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
  });
  afterEach(() => vi.restoreAllMocks());

  for (const [id, layout, graph] of [
    ['R-HSA-9679191', therapeutics, therapeuticsGraph],
    ['R-HSA-2206292', mpsVII, mpsVIIGraph],
  ] as const) {
    describe(id, () => {
      it('gives every element its own id', async () => {
        const ids = all(await elementsOf(id, layout, graph)).map((e) => e.data.id);
        const repeated = ids.filter((x, i) => ids.indexOf(x) !== i);
        expect(repeated).toEqual([]);
      });

      it('joins every line to something that is drawn', async () => {
        const elements = await elementsOf(id, layout, graph);
        const nodes = new Set(elements.nodes.map((n) => n.data.id));
        const dangling = elements.edges
          .filter((e) => !nodes.has(e.data.source) || !nodes.has(e.data.target))
          .map((e) => `${e.data.id}: ${e.data.source} -> ${e.data.target}`);
        expect(dangling).toEqual([]);
      });

      it('draws every entity of the layout, as its kind', async () => {
        const service = TestBed.inject(DiagramService);
        const byId = new Map(
          (await elementsOf(id, layout, graph)).nodes.map((n) => [n.data.id, n])
        );
        for (const entity of layout.nodes) {
          const node = drawn(byId, entity.id);
          const kind = service.nodeTypeMap.get(entity.renderableClass);
          if (!kind) throw new Error(`an unknown kind: ${entity.renderableClass}`);
          expect(classesOf(node), `${entity.renderableClass} ${entity.id}`).toEqual(
            expect.arrayContaining([...kind])
          );
          expect(node.data['reactomeId']).toBe(entity.reactomeId);
        }
      });

      it('draws every reaction as a node of its own', async () => {
        const nodes = new Set((await elementsOf(id, layout, graph)).nodes.map((n) => n.data.id));
        const missing = layout.edges.map((r) => String(r.id)).filter((r) => !nodes.has(r));
        expect(missing).toEqual([]);
      });
    });
  }

  it('marks a drug as a drug', async () => {
    const elements = await elementsOf('R-HSA-9679191', therapeutics, therapeuticsGraph);
    const byId = new Map(elements.nodes.map((n) => [n.data.id, n]));
    const drugs = therapeutics.nodes.filter((n) => n.renderableClass.endsWith('Drug'));
    expect(drugs.length, 'the pathway has drugs').toBeGreaterThan(0);
    for (const drug of drugs) {
      expect(classesOf(drawn(byId, drug.id)), `${drug.renderableClass} ${drug.id}`).toContain(
        'drug'
      );
    }
  });

  it('crosses out what the disease removes, and fades what it replaces', async () => {
    const elements = await elementsOf('R-HSA-2206292', mpsVII, mpsVIIGraph);
    const byId = new Map(elements.nodes.map((n) => [n.data.id, n]));

    const crossed = mpsVII.nodes.filter((n) => 'isCrossed' in n && n.isCrossed);
    expect(crossed.length, 'the pathway crosses something out').toBeGreaterThan(0);
    for (const n of crossed) expect(classesOf(drawn(byId, n.id))).toContain('crossed');

    const faded = mpsVII.nodes.filter((n) => 'isFadeOut' in n && n.isFadeOut && !n.isCrossed);
    expect(faded.length, 'the pathway fades something out').toBeGreaterThan(0);
    for (const n of faded) {
      const node = drawn(byId, n.id);
      expect(node.data['isFadeOut'], `${n.id} is faded`).toBe(true);
      // What stands in for it, when anything does, is something drawn.
      const by = node.data['replacedBy'] as string | undefined;
      if (by) expect(byId.has(by), `${n.id} is replaced by ${by}`).toBe(true);
    }
  });
});
