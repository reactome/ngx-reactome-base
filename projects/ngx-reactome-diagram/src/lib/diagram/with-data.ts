import type cytoscape from 'cytoscape';

/**
 * The elements whose data `field` (a path such as `graph.stId` allowed) is
 * exactly `value`, compared in code rather than through a selector. A value
 * written into a selector unquoted (`[acc=PKM]`) is an invalid selector, which
 * cytoscape treats as matching everything, so `?flag=PKM` flagged the whole
 * diagram; and cytoscape does not unescape a quoted one, so no quoting is safe
 * for every value (issue #14, bug 1). Use this for any value from outside.
 */
export function withData(
  cy: cytoscape.Core,
  field: string,
  value: string | number
): cytoscape.CollectionReturnValue {
  return cy.elements().filter((element) => element.data(field) === value);
}

/**
 * The nodes whose graph leaves (`graph.leaves`, the entities at the bottom of
 * a complex's or set's children) include the stId `stId`: the drawn complexes
 * containing an entity, compared in code as `withData` is.
 */
export function withLeaf(cy: cytoscape.Core, stId: string): cytoscape.CollectionReturnValue {
  return cy.nodes().filter((node) => {
    const leaves: unknown = node.data('graph.leaves');
    return (
      Array.isArray(leaves) &&
      leaves.some(
        (leaf: unknown) =>
          typeof leaf === 'object' && leaf !== null && 'stId' in leaf && leaf.stId === stId
      )
    );
  });
}
