import cytoscape from 'cytoscape';

export interface ReactomeEventTarget {
  /**
   * The element's database id: a number, as the diagrams store it (it was
   * declared text, and was never sent as text). The legend's elements, not
   * drawn from Reactome's data, have none.
   */
  reactomeId: number | undefined;
  type: 'PhysicalEntity' | 'Pathway' | 'reaction' | 'Interactor' | 'Any';
  /**
   * The node the event is about. For a reaction's line it is the reaction's
   * node found from the line (`connectedNodes('.reaction')`), a collection:
   * it was declared a single node, whose methods a collection does not all
   * have.
   */
  element: cytoscape.NodeCollection;
  cy: cytoscape.Core;
}

export enum ReactomeEventTypes {
  hover = 'reactome::hover',
  leave = 'reactome::leave',

  select = 'reactome::select',
  unselect = 'reactome::unselect',

  open = 'reactome::open',
  close = 'reactome::close',
}

export class ReactomeEvent extends CustomEvent<ReactomeEventTarget> {
  constructor(type: ReactomeEventTypes, target: ReactomeEventTarget) {
    super(type, { detail: target });
  }
}
