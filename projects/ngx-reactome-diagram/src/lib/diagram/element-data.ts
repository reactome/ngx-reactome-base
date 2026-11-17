/**
 * Reading what is kept on the diagram's cytoscape elements.
 *
 * Cytoscape types every `data(name)` as `any`. These read it as `unknown` and
 * take what the caller can use: anything else reads as absent. The style
 * library reads its elements the same way (its `element-data.ts`, which it
 * does not export).
 */
interface WithData {
  data(name: string): unknown;
}

/** The value under `name` where it is text. */
export function textData(element: WithData, name: string): string | undefined {
  const value = element.data(name);
  return typeof value === 'string' ? value : undefined;
}

/** The value under `name` where it is a number. */
export function numberData(element: WithData, name: string): number | undefined {
  const value = element.data(name);
  return typeof value === 'number' ? value : undefined;
}

/**
 * An element's id kept under `name`, as the diagram service writes one: text
 * (an element's id) or a number (a connector's `replacement`, an edge's id in
 * the diagram's layout). An empty one (`''`, `0`) reads as none, as it did
 * when read by truthiness.
 */
export function idData(element: WithData, name: string): string | number | undefined {
  const value = element.data(name);
  return (typeof value === 'string' || typeof value === 'number') && value ? value : undefined;
}

/** Whether the value under `name` is set, read by truthiness. */
export function isSet(element: WithData, name: string): boolean {
  return Boolean(element.data(name));
}
