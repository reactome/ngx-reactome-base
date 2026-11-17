/**
 * Reading what is kept on cytoscape elements.
 *
 * Cytoscape types every `data(name)` as `any`. What is stored there is the
 * diagram's (sizes, ids, names) and its host's (analysis values), so these
 * read it as `unknown` and take what the caller can use: anything else reads
 * as absent. WebsiteAngular's diagram reads its own elements the same way
 * (`element-data.ts` there).
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

/** The value under `name` where it is a list. */
export function listData(element: WithData, name: string): unknown[] | undefined {
  const value: unknown = element.data(name);
  return Array.isArray(value) ? value : undefined;
}

/**
 * One of a node's analysis values: a value, none (not found), or a value with
 * the number of shares of the node's width it takes, as a pathway's found and
 * not found entities (`[[fdr, found], [undefined, total - found]]`).
 */
export type Expression = number | undefined | [number | undefined, number];

/**
 * A node's analysis values (`exp`), where they are a list. An entry that is
 * not one of them reads as none.
 */
export function expressionData(node: WithData): Expression[] | undefined {
  return listData(node, 'exp')?.map(toExpression);
}

function toExpression(value: unknown): Expression {
  if (typeof value === 'number') return value;
  if (!Array.isArray(value)) return undefined;
  const pair: unknown[] = value;
  const [share, count] = pair;
  return pair.length === 2 &&
    (typeof share === 'number' || share === undefined) &&
    typeof count === 'number'
    ? [share, count]
    : undefined;
}
