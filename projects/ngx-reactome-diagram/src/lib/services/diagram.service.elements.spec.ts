import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import type { MockInstance } from 'vitest';
import type cytoscape from 'cytoscape';

import { DIAGRAM_CONFIG_TOKEN, DiagramService } from './diagram.service';
import therapeutics from './fixtures/R-HSA-9679191.json';
import therapeuticsGraph from './fixtures/R-HSA-9679191.graph.json';
import mpsVII from './fixtures/R-HSA-2206292.json';
import mpsVIIGraph from './fixtures/R-HSA-2206292.graph.json';
import checkpoints from './fixtures/R-HSA-69620.json';
import checkpointsGraph from './fixtures/R-HSA-69620.graph.json';

/**
 * What the diagram is drawn from: Reactome's layout and graph files, turned
 * into cytoscape elements. Checked against real pathways, stored as fixtures
 * from the Reactome release (download/current/diagram/<id>.json and
 * .graph.json, minified), rather than hand-made data that only has the shapes
 * its author thought of.
 *
 * - R-HSA-9679191, Potential therapeutics for SARS: drugs, entity sets,
 *   complexes and links.
 * - R-HSA-2206292, MPS VII - Sly syndrome: a disease diagram, with the normal
 *   entities faded out and the affected ones crossed out.
 * - R-HSA-69620, Cell Cycle Checkpoints: sub-pathways, whose labels are laid
 *   out apart from one another, a gene, an RNA and an embedded pathway.
 */

type Layout = typeof therapeutics | typeof mpsVII | typeof checkpoints;

const BASE = 'https://example.org/diagram';

/**
 * The classes each kind of entity is drawn with -- what the style library's
 * selectors match. Written out rather than read from the service's own map, so
 * a wrong entry there fails here.
 */
const KINDS: Record<string, string[]> = {
  Protein: ['Protein', 'PhysicalEntity'],
  Entity: ['GenomeEncodedEntity', 'PhysicalEntity'],
  Gene: ['Gene', 'PhysicalEntity'],
  RNA: ['RNA', 'PhysicalEntity'],
  Complex: ['Complex', 'PhysicalEntity'],
  EntitySet: ['EntitySet', 'PhysicalEntity'],
  Chemical: ['Molecule', 'PhysicalEntity'],
  ProteinDrug: ['Protein', 'PhysicalEntity', 'drug'],
  ComplexDrug: ['Complex', 'PhysicalEntity', 'drug'],
  ChemicalDrug: ['Molecule', 'PhysicalEntity', 'drug'],
  EntitySetDrug: ['EntitySet', 'PhysicalEntity', 'drug'],
  EncapsulatedNode: ['Interacting', 'Pathway'],
};

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
const scaled = (p: { x: number; y: number }) => ({ x: p.x * 2, y: p.y * 2 });
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** The graph's entities, as the drawing reads them. */
type GraphEntity = { stId: string; diagramIds?: number[]; children?: number[] };

/**
 * Where each sub-pathway's label starts, before labels are laid out apart: the
 * reaction of the sub-pathway nearest the average of them all.
 */
function labelAnchors(layout: typeof checkpoints, graph: typeof checkpointsGraph) {
  const reactions = new Map(layout.edges.map((r) => [r.reactomeId, scaled(r.position)]));
  const events = new Map(graph.subpathways.map((s) => [s.dbId, s.events]));
  return new Map(
    layout.shadows.map((shadow) => {
      const points = (events.get(shadow.reactomeId) ?? []).flatMap((id) => {
        const p = reactions.get(id);
        return p ? [p] : [];
      });
      const average = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
      };
      const anchor = points.reduce((best, p) =>
        distance(p, average) < distance(best, average) ? p : best
      );
      return [String(shadow.id), anchor];
    })
  );
}
const classesOf = (d: cytoscape.ElementDefinition) =>
  typeof d.classes === 'string' ? d.classes.split(' ') : (d.classes ?? []);

describe('DiagramService, drawing real pathways', () => {
  let canvas: MockInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DIAGRAM_CONFIG_TOKEN, useValue: { diagramUrl: BASE } },
      ],
    });
    // Sub-pathway labels are laid out apart in a temporary rendered cytoscape
    // graph, which measures their text on a canvas -- and is created even for a
    // pathway with no sub-pathways. jsdom has no canvas: without this every
    // test fails with "Could not create canvas of type 2d". A context that
    // measures a character as 6px and draws nothing lets the layout run.
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
  });
  afterEach(() => {
    // Nothing asked for that the test did not answer.
    TestBed.inject(HttpTestingController).verify();
    canvas.mockRestore();
  });

  for (const [id, layout, graph] of [
    ['R-HSA-9679191', therapeutics, therapeuticsGraph],
    ['R-HSA-2206292', mpsVII, mpsVIIGraph],
    ['R-HSA-69620', checkpoints, checkpointsGraph],
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
        const byId = new Map(
          (await elementsOf(id, layout, graph)).nodes.map((n) => [n.data.id, n])
        );
        for (const entity of layout.nodes) {
          const node = drawn(byId, entity.id);
          const kind = KINDS[entity.renderableClass];
          if (!kind) throw new Error(`no expected classes for ${entity.renderableClass}`);
          expect(classesOf(node), `${entity.renderableClass} ${entity.id}`).toEqual(
            expect.arrayContaining(kind)
          );
          expect(node.data['reactomeId']).toBe(entity.reactomeId);
        }
      });

      it('gives every entity the graph node that names it (issue #14, bug 4)', async () => {
        const byId = new Map(
          (await elementsOf(id, layout, graph)).nodes.map((n) => [n.data.id, n])
        );
        const wrong: string[] = [];
        for (const entity of graph.nodes as GraphEntity[]) {
          for (const diagramId of entity.diagramIds ?? []) {
            const stId = (drawn(byId, diagramId).data['graph'] as GraphEntity | undefined)?.stId;
            if (stId !== entity.stId) wrong.push(`${diagramId}: ${stId}, not ${entity.stId}`);
          }
        }
        expect(wrong).toEqual([]);
      });

      it("rounds a compartment's corners by its narrowest margin (issue #14)", async () => {
        const byId = new Map(
          (await elementsOf(id, layout, graph)).nodes.map((n) => [n.data.id, n])
        );
        const edges = (p: { x: number; y: number; width: number; height: number }) => [
          p.x * 2,
          p.y * 2,
          (p.x + p.width) * 2,
          (p.y + p.height) * 2,
        ];
        for (const compartment of layout.compartments) {
          if (!('insets' in compartment) || !compartment.insets) continue;
          const outer = edges(compartment.prop);
          const inner = edges(compartment.insets);
          const margin = Math.min(...outer.map((o, i) => Math.abs(o - inner[i])));
          const node = byId.get(`${compartment.id}-outer`);
          expect(node?.data['radius'], compartment.displayName).toBe(10 + Math.min(margin, 100));
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
    for (const n of crossed) {
      const node = drawn(byId, n.id);
      expect(classesOf(node), `${n.id} is crossed out`).toContain('crossed');
      // Crossed out, not faded: it is the disease's change, drawn in front.
      expect(node.data['isFadeOut'], `${n.id} is not faded`).toBe(false);
    }

    // Faded entities and faded reactions alike.
    const faded = [
      ...mpsVII.nodes.filter((n) => 'isFadeOut' in n && n.isFadeOut && !n.isCrossed),
      ...mpsVII.edges.filter((r) => 'isFadeOut' in r && r.isFadeOut),
    ];
    expect(faded.length, 'the pathway fades something out').toBeGreaterThan(0);
    const replaced: string[] = [];
    for (const n of faded) {
      const node = drawn(byId, n.id);
      expect(node.data['isFadeOut'], `${n.id} is faded`).toBe(true);
      const by = node.data['replacedBy'] as string | undefined;
      if (by) {
        expect(byId.has(by), `${n.id} is replaced by ${by}, which is drawn`).toBe(true);
        replaced.push(`${n.id} -> ${by}`);
      }
    }
    // Some of what is faded has the disease's version drawn in its place.
    expect(replaced.length, 'faded elements that have a replacement').toBeGreaterThan(0);
  });

  it("selects a homomultimer as itself, keeping its monomer's accession (issue #14, bug 4)", async () => {
    const elements = await elementsOf('R-HSA-69620', checkpoints, checkpointsGraph);
    const byId = new Map(elements.nodes.map((n) => [n.data.id, n]));
    const tetramer = (checkpointsGraph.nodes as GraphEntity[]).find(
      (n) => n.stId === 'R-HSA-3209194'
    );
    expect(tetramer?.children, 'TP53 Tetramer has one child, TP53').toEqual([69488]);
    expect(tetramer?.diagramIds?.length, 'TP53 Tetramer is drawn').toBeGreaterThan(0);
    for (const diagramId of tetramer?.diagramIds ?? []) {
      const node = drawn(byId, diagramId);
      expect((node.data['graph'] as GraphEntity).stId).toBe('R-HSA-3209194');
      // Flagging P04637 flags the tetramer, as it did.
      expect(node.data['acc']).toBe('P04637');
    }
  });

  it('numbers each repeat of a line, so a third with the same ends has an id of its own', async () => {
    const layout = structuredClone(therapeutics);
    const node = layout.nodes.find((n) => n.connectors.length > 0);
    if (!node) throw new Error('the pathway has no connectors');
    const connectors: unknown[] = node.connectors;
    connectors.push(structuredClone(node.connectors[0]), structuredClone(node.connectors[0]));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const ids = (await elementsOf('R-HSA-9679191', layout, therapeuticsGraph)).edges.map(
        (e) => e.data.id
      );
      expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
      const third = ids.filter((x) => x?.endsWith(' (2)'));
      expect(third.length).toBe(1);
      const first = third[0]?.slice(0, -' (2)'.length);
      expect(ids).toEqual(expect.arrayContaining([first, `${first} (1)`]));
    } finally {
      warn.mockRestore();
    }
  });

  it("names a reaction's faded counterpart by its id, as an entity's is (issue #14)", async () => {
    const elements = await elementsOf('R-HSA-2206292', mpsVII, mpsVIIGraph);
    const byId = new Map(elements.nodes.map((n) => [n.data.id, n]));
    const named: string[] = [];
    for (const reaction of mpsVII.edges) {
      const replacement: unknown = drawn(byId, reaction.id).data['replacement'];
      if (replacement === undefined) continue;
      if (typeof replacement !== 'string') {
        throw new Error(`the replacement of ${reaction.id} is a ${typeof replacement}, not an id`);
      }
      expect(byId.has(replacement), `${replacement} is drawn`).toBe(true);
      named.push(`${reaction.id} -> ${replacement}`);
    }
    expect(named.length, 'reactions drawn over a faded one').toBeGreaterThan(0);
  });

  it('keeps each sub-pathway label by its sub-pathway (issue #14)', async () => {
    const elements = await elementsOf('R-HSA-69620', checkpoints, checkpointsGraph);
    const anchors = labelAnchors(checkpoints, checkpointsGraph);
    const labels = elements.nodes.filter((n) => classesOf(n).includes('Shadow'));
    expect(labels.length).toBe(anchors.size);
    // None of these labels overlaps another, so none moves.
    const moved = labels.map((n): [string, number] => [
      String(n.data['displayName']),
      Math.round(
        distance(
          n.position ?? { x: NaN, y: NaN },
          anchors.get(n.data.id ?? '') ?? { x: NaN, y: NaN }
        )
      ),
    ]);
    expect(moved).toEqual(labels.map((n): [string, number] => [String(n.data['displayName']), 0]));
  });

  it('still lays out apart sub-pathway labels that would overlap', async () => {
    // Every sub-pathway given the same reactions: their labels start in one place.
    const graph = structuredClone(checkpointsGraph);
    const shown = checkpoints.shadows.map((s) => s.reactomeId);
    const events = graph.subpathways.find((s) => s.dbId === shown[0])?.events ?? [];
    for (const subpathway of graph.subpathways) {
      if (shown.includes(subpathway.dbId)) subpathway.events = events;
    }
    const elements = await elementsOf('R-HSA-69620', checkpoints, graph);
    const anchor = [...labelAnchors(checkpoints, graph).values()][0];
    const places = elements.nodes
      .filter((n) => classesOf(n).includes('Shadow'))
      .map((n) => n.position ?? { x: NaN, y: NaN });
    expect(places.length).toBe(3);
    for (const [i, a] of places.entries()) {
      expect(distance(a, anchor), 'near where they started').toBeLessThan(300);
      for (const b of places.slice(i + 1)) {
        expect(distance(a, b), 'apart from one another').toBeGreaterThan(100);
      }
    }
  });

  describe('stops, naming it, at a part the diagram does not contain', () => {
    // It stopped there before too, with "Cannot read properties of undefined".
    const MISSING = 999999999;

    it('a line to a reaction not in it', async () => {
      const layout = structuredClone(therapeutics);
      const connector = layout.nodes.flatMap((n) => n.connectors)[0];
      if (!connector) throw new Error('the pathway has no connectors');
      connector.edgeId = MISSING;
      await expect(elementsOf('R-HSA-9679191', layout, therapeuticsGraph)).rejects.toThrow(
        `The diagram names the edge ${MISSING}, not in it.`
      );
    });

    it('a link from an entity not in it', async () => {
      const layout = structuredClone(therapeutics);
      const link = layout.links[0];
      if (!link) throw new Error('the pathway has no links');
      link.inputs[0].id = MISSING;
      await expect(elementsOf('R-HSA-9679191', layout, therapeuticsGraph)).rejects.toThrow(
        `The diagram names the node ${MISSING}, not in it.`
      );
    });

    it('a sub-pathway reaction not in it', async () => {
      const graph = structuredClone(checkpointsGraph);
      const shown = checkpoints.shadows[0]?.reactomeId;
      const subpathway = graph.subpathways.find((s) => s.dbId === shown);
      if (!subpathway) throw new Error('the pathway has no sub-pathway drawn');
      subpathway.events.push(MISSING);
      await expect(elementsOf('R-HSA-69620', checkpoints, graph)).rejects.toThrow(
        `The diagram names the reaction ${MISSING}, not in it.`
      );
    });
  });

  it('labels each sub-pathway once, placed apart from the others', async () => {
    const elements = await elementsOf('R-HSA-69620', checkpoints, checkpointsGraph);
    const labels = elements.nodes.filter((n) => classesOf(n).includes('Shadow'));
    expect(labels.map((n) => n.data['reactomeId'] as number).sort()).toEqual(
      checkpoints.shadows.map((s) => s.reactomeId).sort()
    );
    for (const label of labels) {
      const { x, y } = label.position ?? { x: NaN, y: NaN };
      expect(Number.isFinite(x) && Number.isFinite(y), `${label.data.id} is placed`).toBe(true);
    }
    const places = labels.map((n) => `${n.position?.x},${n.position?.y}`);
    expect(new Set(places).size, 'no two labels in one place').toBe(labels.length);
  });
});
